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
    default: 'Pending',
  },
  lastLogin: {
    type: Date,
    default: null,
  },
  firebaseUid: {
    type: String,
    unique: true,
    sparse: true,
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

const User = mongoose.model('User', userSchema);

module.exports = User;