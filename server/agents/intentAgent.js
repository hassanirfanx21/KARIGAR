// ─── Intent Agent (Person A — Brain) ────────────────────────────────────────
// First agent in the pipeline. Parses raw multilingual user messages into
// structured JSON that all downstream agents can consume.
//
// Architecture: Approach B (Gemini extracts raw → Code validates/resolves)
// Prompt Style: Schema + Few-shot examples
// Category Mapping: Hybrid (Gemini picks from 7 → code validates with keyword fallback)
// Confidence: Code-driven (field completeness scoring)
// Failures: needs_clarification with partial preservation + per-field questions

const { callGemini } = require('../utils/gemini');
const { geocode } = require('../utils/geocoder');

// ─── Constants ──────────────────────────────────────────────────────────────

const VALID_CATEGORIES = [
  'hvac', 'plumbing', 'electrical', 'cleaning',
  'carpentry', 'painting', 'tutoring',
];

// Keyword fallback map — used when Gemini returns something outside the 7
const CATEGORY_KEYWORDS = {
  hvac: [
    'ac', 'air conditioner', 'air conditioning', 'cooling', 'heating', 'hvac',
    'ac repair', 'ac technician', 'ac installation', 'gas refill', 'gas refilling',
    'refrigerator', 'fridge', 'split ac', 'inverter ac', 'window ac',
    'thanda', 'ac ka kaam',
  ],
  plumbing: [
    'plumber', 'plumbing', 'pipe', 'pipes', 'leak', 'leakage', 'tap', 'nalkay',
    'bathroom', 'geyser', 'water tank', 'sewerage', 'naali', 'flush',
    'toilet', 'basin', 'sanitary', 'pani ka kaam',
  ],
  electrical: [
    'electrician', 'electrical', 'bijli', 'wiring', 'wire', 'switch', 'switchboard',
    'generator', 'ups', 'fan', 'light', 'bulb', 'circuit', 'breaker',
    'solar', 'panel', 'bijli ka kaam', 'current',
  ],
  cleaning: [
    'cleaning', 'safai', 'clean', 'deep clean', 'deep cleaning',
    'pest control', 'fumigation', 'keera', 'makora',
    'kitchen clean', 'bathroom clean', 'office clean', 'ghar ki safai',
  ],
  carpentry: [
    'carpenter', 'carpentry', 'furniture', 'cabinet', 'door', 'wood',
    'wardrobe', 'lakri', 'lakri ka kaam', 'shelf', 'table', 'chair',
    'almaari', 'kitchen cabinet', 'furniture repair',
  ],
  painting: [
    'painter', 'painting', 'paint', 'rang', 'texture', 'pop',
    'wall', 'interior', 'exterior', 'distemper', 'rang ka kaam',
    'wall painting', 'ghar paint',
  ],
  tutoring: [
    'tutor', 'tutoring', 'teacher', 'tuition', 'padhai', 'parhana',
    'maths', 'math', 'physics', 'english', 'science', 'chemistry',
    'o level', 'a level', 'matric', 'fsc', 'home tutor',
  ],
};

// Time-of-day slot definitions
const TIME_SLOTS = {
  subah:    { start: '09:00', end: '12:00', label: 'Subah (Morning)' },
  morning:  { start: '09:00', end: '12:00', label: 'Morning' },
  dopahar:  { start: '12:00', end: '15:00', label: 'Dopahar (Afternoon)' },
  afternoon:{ start: '12:00', end: '15:00', label: 'Afternoon' },
  shaam:    { start: '15:00', end: '19:00', label: 'Shaam (Evening)' },
  evening:  { start: '15:00', end: '19:00', label: 'Evening' },
  raat:     { start: '19:00', end: '22:00', label: 'Raat (Night)' },
  night:    { start: '19:00', end: '22:00', label: 'Night' },
};

