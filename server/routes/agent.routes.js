// ─── Agent Routes (Person A) ────────────────────────────────────────────────
// POST /api/agent/request    → Parse message → discover → rank → price workers
// POST /api/agent/book       → User picked a worker → book → notify → follow-up
// POST /api/agent/dispute    → Process a complaint
// POST /api/agent/compare    → Side-by-side agentic vs baseline comparison

const express = require('express');
const router = express.Router();
const {
  orchestrate,
  processBooking,
  processDispute,
  processComparison,
} = require('../agents/orchestrator');
const { runBaseline } = require('../utils/baseline');
const { geocode } = require('../utils/geocoder');

// ─── Main Agentic Pipeline ──────────────────────────────────────────────────
// Step 1 of the two-step flow: returns ranked workers with prices.
router.post('/request', async (req, res) => {
  try {
    const { message, language, user_id } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const result = await orchestrate(message, language || 'roman_urdu', user_id || 'anonymous');
    // orchestrate already returns { success, ... }
    res.json(result);
  } catch (err) {
    console.error('[Agent Route Error] /request:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─── Baseline Comparison ────────────────────────────────────────────────────
router.get('/baseline', async (req, res) => {
  try {
    let { message, lat, lng } = req.query;

    if (!lat || !lng) {
      const location = geocode(message || '');
      if (location) {
        lat = location.lat;
        lng = location.lng;
      } else {
        // Fallback to Islamabad center if we can't detect a location
        lat = 33.6844;
        lng = 73.0479;
      }
    }

    const result = await runBaseline({ 
      keyword: message || '', 
      lat: parseFloat(lat), 
      lng: parseFloat(lng) 
    });
    
    res.json(result);
  } catch (err) {
    console.error('[Agent Route Error] /baseline:', err);
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
