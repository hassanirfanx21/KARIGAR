// ─── Worker Routes (Person B owns this file) ───────────────────────────────
// GET  /api/workers          → All workers
// GET  /api/workers/:id      → Single worker

const express = require('express');
const router = express.Router();

// TODO: Person B will implement these with Firestore queries

router.get('/', async (req, res) => {
  res.json({ success: true, message: 'Worker list not yet implemented' });
});

router.get('/:id', async (req, res) => {
  res.json({ success: true, message: 'Worker detail not yet implemented', id: req.params.id });
});

module.exports = router;