// Day keywords → offset from today
const DAY_KEYWORDS = {
  'abhi':        0,
  'foran':       0,
  'now':         0,
  'immediately': 0,
  'urgent':      0,
  'aaj':         0,
  'today':       0,
  'kal':         1,
  'tomorrow':    1,
  'parson':      2,
  'parso':       2,
  'day after':   2,
  'is hafte':    3,   // this week — approximate to 3 days out
  'this week':   3,
  'aglay hafte': 7,
  'aglay hafta': 7,
  'next week':   7,
};

// Urgency keywords
const URGENCY_KEYWORDS = {
  same_day: ['abhi', 'foran', 'now', 'immediately', 'urgent', 'jaldi', 'emergency', 'aaj'],
  next_day: ['kal', 'tomorrow', 'parson', 'parso'],
  later:    ['is hafte', 'this week', 'aglay hafte', 'aglay hafta', 'next week', 'baad mein'],
};

// ─── System Prompt for Gemini ───────────────────────────────────────────────

const SYSTEM_PROMPT = `You are KARIGAR Agent for a Pakistani home services app. The user message is in Urdu or Roman Urdu. Extract the following and respond ONLY in valid JSON with no extra text: { intent: 'find_worker' | 'book' | 'query' | 'other', service_type: 'plumber' | 'electrician' | 'painter' | 'AC technician' | 'carpenter' | 'other' | null, location_mentioned: string or null, is_service_clear: true | false, is_location_clear: true | false, clarification_needed: string or null }`;

// ─── Date/Time Resolver ─────────────────────────────────────────────────────

/**
 * Resolves a raw time expression like "kal subah" into a concrete date and time slot.
 *
 * @param {string|null} timeRaw - e.g. "kal subah", "parson afternoon", "abhi"
 * @returns {{ date: string, time_slot: {start, end, label}, urgency: string } | null}
 */
function resolveDateTime(timeRaw) {
  if (!timeRaw) return null;

  const normalized = timeRaw.toLowerCase().trim();

  // ── Find the day offset ──
  let dayOffset = null;
  let matchedDayKeyword = null;

  // Sort keys by length (longest first) to match "is hafte" before partial hits
  const sortedDayKeys = Object.keys(DAY_KEYWORDS).sort((a, b) => b.length - a.length);

  for (const keyword of sortedDayKeys) {
    if (normalized.includes(keyword)) {
      dayOffset = DAY_KEYWORDS[keyword];
      matchedDayKeyword = keyword;
      break;
    }
  }

  // Default to today if no day keyword found
  if (dayOffset === null) dayOffset = 0;

  // Compute the actual date
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + dayOffset);
  const dateStr = targetDate.toISOString().split('T')[0]; // "2026-05-16"

  // ── Find the time slot ──
  let timeSlot = null;
  let timeLabel = null;

  for (const [keyword, slot] of Object.entries(TIME_SLOTS)) {
    if (normalized.includes(keyword)) {
      timeSlot = slot;
      timeLabel = keyword;
      break;
    }
  }

  // Default time slot if none specified
  if (!timeSlot) {
    timeSlot = { start: '09:00', end: '18:00', label: 'Full Day' };
  }

  // ── Determine urgency from the day keyword ──
  let urgency = 'next_day'; // default
  for (const [level, keywords] of Object.entries(URGENCY_KEYWORDS)) {
    if (matchedDayKeyword && keywords.includes(matchedDayKeyword)) {
      urgency = level;
      break;
    }
  }

  return {
    date: dateStr,
    time_slot: timeSlot,
    urgency,
  };
}

// ─── Category Validator (Keyword Fallback) ──────────────────────────────────

/**
 * Validates the category from Gemini. If it's not one of the 7, uses keyword
 * matching on the service_raw string to find the closest match.
 *
 * @param {string|null} geminiCategory - Category returned by Gemini
 * @param {string|null} serviceRaw - Raw service text from user
 * @returns {string|null} - Validated category or null if unmappable
 */
