// ─── Dispute Agent (Person A — Brain) ────────────────────────────────────────
// Handles user complaints about completed bookings. Uses a hybrid approach:
//   1. Gemini classifies the complaint (multilingual → structured)
//   2. Code rules auto-resolve clear-cut cases (no-show, overcharging w/ proof)
//   3. Gemini reasons about ambiguous cases (quality, behavior)
//   4. Low-confidence verdicts → requires_human_review
//   5. User-facing response generated in their detected language
//   6. Worker impact calculated (rating adjustment, flags, penalties)
//
// Architecture: Hybrid (Code rules + Gemini reasoning)
// Escalation: Auto-resolve if confidence >= 0.80, else flag for human review

const { callGemini, callGeminiText } = require('../utils/gemini');
const { v4: uuidv4 } = require('uuid');

// ─── Constants ──────────────────────────────────────────────────────────────

const DISPUTE_CATEGORIES = [
  'no_show',        // Worker didn't show up
  'quality',        // Work was subpar / incomplete
  'overcharging',   // Charged more than quoted
  'lateness',       // Showed up significantly late
  'behavior',       // Rude / unprofessional conduct
  'wrong_service',  // Wrong type of service provided
  'other',          // Anything else
];

const VERDICT_OPTIONS = [
  'full_refund',    // Complete refund to user
  'partial_refund', // Partial refund (e.g., 50%)
  're_service',     // Free re-service by another worker
  'warning',        // Warning issued to worker, no refund
  'dismissed',      // Complaint not valid / insufficient evidence
];

// Confidence threshold — below this, always flag for human review
const AUTO_RESOLVE_THRESHOLD = 0.80;

// ─── Clear-Cut Rules Engine ─────────────────────────────────────────────────
// These rules auto-resolve without needing Gemini to reason.
// They fire ONLY when the evidence is unambiguous.

const CLEAR_CUT_RULES = {
  no_show: {
    verdict: 'full_refund',
    confidence: 0.95,
    requires_human_review: false,
    reasoning_template: 'Worker did not arrive for the scheduled service. Full refund issued automatically per KARIGAR policy.',
    compensation_percent: 100,
    worker_impact: {
      rating_adjustment: -0.3,
      add_dispute_flag: true,
      suggested_penalty: 'suspension_warning',
    },
  },

  overcharging: {
    // Only auto-resolves if charged_amount is provided AND exceeds quoted price
    verdict: 'partial_refund',
    confidence: 0.90,
    requires_human_review: false,
    reasoning_template: 'Worker charged PKR {charged} vs quoted PKR {quoted}. Overcharge of PKR {difference} refunded.',
    // compensation_percent is dynamic — refund the difference
    worker_impact: {
      rating_adjustment: -0.2,
      add_dispute_flag: true,
      suggested_penalty: 'warning',
    },
  },
};

// ─── Gemini Classification Prompt ───────────────────────────────────────────

const CLASSIFY_SYSTEM_PROMPT = `You are KARIGAR's Dispute Classifier. You receive a user complaint (in English, Urdu, Roman Urdu, or mixed) about a completed service booking and must classify it.

## Output Schema (respond with ONLY this JSON):
{
  "category": "one of: no_show, quality, overcharging, lateness, behavior, wrong_service, other",
  "severity": "low | medium | high | critical",
  "complaint_summary": "a clean 1-line English summary of what happened",
  "language_detected": "english | urdu | roman_urdu | mixed",
  "key_claims": ["list", "of", "specific", "claims", "the user made"],
  "mentions_physical_damage": true/false,
  "mentions_safety_issue": true/false,
  "emotional_tone": "calm | frustrated | angry | threatening"
}

## Category Guide:
- no_show → Worker didn't come at all, didn't show up, nahi aaya
- quality → Work was bad, didn't fix the problem, incomplete job, theek nahi kiya
- overcharging → Charged more money than agreed, zyada paisa maanga, extra charge
- lateness → Came very late, 2 ghante baad aaya, late arrival
- behavior → Rude, unprofessional, badtameez, disrespectful
- wrong_service → Wrong person sent, different service than requested
- other → Doesn't fit any category clearly

## Severity Guide:
- low → Minor inconvenience, preference issue
- medium → Service not fully satisfactory, moderate delay
- high → Service failed, significant overcharging, major delay
- critical → Safety concern, physical damage, threatening behavior

## Rules:
1. ALWAYS respond with valid JSON only — no markdown, no explanation.
2. Keep complaint_summary in English regardless of input language.
3. Be precise with category — pick the PRIMARY issue.
4. If multiple issues, pick the most severe one as the category.`;

