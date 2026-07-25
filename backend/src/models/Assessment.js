const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema({
  patientName: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, required: true },
  height: { type: Number, required: true },
  weight: { type: Number, required: true },
  bloodPressure: { type: String, required: true },
  heartRate: { type: Number, required: true },
  spo2: { type: Number, default: 98 },
  allergies: { type: String, default: 'None' },
  otherDetails: { type: String, default: '' },
  medHistory: { type: Map, of: Boolean, default: {} },
  riskLevel: { type: String, enum: ['Low', 'Moderate', 'High'], default: 'Low' },
  riskScore: { type: Number, default: 0 },
  riskFactors: { type: [String], default: [] },
  status: { type: String, enum: ['Pending', 'Completed'], default: 'Pending' },
  
  // ✅ Link assessment to user
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  
  bmi: { type: String, default: '--' },
}, { timestamps: true });

// ✅ Index for faster queries
assessmentSchema.index({ createdBy: 1 });

module.exports = mongoose.model('Assessment', assessmentSchema);