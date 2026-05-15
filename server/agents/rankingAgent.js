// ─── Ranking Agent (Person A — Brain) ────────────────────────────────────────
// Second-to-last brain agent in the pipeline.
// Receives discovered worker candidates → scores them on 8 factors → returns
// top 5 with per-factor breakdowns and Gemini-generated reasoning.
//
// Scoring: Pure code (fast, predictable, auditable)
// Reasoning: Single batch Gemini call for all top 5 at once
// Tie-breaking: rating DESC, then distance ASC

const { callGeminiText } = require('../utils/gemini');

// ─── Scoring Configuration ───────────────────────────────────────────────────
// Weights must sum to 1.0. Tune here without touching algorithm logic.

const SCORING_CONFIG = {
  weights: {
    distance:       0.20,   // How close the worker is
    availability:   0.15,   // Is their slot open for the requested time?
    rating:         0.15,   // Average star rating (out of 5)
    review_recency: 0.10,   // How recent their latest review is
    reliability:    0.10,   // On-time completion rate
    price_match:    0.10,   // How well their price fits the user's budget
    skill_match:    0.10,   // How many requested tags they have
    cancellation:   0.10,   // Inverse of their cancellation rate
  },

  // Distance scoring thresholds (km → score)
  distance: {
    perfect:  1,    // <= 1 km  → 100
    great:    3,    // <= 3 km  → 85
    good:     5,    // <= 5 km  → 70
    okay:     10,   // <= 10 km → 50
    far:      15,   // <= 15 km → 30
                    //  > 15 km → 10
  },

  // Review recency thresholds (days ago → score)
  recency: {
    fresh:   7,    // <= 7 days   → 100
    recent:  30,   // <= 30 days  → 80
    okay:    90,   // <= 90 days  → 55
    old:     180,  // <= 180 days → 30
                   //  > 180 days → 10
  },

  // How many results to return
  topN: 5,
};

// ─── Individual Factor Scorers ───────────────────────────────────────────────

/**
 * Distance score — exponential falloff based on km.
 * Returns { score: 0-100, raw: "X.X km" }
 */
function scoreDistance(distanceKm) {
  const d = parseFloat(distanceKm) || 999;
  const { perfect, great, good, okay, far } = SCORING_CONFIG.distance;

  let score;
  if      (d <= perfect) score = 100;
  else if (d <= great)   score = Math.round(100 - ((d - perfect) / (great - perfect)) * 15);
  else if (d <= good)    score = Math.round(85  - ((d - great)   / (good  - great))   * 15);
  else if (d <= okay)    score = Math.round(70  - ((d - good)    / (okay  - good))    * 20);
  else if (d <= far)     score = Math.round(50  - ((d - okay)    / (far   - okay))    * 20);
  else                   score = 10;

  return { score, raw: `${d.toFixed(1)} km` };
}

/**
 * Availability score — binary with context.
 * Returns { score: 0-100, raw: string }
 */
function scoreAvailability(worker, requestedSlot) {
  // If worker is marked unavailable at all → 0
  if (!worker.is_available) {
    return { score: 0, raw: 'Marked unavailable' };
  }

  // If no slot was requested, treat availability as confirmed
  if (!requestedSlot) {
    return { score: 90, raw: 'Generally available' };
  }

  // Check if the requested day falls in their available_days
  // available_days is e.g. ['Monday','Tuesday','Wednesday','Thursday','Friday']
  // We'll trust this field from Firestore for MVP
  return { score: 100, raw: 'Slot open' };
}

/**
 * Rating score — linear mapping of 0-5 stars to 0-100.
 * Returns { score: 0-100, raw: "X.X/5" }
 */
function scoreRating(rating, totalReviews) {
  const r = parseFloat(rating) || 0;

  // Penalize slightly if very few reviews (less confidence)
  let score = (r / 5) * 100;
  if (totalReviews < 3)  score *= 0.70;
  else if (totalReviews < 10) score *= 0.90;

  return {
    score: Math.round(score),
    raw: `${r.toFixed(1)}/5 (${totalReviews || 0} reviews)`,
  };
}

/**
 * Review recency score — how recently they got a review.
 * Returns { score: 0-100, raw: "X days ago" }
 */
function scoreReviewRecency(lastReviewDaysAgo) {
  const days = parseInt(lastReviewDaysAgo) || 999;
  const { fresh, recent, okay, old } = SCORING_CONFIG.recency;

  let score;
  if      (days <= fresh)  score = 100;
  else if (days <= recent) score = Math.round(100 - ((days - fresh)  / (recent - fresh))  * 20);
  else if (days <= okay)   score = Math.round(80  - ((days - recent) / (okay   - recent)) * 25);
  else if (days <= old)    score = Math.round(55  - ((days - okay)   / (old    - okay))   * 25);
  else                     score = 10;

  return { score, raw: days < 999 ? `${days} days ago` : 'No reviews yet' };
}

/**
 * Reliability score — on_time_rate is already 0-100.
 * Returns { score: 0-100, raw: "XX% on-time" }
 */
