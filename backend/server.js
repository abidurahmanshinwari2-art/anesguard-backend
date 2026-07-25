const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');
const User = require('./src/models/User');
const Assessment = require('./src/models/Assessment');
const bcrypt = require('bcryptjs');

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// ============================================
// ✅ AUTH ROUTES
// ============================================

app.post('/api/auth/register', async (req, res) => {
  try {
    const { fullName, email, password, phone, department, employeeId, role } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await User.create({
      fullName, email, password: hashedPassword,
      phone: phone || '', department: department || 'Cardiology',
      employeeId: employeeId || '', role: role || 'Viewer', status: 'Active'
    });
    res.status(201).json({
      success: true, message: 'User created successfully',
      user: { id: user._id, fullName: user.fullName, email: user.email, role: user.role, status: user.status }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    res.json({
      success: true,
      token: 'test-token-' + Date.now(),
      user: { id: user._id, fullName: user.fullName, email: user.email, role: user.role, status: user.status }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// ✅ ASSESSMENT ROUTES - NOW WITH MONGODB!
// ============================================

// CREATE Assessment
app.post('/api/assessments', async (req, res) => {
  try {
    const data = req.body;
    
    // Calculate BMI
    const height = parseFloat(data.height);
    const weight = parseFloat(data.weight);
    let bmi = '--';
    if (height > 0 && weight > 0) {
      bmi = (weight / ((height / 100) ** 2)).toFixed(1);
    }

    // Calculate risk
    let riskScore = 0;
    let riskFactors = [];
    let riskLevel = 'Low';
    
    if (data.age > 60) { riskScore += 2; riskFactors.push('Age > 60 years'); }
    else if (data.age > 50) { riskScore += 1; riskFactors.push('Age > 50 years'); }
    
    if (bmi !== '--' && parseFloat(bmi) > 30) { riskScore += 2; riskFactors.push('BMI > 30'); }
    else if (bmi !== '--' && parseFloat(bmi) > 25) { riskScore += 1; riskFactors.push('BMI > 25'); }
    
    if (data.medHistory) {
      if (data.medHistory.Hypertension) { riskScore += 2; riskFactors.push('Hypertension'); }
      if (data.medHistory['Diabetes Mellitus']) { riskScore += 1; riskFactors.push('Diabetes Mellitus'); }
      if (data.medHistory['Respiratory Disease']) { riskScore += 1; riskFactors.push('Respiratory Disease'); }
      if (data.medHistory['Cardiac Disease']) { riskScore += 2; riskFactors.push('Cardiac Disease'); }
    }
    
    if (riskScore >= 7) riskLevel = 'High';
    else if (riskScore >= 4) riskLevel = 'Moderate';
    else riskLevel = 'Low';

    // ✅ SAVE TO MONGODB
    const assessment = await Assessment.create({
      ...data,
      bmi,
      riskScore,
      riskLevel,
      riskFactors,
      status: 'Pending'
    });

    res.status(201).json({
      success: true,
      message: 'Assessment created successfully',
      assessment
    });

  } catch (error) {
    console.error('Assessment error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET All Assessments
app.get('/api/assessments', async (req, res) => {
  try {
    const assessments = await Assessment.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      assessments,
      pagination: { page: 1, limit: 10, total: assessments.length, pages: 1 }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET Assessment Stats
app.get('/api/assessments/stats', async (req, res) => {
  try {
    const total = await Assessment.countDocuments();
    const low = await Assessment.countDocuments({ riskLevel: 'Low' });
    const moderate = await Assessment.countDocuments({ riskLevel: 'Moderate' });
    const high = await Assessment.countDocuments({ riskLevel: 'High' });
    const pending = await Assessment.countDocuments({ status: 'Pending' });
    const completed = await Assessment.countDocuments({ status: 'Completed' });
    
    res.json({
      success: true,
      stats: { total, low, moderate, high, pending, completed }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// ✅ HEALTH CHECK
// ============================================

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'AnesGuard API is running' });
});

// ============================================
// ✅ START SERVER
// ============================================

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API URL: http://localhost:${PORT}/api`);
});