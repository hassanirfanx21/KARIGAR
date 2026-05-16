// ─── Notification Routes ──────────────────────────────────────────────────
// GET /api/notifications?user_id=... or ?worker_id=...

const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');

router.get('/', async (req, res) => {
  try {
    const { user_id, worker_id, limit = 30 } = req.query;
    let query = db.collection('notifications');

    if (user_id) {
      query = query.where('user_id', '==', user_id);
    } else if (worker_id) {
      query = query.where('worker_id', '==', worker_id);
    }

    query = query.orderBy('sent_at', 'desc').limit(Number(limit));

    const snapshot = await query.get();
    const notifications = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    res.json({
      success: true,
      total: notifications.length,
      notifications,
    });
  } catch (err) {
    console.error('[Notification Route Error]', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
