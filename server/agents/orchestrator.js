// ─── Master Orchestrator (Person A — Brain) ─────────────────────────────────
// The central "brain stem" that chains all 8 agents into coherent pipelines.
//
// Three entry points:
//   1. processRequest()  — Intent → Discovery → Ranking → Pricing (returns ranked workers)
//   2. processBooking()  — Booking → Notification → Follow-up (user picked a worker)
//   3. processDispute()  — Dispute Agent (standalone complaint flow)
//
// Features:
//   - Full agent trace (name + duration + I/O + reasoning) stored per request
//   - Auto-expand discovery when zero workers found (relax filters, widen radius)
//   - Side-by-side baseline comparison

const { parseIntent, runIntentAgent } = require('./intentAgent');
const { runDiscoveryAgent } = require('./discoveryAgent');
const { rankCandidates, runRankingAgent } = require('./rankingAgent');
const { runPricingAgent } = require('./pricingAgent');
const { runBookingAgent } = require('./bookingAgent');
const { runNotificationAgent } = require('./notificationAgent');
const { runFollowupAgent } = require('./followupAgent');
const { resolveDispute } = require('./disputeAgent');
const { runBaseline } = require('../utils/baseline');
const { db } = require('../config/firebase');
const { haversine } = require('../utils/distance');
const { callGeminiText } = require('../utils/gemini');

// ─── Trace Helper ───────────────────────────────────────────────────────────

function traceEntry(agentName, input, output) {
  return {
    agent: agentName,
    duration_ms: output.duration_ms || 0,
    reasoning: output.reasoning || null,
    status: output.status || 'ok',
    input_summary: summarizeInput(input),
    output_summary: summarizeOutput(output),
    timestamp: new Date().toISOString(),
  };
}

function summarizeInput(input) {
  if (!input) return null;
  // Keep it compact — strip large arrays/objects
  const summary = {};
  for (const [k, v] of Object.entries(input)) {
    if (Array.isArray(v)) {
      summary[k] = `[${v.length} items]`;
    } else if (typeof v === 'object' && v !== null) {
      summary[k] = '{...}';
    } else {
      summary[k] = v;
    }
  }
  return summary;
}

function summarizeOutput(output) {
  if (!output) return null;
  const summary = {};
  for (const [k, v] of Object.entries(output)) {
    if (k === 'duration_ms' || k === 'agent') continue;
    if (Array.isArray(v)) {
      summary[k] = `[${v.length} items]`;
    } else if (typeof v === 'object' && v !== null) {
      summary[k] = '{...}';
    } else {
      summary[k] = v;
    }
  }
  return summary;
}

// ─── Expanded Discovery (Fallback) ──────────────────────────────────────────

/**
 * When primary discovery returns 0 workers, retry with relaxed filters:
 *   - Skip day/time constraints
 *   - Use expanded radius (worker's radius × 2, min 15km)
 *   - Still require same category + is_available
 */
async function expandedDiscovery(service_category, lat, lng) {
  const startTime = Date.now();

  const snapshot = await db
    .collection('workers')
    .where('category', '==', service_category)
    .where('is_available', '==', true)
    .get();

  const candidates = [];

  for (const doc of snapshot.docs) {
    const worker = { id: doc.id, ...doc.data() };
    const distance_km = haversine(lat, lng, worker.lat, worker.lng);
    const expandedRadius = Math.max((worker.service_radius_km || 10) * 2, 15);

    if (distance_km <= expandedRadius) {
      candidates.push({ ...worker, distance_km });
    }
  }

  candidates.sort((a, b) => a.distance_km - b.distance_km);

  return {
    candidates,
    total_found: candidates.length,
    expanded: true,
    agent: 'discovery',
    reasoning: candidates.length > 0
      ? `Expanded search (relaxed time/day/radius). Found ${candidates.length} workers.`
      : `No workers found even with expanded search for "${service_category}".`,
    duration_ms: Date.now() - startTime,
  };
}

