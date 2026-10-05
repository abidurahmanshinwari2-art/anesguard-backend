const User = require('../models/User');
const Assessment = require('../models/Assessment');
const Settings = require('../models/Settings');

const DEFAULT_SETTINGS = {
  general: {
    systemName: 'AnesGuard',
    systemVersion: '1.0.0',
    timezone: 'UTC+5',
    dateFormat: 'MM/DD/YYYY',
    language: 'English',
  },
  security: {
    sessionTimeout: '30',
    passwordPolicy: 'Strong',
  },
  notifications: {
    emailAlerts: false,
    systemUpdates: true,
    userActivity: true,
    reportGeneration: true,
  },
};

const getSystemOverview = async (req, res, next) => {
  try {
    const activeUsers = { isDeleted: { $ne: true } };
    const [
      totalUsers,
      superAdmin,
      administrator,
      doctor,
      nurse,
      trainee,
      viewer,
      totalAssessments,
      lowRisk,
      moderateRisk,
      highRisk,
    ] = await Promise.all([
      User.countDocuments(activeUsers),
      User.countDocuments({ ...activeUsers, role: 'Super Admin' }),
      User.countDocuments({ ...activeUsers, role: 'Administrator' }),
      User.countDocuments({ ...activeUsers, role: 'Doctor' }),
      User.countDocuments({ ...activeUsers, role: 'Nurse' }),
      User.countDocuments({ ...activeUsers, role: 'Trainee' }),
      User.countDocuments({ ...activeUsers, role: 'Viewer' }),
      Assessment.countDocuments(),
      Assessment.countDocuments({ riskLevel: 'Low' }),
      Assessment.countDocuments({ riskLevel: 'Moderate' }),
      Assessment.countDocuments({ riskLevel: 'High' }),
    ]);

    res.json({
      users: {
        total: totalUsers,
        superAdmin,
        administrator,
        doctor,
        nurse,
        trainee,
        viewer,
      },
      assessments: { total: totalAssessments, low: lowRisk, moderate: moderateRisk, high: highRisk },
    });
  } catch (err) {
    next(err);
  }
};

const getRecentActivity = async (req, res, next) => {
  try {
    const limit = Math.min(100, Number(req.query.limit) || 10);
    const recent = await Assessment.find()
      .sort({ updatedAt: -1 })
      .limit(limit)
      .populate('createdBy', 'fullName email')
      .select('patientName riskLevel status createdAt updatedAt createdBy drugSelected');
    res.json(recent);
  } catch (err) {
    next(err);
  }
};

const getSettings = async (req, res, next) => {
  try {
    const saved = await Settings.findOne({ key: 'system' });
    res.json({
      success: true,
      settings: {
        general: { ...DEFAULT_SETTINGS.general, ...(saved?.general || {}) },
        security: { ...DEFAULT_SETTINGS.security, ...(saved?.security || {}) },
        notifications: { ...DEFAULT_SETTINGS.notifications, ...(saved?.notifications || {}) },
        updatedAt: saved?.updatedAt || null,
      },
    });
  } catch (err) {
    next(err);
  }
};

const updateSettings = async (req, res, next) => {
  try {
    const { general = {}, security = {}, notifications = {} } = req.body || {};
    const saved = await Settings.findOneAndUpdate(
      { key: 'system' },
      {
        $set: {
          general: {
            systemName: general.systemName || DEFAULT_SETTINGS.general.systemName,
            systemVersion: general.systemVersion || DEFAULT_SETTINGS.general.systemVersion,
            timezone: general.timezone || DEFAULT_SETTINGS.general.timezone,
            dateFormat: general.dateFormat || DEFAULT_SETTINGS.general.dateFormat,
            language: general.language || DEFAULT_SETTINGS.general.language,
          },
          security: {
            sessionTimeout: String(security.sessionTimeout || DEFAULT_SETTINGS.security.sessionTimeout),
            passwordPolicy: security.passwordPolicy || DEFAULT_SETTINGS.security.passwordPolicy,
          },
          notifications: {
            emailAlerts: Boolean(notifications.emailAlerts),
            systemUpdates: Boolean(notifications.systemUpdates),
            userActivity: Boolean(notifications.userActivity),
            reportGeneration: Boolean(notifications.reportGeneration),
          },
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json({
      success: true,
      message: 'Settings saved',
      settings: {
        general: saved.general,
        security: saved.security,
        notifications: saved.notifications,
        updatedAt: saved.updatedAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getSystemOverview, getRecentActivity, getSettings, updateSettings };
