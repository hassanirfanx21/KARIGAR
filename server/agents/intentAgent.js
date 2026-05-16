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

const SYSTEM_PROMPT = `You are KARIGAR's Intent Parser — an AI that extracts structured service requests from multilingual user messages (English, Urdu, Roman Urdu, or mixed).

Your job is ONLY to extract raw information. Do NOT compute dates, coordinates, or confidence scores.

## Output Schema (respond with ONLY this JSON):
{
  "service_raw": "the service mentioned as-is, e.g. 'AC repair', 'plumber', 'bijli ka kaam'",
  "service_category": "one of: hvac, plumbing, electrical, cleaning, carpentry, painting, tutoring — pick the CLOSEST match",
  "service_display": "a clean display name in English, e.g. 'AC Technician', 'Plumber', 'Electrician'",
  "location_raw": "the location/sector mentioned as-is, e.g. 'G-13', 'DHA', 'Bahria Town', or null if not mentioned",
  "time_raw": "the time expression as-is, e.g. 'kal subah', 'aaj shaam', 'tomorrow morning', or null if not mentioned",
  "urgency_raw": "urgent/normal/flexible based on tone and time words",
  "complexity_raw": "basic/intermediate/complex based on the task described",
  "budget_hint": "number if a budget is mentioned (e.g. '2000 ke andar' → 2000), or null",
  "language_detected": "english / urdu / roman_urdu / mixed",
  "additional_notes": "any extra details the user mentioned (e.g. 'split AC', '2 rooms', 'ground floor'), or null"
}

## Category Mapping Guide:
- hvac → AC, cooling, heating, refrigerator, gas refilling, thanda
- plumbing → pipes, leaks, taps, geyser, water tank, bathroom fitting, nalkay, flush
- electrical → wiring, switches, generator, UPS, solar, fan, bijli
- cleaning → house cleaning, deep clean, pest control, safai, fumigation
- carpentry → furniture, cabinets, doors, wood work, wardrobe, lakri
- painting → wall paint, texture, POP, interior/exterior, rang
- tutoring → tuition, teacher, subjects, padhai

## Few-Shot Examples:

User: "Kal subah AC technician chahiye G-13 mein"
Output: {"service_raw":"AC technician","service_category":"hvac","service_display":"AC Technician","location_raw":"G-13","time_raw":"kal subah","urgency_raw":"normal","complexity_raw":"basic","budget_hint":null,"language_detected":"roman_urdu","additional_notes":null}

User: "I need a plumber urgently in F-8, there's a pipe burst"
Output: {"service_raw":"plumber","service_category":"plumbing","service_display":"Plumber","location_raw":"F-8","time_raw":"urgently","urgency_raw":"urgent","complexity_raw":"intermediate","budget_hint":null,"language_detected":"english","additional_notes":"pipe burst"}

User: "Bijli ka kaam hai I-10 mein, parson afternoon"
Output: {"service_raw":"bijli ka kaam","service_category":"electrical","service_display":"Electrician","location_raw":"I-10","time_raw":"parson afternoon","urgency_raw":"normal","complexity_raw":"basic","budget_hint":null,"language_detected":"roman_urdu","additional_notes":null}

User: "Ghar ki safai karwani hai DHA mein is hafte, budget 2000 ke andar"
Output: {"service_raw":"ghar ki safai","service_category":"cleaning","service_display":"House Cleaning","location_raw":"DHA","time_raw":"is hafte","urgency_raw":"normal","complexity_raw":"basic","budget_hint":2000,"language_detected":"roman_urdu","additional_notes":null}

User: "AC repair"
Output: {"service_raw":"AC repair","service_category":"hvac","service_display":"AC Repair","location_raw":null,"time_raw":null,"urgency_raw":"normal","complexity_raw":"basic","budget_hint":null,"language_detected":"english","additional_notes":null}

User: "Mujhe painter chahiye G-9, 2 rooms, kal shaam"
Output: {"service_raw":"painter","service_category":"painting","service_display":"Painter","location_raw":"G-9","time_raw":"kal shaam","urgency_raw":"normal","complexity_raw":"intermediate","budget_hint":null,"language_detected":"roman_urdu","additional_notes":"2 rooms"}

User: "hello"
Output: {"service_raw":null,"service_category":null,"service_display":null,"location_raw":null,"time_raw":null,"urgency_raw":"normal","complexity_raw":"basic","budget_hint":null,"language_detected":"english","additional_notes":null}

User: "Furniture theek karwana hai, kal dopahar, Bahria Town, budget 3000"
Output: {"service_raw":"furniture theek karwana","service_category":"carpentry","service_display":"Furniture Repair","location_raw":"Bahria Town","time_raw":"kal dopahar","urgency_raw":"normal","complexity_raw":"basic","budget_hint":3000,"language_detected":"roman_urdu","additional_notes":null}

## Rules:
1. ALWAYS respond with valid JSON only — no markdown, no explanation.
2. If a field is not mentioned, set it to null.
3. For service_category, ALWAYS pick the closest of the 7 options. Never return anything else.
4. For complexity: "basic" = routine job, "intermediate" = multi-step or specific, "complex" = major installation/renovation.
5. Keep service_raw exactly as the user said it. Keep location_raw exactly as the user said it.`;

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

  // ── Step 1: Attempt extraction (with fallback for service_raw) ──
  console.log('[Intent Agent] Calling Gemini to extract intent...');

  let extraction = { service_raw: message, location_raw: null };
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

  // ── Step 2: Validate category (hybrid approach) ──
  const serviceCategory = validateCategory(
    extraction.service_category,
    extraction.service_raw
  );

  // ── Step 3: Resolve location via geocoder ──
  const location = extraction.location_raw
    ? geocode(extraction.location_raw)
    : null;

  // ── Step 4: Resolve date/time ──
  const dateTime = resolveDateTime(extraction.time_raw);

  let urgency = dateTime?.urgency || 'normal';
  if (extraction.urgency_raw === 'urgent' && urgency === 'normal') {
    urgency = 'same_day';
  } else if (extraction.urgency_raw === 'flexible') {
    urgency = 'later';
  }

  // ── Step 5: Assemble the result ──
  const detectedLanguage = extraction.language_detected || (language !== 'auto' ? language : 'english');

  const result = {
    service_category: serviceCategory,
    service_display: extraction.service_display || null,
    location_raw: extraction.location_raw || null,
    location,
    date: dateTime?.date || null,
    time_slot: dateTime?.time_slot || null,
    urgency,
    complexity: extraction.complexity_raw || 'basic',
    budget_hint: extraction.budget_hint || null,
    language_detected: detectedLanguage,
    additional_notes: extraction.additional_notes || null,
    confidence: 0,
  };

  // ── Step 6: Compute confidence ──
  result.confidence = computeConfidence(result);

  // ── Step 7: Check if we need clarification ──
  const needsClarification = !result.service_category || !result.location;

  if (needsClarification) {
    console.log('[Intent Agent] Missing required fields — requesting clarification');
    return {
      ...buildClarification(
        { ...result, location_raw: extraction.location_raw },
        detectedLanguage
      ),
      agent: 'intent',
      extraction_raw: extraction,
      duration_ms: Date.now() - startTime,
    };
  }

  // ── All good — return full structured intent ──
  console.log(`[Intent Agent] ✅ Parsed successfully (confidence: ${result.confidence})`);

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
