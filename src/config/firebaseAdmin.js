// src/config/firebaseAdmin.js
const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

const keyPath = path.join(__dirname, 'serviceAccountKey.json');

if (!fs.existsSync(keyPath)) {
  console.error('❌ Missing src/config/serviceAccountKey.json — download it from Firebase Console > Project Settings > Service Accounts, and place it there.');
  process.exit(1);
}

const serviceAccount = require('./serviceAccountKey.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

module.exports = admin;