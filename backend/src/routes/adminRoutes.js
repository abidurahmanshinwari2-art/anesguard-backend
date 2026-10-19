const express = require('express');
const router = express.Router();
const { protect, requireAdmin } = require('../middleware/authMiddleware');
const {
  getSystemOverview,
  getRecentActivity,
  getSettings,
  updateSettings,
  getAccessRules,
  saveAccessRules,
  deleteAssessment,
} = require('../controllers/adminController');

router.get('/overview', protect, requireAdmin, getSystemOverview);
router.get('/recent-activity', protect, requireAdmin, getRecentActivity);
router.get('/settings', protect, requireAdmin, getSettings);
router.put('/settings', protect, requireAdmin, updateSettings);
router.get('/access-rules', protect, requireAdmin, getAccessRules);
router.put('/access-rules', protect, requireAdmin, saveAccessRules);
router.delete('/assessments/:id', protect, requireAdmin, deleteAssessment);

module.exports = router;