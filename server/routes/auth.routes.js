const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// ─── Auth Routes ────────────────────────────────────────────────────────────

// POST /api/auth/request-otp
router.post('/request-otp', authController.requestOtp);

// POST /api/auth/verify-otp
router.post('/verify-otp', authController.verifyOtp);

module.exports = router;
