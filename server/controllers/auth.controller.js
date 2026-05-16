const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { db } = require('../config/firebase');

// ─── Constants ──────────────────────────────────────────────────────────────
const JWT_SECRET = process.env.JWT_SECRET || 'karigar-dev-secret-key';
const OTP_EXPIRY_MINUTES = 5;

// ─── Helpers ────────────────────────────────────────────────────────────────
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
}

// ─── Controllers ────────────────────────────────────────────────────────────

/**
 * 1. Request OTP
 * Body: { phone }
 */
exports.requestOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ error: 'Phone number is required' });

    const otp = generateOTP();
    const expiresAt = Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000;

    // Hash OTP before storing (best practice, even though it's short-lived)
    const salt = await bcrypt.genSalt(10);
    const hashedOtp = await bcrypt.hash(otp, salt);

    // Save to Firestore 'otps' collection
    await db.collection('otps').doc(phone).set({
      hash: hashedOtp,
      expiresAt: expiresAt
    });

    // In production, this is where we call an SMS provider (Twilio/JazzCash API)
    console.log(`\n📱 [Auth] SMS to ${phone}: Your KARIGAR OTP is ${otp}. Valid for 5 mins.\n`);

    res.json({ success: true, message: 'OTP sent successfully' });
  } catch (err) {
    console.error('[Auth] requestOtp error:', err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * 2. Verify OTP & Login/Register
 * Body: { phone, otp, role, name }
 */
exports.verifyOtp = async (req, res) => {
  try {
    const { phone, otp, role = 'customer', name } = req.body;
    if (!phone || !otp) return res.status(400).json({ error: 'Phone and OTP are required' });

    const doc = await db.collection('otps').doc(phone).get();
    if (!doc.exists) return res.status(400).json({ error: 'Invalid or expired OTP' });

    const data = doc.data();
    if (Date.now() > data.expiresAt) {
      await db.collection('otps').doc(phone).delete();
      return res.status(400).json({ error: 'OTP expired' });
    }

    const isValid = await bcrypt.compare(otp, data.hash);
    if (!isValid) return res.status(400).json({ error: 'Incorrect OTP' });

    // Delete OTP after successful use
    await db.collection('otps').doc(phone).delete();

    // Check if user exists, else create
    const usersRef = db.collection('users');
    let userDoc = await usersRef.doc(phone).get();
    
    if (!userDoc.exists) {
      await usersRef.doc(phone).set({
        phone,
        name: name || 'Karigar User',
        role,
        createdAt: new Date().toISOString()
      });
      userDoc = await usersRef.doc(phone).get();
    }

    const userData = { id: userDoc.id, ...userDoc.data() };

    // Generate JWT
    const token = jwt.sign(
      { id: userData.id, phone: userData.phone, role: userData.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: userData
    });
  } catch (err) {
    console.error('[Auth] verifyOtp error:', err);
    res.status(500).json({ error: err.message });
  }
};