function validateCategory(geminiCategory, serviceRaw) {
  // If Gemini returned a valid category, trust it
  if (geminiCategory && VALID_CATEGORIES.includes(geminiCategory.toLowerCase())) {
    return geminiCategory.toLowerCase();
  }

  // Fallback: keyword matching on the raw service text
  if (!serviceRaw) return null;

  const normalizedService = serviceRaw.toLowerCase();

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (normalizedService.includes(keyword)) {
        return category;
      }
    }
  }

  // Last resort: return what Gemini said even if it's not in our list
  // The orchestrator can handle this edge case
  return geminiCategory ? geminiCategory.toLowerCase() : null;
}

// ─── Confidence Calculator ──────────────────────────────────────────────────

/**
 * Computes a code-driven confidence score based on how many fields were
 * successfully extracted and resolved.
 *
 * Scoring weights:
 *   service_category resolved  → 0.30
 *   location geocoded          → 0.25
 *   date/time resolved         → 0.20
 *   time slot specific         → 0.10
 *   urgency determined         → 0.05
 *   complexity determined      → 0.05
 *   budget provided            → 0.05
 *
 * @param {object} result - The assembled intent result
 * @returns {number} - Confidence score from 0.0 to 1.0
 */
function computeConfidence(result) {
  let score = 0;

  // Service category present and valid?
  if (result.service_category && VALID_CATEGORIES.includes(result.service_category)) {
    score += 0.30;
  }

  // Location resolved (not just approximate fallback)?
  if (result.location && !result.location.label.includes('(approximate)')) {
    score += 0.25;
  } else if (result.location) {
    score += 0.10; // partial credit for approximate
  }

  // Date resolved?
  if (result.date) {
    score += 0.20;
  }

  // Time slot is specific (not "Full Day" default)?
  if (result.time_slot && result.time_slot.label !== 'Full Day') {
    score += 0.10;
  } else if (result.time_slot) {
    score += 0.05; // partial credit for default slot
  }

  // Urgency determined?
  if (result.urgency && result.urgency !== 'normal') {
    score += 0.05;
  }

  // Complexity determined?
  if (result.complexity && result.complexity !== 'basic') {
    score += 0.05;
  }

  // Budget provided?
  if (result.budget_hint !== null && result.budget_hint !== undefined) {
    score += 0.05;
  }

  return Math.round(score * 100) / 100; // round to 2 decimals
}

// ─── Clarification Builder ──────────────────────────────────────────────────

/**
 * Builds a needs_clarification response with partial data preserved
 * and per-field follow-up questions in the user's detected language.
 *
 * @param {object} partial - Whatever was successfully parsed
 * @param {string} language - Detected language for response tone
 * @returns {object} - Clarification response
 */
function buildClarification(partial, language) {
  const isUrdu = language === 'roman_urdu' || language === 'urdu' || language === 'mixed';

  const missing = [];

  if (!partial.service_category) {
    missing.push({
      field: 'service',
      question: isUrdu
        ? 'Aapko kis tarah ki service chahiye? (e.g., AC repair, plumber, electrician)'
        : 'What type of service do you need? (e.g., AC repair, plumber, electrician)',
    });
  }

  if (!partial.location_raw) {
    missing.push({
      field: 'location',
      question: isUrdu
        ? 'Kis sector ya area mein service chahiye? (e.g., G-13, F-8, DHA)'
        : 'Which sector or area do you need the service in? (e.g., G-13, F-8, DHA)',
    });
  }

  if (!partial.date) {
    missing.push({
      field: 'time',
      question: isUrdu
        ? 'Kab chahiye? (e.g., aaj, kal subah, parson shaam)'
        : 'When do you need this? (e.g., today, tomorrow morning)',
    });
  }

  return {
    status: 'needs_clarification',
    partial: {
      service_category: partial.service_category || null,
      service_display: partial.service_display || null,
      location: partial.location || null,
      date: partial.date || null,
      language_detected: language || 'unknown',
    },
    missing,
    message: isUrdu
      ? 'Thori aur details chahiye taake hum aapki madad kar sakein:'
      : 'We need a few more details to help you:',
  };
}

