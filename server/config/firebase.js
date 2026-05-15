// ─── Firebase Admin SDK Setup ───────────────────────────────────────────────
// Shared by all agents that need Firestore access.
//
// SETUP INSTRUCTIONS:
// 1. Go to Firebase Console → Project Settings → Service Accounts
// 2. Click "Generate New Private Key"
// 3. Save the JSON file as: server/config/serviceAccountKey.json
// 4. Add serviceAccountKey.json to .gitignore!

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');

if (fs.existsSync(serviceAccountPath)) {
  const serviceAccount = require(serviceAccountPath);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'karigar-90fbf'
  });
} else {
  // Fallback: use environment variables (for Railway deployment)
  console.warn('[Firebase] No serviceAccountKey.json found. Using default credentials.');
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

const db = admin.firestore();
const auth = admin.auth();

module.exports = { admin, db, auth };
