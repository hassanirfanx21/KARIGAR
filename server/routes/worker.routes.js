// ─── Worker Routes (Person B owns this file) ───────────────────────────────
// GET  /api/workers          → All workers (optional ?category= filter)
// GET  /api/workers/:id      → Single worker by ID

const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');

// List all workers, optionally filtered by category
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    let query = db.collection('workers');

    if (category) {
      query = query.where('category', '==', category.toLowerCase());
    }

    const snapshot = await query.get();
    const workers = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    res.json({
      success: true,
      total: workers.length,
      workers,
    });
  } catch (err) {
    console.error('[Worker Route Error]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Get single worker by ID
router.get('/:id', async (req, res) => {
  try {
    const doc = await db.collection('workers').doc(req.params.id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Worker not found', id: req.params.id });
    }

    res.json({
      success: true,
      worker: { id: doc.id, ...doc.data() },
    });
  } catch (err) {
    console.error('[Worker Route Error]', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