// ─── Gemini Reasoning Prompt ────────────────────────────────────────────────

const REASONING_SYSTEM_PROMPT = `You are KARIGAR's Dispute Resolver — a fair, impartial AI judge for service complaints in Islamabad. You receive a classified complaint with booking context and worker history, then reason about the appropriate verdict.

## Output Schema (respond with ONLY this JSON):
{
  "verdict": "one of: full_refund, partial_refund, re_service, warning, dismissed",
  "confidence": 0.0 to 1.0,
  "reasoning": "2-3 sentence explanation of WHY this verdict was chosen, referencing specific evidence",
  "partial_refund_percent": 50,
  "mitigating_factors": ["list of factors that influenced the decision"],
  "aggravating_factors": ["list of factors that made it worse"]
}

## Verdict Guide:
- full_refund → Service completely failed (no-show, major safety issue, total incompetence)
- partial_refund → Service was delivered but significantly flawed (50-70% refund typical)
- re_service → Service can be redone properly by another worker (quality issues, wrong service)
- warning → Minor issue, worker gets a warning but no refund (slight lateness, minor attitude)
- dismissed → Complaint has no merit, or is a misunderstanding

## Reasoning Principles:
1. Worker history matters — first-time offense by a 4.8★ worker with 150+ jobs deserves leniency.
2. Severity matters — safety issues always get full_refund + critical flag.
3. Evidence matters — specific claims ("AC still leaking") > vague claims ("kaam theek nahi tha").
4. Balance fairness — protect users from bad service, protect workers from frivolous complaints.
5. If unsure, set confidence below 0.80 so a human reviews it.

## Rules:
1. ALWAYS respond with valid JSON only.
2. Be fair — not every complaint deserves a refund.
3. Consider the worker's track record in your reasoning.`;

// ─── User-Facing Response Prompt ────────────────────────────────────────────

const RESPONSE_SYSTEM_PROMPT = `You are KARIGAR's customer communication writer. You write SHORT, empathetic resolution messages to users about their service complaints.

Rules:
1. Write in the SAME LANGUAGE as specified in the instruction.
2. Keep it under 3 sentences.
3. Be warm, professional, and action-oriented.
4. Mention the specific resolution (refund amount, re-service, etc).
5. Respond with ONLY the message text — no JSON, no quotes, no extra formatting.`;

// ─── Worker Impact Calculator ───────────────────────────────────────────────

/**
 * Calculate the impact on a worker's profile based on the dispute outcome.
 * Considers the worker's history — first-time offenders get lighter treatment.
 *
 * @param {string} category    - Dispute category
 * @param {string} verdict     - Resolution verdict
 * @param {string} severity    - low/medium/high/critical
 * @param {object} workerHistory - Worker's track record
 * @returns {object} - Impact adjustments
 */
