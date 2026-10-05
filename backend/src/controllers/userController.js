const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { publicUser, normalizeDepartment } = require('./authController');

const ROLES = ['Super Admin', 'Administrator', 'Doctor', 'Nurse', 'Trainee', 'Viewer'];

const getMe = async (req, res) => {
  res.json(publicUser(req.user));
};

const updateMe = async (req, res, next) => {
  try {
    const { fullName, phone, department, employeeId, photoURL } = req.body;
    if (fullName !== undefined) req.user.fullName = String(fullName).trim();
    if (phone !== undefined) req.user.phone = phone;
    if (department !== undefined) req.user.department = normalizeDepartment(department);
    if (employeeId !== undefined) {
      const trimmed = String(employeeId).trim();
      req.user.employeeId = trimmed || undefined;
    }
    if (photoURL !== undefined) req.user.photoURL = photoURL;
    await req.user.save();
    res.json({ success: true, user: publicUser(req.user) });
  } catch (err) {
    next(err);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current and new passwords are required' });
    }
    if (String(newPassword).length < 8) {
      return res.status(400).json({ success: false, message: 'New password must be at least 8 characters' });
    }

    const matches = await bcrypt.compare(currentPassword, req.user.password);
    if (!matches) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    req.user.password = await bcrypt.hash(newPassword, 10);
    await req.user.save();
    res.json({ success: true, message: 'Password updated' });
  } catch (err) {
    next(err);
  }
};

const syncUser = async (req, res) => {
  res.json(publicUser(req.user));
};

const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({ isDeleted: { $ne: true } }).sort({ createdAt: -1 });
    res.json(users.map(publicUser));
  } catch (err) {
    next(err);
  }
};

const createUser = async (req, res, next) => {
  try {
    const { fullName, email, role, department, phone } = req.body;
    if (!fullName || !email) {
      return res.status(400).json({ success: false, message: 'Name and email are required' });
    }

    const existing = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (existing && !existing.isDeleted) {
      return res.status(400).json({ success: false, message: 'A user with this email already exists' });
    }

    const assignedRole = ROLES.includes(role) && role !== 'Super Admin' ? role : 'Viewer';
    const temporaryPassword = `Temp${Math.floor(100000 + Math.random() * 900000)}!`;
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

    let user;
    if (existing && existing.isDeleted) {
      existing.fullName = String(fullName).trim();
      existing.password = hashedPassword;
      existing.role = assignedRole;
      existing.department = normalizeDepartment(department);
      existing.phone = phone || '';
      existing.status = 'Active';
      existing.isDeleted = false;
      user = await existing.save();
    } else {
      user = await User.create({
        fullName: String(fullName).trim(),
        email: String(email).toLowerCase().trim(),
        password: hashedPassword,
        role: assignedRole,
        department: normalizeDepartment(department),
        phone: phone || '',
        status: 'Active',
      });
    }

    res.status(201).json({
      success: true,
      message: 'User created',
      temporaryPassword,
      user: publicUser(user),
    });
  } catch (err) {
    next(err);
  }
};

const updateUserStatus = async (req, res, next) => {
  try {
    if (String(req.params.id) === String(req.user._id)) {
      return res.status(400).json({ success: false, message: 'You cannot change your own status' });
    }

    const user = await User.findOne({ _id: req.params.id, isDeleted: { $ne: true } });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const nextStatus = req.body.status === 'Inactive' ? 'Inactive' : 'Active';
    user.status = nextStatus;
    await user.save();
    res.json({ success: true, user: publicUser(user) });
  } catch (err) {
    next(err);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    if (String(req.params.id) === String(req.user._id)) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own account' });
    }

    const user = await User.findOne({ _id: req.params.id, isDeleted: { $ne: true } });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.isDeleted = true;
    user.status = 'Inactive';
    await user.save();
    res.json({ success: true, message: 'User deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  syncUser,
  getMe,
  updateMe,
  changePassword,
  getAllUsers,
  createUser,
  updateUserStatus,
  deleteUser,
};
