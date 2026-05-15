// ─── Booking Routes (Person B owns this file) ──────────────────────────────
// GET  /api/bookings/:id          → Booking detail with agent trace
// POST /api/bookings/:id/dispute  → Submit a dispute/complaint

const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');

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

// Submit a dispute for a booking
router.post('/:id/dispute', async (req, res) => {
  try {
    const { complaint, user_id } = req.body;
    const bookingId = req.params.id;

    if (!complaint) {
      return res.status(400).json({ error: 'Complaint text is required' });
    }

    // Fetch the booking
    const bookingDoc = await db.collection('bookings').doc(bookingId).get();
    if (!bookingDoc.exists) {
      return res.status(404).json({ error: 'Booking not found', id: bookingId });
    }

    const booking = bookingDoc.data();

    // Store dispute in Firestore
    const disputeData = {
      booking_id: bookingId,
      user_id: user_id || booking.user_id || 'anonymous',
      worker_id: booking.worker_id,
      complaint,
      status: 'pending_review',
      created_at: new Date().toISOString(),
    };

    const disputeRef = await db.collection('disputes').add(disputeData);

    // Update booking status
    await db.collection('bookings').doc(bookingId).update({
      status: 'disputed',
      dispute_id: disputeRef.id,
    });

    res.json({
      success: true,
      dispute_id: disputeRef.id,
      status: 'pending_review',
      message: 'Dispute submitted. Our team will review your complaint.',
    });
  } catch (err) {
    console.error('[Booking Dispute Error]', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