// ─── Pipeline 1: Process Request ────────────────────────────────────────────

/**
 * Main agentic pipeline. Parses user message → finds workers → ranks → prices.
 * Returns ranked workers with pricing so the user can pick one.
 *
 * @param {string} message  - Raw user input (multilingual)
 * @param {string} language - Language hint ("auto" for auto-detect)
 * @param {string} user_id  - User's ID (for loyalty pricing)
 * @returns {Promise<object>}
 */
async function processRequest(message, language = 'auto', user_id = null) {
  const startTime = Date.now();
  const trace = [];

  console.log('\n══════════════════════════════════════════════════════');
  console.log('  KARIGAR Orchestrator — Processing Request');
  console.log('══════════════════════════════════════════════════════');
  console.log(`  Message: "${message}"`);
  console.log(`  Language: ${language} | User: ${user_id || 'anonymous'}\n`);

  // ── Step 1: Intent Agent ──────────────────────────────────────────────
  console.log('[Orchestrator] Step 1/4 — Intent Agent...');
  const intentInput = { message, language };
  const intent = await parseIntent(message, language);
  trace.push(traceEntry('intent', intentInput, intent));

  if (intent.status === 'needs_clarification') {
    console.log('[Orchestrator] ⚠️ Needs clarification — returning early');
    return {
      status: 'needs_clarification',
      clarification: {
        message: intent.message,
        missing: intent.missing,
        partial: intent.partial,
      },
      trace,
      total_duration_ms: Date.now() - startTime,
    };
  }

  console.log(`[Orchestrator] ✅ Intent parsed: ${intent.service_category} in ${intent.location?.label}`);

  // ── Step 2: Discovery Agent ───────────────────────────────────────────
  console.log('[Orchestrator] Step 2/4 — Discovery Agent...');
  const discoveryInput = {
    service_category: intent.service_category,
    lat: intent.location.lat,
    lng: intent.location.lng,
    date: intent.date || new Date().toISOString().split('T')[0],
    time_slot: intent.time_slot || { start: '09:00', end: '18:00' },
  };

  let discovery = await runDiscoveryAgent(discoveryInput);
  trace.push(traceEntry('discovery', discoveryInput, discovery));

  // Auto-expand if zero results
  if (discovery.total_found === 0) {
    console.log('[Orchestrator] ⚠️ No workers found — expanding search...');
    discovery = await expandedDiscovery(
      intent.service_category,
      intent.location.lat,
      intent.location.lng
    );
    trace.push(traceEntry('discovery_expanded', {
      service_category: intent.service_category,
      note: 'Relaxed time/day/radius filters',
    }, discovery));
  }

  if (discovery.total_found === 0) {
    console.log('[Orchestrator] ❌ No workers found even after expansion');
    return {
      status: 'no_workers_found',
      intent,
      message: `No ${intent.service_display || intent.service_category} workers available in ${intent.location?.label || 'your area'} right now. Try a different time or location.`,
      trace,
      total_duration_ms: Date.now() - startTime,
    };
  }

  console.log(`[Orchestrator] ✅ Found ${discovery.total_found} candidates`);

  // ── Step 3: Ranking Agent ─────────────────────────────────────────────
  console.log('[Orchestrator] Step 3/4 — Ranking Agent...');
  const rankingInput = {
    candidates: discovery.candidates,
    user_request: intent,
  };

  const ranking = await rankCandidates(rankingInput);
  trace.push(traceEntry('ranking', {
    candidates_count: discovery.candidates.length,
  }, ranking));

  console.log(`[Orchestrator] ✅ Ranked ${ranking.ranked.length} workers`);

  // ── Step 4: Pricing Agent (for each ranked worker) ────────────────────
  console.log('[Orchestrator] Step 4/4 — Pricing Agent...');

  // Check if user is returning (has previous bookings)
  let isReturning = false;
  if (user_id) {
    try {
      const bookingSnap = await db.collection('bookings')
        .where('user_id', '==', user_id)
        .limit(1)
        .get();
      isReturning = !bookingSnap.empty;
    } catch {
      // Firestore might not be available — default to false
    }
  }

  const pricedWorkers = ranking.ranked.map(worker => {
    const pricingInput = {
      worker_base_price: worker._raw_worker?.base_price || worker.base_price || 1500,
      distance_km: worker.distance_km || 0,
      urgency: intent.urgency || 'next_day',
      complexity: intent.complexity || 'basic',
      is_returning_user: isReturning,
    };

    const pricing = runPricingAgent(pricingInput);

    return {
      worker_id: worker.worker_id,
      name: worker.name,
      total_score: worker.total_score,
      factors: worker.factors,
      reasoning: worker.reasoning,
      distance_km: worker.distance_km,
      rating: worker.rating,
      pricing: {
        final_price: pricing.final_price,
        breakdown: pricing.breakdown,
      },
    };
  });

  trace.push(traceEntry('pricing', {
    workers_priced: pricedWorkers.length,
    urgency: intent.urgency,
    complexity: intent.complexity,
    is_returning_user: isReturning,
  }, {
    agent: 'pricing',
    reasoning: `Priced ${pricedWorkers.length} workers. Prices range PKR ${Math.min(...pricedWorkers.map(w => w.pricing.final_price))} — ${Math.max(...pricedWorkers.map(w => w.pricing.final_price))}.`,
    duration_ms: 0,
  }));

  console.log(`[Orchestrator] ✅ All ${pricedWorkers.length} workers priced\n`);
  console.log('══════════════════════════════════════════════════════');
  console.log(`  Pipeline complete in ${Date.now() - startTime}ms`);
  console.log('══════════════════════════════════════════════════════\n');

  return {
    status: 'workers_found',
    intent: {
      service_category: intent.service_category,
      service_display: intent.service_display,
      location: intent.location,
      date: intent.date,
      time_slot: intent.time_slot,
      urgency: intent.urgency,
      complexity: intent.complexity,
      budget_hint: intent.budget_hint,
      language_detected: intent.language_detected,
      confidence: intent.confidence,
    },
    workers: pricedWorkers,
    total_candidates: discovery.total_found,
    expanded_search: discovery.expanded || false,
    trace,
    total_duration_ms: Date.now() - startTime,
  };
}