// ─── Main Entry Point ───────────────────────────────────────────────────────

/**
 * Retry helper for transient failures.
 */
async function callGeminiWithRetry(prompt, message, options, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    try {
      return await callGemini(prompt, message, options);
    } catch (err) {
      if (i === retries) throw err;
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }
}

/**
 * Parse a raw user message into a structured service request.
 * This is the function the Orchestrator calls.
 *
 * @param {string} message - Raw user input (multilingual)
 * @param {string} language - Language hint ("auto" for auto-detect)
 * @returns {Promise<object>} - Structured intent or needs_clarification
 */
async function parseIntent(message, language = 'auto') {
  const startTime = Date.now();

  console.log('[Intent Agent] Calling Gemini to extract intent...');

  let extraction = null;
  try {
    const { parsed } = await callGeminiWithRetry(SYSTEM_PROMPT, message, {
      temperature: 0.2,
      maxTokens: 1024,
    });
    if (parsed) extraction = parsed;
  } catch (err) {
    const isQuota = err.message.includes('429')
      || err.message.toLowerCase().includes('quota')
      || err.message.includes('Too Many Requests');
    if (isQuota) throw err; // let runIntentAgent catch this and use keyword fallback
    console.warn('[Intent Agent] Gemini failed, continuing with keyword extraction:', err.message);
  }

  // If extraction failed, fallback
  if (!extraction) {
    throw new Error('Gemini extraction failed to return valid JSON');
  }

  // Handle Contingency Check (Priority 2 Step 3)
  if (extraction.is_service_clear === false) {
    return {
      status: 'needs_clarification',
      message: extraction.clarification_needed || "Aap kaunsi service chahte hain? Jaise plumber, electrician, painter wagera.",
      agent: 'intent',
      duration_ms: Date.now() - startTime
    };
  }

  // For location, we'll check if it's missing entirely (we can check GPS later, but here we just flag it if no GPS was passed in)
  if (extraction.is_location_clear === false) {
    return {
      status: 'needs_clarification',
      message: extraction.clarification_needed || "Aap kahan hain? Apna area batayein jaise G-13 Islamabad, ya location share karein.",
      agent: 'intent',
      duration_ms: Date.now() - startTime
    };
  }

  // Map service_type to our internal categories
  let serviceCategory = null;
  let serviceDisplay = null;
  const serviceMap = {
    'AC technician': { cat: 'hvac', display: 'AC Technician' },
    'plumber': { cat: 'plumbing', display: 'Plumber' },
    'electrician': { cat: 'electrical', display: 'Electrician' },
    'painter': { cat: 'painting', display: 'Painter' },
    'carpenter': { cat: 'carpentry', display: 'Carpenter' },
    'cleaning': { cat: 'cleaning', display: 'Cleaning Service' },
  };

  if (extraction.service_type && serviceMap[extraction.service_type]) {
    serviceCategory = serviceMap[extraction.service_type].cat;
    serviceDisplay = serviceMap[extraction.service_type].display;
  } else if (extraction.service_type) {
    serviceCategory = validateCategory(extraction.service_type, extraction.service_type);
    serviceDisplay = extraction.service_type;
  }

  // Resolve location via geocoder
  const location = extraction.location_mentioned
    ? geocode(extraction.location_mentioned)
    : null;

  const result = {
    service_category: serviceCategory,
    service_display: serviceDisplay || extraction.service_type,
    location_raw: extraction.location_mentioned,
    location,
    date: new Date().toISOString().split('T')[0], // Defaulting to today for now as it's not in the new prompt
    time_slot: { start: '09:00', end: '18:00', label: 'Flexible' },
    urgency: 'normal',
    complexity: 'basic',
    budget_hint: null,
    language_detected: language !== 'auto' ? language : 'roman_urdu',
    confidence: 1, // Gemini handled confidence via is_clear flags
  };

  const needsClarification = !result.service_category || !result.location;
  if (needsClarification) {
    return {
      status: 'needs_clarification',
      message: "Thori aur details chahiye. Aapko kya service chahiye aur kahan?",
      agent: 'intent',
      duration_ms: Date.now() - startTime
    };
  }

  console.log(`[Intent Agent] ✅ Parsed successfully`);

  return {
    status: 'parsed',
    agent: 'intent',
    ...result,
    duration_ms: Date.now() - startTime,
  };
}

