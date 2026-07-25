const admin = require('../config/firebaseAdmin');

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization || '';

  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No auth token provided' });
  }

  const idToken = authHeader.split(' ')[1];

  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    req.user = {
      uid: decoded.uid,
      email: decoded.email,
    };
    next();
  } catch (err) {
    console.error('Token verification failed:', err.message);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

const requireAdmin = async (req, res, next) => {
  const User = require('../models/User');
  const user = await User.findOne({ firebaseUid: req.user.uid });

  if (!user || user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

module.exports = { protect, requireAdmin };