// ─── Pipeline 2: Process Booking ────────────────────────────────────────────

/**
 * Second step — user picked a worker. Create booking + notify + schedule follow-ups.
 *
 * @param {object} input
 * @param {string} input.user_id
 * @param {string} input.worker_id
 * @param {object} input.intent   - Intent data from processRequest response
 * @param {object} input.pricing  - Pricing data for the chosen worker
 * @param {string} [input.user_phone]
 * @param {string} [input.worker_phone]
 * @param {string} [input.worker_name]
 * @returns {Promise<object>}
 */
async function processBooking(input) {
  const startTime = Date.now();
  const trace = [];
  const {
    user_id, worker_id, intent, pricing,
    user_phone, worker_phone, worker_name,
  } = input;

  console.log('\n[Orchestrator] Booking pipeline — creating booking...');

  // ── Step 1: Booking Agent ─────────────────────────────────────────────
  const bookingInput = {
    user_id: user_id || 'anonymous',
    worker_id,
    service: {
      category: intent.service_category,
      display_name: intent.service_display,
    },
    slot: {
      date: intent.date || new Date().toISOString().split('T')[0],
      start: intent.time_slot?.start || '09:00',
      end: intent.time_slot?.end || '18:00',
    },
    location: intent.location,
    pricing,
    agent_trace: trace,
  };

  const booking = await runBookingAgent(bookingInput);
  trace.push(traceEntry('booking', { user_id, worker_id }, booking));

  // ── Step 2: Notification Agent ────────────────────────────────────────
  const notifInput = {
    booking_id: booking.booking_id,
    confirmation_code: booking.confirmation_code,
    user_phone: user_phone || 'N/A',
    worker_phone: worker_phone || 'N/A',
    worker_name: worker_name || worker_id,
    service_display: intent.service_display || intent.service_category,
    slot: {
      date: intent.date,
      start: intent.time_slot?.start,
      end: intent.time_slot?.end,
    },
    location: intent.location,
    final_price: pricing.final_price,
    language: intent.language_detected === 'roman_urdu' ? 'roman_urdu' : 'english',
  };

  const notifications = await runNotificationAgent(notifInput);
  trace.push(traceEntry('notification', { booking_id: booking.booking_id }, notifications));

  // ── Step 3: Follow-up Agent ───────────────────────────────────────────
  const followupInput = {
    booking_id: booking.booking_id,
    slot: {
      date: intent.date || new Date().toISOString().split('T')[0],
      start: intent.time_slot?.start || '09:00',
      end: intent.time_slot?.end || '18:00',
    },
    created_at: booking.created_at,
  };

  const followups = runFollowupAgent(followupInput);
  trace.push(traceEntry('followup', { booking_id: booking.booking_id }, followups));

  console.log(`[Orchestrator] ✅ Booking complete: ${booking.booking_id}`);

  return {
    status: 'booked',
    booking: {
      booking_id: booking.booking_id,
      confirmation_code: booking.confirmation_code,
      status: booking.status,
      created_at: booking.created_at,
    },
    notifications: notifications.notifications,
    followups: followups.followups,
    trace,
    total_duration_ms: Date.now() - startTime,
  };
}

