// ─── Agent Routes (Person A) ────────────────────────────────────────────────
// POST /api/agent/request    → Parse message → discover → rank → price workers
// POST /api/agent/book       → User picked a worker → book → notify → follow-up
// POST /api/agent/dispute    → Process a complaint
// POST /api/agent/compare    → Side-by-side agentic vs baseline comparison

const express = require('express');
const router = express.Router();
const {
  processRequest,
  processBooking,
  processDispute,
  processComparison,
} = require('../agents/orchestrator');

// ─── Main Agentic Pipeline ──────────────────────────────────────────────────
// Step 1 of the two-step flow: returns ranked workers with prices.
router.post('/request', async (req, res) => {
  try {
    const { message, language, user_id } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const result = await processRequest(message, language, user_id);
    res.json({ success: true, ...result });
  } catch (err) {
    console.error('[Agent Route Error] /request:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─── Booking (User Picked a Worker) ─────────────────────────────────────────
// Step 2 of the two-step flow: creates the booking.
router.post('/book', async (req, res) => {
  try {
    const { user_id, worker_id, intent, pricing, user_phone, worker_phone, worker_name } = req.body;

    if (!worker_id || !intent || !pricing) {
      return res.status(400).json({
        error: 'worker_id, intent, and pricing are required',
      });
    }

    const result = await processBooking({
      user_id, worker_id, intent, pricing,
      user_phone, worker_phone, worker_name,
    });

    res.json({ success: true, ...result });
  } catch (err) {
    console.error('[Agent Route Error] /book:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─── Dispute ────────────────────────────────────────────────────────────────
router.post('/dispute', async (req, res) => {
  try {
    const { complaint_text, language, booking, worker_history, charged_amount } = req.body;

    if (!complaint_text) {
      return res.status(400).json({ error: 'complaint_text is required' });
    }

    const result = await processDispute({
      complaint_text, language, booking, worker_history, charged_amount,
    });

    res.json({ success: true, ...result });
  } catch (err) {
    console.error('[Agent Route Error] /dispute:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─── Side-by-Side Comparison ────────────────────────────────────────────────
router.post('/compare', async (req, res) => {
  try {
    const { message, language } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const result = await processComparison(message, language);
    res.json({ success: true, ...result });
  } catch (err) {
    console.error('[Agent Route Error] /compare:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
