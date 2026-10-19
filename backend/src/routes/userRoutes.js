const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { requireAccess } = require('../middleware/accessMiddleware');
const {
  syncUser,
  getMe,
  updateMe,
  changePassword,
  getAllUsers,
  createUser,
  updateUser,
  updateUserStatus,
  deleteUser,
} = require('../controllers/userController');

router.post('/sync', protect, syncUser);
router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);
router.put('/me/password', protect, changePassword);
router.get('/', protect, requireAccess('User accounts', 'Read Only'), getAllUsers);
router.post('/', protect, requireAccess('User accounts', 'Read/Write'), createUser);
router.patch('/:id/status', protect, requireAccess('User accounts', 'Read/Write'), updateUserStatus);
router.patch('/:id', protect, requireAccess('User accounts', 'Read/Write'), updateUser);
router.delete('/:id', protect, requireAccess('User accounts', 'Full Control'), deleteUser);

module.exports = router;
