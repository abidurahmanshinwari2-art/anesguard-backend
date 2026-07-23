// controllers/userController.js
const User = require('../models/User');

// POST /api/users/sync
// Purpose: call this once right after login/signup succeeds on the frontend
// (in onLoginSuccess). Creates the Mongo profile the first time a Firebase
// user is seen, or just updates lastLoginAt on subsequent logins.
const syncUser = async (req, res, next) => {
  try {
    const { uid, email } = req.user; // set by authMiddleware.protect
    const { displayName, phone, department, employeeId } = req.body;

    const setFields = { email, lastLoginAt: new Date() };
    if (displayName) setFields.displayName = displayName;
    if (phone) setFields.phone = phone;
    if (department) setFields.department = department;
    if (employeeId) setFields.employeeId = employeeId;

    const user = await User.findOneAndUpdate(
      { firebaseUid: uid },
      { $set: setFields },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json(user);
  } catch (err) {
    next(err);
  }
};

// GET /api/users/me
const getMe = async (req, res, next) => {
  try {
    const user = await User.findOne({ firebaseUid: req.user.uid });
    if (!user) return res.status(404).json({ message: 'Profile not found. Call /sync first.' });
    res.json(user);
  } catch (err) {
    next(err);
  }
};

// PUT /api/users/me
const updateMe = async (req, res, next) => {
  try {
    // Only update fields that were actually sent, so a partial update from
    // the Profile screen (e.g. just changing the phone number) doesn't
    // accidentally blank out the other fields.
    const { displayName, phone, department, employeeId, photoURL } = req.body;
    const updates = {};
    if (displayName !== undefined) updates.displayName = displayName;
    if (phone !== undefined) updates.phone = phone;
    if (department !== undefined) updates.department = department;
    if (employeeId !== undefined) updates.employeeId = employeeId;
    if (photoURL !== undefined) updates.photoURL = photoURL;

    const user = await User.findOneAndUpdate(
      { firebaseUid: req.user.uid },
      { $set: updates },
      { new: true }
    );
    res.json(user);
  } catch (err) {
    next(err);
  }
};

// GET /api/users  (admin only — used by adminpanel.jsx)
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    next(err);
  }
};

module.exports = { syncUser, getMe, updateMe, getAllUsers };