// ─── Google Distance Matrix Helper ─────────────────────────────────────────
// Optional: uses Google Maps Distance Matrix API when key is provided.
// Fallback: estimates travel time from straight-line distance.

const DISTANCE_MATRIX_URL = 'https://maps.googleapis.com/maps/api/distancematrix/json';
const DEFAULT_SPEED_KMH = 25; // Conservative city speed for fallback

/**
 * Estimate travel time in minutes from distance in km.
 * @param {number} distanceKm
 * @returns {number}
 */
function estimateTravelMinutes(distanceKm) {
  const hours = distanceKm / DEFAULT_SPEED_KMH;
  return Math.max(1, Math.round(hours * 60));
}

/**
 * Fetch travel times for multiple destinations.
 * @param {{ lat: number, lng: number }} origin
 * @param {Array<{ lat: number, lng: number, distance_km?: number }>} destinations
 * @returns {Promise<number[]>} travel time minutes in same order as destinations
 */
async function getTravelTimes(origin, destinations) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return destinations.map((d) => estimateTravelMinutes(d.distance_km || 0));
  }

  const originsParam = `${origin.lat},${origin.lng}`;
  const destinationsParam = destinations
    .map((d) => `${d.lat},${d.lng}`)
    .join('|');

  const url = `${DISTANCE_MATRIX_URL}?origins=${encodeURIComponent(originsParam)}&destinations=${encodeURIComponent(destinationsParam)}&key=${apiKey}&mode=driving`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      return destinations.map((d) => estimateTravelMinutes(d.distance_km || 0));
    }

    const data = await res.json();
    const row = data?.rows?.[0]?.elements || [];

    return destinations.map((d, i) => {
      const durationSec = row[i]?.duration?.value;
      if (!durationSec) return estimateTravelMinutes(d.distance_km || 0);
      return Math.max(1, Math.round(durationSec / 60));
    });
  } catch (err) {
    return destinations.map((d) => estimateTravelMinutes(d.distance_km || 0));
  }
}

module.exports = { getTravelTimes, estimateTravelMinutes };