function scoreReliability(onTimeRate) {
  const rate = parseFloat(onTimeRate) || 50;
  return {
    score: Math.round(Math.min(100, rate)),
    raw: `${rate.toFixed(0)}% on-time`,
  };
}

/**
 * Price match score — how well the worker's base price aligns with budget.
 * Returns { score: 0-100, raw: "PKR XXXX" }
 */
function scorePriceMatch(basePrice, budgetHint) {
  const price = parseFloat(basePrice) || 0;

  // No budget hint → neutral score (don't penalize, don't reward)
  if (!budgetHint) {
    return { score: 70, raw: `PKR ${price.toFixed(0)} (no budget set)` };
  }

  const budget = parseFloat(budgetHint);

  if (price <= budget) {
    // Within budget — reward being under budget
    const saving = budget - price;
    const savingRatio = saving / budget;
    const score = Math.min(100, Math.round(80 + savingRatio * 20));
    return { score, raw: `PKR ${price.toFixed(0)} (within budget)` };
  } else {
    // Over budget — penalize proportionally
    const overage = price - budget;
    const overageRatio = overage / budget;
    const score = Math.max(0, Math.round(70 - overageRatio * 70));
    return { score, raw: `PKR ${price.toFixed(0)} (over budget by ${overage.toFixed(0)})` };
  }
}

/**
 * Skill match score — how many of the user's service tags the worker covers.
 * Returns { score: 0-100, raw: "X/Y tags match" }
 */
function scoreSkillMatch(workerTags, requestTags) {
  const wTags = Array.isArray(workerTags) ? workerTags.map(t => t.toLowerCase()) : [];

  // No tags to match against — neutral score
  if (!Array.isArray(requestTags) || requestTags.length === 0) {
    return { score: 75, raw: 'No specific tags requested' };
  }

  const rTags = requestTags.map(t => t.toLowerCase());
  const matches = rTags.filter(tag => wTags.includes(tag)).length;
  const score = Math.round((matches / rTags.length) * 100);

  return { score, raw: `${matches}/${rTags.length} tags match` };
}

/**
 * Cancellation score — inverse of cancellation rate.
 * Returns { score: 0-100, raw: "X% cancel rate" }
 */
function scoreCancellation(cancellationRate) {
  // cancellationRate is 0-100 (percentage)
  const rate = parseFloat(cancellationRate) || 0;
  const score = Math.round(Math.max(0, 100 - rate));

  return { score, raw: `${rate.toFixed(0)}% cancel rate` };
}

// ─── Composite Scorer ────────────────────────────────────────────────────────

/**
 * Score a single worker candidate against a user request.
 * Returns the worker with all factor scores and total weighted score.
 *
 * @param {object} candidate   - Worker from discoveryAgent (includes distance_km)
 * @param {object} userRequest - Parsed intent from intentAgent
 * @returns {object} - Scored candidate
 */
function scoreCandidate(candidate, userRequest) {
  const w = SCORING_CONFIG.weights;

  // Compute each factor
  const factors = {
    distance:       scoreDistance(candidate.distance_km),
    availability:   scoreAvailability(candidate, userRequest.time_slot),
    rating:         scoreRating(candidate.rating, candidate.total_reviews),
    review_recency: scoreReviewRecency(candidate.last_review_days_ago),
    reliability:    scoreReliability(candidate.on_time_rate),
    price_match:    scorePriceMatch(candidate.base_price, userRequest.budget_hint),
    skill_match:    scoreSkillMatch(candidate.tags, userRequest.tags),
    cancellation:   scoreCancellation(candidate.cancellation_rate),
  };

  // Compute weighted total
  const totalScore = Object.entries(factors).reduce((sum, [key, factor]) => {
    return sum + (factor.score * w[key]);
  }, 0);

  // Attach weights to each factor for output contract compliance
  const factorsWithWeights = Object.fromEntries(
    Object.entries(factors).map(([key, factor]) => [
      key,
      { ...factor, weight: w[key] },
    ])
  );

  return {
    worker_id:   candidate.worker_id || candidate.id,
    name:        candidate.name,
    distance_km: candidate.distance_km,
    rating:      candidate.rating,
    base_price:  candidate.base_price,
    total_score: Math.round(totalScore * 10) / 10,
    factors:     factorsWithWeights,
    // reasoning will be filled by Gemini batch call
    _raw_worker: candidate,
  };
}

// ─── Gemini Reasoning (Batch) ────────────────────────────────────────────────

const REASONING_SYSTEM_PROMPT = `You are KARIGAR's Ranking Explainer. You receive a list of ranked workers with their scores and must write a SHORT, friendly 1-sentence reasoning for each, explaining WHY this worker was selected/ranked this position.

Rules:
1. Respond ONLY with a valid JSON array of strings — one sentence per worker, in order.
2. Mention 2-3 strongest factors (e.g., proximity, rating, price).
3. Write in a confident, assistant-like tone.
4. Each sentence must be under 20 words.
5. Never mention scores or weights — speak naturally.

Example output for 3 workers:
["Ali AC is your best match — closest to you, top-rated, and within budget.",
 "Shah Cooling is a strong choice — highly reliable with excellent recent reviews.",
 "Premier AC is solid — verified, experienced, and has a low cancellation history."]`;

