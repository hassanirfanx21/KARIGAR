// ─── Booking Routes (Person B owns this file) ──────────────────────────────
// GET  /api/bookings/:id          → Booking detail with agent trace
// POST /api/bookings/:id/dispute  → Submit a dispute/complaint

const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const { processDispute } = require('../agents/orchestrator');

// Get booking detail by ID (includes agent_trace)
router.get('/:id', async (req, res) => {
  try {
    const doc = await db.collection('bookings').doc(req.params.id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Booking not found', id: req.params.id });
    }

    res.json({
      success: true,
      booking: { id: doc.id, ...doc.data() },
    });
  } catch (err) {
    console.error('[Booking Route Error]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Submit a dispute for a booking using the AI Dispute Agent
router.post('/:id/dispute', async (req, res) => {
  try {
    const { complaint, language, charged_amount } = req.body;
    const bookingId = req.params.id;

    if (!complaint) {
      return res.status(400).json({ error: 'Complaint text is required' });
    }

    // 1. Fetch the booking
    const bookingDoc = await db.collection('bookings').doc(bookingId).get();
    if (!bookingDoc.exists) {
      return res.status(404).json({ error: 'Booking not found', id: bookingId });
    }
    const booking = bookingDoc.data();

    // 2. Fetch the worker's history
    const workerDoc = await db.collection('workers').doc(booking.worker_id).get();
    const worker_history = workerDoc.exists ? workerDoc.data() : {};

    // 3. Run the AI Dispute Agent via Orchestrator
    const result = await processDispute({
      complaint_text: complaint,
      language: language || 'auto',
      booking,
      worker_history,
      charged_amount
    });

    // 4. Update the booking status in Firestore based on the agent's resolution
    await db.collection('bookings').doc(bookingId).update({
      status: result.status === 'resolved' ? 'dispute_resolved' : 'dispute_escalated',
      dispute_result: result,
    });

    res.json({
      success: true,
      message: 'Dispute processed by AI agent.',
      result
    });
  } catch (err) {
    console.error('[Booking Dispute Error]', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
