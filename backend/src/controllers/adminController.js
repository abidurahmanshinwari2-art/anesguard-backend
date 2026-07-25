const User = require('../models/User');
const Assessment = require('../models/Assessment');

const getSystemOverview = async (req, res, next) => {
  try {
    const [
      totalUsers,
      studentCount,
      doctorCount,
      adminCount,
      totalAssessments,
      lowRisk,
      moderateRisk,
      highRisk,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'doctor' }),
      User.countDocuments({ role: 'admin' }),
      Assessment.countDocuments(),
      Assessment.countDocuments({ riskLevel: 'Low' }),
      Assessment.countDocuments({ riskLevel: 'Moderate' }),
      Assessment.countDocuments({ riskLevel: 'High' }),
    ]);

    res.json({
      users: { total: totalUsers, student: studentCount, doctor: doctorCount, admin: adminCount },
      assessments: { total: totalAssessments, low: lowRisk, moderate: moderateRisk, high: highRisk },
    });
  } catch (err) {
    next(err);
  }
};

const getRecentActivity = async (req, res, next) => {
  try {
    const limit = Number(req.query.limit) || 10;
    const recent = await Assessment.find()
      .sort({ updatedAt: -1 })
      .limit(limit)
      .select('patientName riskLevel status createdAt updatedAt createdBy');
    res.json(recent);
  } catch (err) {
    next(err);
  }
};

module.exports = { getSystemOverview, getRecentActivity };