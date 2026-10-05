const express = require('express');
const router = express.Router();
const { protect, requireAdmin } = require('../middleware/authMiddleware');
const { getSystemOverview, getRecentActivity, getSettings, updateSettings } = require('../controllers/adminController');

router.get('/overview', protect, requireAdmin, getSystemOverview);
router.get('/recent-activity', protect, requireAdmin, getRecentActivity);
router.get('/settings', protect, requireAdmin, getSettings);
router.put('/settings', protect, requireAdmin, updateSettings);

module.exports = router;