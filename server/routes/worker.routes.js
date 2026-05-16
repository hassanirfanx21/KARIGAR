// ─── Worker Routes (Person B owns this file) ───────────────────────────────
// GET  /api/workers          → All workers (optional ?category= filter)
// GET  /api/workers/:id      → Single worker by ID

const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const { haversine } = require('../utils/distance');
const { getTravelTimes } = require('../utils/distanceMatrix');

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

// Nearby workers by distance
router.get('/nearby', async (req, res) => {
  try {
    const { lat, lng, radius = 10, category } = req.query;
    if (!lat || !lng) {
      return res.status(400).json({ error: 'lat and lng are required' });
    }

    let query = db
      .collection('workers')
      .where('is_available', '==', true)
      .where('is_verified', '==', true);

    if (category) {
      query = query.where('category', '==', category.toLowerCase());
    }

    const snapshot = await query.get();
    const workers = [];

    snapshot.docs.forEach((doc) => {
      const worker = { id: doc.id, ...doc.data() };
      const distance_km = haversine(Number(lat), Number(lng), worker.lat, worker.lng);
      if (distance_km <= Number(radius)) {
        workers.push({ ...worker, distance_km });
      }
    });

    const travelTimes = await getTravelTimes(
      { lat: Number(lat), lng: Number(lng) },
      workers.map((w) => ({ lat: w.lat, lng: w.lng, distance_km: w.distance_km }))
    );

    const enriched = workers.map((w, i) => ({
      ...w,
      travel_time_min: travelTimes[i],
    }));

    enriched.sort((a, b) => a.distance_km - b.distance_km);

    res.json({
      success: true,
      total: enriched.length,
      workers: enriched,
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
