const express = require('express');
const router = express.Router();
const { protect, requireAdmin } = require('../middleware/authMiddleware');
const { getSystemOverview, getRecentActivity } = require('../controllers/adminController');

router.get('/overview', protect, requireAdmin, getSystemOverview);
router.get('/recent-activity', protect, requireAdmin, getRecentActivity);

module.exports = router;