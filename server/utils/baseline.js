// ─── Baseline Comparison Logic (Person B) ───────────────────────────────────
// Simple keyword + distance-only matching. No AI, no ranking intelligence.
// Used to compare against the full agentic pipeline results.

const { db } = require('../config/firebase');
const { haversine } = require('./distance');

/**
 * Run a baseline (non-AI) search.
 * Steps:
 *   1. Keyword match on worker category and tags
 *   2. Filter by is_available + is_verified
 *   3. Sort by distance only (no scoring)
 *
 * @param {object} input
 * @param {string} input.keyword       - Raw search term (e.g. "AC repair")
 * @param {number} input.lat           - User latitude
 * @param {number} input.lng           - User longitude
 * @param {number} [input.max_distance] - Max distance in km (default 25)
 * @returns {Promise<{ results: Array, total_found: number, method: string }>}
 */
async function runBaseline(input) {
  const startTime = Date.now();
  const { keyword, lat, lng, max_distance = 25 } = input;

  const normalizedKeyword = keyword.toLowerCase().trim();

  // Get all available + verified workers
  const snapshot = await db
    .collection('workers')
    .where('is_available', '==', true)
    .where('is_verified', '==', true)
    .get();

  const results = [];

  for (const doc of snapshot.docs) {
    const worker = { id: doc.id, ...doc.data() };

    // Keyword match: check category or tags
    const categoryMatch = worker.category && worker.category.toLowerCase().includes(normalizedKeyword);
    const tagMatch = worker.tags && worker.tags.some(
      (tag) => tag.toLowerCase().includes(normalizedKeyword) || normalizedKeyword.includes(tag.toLowerCase())
    );

    if (!categoryMatch && !tagMatch) continue;

    // Distance check
    const distance_km = haversine(lat, lng, worker.lat, worker.lng);
    if (distance_km > max_distance) continue;

    results.push({
      worker_id: worker.id,
      name: worker.name,
      category: worker.category,
      rating: worker.rating,
      base_price: worker.base_price,
      distance_km,
      sector: worker.sector,
    });
  }

  // Sort by distance only
  results.sort((a, b) => a.distance_km - b.distance_km);

  return {
    results,
    total_found: results.length,
    method: 'baseline_keyword_distance',
    reasoning: `Simple keyword "${keyword}" match + distance sort. No scoring, no time/day filtering, no pricing intelligence.`,
    duration_ms: Date.now() - startTime,
  };
}

module.exports = { runBaseline };