// ─── Pipeline 3: Process Dispute ────────────────────────────────────────────

/**
 * Standalone dispute flow — wraps the Dispute Agent.
 */
async function processDispute(input) {
  return resolveDispute(input);
}

// ─── Pipeline 4: Side-by-Side Comparison ────────────────────────────────────

/**
 * Runs BOTH the agentic pipeline AND the baseline, returns side-by-side.
 *
 * @param {string} message  - Raw user input
 * @param {string} language - Language hint
 * @returns {Promise<object>}
 */
async function processComparison(message, language = 'auto') {
  const startTime = Date.now();

  // Run both in parallel
  const [agenticResult, intentForBaseline] = await Promise.all([
    processRequest(message, language),
    parseIntent(message, language),
  ]);

  // Run baseline using the parsed intent's category + location
  let baselineResult = { results: [], total_found: 0, method: 'baseline_keyword_distance' };
  if (intentForBaseline.status === 'parsed' && intentForBaseline.location) {
    baselineResult = await runBaseline({
      keyword: intentForBaseline.service_category || message,
      lat: intentForBaseline.location.lat,
      lng: intentForBaseline.location.lng,
    });
  }

  return {
    status: 'comparison_complete',
    agentic: {
      workers: agenticResult.workers || [],
      total_candidates: agenticResult.total_candidates || 0,
      pipeline_duration_ms: agenticResult.total_duration_ms,
      features: [
        'Multilingual intent parsing',
        '8-factor weighted ranking',
        'Dynamic pricing with breakdown',
        'AI-generated reasoning',
        'Availability + time slot filtering',
      ],
    },
    baseline: {
      workers: baselineResult.results || [],
      total_found: baselineResult.total_found || 0,
      pipeline_duration_ms: baselineResult.duration_ms,
      method: baselineResult.method,
      features: [
        'Keyword matching only',
        'Distance sort only',
        'No pricing intelligence',
        'No time/day filtering',
        'No ranking or scoring',
      ],
    },
    comparison_duration_ms: Date.now() - startTime,
  };
}

// ─── End-to-End Orchestrator (Prompt 3 compliance) ──────────────────────────
/**
 * Fully chains the 8-agent pipeline in a single end-to-end shot.
 * 
 * @param {string} message 
 * @param {string} language 
 * @param {string} user_id 
 * @returns {Promise<object>}
 */
