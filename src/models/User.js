const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
  },
  phone: {
    type: String,
    default: '',
  },
  department: {
    type: String,
    enum: ['Cardiology', 'Neurology', 'Pediatrics', 'Orthopedics', 'Radiology', 'Emergency Medicine', 'Surgery'],
    default: 'Cardiology',
  },
  employeeId: {
    type: String,
    unique: true,
    sparse: true,
  },
  role: {
    type: String,
    enum: ['Super Admin', 'Administrator', 'Doctor', 'Nurse', 'Trainee', 'Viewer'],
    default: 'Viewer',
  },
  photoURL: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Pending'],
    default: 'Active',
  },
  lastLogin: {
    type: Date,
    default: null,
  },
  // ✅ FIXED: Removed 'required' and 'unique' to allow null values
  firebaseUid: {
    type: String,
    sparse: true,  // This allows multiple null values
    // unique: true,  // ← REMOVED! No more duplicate key error
  },
  isDeleted: {
    type: Boolean,
    default: false,
  }
}, {
  timestamps: true,
});

// Remove password when converting to JSON
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

// Create indexes for better query performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ status: 1 });

const User = mongoose.model('User', userSchema);

module.exports = User;