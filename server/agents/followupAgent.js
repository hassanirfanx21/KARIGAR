// ─── Follow-up Agent (Person B) ─────────────────────────────────────────────
// Schedules reminder / follow-up timestamps relative to booking time.

function parseTime(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  return { h, m };
}

function buildDateTime(dateStr, timeStr) {
  const { h, m } = parseTime(timeStr);
  const d = new Date(dateStr + 'T00:00:00');
  d.setHours(h, m, 0, 0);
  return d;
}

function runFollowupAgent(input) {
  const startTime = Date.now();
  const { booking_id, slot, created_at } = input;

  const createdDate = created_at ? new Date(created_at) : new Date();
  const serviceStart = buildDateTime(slot.date, slot.start);
  const serviceEnd = buildDateTime(slot.date, slot.end);
  const followups = [];

  // 1. Confirmation reminder — 1 hour after booking
  followups.push({
    type: 'confirmation_reminder',
    label: 'Booking Confirmation Reminder',
    scheduled_at: new Date(createdDate.getTime() + 60 * 60 * 1000).toISOString(),
    message: `Reminder: Your booking ${booking_id} is confirmed.`,
    target: 'user',
    status: 'scheduled',
  });

  // 2. Pre-service reminder — 2 hours before service
  const preService = new Date(serviceStart.getTime() - 2 * 60 * 60 * 1000);
  if (preService > createdDate) {
    followups.push({
      type: 'pre_service_reminder',
      label: 'Service Starting Soon',
      scheduled_at: preService.toISOString(),
      message: `Your ${booking_id} service starts in 2 hours.`,
      target: 'user',
      status: 'scheduled',
    });
  }

  // 3. Worker heads-up — 1 hour before service
  const workerHeadsUp = new Date(serviceStart.getTime() - 60 * 60 * 1000);
  if (workerHeadsUp > createdDate) {
    followups.push({
      type: 'worker_heads_up',
      label: 'Job Starting Soon (Worker)',
      scheduled_at: workerHeadsUp.toISOString(),
      message: `Reminder: Job ${booking_id} starts in 1 hour.`,
      target: 'worker',
      status: 'scheduled',
    });
  }

  // 4. Post-service feedback — 1 hour after service ends
  followups.push({
    type: 'post_service_feedback',
    label: 'Rate Your Experience',
    scheduled_at: new Date(serviceEnd.getTime() + 60 * 60 * 1000).toISOString(),
    message: `How was booking ${booking_id}? Tap to rate.`,
    target: 'user',
    status: 'scheduled',
  });

  // 5. No-review nudge — 24 hours after service
  followups.push({
    type: 'no_review_nudge',
    label: 'Reminder to Review',
    scheduled_at: new Date(serviceEnd.getTime() + 24 * 60 * 60 * 1000).toISOString(),
    message: `You haven't reviewed booking ${booking_id}. Your feedback helps!`,
    target: 'user',
    status: 'scheduled',
  });

  return {
    followups,
    total_scheduled: followups.length,
    agent: 'followup',
    reasoning: `Scheduled ${followups.length} follow-ups for ${booking_id}.`,
    duration_ms: Date.now() - startTime,
  };
}

module.exports = { runFollowupAgent };
