const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');
const User = require('./src/models/User');
const bcrypt = require('bcryptjs');

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// ============================================
// ✅ AUTH ROUTES
// ============================================

// REGISTER
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
      fullName,
      email,
      password: hashedPassword,
      phone: phone || '',
      department: department || 'Cardiology',
      employeeId: employeeId || '',
      role: role || 'Viewer',
      status: 'Active'
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        status: user.status
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// LOGIN
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
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        status: user.status
      }
    });
    
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// ✅ ASSESSMENT ROUTES (NEW!)
// ============================================

// CREATE Assessment
app.post('/api/assessments', async (req, res) => {
  try {
    const assessmentData = req.body;
    
    // Validate required fields
    if (!assessmentData.patientName || !assessmentData.age) {
      return res.status(400).json({
        success: false,
        message: 'Patient name and age are required'
      });
    }

    // Calculate BMI
    const height = parseFloat(assessmentData.height);
    const weight = parseFloat(assessmentData.weight);
    let bmi = null;
    if (height > 0 && weight > 0) {
      bmi = weight / ((height / 100) ** 2);
    }

    // Calculate risk level (simple logic)
    let riskScore = 0;
    let riskLevel = 'Low';
    
    if (assessmentData.age > 60) riskScore += 2;
    else if (assessmentData.age > 50) riskScore += 1;
    
    if (bmi && bmi > 30) riskScore += 2;
    else if (bmi && bmi > 25) riskScore += 1;
    
    if (assessmentData.medHistory) {
      if (assessmentData.medHistory.Hypertension) riskScore += 2;
      if (assessmentData.medHistory['Diabetes Mellitus']) riskScore += 1;
      if (assessmentData.medHistory['Respiratory Disease']) riskScore += 1;
      if (assessmentData.medHistory['Cardiac Disease']) riskScore += 2;
    }
    
    if (riskScore >= 7) riskLevel = 'High';
    else if (riskScore >= 4) riskLevel = 'Moderate';
    else riskLevel = 'Low';

    // Save assessment (in memory for now - will save to MongoDB later)
    const assessment = {
      id: Date.now().toString(),
      ...assessmentData,
      bmi: bmi ? bmi.toFixed(1) : '--',
      riskScore,
      riskLevel,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };

    res.status(201).json({
      success: true,
      message: 'Assessment created successfully',
      assessment
    });

  } catch (error) {
    console.error('Assessment error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to save assessment'
    });
  }
});

// GET All Assessments
app.get('/api/assessments', async (req, res) => {
  try {
    // For now, return empty array (will connect to MongoDB later)
    res.json({
      success: true,
      assessments: [],
      pagination: { page: 1, limit: 10, total: 0, pages: 0 }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET Assessment Stats
app.get('/api/assessments/stats', async (req, res) => {
  try {
    // For now, return zero stats (will connect to MongoDB later)
    res.json({
      success: true,
      stats: {
        total: 0,
        low: 0,
        moderate: 0,
        high: 0,
        pending: 0,
        completed: 0
      }
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