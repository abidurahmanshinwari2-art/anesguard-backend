const express = require('express');
const router = express.Router();
const { protect, requireAdmin } = require('../middleware/authMiddleware');
const {
  syncUser,
  getMe,
  updateMe,
  changePassword,
  getAllUsers,
  createUser,
  updateUserStatus,
  deleteUser,
} = require('../controllers/userController');

router.post('/sync', protect, syncUser);
router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);
router.put('/me/password', protect, changePassword);
router.get('/', protect, requireAdmin, getAllUsers);
router.post('/', protect, requireAdmin, createUser);
router.patch('/:id/status', protect, requireAdmin, updateUserStatus);
router.delete('/:id', protect, requireAdmin, deleteUser);

module.exports = router;
