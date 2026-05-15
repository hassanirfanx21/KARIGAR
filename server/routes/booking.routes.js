// ─── Booking Routes (Person B owns this file) ──────────────────────────────
// GET  /api/bookings/:id          → Booking detail with trace
// POST /api/bookings/:id/dispute  → Trigger dispute agent

const express = require('express');
const router = express.Router();

// TODO: Person B will implement these with Firestore queries

router.get('/:id', async (req, res) => {
  res.json({ success: true, message: 'Booking detail not yet implemented', id: req.params.id });
});

router.post('/:id/dispute', async (req, res) => {
  res.json({ success: true, message: 'Dispute not yet implemented', id: req.params.id });
});

module.exports = router;
