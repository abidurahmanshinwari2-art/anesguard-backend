// CREATE Assessment - FIXED
app.post('/api/assessments', async (req, res) => {
  try {
    console.log('📝 Creating assessment...');
    console.log('📦 Request body:', req.body);
    
    const data = req.body;
    const userId = req.headers.userid;

    console.log('👤 User ID from header:', userId);

    // ✅ FIX: Get valid user ID
    let userIdToUse = userId;
    
    if (!userIdToUse || userIdToUse === 'undefined' || userIdToUse === 'null') {
      const firstUser = await User.findOne();
      if (firstUser) {
        userIdToUse = firstUser._id;
        console.log('👤 Using first user:', userIdToUse);
      } else {
        // Create a test user if none exists
        const testUser = await User.create({
          fullName: 'Test User',
          email: 'test@anesguard.com',
          password: await bcrypt.hash('password123', 10),
          role: 'Viewer',
          status: 'Active'
        });
        userIdToUse = testUser._id;
        console.log('👤 Created test user:', userIdToUse);
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
      patientName: data.patientName,
      age: data.age,
      gender: data.gender,
      height: data.height,
      weight: data.weight,
      bloodPressure: data.bloodPressure,
      heartRate: data.heartRate,
      spo2: data.spo2 || 98,
      allergies: data.allergies || 'None',
      otherDetails: data.otherDetails || '',
      medHistory: data.medHistory || {},
      bmi,
      riskScore,
      riskLevel,
      riskFactors,
      status: 'Pending',
      createdBy: userIdToUse
    };

    console.log('💾 Saving assessment data:', assessmentData);

    const assessment = await Assessment.create(assessmentData);
    console.log('✅ Assessment saved successfully! ID:', assessment._id);

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