/**
 * Generate Gemini reasoning for all top candidates in a single API call.
 *
 * @param {Array} scoredCandidates - Top N scored candidates
 * @param {object} userRequest     - Parsed intent context
 * @returns {Promise<string[]>}    - Array of reasoning strings (same length)
 */
async function generateBatchReasoning(scoredCandidates, userRequest) {
  // Build a compact summary for Gemini to reason about
  const workerSummaries = scoredCandidates.map((c, i) => ({
    rank: i + 1,
    name: c.name,
    score: c.total_score,
    distance: c.factors.distance.raw,
    rating: c.factors.rating.raw,
    price: c.factors.price_match.raw,
    reliability: c.factors.reliability.raw,
    skill_match: c.factors.skill_match.raw,
    cancellation: c.factors.cancellation.raw,
  }));

  const contextMessage = `
Service requested: ${userRequest.service_display || userRequest.service_category}
User location: ${userRequest.location?.label || 'Islamabad'}
Budget: ${userRequest.budget_hint ? `PKR ${userRequest.budget_hint}` : 'Not specified'}
Urgency: ${userRequest.urgency || 'normal'}

Ranked workers:
${JSON.stringify(workerSummaries, null, 2)}

Write exactly ${scoredCandidates.length} reasoning sentences as a JSON array.`.trim();

  try {
    const raw = await callGeminiText(REASONING_SYSTEM_PROMPT, contextMessage, {
      temperature: 0.6,
      maxTokens: 512,
    });

    // Extract JSON array from response (handle any markdown wrapping)
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error('No JSON array found in Gemini response');

    const reasonings = JSON.parse(jsonMatch[0]);

    // Validate we got the right number back
    if (!Array.isArray(reasonings) || reasonings.length !== scoredCandidates.length) {
      throw new Error(`Expected ${scoredCandidates.length} reasonings, got ${reasonings.length}`);
    }

    return reasonings;
  } catch (err) {
    console.warn('[Ranking Agent] Gemini reasoning failed, using fallback:', err.message);

    // Fallback: generate code-based reasoning
    return scoredCandidates.map(c => {
      const topFactor = Object.entries(c.factors)
        .sort((a, b) => b[1].score * b[1].weight - a[1].score * a[1].weight)[0];
      return `${c.name} ranked here — score ${c.total_score}/100, strongest in ${topFactor[0].replace('_', ' ')}.`;
    });
  }
}

// ─── Main Entry Point ────────────────────────────────────────────────────────

/**
 * Rank a list of discovered worker candidates against a user request.
 * This is the function the Orchestrator calls.
 *
 * @param {object} input
 * @param {Array}  input.candidates   - Workers from discoveryAgent (each has distance_km)
 * @param {object} input.user_request - Parsed intent from intentAgent
 * @returns {Promise<object>} - { ranked: [...top5 with reasoning], agent, duration_ms }
 */
async function rankCandidates({ candidates, user_request }) {
  const startTime = Date.now();

  if (!candidates || candidates.length === 0) {
    console.log('[Ranking Agent] No candidates to rank.');
    return {
      status: 'no_candidates',
      ranked: [],
      agent: 'ranking',
      duration_ms: Date.now() - startTime,
    };
  }

  console.log(`[Ranking Agent] Scoring ${candidates.length} candidates...`);

  // ── Step 1: Score every candidate ──
  const scored = candidates.map(c => scoreCandidate(c, user_request));

  // ── Step 2: Sort — total_score DESC, rating DESC (tie-break), distance ASC (final tie-break) ──
  scored.sort((a, b) => {
    if (b.total_score !== a.total_score) return b.total_score - a.total_score;
    if (b.rating !== a.rating)           return b.rating - a.rating;
    return a.distance_km - b.distance_km;
  });

  // ── Step 3: Take top N ──
  const topN = scored.slice(0, SCORING_CONFIG.topN);

  console.log(`[Ranking Agent] Top ${topN.length} selected. Calling Gemini for reasoning...`);

  // ── Step 4: Single Gemini call for all reasoning strings ──
  const reasonings = await generateBatchReasoning(topN, user_request);

  // ── Step 5: Assemble final output ──
  const ranked = topN.map((candidate, i) => {
    const { _raw_worker, ...rest } = candidate;
    return {
      ...rest,
      reasoning: reasonings[i],
    };
  });

  console.log(`[Ranking Agent] ✅ Ranked ${ranked.length} workers (top score: ${ranked[0]?.total_score})`);

  return {
    status: 'ranked',
    agent: 'ranking',
    total_candidates: candidates.length,
    ranked,
    duration_ms: Date.now() - startTime,
  };
}

// ─── Exports ────────────────────────────────────────────────────────────────

module.exports = {
  rankCandidates,
  // Exported for unit testing
  scoreDistance,
  scoreAvailability,
  scoreRating,
  scoreReviewRecency,
  scoreReliability,
  scorePriceMatch,
  scoreSkillMatch,
  scoreCancellation,
  scoreCandidate,
  SCORING_CONFIG,
};
