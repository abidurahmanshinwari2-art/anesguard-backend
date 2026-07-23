const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    firebaseUid: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true },
    displayName: { type: String, default: '' },
    role: { type: String, enum: ['student', 'doctor', 'admin'], default: 'student' },
    lastLoginAt: { type: Date, default: Date.now },
    phone: { type: String, default: '' },
    department: { type: String, default: '' },
    employeeId: { type: String, default: '' },
    photoURL: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);