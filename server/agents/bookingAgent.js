// ─── Booking Agent (Person B) ───────────────────────────────────────────────
// Creates a confirmed booking in Firestore.
//
// Responsibilities:
//   - Generate unique booking ID (BK-YYYYMMDD-XXXX)
//   - Generate confirmation code (KRG-XXXX)
//   - Write to Firestore `bookings` collection
//   - Return confirmation payload
//
// Input:  { user_id, worker_id, service, slot, location, pricing, agent_trace }
// Output: { booking_id, confirmation_code, status, created_at }

const { db } = require('../config/firebase');

/**
 * Generate a booking ID in format: BK-YYYYMMDD-XXXX
 * @param {string} date - date string YYYY-MM-DD
 * @returns {string}
 */
function generateBookingId(date) {
  const dateStr = date.replace(/-/g, '');
  const rand = String(Math.floor(1000 + Math.random() * 9000)); // 4-digit
  return `BK-${dateStr}-${rand}`;
}

/**
 * Generate a confirmation code in format: KRG-XXXX
 * @returns {string}
 */
function generateConfirmationCode() {
  const rand = String(Math.floor(1000 + Math.random() * 9000));
  return `KRG-${rand}`;
}

/**
 * Run the Booking Agent.
 *
 * @param {object} input
 * @param {string} input.user_id      - User's ID
 * @param {string} input.worker_id    - Selected worker's ID
 * @param {object} input.service      - { category, display_name }
 * @param {object} input.slot         - { date, start, end }
 * @param {object} input.location     - { lat, lng, label }
 * @param {object} input.pricing      - Pricing agent output
 * @param {Array}  [input.agent_trace] - Full trace from orchestrator
 * @returns {Promise<{ booking_id, confirmation_code, status, created_at, agent, duration_ms }>}
 */
async function runBookingAgent(input) {
  const startTime = Date.now();
  const { user_id, worker_id, service, slot, location, pricing, agent_trace = [] } = input;

  const slotDate = slot.date || new Date().toISOString().split('T')[0];
  const bookingId = generateBookingId(slotDate);
  const confirmationCode = generateConfirmationCode();
  const createdAt = new Date().toISOString();

  // ── Build the booking document ────────────────────────────────────────
  const bookingDoc = {
    booking_ref: bookingId,
    user_id: user_id || 'anonymous',
    worker_id,
    service_type: service.category || service,
    service_display: service.display_name || service.category || service,
    status: 'confirmed',
    slot_date: slotDate,
    slot_time: { start: slot.start, end: slot.end },
    location: {
      lat: location.lat,
      lng: location.lng,
      label: location.label || 'Unknown',
    },
    pricing: {
      final_price: pricing.final_price,
      breakdown: pricing.breakdown,
    },
    agent_trace,
    confirmation_code: confirmationCode,
    created_at: createdAt,
  };

  // ── Write to Firestore ────────────────────────────────────────────────
  await db.collection('bookings').doc(bookingId).set(bookingDoc);

  return {
    booking_id: bookingId,
    confirmation_code: confirmationCode,
    status: 'confirmed',
    created_at: createdAt,
    agent: 'booking',
    reasoning: `Booking ${bookingId} confirmed for worker ${worker_id}. Confirmation code: ${confirmationCode}.`,
    duration_ms: Date.now() - startTime,
  };
}

module.exports = { runBookingAgent };
