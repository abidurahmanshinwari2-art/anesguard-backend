const express = require('express');
const router = express.Router();
const { protect, requireAdmin } = require('../middleware/authMiddleware');
const { syncUser, getMe, updateMe, getAllUsers } = require('../controllers/userController');

router.post('/sync', protect, syncUser);
router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);
router.get('/', protect, requireAdmin, getAllUsers);

module.exports = router;