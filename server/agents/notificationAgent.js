// ─── Notification Agent (Person B) ──────────────────────────────────────────
// Simulates sending SMS / WhatsApp notifications.
// In production this would integrate with Twilio / WhatsApp Business API.
//
// Generates messages for:
//   - User: booking confirmation
//   - Worker: new job alert
//
// Supports English + Roman Urdu templates.
//
// Input:  { booking_id, confirmation_code, user_phone, worker_phone, worker_name,
//           service_display, slot, location, final_price, language }
// Output: { notifications: [...], agent, duration_ms }

/**
 * Message templates.
 */
const TEMPLATES = {
  english: {
    user_confirm: (data) =>
      `✅ KARIGAR Booking Confirmed!\n` +
      `Booking: ${data.booking_id}\n` +
      `Code: ${data.confirmation_code}\n` +
      `Service: ${data.service_display}\n` +
      `Worker: ${data.worker_name}\n` +
      `Date: ${data.slot_date} (${data.slot_start} - ${data.slot_end})\n` +
      `Location: ${data.location_label}\n` +
      `Total: PKR ${data.final_price}\n` +
      `Share your confirmation code with the worker on arrival.`,

    worker_alert: (data) =>
      `🔔 New Job Alert — KARIGAR\n` +
      `Booking: ${data.booking_id}\n` +
      `Service: ${data.service_display}\n` +
      `Date: ${data.slot_date} (${data.slot_start} - ${data.slot_end})\n` +
      `Location: ${data.location_label}\n` +
      `Payment: PKR ${data.final_price}\n` +
      `Please confirm your availability.`,
  },

  roman_urdu: {
    user_confirm: (data) =>
      `✅ KARIGAR Booking Confirm Ho Gayi!\n` +
      `Booking: ${data.booking_id}\n` +
      `Code: ${data.confirmation_code}\n` +
      `Service: ${data.service_display}\n` +
      `Karigar: ${data.worker_name}\n` +
      `Tarikh: ${data.slot_date} (${data.slot_start} - ${data.slot_end})\n` +
      `Jagah: ${data.location_label}\n` +
      `Total: PKR ${data.final_price}\n` +
      `Karigar ke aane par confirmation code share karein.`,

    worker_alert: (data) =>
      `🔔 Naya Kaam — KARIGAR\n` +
      `Booking: ${data.booking_id}\n` +
      `Service: ${data.service_display}\n` +
      `Tarikh: ${data.slot_date} (${data.slot_start} - ${data.slot_end})\n` +
      `Jagah: ${data.location_label}\n` +
      `Payment: PKR ${data.final_price}\n` +
      `Apni availability confirm karein.`,
  },
};

/**
 * Run the Notification Agent.
 *
 * @param {object} input
 * @returns {{ notifications: Array, agent: string, duration_ms: number }}
 */
function runNotificationAgent(input) {
  const startTime = Date.now();
  const {
    booking_id,
    confirmation_code,
    user_phone = 'N/A',
    worker_phone = 'N/A',
    worker_name,
    service_display,
    slot = {},
    location = {},
    final_price,
    language = 'english',
  } = input;

  // Pick template set (default to english if unknown)
  const templateSet = TEMPLATES[language] || TEMPLATES.english;

  const templateData = {
    booking_id,
    confirmation_code,
    worker_name,
    service_display,
    slot_date: slot.date || 'TBD',
    slot_start: slot.start || '—',
    slot_end: slot.end || '—',
    location_label: location.label || 'Unknown',
    final_price,
  };

  // ── Generate messages ─────────────────────────────────────────────────
  const userMsg = templateSet.user_confirm(templateData);
  const workerMsg = templateSet.worker_alert(templateData);

  // ── Simulate sending (console log in dev) ─────────────────────────────
  console.log(`\n📱 [Notification] → User (${user_phone}):\n${userMsg}\n`);
  console.log(`📱 [Notification] → Worker (${worker_phone}):\n${workerMsg}\n`);

  const notifications = [
    {
      recipient: 'user',
      phone: user_phone,
      channel: 'whatsapp',
      message: userMsg,
      sent_at: new Date().toISOString(),
      status: 'simulated',
    },
    {
      recipient: 'worker',
      phone: worker_phone,
      channel: 'sms',
      message: workerMsg,
      sent_at: new Date().toISOString(),
      status: 'simulated',
    },
  ];

  return {
    notifications,
    agent: 'notification',
    reasoning: `Sent ${notifications.length} notifications (simulated) — 1 to user via WhatsApp, 1 to worker via SMS.`,
    duration_ms: Date.now() - startTime,
  };
}

module.exports = { runNotificationAgent };
