// ─── Discovery Agent (Person B) ─────────────────────────────────────────────
// Queries Firestore for matching workers based on:
//   - service_category
//   - is_available + is_verified
//   - Day availability (date → day-of-week)
//   - Time slot overlap
//   - Distance within worker's service_radius_km
//
// Input:  { service_category, lat, lng, date, time_slot: { start, end } }
// Output: { candidates: [...workerProfiles with distance_km], total_found }

const { db } = require('../config/firebase');
const { haversine } = require('../utils/distance');

/**
 * Map a date string (YYYY-MM-DD) to a short day name.
 * @param {string} dateStr
 * @returns {string} e.g. "mon", "tue", "wed"
 */
function dateToDayKey(dateStr) {
  const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const d = new Date(dateStr + 'T00:00:00');
  return days[d.getDay()];
}

/**
 * Check if the requested time slot overlaps with the worker's available_hours.
 * Worker hours format: "08:00-18:00"
 * Requested slot format: { start: "09:00", end: "12:00" }
 *
 * @param {{ start: string, end: string }} requestedSlot
 * @param {string} workerHours - e.g. "08:00-18:00"
 * @returns {boolean}
 */
function timeSlotOverlaps(requestedSlot, workerHours) {
  if (!workerHours || !requestedSlot) return false;

  const [wStart, wEnd] = workerHours.split('-');
  const toMinutes = (t) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };

  const reqStart = toMinutes(requestedSlot.start);
  const reqEnd = toMinutes(requestedSlot.end);
  const workStart = toMinutes(wStart);
  const workEnd = toMinutes(wEnd);

  // Overlap: requested start is before worker ends AND requested end is after worker starts
  return reqStart < workEnd && reqEnd > workStart;
}

/**
 * Run the Discovery Agent.
 *
 * @param {object} input
 * @param {string} input.service_category - e.g. "hvac", "plumbing"
 * @param {number} input.lat - User's latitude
 * @param {number} input.lng - User's longitude
 * @param {string} input.date - Requested date (YYYY-MM-DD)
 * @param {{ start: string, end: string }} input.time_slot - Requested time window
 * @returns {Promise<{ candidates: Array, total_found: number, agent: string, reasoning: string }>}
 */
async function runDiscoveryAgent(input) {
  const { service_category, lat, lng, date, time_slot } = input;
  const startTime = Date.now();

  // ── Step 1: Query Firestore for category + available + verified ────────
  const snapshot = await db
    .collection('workers')
    .where('category', '==', service_category)
    .where('is_available', '==', true)
    .where('is_verified', '==', true)
    .get();

  if (snapshot.empty) {
    return {
      candidates: [],
      total_found: 0,
      agent: 'discovery',
      reasoning: `No verified, available workers found for category "${service_category}".`,
      duration_ms: Date.now() - startTime,
    };
  }

  // ── Step 2: In-memory filters (day, time, distance) ───────────────────
  const dayKey = dateToDayKey(date);
  const candidates = [];
  const filterLog = { total_in_category: snapshot.size, after_day: 0, after_time: 0, after_distance: 0 };

  for (const doc of snapshot.docs) {
    const worker = { id: doc.id, ...doc.data() };

    // Day availability check
    if (worker.available_days && !worker.available_days.includes(dayKey)) {
      continue;
    }
    filterLog.after_day++;

    // Time slot overlap check
    if (!timeSlotOverlaps(time_slot, worker.available_hours)) {
      continue;
    }
    filterLog.after_time++;

    // Distance check
    const distance_km = haversine(lat, lng, worker.lat, worker.lng);
    if (distance_km > worker.service_radius_km) {
      continue;
    }
    filterLog.after_distance++;

    candidates.push({ ...worker, distance_km });
  }

  // ── Step 3: Sort by distance (closest first) ──────────────────────────
  candidates.sort((a, b) => a.distance_km - b.distance_km);

  return {
    candidates,
    total_found: candidates.length,
    agent: 'discovery',
    filter_log: filterLog,
    reasoning: candidates.length > 0
      ? `Found ${candidates.length} ${service_category} workers within range for ${dayKey} ${time_slot.start}-${time_slot.end}. Closest: ${candidates[0].name} (${candidates[0].distance_km} km).`
      : `No workers matched all filters (day: ${dayKey}, time: ${time_slot.start}-${time_slot.end}, distance from user location).`,
    duration_ms: Date.now() - startTime,
  };
}

module.exports = { runDiscoveryAgent };
