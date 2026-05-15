// ─── Agent Routes (Person A owns this file) ────────────────────────────────
// POST /api/agent/request    → Full agentic pipeline
// GET  /api/agent/baseline   → Baseline comparison

const express = require('express');
const router = express.Router();

// TODO: Person A will implement these
// const { orchestrate } = require('../agents/orchestrator');

// Main agentic pipeline endpoint
router.post('/request', async (req, res) => {
  try {
    const { message, language, user_id } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // TODO: Replace with orchestrator call
    res.json({
      success: true,
      message: 'Agent pipeline not yet implemented',
      received: { message, language, user_id },
    });
  } catch (err) {
    console.error('[Agent Route Error]', err);
    res.status(500).json({ error: err.message });
  }
});

// Baseline comparison endpoint
router.get('/baseline', async (req, res) => {
  try {
    const { message } = req.query;

    if (!message) {
      return res.status(400).json({ error: 'Message query param is required' });
    }

    // TODO: Replace with baseline comparison logic
    res.json({
      success: true,
      message: 'Baseline comparison not yet implemented',
    });
  } catch (err) {
    console.error('[Baseline Route Error]', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