// ─── Keyword-only fallback (no Gemini needed) ─────────────────────────────
// Used when Gemini quota is exhausted. Keeps the pipeline running for demo.

function parseIntentKeywordOnly(message, language = 'roman_urdu') {
  const lower = message.toLowerCase();

  // Category
  let service_category = null;
  let service_display = 'Service';
  const displayMap = {
    hvac: 'AC Technician', plumbing: 'Plumber', electrical: 'Electrician',
    cleaning: 'Cleaning Service', carpentry: 'Carpenter',
    painting: 'Painter', tutoring: 'Tutor',
  };
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(kw => lower.includes(kw))) {
      service_category = cat;
      service_display = displayMap[cat] || cat;
      break;
    }
  }

  // Location — scan raw message for sector codes like G-13, F-8, I-10
  const { geocode } = require('../utils/geocoder');
  let location_raw = null;
  let location = null;
  const sectorMatch = lower.match(/\b([a-z]-?\d{1,2})\b/);
  if (sectorMatch) {
    location = geocode(sectorMatch[1]);
    if (location) location_raw = sectorMatch[1].toUpperCase();
  }
  // Also try common named areas
  const namedAreas = ['dha', 'bahria', 'gulberg', 'johar', 'model town', 'clifton'];
  if (!location_raw) {
    for (const area of namedAreas) {
      if (lower.includes(area)) {
        location = geocode(area);
        if (location) { location_raw = area; break; }
      }
    }
  }

  // Date/time
  const sortedKeys = Object.keys(DAY_KEYWORDS).sort((a, b) => b.length - a.length);
  const matchedKey = sortedKeys.find(kw => lower.includes(kw)) || null;
  const dateTime = resolveDateTime(matchedKey);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const result = {
    service_category,
    service_display,
    location_raw,
    location,
    date: dateTime?.date || tomorrow.toISOString().split('T')[0],
    time_slot: dateTime?.time_slot || { start: '09:00', end: '17:00', label: 'Flexible' },
    urgency: dateTime?.urgency || 'next_day',
    complexity: 'basic',
    budget_hint: null,
    language_detected: language,
    additional_notes: null,
  };

  result.confidence = computeConfidence(result);

  return {
    status: (!result.service_category || !result.location) ? 'needs_clarification' : 'parsed',
    agent: 'intent',
    fallback_mode: 'keyword_only',
    ...result,
    duration_ms: 0,
  };
}

// ─── runIntentAgent — Primary export used by orchestrator ───────────────────
// Tries Gemini. On 429 / quota error, gracefully falls back to keyword-only.
// Never throws — always returns a usable object.

async function runIntentAgent(input) {
  const { message, language = 'auto' } = input;
  try {
    return await parseIntent(message, language);
  } catch (err) {
    const isQuotaError = err.message.includes('429')
      || err.message.toLowerCase().includes('quota')
      || err.message.includes('Too Many Requests');
    if (isQuotaError) {
      console.warn('[INTENT_AGENT] Gemini quota hit — using keyword-only fallback');
    } else {
      console.warn('[INTENT_AGENT] Gemini error, falling back:', err.message);
    }
    return parseIntentKeywordOnly(message, language !== 'auto' ? language : 'roman_urdu');
  }
}

// ─── Exports ────────────────────────────────────────────────────────────────

module.exports = {
  runIntentAgent,           // Primary — used by orchestrator
  parseIntent,              // Gemini call (throws on error)
  parseIntentKeywordOnly,   // Fallback — no network needed
  resolveDateTime,
  validateCategory,
  computeConfidence,
  buildClarification,
  VALID_CATEGORIES,
};
