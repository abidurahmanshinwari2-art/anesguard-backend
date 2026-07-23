const admin = require('firebase-admin');

// Try to load from environment variable first
let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    console.log('✅ Firebase: Loaded from environment variable');
  } catch (error) {
    console.error('❌ Failed to parse FIREBASE_SERVICE_ACCOUNT:', error.message);
    process.exit(1);
  }
} else {
  console.error('❌ FIREBASE_SERVICE_ACCOUNT environment variable not set');
  process.exit(1);
}

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: serviceAccount.project_id,
});

console.log('✅ Firebase Admin initialized successfully');

module.exports = admin;