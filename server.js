const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');

// Load Firebase Admin (this will use environment variable)
require('./src/config/firebaseAdmin');

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// ✅ IMPORTANT: Auth Routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // For testing - hardcoded admin login
    if (email === 'admin@anesguard.com' && password === 'Admin@123456') {
      return res.json({
        success: true,
        token: 'test-token-123456',
        user: {
          id: '1',
          fullName: 'Admin User',
          email: 'admin@anesguard.com',
          role: 'Super Admin',
          status: 'Active'
        }
      });
    }
    
    res.status(401).json({ 
      success: false, 
      message: 'Invalid credentials' 
    });
    
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'AnesGuard API is running' 
  });
});

// ✅ IMPORTANT: Bind to all interfaces
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API URL: http://localhost:${PORT}/api`);
});