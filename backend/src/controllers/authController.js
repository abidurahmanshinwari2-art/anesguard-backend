const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { signToken } = require('../utils/generateToken');

const DEPARTMENTS = [
  'Cardiology',
  'Neurology',
  'Pediatrics',
  'Orthopedics',
  'Radiology',
  'Emergency Medicine',
  'Surgery',
];

const normalizeDepartment = (value) => {
  const text = String(value || '').trim();
  if (!text) return 'Cardiology';
  if (text.toLowerCase() === 'emergency') return 'Emergency Medicine';
  const match = DEPARTMENTS.find((department) => department.toLowerCase() === text.toLowerCase());
  return match || 'Cardiology';
};

const LEGACY_ROLES = {
  admin: 'Super Admin',
  student: 'Trainee',
  doctor: 'Doctor',
};

const ALLOWED_ROLES = ['Super Admin', 'Administrator', 'Doctor', 'Nurse', 'Trainee', 'Viewer'];

const normalizeRole = (role) => {
  if (LEGACY_ROLES[role]) return LEGACY_ROLES[role];
  return ALLOWED_ROLES.includes(role) ? role : 'Viewer';
};

const publicUser = (user) => ({
  id: user._id,
  _id: user._id,
  fullName: user.fullName,
  email: user.email,
  role: user.role,
  status: user.status,
  phone: user.phone || '',
  department: user.department || '',
  employeeId: user.employeeId || '',
  lastLogin: user.lastLogin || null,
  photoURL: user.photoURL || '',
});

const register = async (req, res, next) => {
  try {
    const { fullName, email, password, phone, department, employeeId } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }
    if (String(password).length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
    }

    const existing = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const userCount = await User.countDocuments();
    const hashedPassword = await bcrypt.hash(password, 10);
    const trimmedEmployeeId = employeeId && String(employeeId).trim();

    const user = await User.create({
      fullName: String(fullName).trim(),
      email: String(email).toLowerCase().trim(),
      password: hashedPassword,
      phone: phone || '',
      department: normalizeDepartment(department),
      ...(trimmedEmployeeId ? { employeeId: trimmedEmployeeId } : {}),
      role: userCount === 0 ? 'Super Admin' : 'Viewer',
      status: 'Active',
    });

    res.status(201).json({
      success: true,
      message: userCount === 0
        ? 'Account created. You are the first user, so this account is a Super Admin.'
        : 'User created successfully',
      user: publicUser(user),
    });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: String(email).toLowerCase().trim(), isDeleted: { $ne: true } });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    if (user.status === 'Inactive') {
      return res.status(403).json({ success: false, message: 'This account is inactive' });
    }

    const storedPassword = user.password;
    if (!storedPassword) {
      // Older accounts were saved with email and role only. The password
      // entered on this login becomes the stored password.
      user.password = await bcrypt.hash(password, 10);
    } else {
      const matches = await bcrypt.compare(password, storedPassword);
      if (!matches) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }
    }

    user.role = normalizeRole(user.role);
    user.department = normalizeDepartment(user.department);
    if (!user.fullName) user.fullName = String(email).split('@')[0];
    if (!user.status || !['Active', 'Inactive', 'Pending'].includes(user.status)) user.status = 'Active';
    user.lastLogin = new Date();
    await user.save();

    res.json({
      success: true,
      token: signToken(user._id),
      user: publicUser(user),
    });
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res) => {
  res.json({ success: true, user: publicUser(req.user) });
};

module.exports = { register, login, getMe, publicUser, normalizeDepartment };