function calculateWorkerImpact(category, verdict, severity, workerHistory) {
  const pastDisputes = workerHistory?.past_disputes || 0;
  const rating = workerHistory?.rating || 3.0;
  const completedJobs = workerHistory?.completed_jobs || 0;

  // Base impact by verdict
  const impactMap = {
    full_refund:    { rating_adj: -0.3, penalty: 'suspension_warning' },
    partial_refund: { rating_adj: -0.2, penalty: 'warning' },
    re_service:     { rating_adj: -0.1, penalty: 'warning' },
    warning:        { rating_adj: -0.05, penalty: 'verbal_warning' },
    dismissed:      { rating_adj: 0, penalty: 'none' },
  };

  const base = impactMap[verdict] || impactMap.dismissed;

  // Severity multiplier
  const severityMultiplier = {
    low: 0.5, medium: 1.0, high: 1.5, critical: 2.0,
  };
  const multiplier = severityMultiplier[severity] || 1.0;

  // Leniency for first-time offenders with good history
  let leniencyFactor = 1.0;
  if (pastDisputes === 0 && rating >= 4.5 && completedJobs >= 50) {
    leniencyFactor = 0.5; // Half impact for stellar workers on first offense
  } else if (pastDisputes >= 3) {
    leniencyFactor = 1.5; // Harsher for repeat offenders
  }

  const ratingAdjustment = Math.round(base.rating_adj * multiplier * leniencyFactor * 100) / 100;

  // Escalate penalty for repeat offenders
  let penalty = base.penalty;
  if (pastDisputes >= 3 && verdict !== 'dismissed') {
    penalty = 'temporary_suspension';
  } else if (pastDisputes >= 5) {
    penalty = 'permanent_review';
  }

  return {
    rating_adjustment: ratingAdjustment,
    add_dispute_flag: verdict !== 'dismissed',
    suggested_penalty: penalty,
    is_repeat_offender: pastDisputes >= 2,
    leniency_applied: leniencyFactor < 1.0,
  };
}

// ─── Compensation Calculator ────────────────────────────────────────────────

/**
 * Calculate compensation based on verdict, pricing, and overcharge amount.
 *
 * @param {string} verdict        - Resolution verdict
 * @param {number} finalPrice     - Original quoted/final price
 * @param {number|null} chargedAmount  - What the worker actually charged
 * @param {number} partialPercent - Percentage for partial refunds (from Gemini)
 * @returns {object|null} - Compensation details or null
 */
function calculateCompensation(verdict, finalPrice, chargedAmount, partialPercent = 50) {
  if (verdict === 'dismissed' || verdict === 'warning') {
    return null;
  }

  const price = parseFloat(finalPrice) || 0;

  if (verdict === 'full_refund') {
    return {
      type: 'refund',
      amount: price,
      currency: 'PKR',
      description: 'Full service refund',
    };
  }

  if (verdict === 'partial_refund') {
    // If overcharging with known amounts, refund the difference
    if (chargedAmount && chargedAmount > price) {
      const overcharge = chargedAmount - price;
      return {
        type: 'refund',
        amount: overcharge,
        currency: 'PKR',
        description: `Overcharge refund (PKR ${overcharge})`,
      };
    }

    // Otherwise use the percentage
    const refundAmount = Math.round(price * (partialPercent / 100));
    return {
      type: 'refund',
      amount: refundAmount,
      currency: 'PKR',
      description: `${partialPercent}% partial refund`,
    };
  }

  if (verdict === 're_service') {
    return {
      type: 're_service',
      amount: 0,
      currency: 'PKR',
      description: 'Free re-service by a different worker',
    };
  }

  return null;
}

// ─── Main Entry Point ───────────────────────────────────────────────────────

/**
 * Process a user dispute/complaint about a completed booking.
 * This is the function the Orchestrator calls.
 *
 * @param {object} input
 * @param {string} input.complaint_text   - Raw user complaint (multilingual)
 * @param {string} input.language         - Language hint ("auto" for auto-detect)
 * @param {object} input.booking          - Booking data
 * @param {object} input.worker_history   - Worker's track record
 * @param {number} [input.charged_amount] - What worker actually charged (optional)
 * @returns {Promise<object>} - Dispute resolution
 */
