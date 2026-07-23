const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema(
  {
    createdBy: { type: String, required: true, index: true },

    patientName: { type: String, required: true, trim: true },
    age: { type: Number, required: true },
    gender: { type: String, enum: ['male', 'female', 'other'], required: true },
    height: { type: Number, required: true },
    weight: { type: Number, required: true },
    bmi: { type: Number },

    bloodPressure: { type: String, required: true },
    heartRate: { type: Number, required: true },
    spo2: { type: Number },

    allergies: { type: String, default: 'None' },
    otherDetails: { type: String, default: '' },
    medHistory: { type: Map, of: Boolean, default: {} },

    riskLevel: { type: String, enum: ['Low', 'Moderate', 'High'], default: 'Low' },
    riskScore: { type: Number, default: 0 },
    riskFactors: [{ label: String, score: Number }],
    recommendations: [{ type: String }],

    drugSelected: { type: String },
    calculatedDose: { type: String },
    doseRange: { type: String },

    doctor: { type: String, default: '' },
    status: { type: String, enum: ['Pending', 'Completed'], default: 'Pending' },
  },
  { timestamps: true }
);

assessmentSchema.pre('save', function (next) {
  if (this.height && this.weight) {
    const heightInMeters = this.height / 100;
    this.bmi = +(this.weight / (heightInMeters * heightInMeters)).toFixed(1);
  }
  next();
});

module.exports = mongoose.model('Assessment', assessmentSchema);