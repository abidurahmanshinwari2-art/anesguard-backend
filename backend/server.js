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
// ✅ ASSESSMENT ROUTES - FIXED!
// ============================================

// CREATE Assessment
app.post('/api/assessments', async (req, res) => {
  try {
    console.log('📝 Received assessment data:', req.body);
    
    const data = req.body;
    const userId = req.headers.userid;

    console.log('👤 User ID from header:', userId);

    // ✅ FIX: Use the actual user ID or create a valid one
    let userIdToUse = userId;
    
    // If no userId, get the first user from database or create a valid ObjectId
    if (!userIdToUse) {
      const firstUser = await User.findOne();
      if (firstUser) {
        userIdToUse = firstUser._id;
        console.log('👤 Using first user:', userIdToUse);
      } else {
        // If no user exists, create a valid ObjectId
        userIdToUse = new mongoose.Types.ObjectId();
        console.log('👤 No user found, creating new ObjectId:', userIdToUse);
      }
    }

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

    // ✅ SAVE TO DATABASE
    const assessmentData = {
      ...data,
      bmi,
      riskScore,
      riskLevel,
      riskFactors,
      status: 'Pending',
      createdBy: userIdToUse
    };

    console.log('💾 Saving assessment:', assessmentData);

    const assessment = await Assessment.create(assessmentData);

    console.log('✅ Assessment saved successfully:', assessment._id);

    res.status(201).json({
      success: true,
      message: 'Assessment created successfully',
      assessment
    });

  } catch (error) {
    console.error('❌ Assessment error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message,
      stack: error.stack 
    });
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