async function resolveDispute({
  complaint_text,
  language = 'auto',
  booking = {},
  worker_history = {},
  charged_amount = null,
}) {
  const startTime = Date.now();
  const disputeId = `DSP-${Date.now()}-${uuidv4().slice(0, 4).toUpperCase()}`;

  console.log(`[Dispute Agent] Processing dispute ${disputeId}...`);

  // ── Step 1: Classify the complaint via Gemini ──
  console.log('[Dispute Agent] Step 1 — Classifying complaint...');

  let classification;
  try {
    const classifyInput = `Complaint: "${complaint_text}"
Booking service: ${booking.service_type || 'unknown'}
Worker: ${booking.worker_name || 'unknown'}
Booked time: ${booking.slot_date || 'unknown'} ${booking.slot_time?.start || ''}-${booking.slot_time?.end || ''}
Quoted price: PKR ${booking.pricing?.final_price || 'unknown'}
${charged_amount ? `Actually charged: PKR ${charged_amount}` : ''}`;

    const { parsed } = await callGemini(CLASSIFY_SYSTEM_PROMPT, classifyInput, {
      temperature: 0.2,
      maxTokens: 512,
    });

    if (!parsed) throw new Error('Gemini returned non-JSON for classification');
    classification = parsed;
  } catch (err) {
    console.error('[Dispute Agent] Classification failed:', err.message);
    // Fallback classification
    classification = {
      category: 'other',
      severity: 'medium',
      complaint_summary: complaint_text.slice(0, 100),
      language_detected: language !== 'auto' ? language : 'english',
      key_claims: [],
      mentions_physical_damage: false,
      mentions_safety_issue: false,
      emotional_tone: 'frustrated',
    };
  }

  console.log(`[Dispute Agent] Classified: ${classification.category} (${classification.severity})`);

  const detectedLanguage = classification.language_detected || 'english';

  // ── Step 2: Check clear-cut rules (code-driven auto-resolve) ──
  let verdict, confidence, reasoning, partialPercent, requiresHumanReview;

  const clearCutRule = CLEAR_CUT_RULES[classification.category];
  const isOverchargeWithProof = classification.category === 'overcharging'
    && charged_amount
    && booking.pricing?.final_price
    && charged_amount > booking.pricing.final_price;

  const isClearCut = (classification.category === 'no_show')
    || isOverchargeWithProof;

  if (isClearCut && clearCutRule) {
    console.log('[Dispute Agent] Step 2 — Clear-cut case, auto-resolving...');

    verdict = clearCutRule.verdict;
    confidence = clearCutRule.confidence;
    requiresHumanReview = false;
    partialPercent = 100;

    if (isOverchargeWithProof) {
      const diff = charged_amount - booking.pricing.final_price;
      reasoning = clearCutRule.reasoning_template
        .replace('{charged}', charged_amount)
        .replace('{quoted}', booking.pricing.final_price)
        .replace('{difference}', diff);
    } else {
      reasoning = clearCutRule.reasoning_template;
    }
  } else {
    // ── Step 3: Gemini reasons about ambiguous cases ──
    console.log('[Dispute Agent] Step 2 — Ambiguous case, calling Gemini for reasoning...');

    try {
      const reasoningInput = `
Complaint category: ${classification.category}
Severity: ${classification.severity}
Summary: ${classification.complaint_summary}
Key claims: ${classification.key_claims?.join(', ') || 'None specific'}
Emotional tone: ${classification.emotional_tone}
Physical damage mentioned: ${classification.mentions_physical_damage}
Safety issue mentioned: ${classification.mentions_safety_issue}

Booking details:
- Service: ${booking.service_type || 'unknown'}
- Worker: ${booking.worker_name || 'unknown'}
- Date: ${booking.slot_date || 'unknown'}
- Quoted price: PKR ${booking.pricing?.final_price || 'unknown'}
${charged_amount ? `- Actually charged: PKR ${charged_amount}` : ''}

Worker history:
- Rating: ${worker_history.rating || 'N/A'}/5
- Total reviews: ${worker_history.total_reviews || 0}
- Completed jobs: ${worker_history.completed_jobs || 0}
- On-time rate: ${worker_history.on_time_rate || 'N/A'}%
- Cancellation rate: ${worker_history.cancellation_rate || 'N/A'}%
- Past disputes: ${worker_history.past_disputes || 0}

Provide your verdict with reasoning.`.trim();

      const { parsed } = await callGemini(REASONING_SYSTEM_PROMPT, reasoningInput, {
        temperature: 0.3,
        maxTokens: 1024,
      });

      if (!parsed) throw new Error('Gemini returned non-JSON for reasoning');

      verdict = VERDICT_OPTIONS.includes(parsed.verdict) ? parsed.verdict : 'warning';
      confidence = Math.min(1.0, Math.max(0.0, parseFloat(parsed.confidence) || 0.5));
      reasoning = parsed.reasoning || 'Gemini provided no reasoning.';
      partialPercent = parsed.partial_refund_percent || 50;
      requiresHumanReview = confidence < AUTO_RESOLVE_THRESHOLD;

    } catch (err) {
      console.warn('[Dispute Agent] Gemini reasoning failed, using fallback:', err.message);
      // Conservative fallback — escalate to human
      verdict = 'warning';
      confidence = 0.40;
      reasoning = 'Automated reasoning unavailable. Escalated for human review.';
      partialPercent = 50;
      requiresHumanReview = true;
    }
  }

  // Safety override: critical severity ALWAYS gets escalated
  if (classification.severity === 'critical') {
    requiresHumanReview = true;
  }
  if (classification.mentions_safety_issue) {
    requiresHumanReview = true;
    if (verdict === 'dismissed' || verdict === 'warning') {
      verdict = 'full_refund';
      confidence = 0.70;
      reasoning += ' Safety concern flagged — escalated with full refund pending human review.';
    }
  }

  // ── Step 4: Calculate compensation ──
  const compensation = calculateCompensation(
    verdict,
    booking.pricing?.final_price,
    charged_amount,
    partialPercent
  );

  // ── Step 5: Calculate worker impact ──
  const workerImpact = calculateWorkerImpact(
    classification.category,
    verdict,
    classification.severity,
    worker_history
  );

  // ── Step 6: Generate user-facing response in their language ──
  console.log(`[Dispute Agent] Step 3 — Generating user response in ${detectedLanguage}...`);

  let userMessage;
  try {
    const langInstruction = (detectedLanguage === 'roman_urdu' || detectedLanguage === 'urdu' || detectedLanguage === 'mixed')
      ? 'Write in Roman Urdu (Urdu written in English letters).'
      : 'Write in English.';

    const responseInput = `${langInstruction}

Complaint was about: ${classification.complaint_summary}
Resolution: ${verdict.replace('_', ' ')}
${compensation ? `Compensation: ${compensation.description} — PKR ${compensation.amount}` : 'No monetary compensation.'}
${requiresHumanReview ? 'Note: This case has been escalated to our team for further review.' : ''}

Write a short, empathetic message to the customer about this resolution.`;

    userMessage = await callGeminiText(RESPONSE_SYSTEM_PROMPT, responseInput, {
      temperature: 0.6,
      maxTokens: 256,
    });

    userMessage = userMessage.trim().replace(/^["']|["']$/g, '');
  } catch (err) {
    console.warn('[Dispute Agent] User response generation failed:', err.message);
    // Fallback messages
    const isUrdu = detectedLanguage === 'roman_urdu' || detectedLanguage === 'urdu' || detectedLanguage === 'mixed';
    if (isUrdu) {
      userMessage = `Aapki shikayat mil gayi hai. Hum is mamlay ko dekh rahe hain aur jald hal karein ge. ${compensation ? `PKR ${compensation.amount} refund process ho raha hai.` : ''}`;
    } else {
      userMessage = `Your complaint has been received and is being processed. ${compensation ? `A refund of PKR ${compensation.amount} will be issued to your account.` : 'We will follow up with the service provider.'}`;
    }
  }

  // ── Assemble final result ──
  const status = requiresHumanReview ? 'escalated' : 'resolved';
  console.log(`[Dispute Agent] ✅ ${status.toUpperCase()} — ${verdict} (confidence: ${confidence})`);

  return {
    status,
    agent: 'dispute',
    dispute_id: disputeId,
    category: classification.category,
    severity: classification.severity,
    verdict,
    confidence,
    requires_human_review: requiresHumanReview,
    compensation,
    reasoning,
    complaint_summary: classification.complaint_summary,
    key_claims: classification.key_claims || [],
    emotional_tone: classification.emotional_tone,
    user_message: userMessage,
    worker_impact: workerImpact,
    language_detected: detectedLanguage,
    duration_ms: Date.now() - startTime,
  };
}

// ─── Exports ────────────────────────────────────────────────────────────────

module.exports = {
  resolveDispute,
  // Exported for unit testing
  calculateWorkerImpact,
  calculateCompensation,
  DISPUTE_CATEGORIES,
  VERDICT_OPTIONS,
  AUTO_RESOLVE_THRESHOLD,
};