async function orchestrate(message, language = 'auto', user_id = 'anonymous') {
  const startTime = Date.now();
  const trace = [];

  const addTrace = (name, summary, start) => {
    trace.push({
      agent_name: name,
      status: 'done',
      output_summary: summary,
      duration_ms: Date.now() - start
    });
  };

  try {
    // 1. Intent Agent
    let tStart = Date.now();
    const intent = await runIntentAgent({ message, language });
    addTrace('intentAgent', { service: intent.service_category, location: intent.location?.label }, tStart);

    if (intent.status === 'needs_clarification') {
      return { success: false, error: 'needs_clarification', message: intent.message, trace, total_duration_ms: Date.now() - startTime };
    }

    // 2. Discovery Agent
    tStart = Date.now();
    let discovery = await runDiscoveryAgent({
      service_category: intent.service_category,
      lat: intent.location?.lat,
      lng: intent.location?.lng,
      date: intent.date,
      time_slot: intent.time_slot
    });
    addTrace('discoveryAgent', { candidates_found: discovery.total_found }, tStart);

    // 3. Check Candidates
    if (discovery.total_found === 0) {
      return {
        success: false,
        error: 'no_providers',
        message: 'Koi karigar nahi mila is area mein.',
        trace,
        total_duration_ms: Date.now() - startTime
      };
    }

    // 4. Ranking Agent
    tStart = Date.now();
    const ranking = await runRankingAgent({ candidates: discovery.candidates, user_request: intent });
    const topWorker = ranking.ranked[0];
    addTrace('rankingAgent', { top_worker: topWorker?.name, score: topWorker?.total_score }, tStart);

    // 5. Pricing Agent
    tStart = Date.now();
    const pricing = runPricingAgent({
      worker_base_price: topWorker.base_price || topWorker._raw_worker?.base_price || 1500,
      distance_km: topWorker.distance_km,
      urgency: intent.urgency,
      complexity: intent.complexity,
      is_returning_user: false
    });
    addTrace('pricingAgent', { final_price: pricing.final_price }, tStart);

    // 6. Master Reasoning via Gemini (Conversational Reply)
    let reply = '';
    const summaryMsg = `We received request: "${message}". Intent extracted: ${intent.service_category} at ${intent.location?.label}. Found ${discovery.total_found} candidates. Top candidate is ${topWorker.name} at ${pricing.final_price} PKR.`;
    
    try {
      reply = await callGeminiText(
        'You are KARIGAR Agent. Write a friendly 1-2 sentence response in Roman Urdu directly addressing the user, confirming you understood their request and found workers.',
        summaryMsg,
        { temperature: 0.3, maxTokens: 100 }
      );
    } catch (e) {
      reply = `Mainey aapki request samajh li hai aur mujhe ${discovery.total_found} karigar mil gaye hain. Sab se behtar ${topWorker.name} hai.`;
    }

    addTrace('geminiReply', { reply }, tStart);

    return {
      success: true,
      intent,
      reply,
      workers: [
        {
          ...topWorker,
          pricing,
        },
        // We can add more workers from the ranked list here if needed, but the UI expects a workers array
        ...ranking.ranked.slice(1, 3).map(w => ({
          ...w,
          pricing: runPricingAgent({
            worker_base_price: w.base_price || w._raw_worker?.base_price || 1500,
            distance_km: w.distance_km,
            urgency: intent.urgency,
            complexity: intent.complexity,
            is_returning_user: false
          })
        }))
      ],
      total_candidates: discovery.total_found,
      expanded_search: discovery.expanded || false,
      trace,
      total_duration_ms: Date.now() - startTime,
    };

  } catch (err) {
    return {
      success: false,
      error: err.message,
      trace,
      total_duration_ms: Date.now() - startTime
    };
  }
}

// ─── Exports ────────────────────────────────────────────────────────────────

module.exports = {
  orchestrate,
  processRequest,
  processBooking,
  processDispute,
  processComparison,
};
