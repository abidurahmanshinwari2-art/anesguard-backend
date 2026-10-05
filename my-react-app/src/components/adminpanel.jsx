import React, { useState, useEffect } from 'react';
import { getAllUsers, createUser as createUserRequest, updateUserStatus, deleteUser as deleteUserRequest } from '../api/users';
import { getSystemOverview, getRecentActivity, getSettings, saveSettings } from '../api/admin';

// ── SVG Icons ─────────────────────────────────────────────────────────────────
const Icon = ({ d, size = 16, color = 'currentColor', fill = 'none', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color}
    strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);

const ShieldLogo = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.35C16.5 22.15 20 17.25 20 12V6l-8-4z" fill="rgba(255,255,255,0.2)" />
    <line x1="12" y1="7" x2="12" y2="17" stroke="#fff" strokeWidth="2" />
    <line x1="7" y1="12" x2="17" y2="12" stroke="#fff" strokeWidth="2" />
  </svg>
);

// ── Static Data ───────────────────────────────────────────────────────────────
const STAT_CARDS = [
  { icon: '👥', value: '128', label: 'Total Users',        link: 'View all users →', color: '#2563eb', bg: '#eff6ff' },
  { icon: '🛡️',  value: '8',   label: 'User Roles',         link: 'View roles →',     color: '#16a34a', bg: '#f0fdf4' },
  { icon: '⚙️',  value: '42',  label: 'System Settings',    link: 'Configure →',      color: '#7c3aed', bg: '#f5f3ff' },
  { icon: '📄', value: '156', label: 'Reports Generated',  link: 'View reports →',   color: '#d97706', bg: '#fffbeb' },
  { icon: '📊', value: '1,248',label: 'System Activities', link: 'View logs →',      color: '#dc2626', bg: '#fef2f2' },
];

const USERS = [
  { id: 1, name: 'Dr. Ali Khan',    email: 'ali.khan@anesguard.com',    role: 'Administrator', roleColor: '#7c3aed', roleBg: '#f5f3ff', status: 'Active',   lastLogin: '2025-05-20 10:30 AM' },
  { id: 2, name: 'Dr. Sara Ahmed',  email: 'sara.ahmed@anesguard.com',  role: 'Doctor',        roleColor: '#16a34a', roleBg: '#f0fdf4', status: 'Active',   lastLogin: '2025-05-20 09:15 AM' },
  { id: 3, name: 'Nurse Fatima',    email: 'fatima.noor@anesguard.com', role: 'Nurse',         roleColor: '#2563eb', roleBg: '#eff6ff', status: 'Active',   lastLogin: '2025-05-19 08:45 PM' },
  { id: 4, name: 'Bilal Hussain',   email: 'bilal.hussain@anesguard.com',role: 'Trainee',      roleColor: '#d97706', roleBg: '#fffbeb', status: 'Inactive', lastLogin: '2025-05-18 04:20 PM' },
  { id: 5, name: 'Zainab Malik',    email: 'zainab.malik@anesguard.com', role: 'Viewer',       roleColor: '#64748b', roleBg: '#f8fafc', status: 'Active',   lastLogin: '2025-05-20 11:05 AM' },
];

const ACTIVITY_FEED = [
  { icon: '🟢', text: 'User Dr. Ali Khan logged in',              time: '10:30 AM • May 20, 2025' },
  { icon: '✏️',  text: 'User Sara Ahmed updated patient data',     time: '09:45 AM • May 20, 2025' },
  { icon: '⚙️',  text: 'System settings updated',                 time: '08:20 AM • May 20, 2025' },
  { icon: '📄', text: 'User Bilal Hussain generated report',      time: '06:15 PM • May 19, 2025' },
  { icon: '🔴', text: 'User Zainab Malik logged out',             time: '05:40 PM • May 19, 2025' },
];

const QUICK_SETTINGS = [
  { icon: '⚙️',  label: 'General Settings',      sub: 'Configure basic system settings' },
  { icon: '🛡️',  label: 'Security Settings',     sub: 'Manage passwords & security'     },
  { icon: '🔔', label: 'Notification Settings', sub: 'Configure system notifications'  },
  { icon: '💾', label: 'Backup & Restore',      sub: 'Manage system backup'            },
];

const ACCESS_RULES = [
  { id: 1, resource: 'User accounts', role: 'Super Admin', access: 'Full Control', status: 'Active' },
  { id: 2, resource: 'User accounts', role: 'Administrator', access: 'Full Control', status: 'Active' },
  { id: 3, resource: 'User accounts', role: 'Doctor, Nurse, Trainee, Viewer', access: 'No Access', status: 'Active' },
  { id: 4, resource: 'Own assessments', role: 'Every signed-in role', access: 'Read/Write', status: 'Active' },
  { id: 5, resource: 'System settings', role: 'Super Admin', access: 'Full Control', status: 'Active' },
  { id: 6, resource: 'System settings', role: 'Administrator', access: 'Full Control', status: 'Active' },
  { id: 7, resource: 'All activity', role: 'Super Admin', access: 'Read Only', status: 'Active' },
  { id: 8, resource: 'All activity', role: 'Administrator', access: 'Read Only', status: 'Active' },
];

const accessLevelColors = {
  'Full Control': '#16a34a',
  'Read/Write': '#2563eb',
  'Read Only': '#d97706',
  'No Access': '#dc2626'
};

// ── SYSTEM SETTINGS DATA ────────────────────────────────────────────────────
const initialSettings = {
  general: {
    systemName: 'AnesGuard',
    systemVersion: '2.5.0',
    timezone: 'UTC+5',
    dateFormat: 'MM/DD/YYYY',
    language: 'English'
  },
  security: {
    sessionTimeout: '30',
    twoFactorAuth: true,
    passwordPolicy: 'Strong',
    ipWhitelist: false
  },
  notifications: {
    emailAlerts: true,
    systemUpdates: true,
    userActivity: false,
    reportGeneration: true
  },
  integrations: {
    firebase: 'Connected',
    emailService: 'SMTP Configured',
    backupService: 'Enabled'
  }
};

// ── Charts ──────────────────────────────────────────────────────────────────
const DonutChart = ({ users = [] }) => {
  const slices = [
    { label: 'Super Admin', color: '#7c3aed' },
    { label: 'Administrator', color: '#2563eb' },
    { label: 'Doctor', color: '#16a34a' },
    { label: 'Nurse', color: '#93c5fd' },
    { label: 'Trainee', color: '#f59e0b' },
    { label: 'Viewer', color: '#64748b' },
  ].map((role) => ({
    ...role,
    pct: users.length ? users.filter((user) => user.role === role.label).length / users.length : 0,
  })).filter((slice) => slice.pct > 0);

  const cx = 60, cy = 60, r = 44, innerR = 28;
  if (!slices.length) {
    return (
      <svg width="120" height="120" viewBox="0 0 120 120">
        <circle cx={cx} cy={cy} r={(r + innerR) / 2} fill="none" stroke="#e5e7eb" strokeWidth={r - innerR} />
      </svg>
    );
  }

  let cum = -Math.PI / 2;
  const pathData = slices.map(s => {
    const a1 = cum, a2 = cum + s.pct * 2 * Math.PI; cum = a2;
    if (s.pct >= 0.999) {
      return { ...s, d: `M${cx},${cy - r} A${r},${r} 0 1,1 ${cx - 0.01},${cy - r} L${cx - 0.01},${cy - innerR} A${innerR},${innerR} 0 1,0 ${cx},${cy - innerR} Z` };
    }
    const x1o = cx + r * Math.cos(a1), y1o = cy + r * Math.sin(a1);
    const x2o = cx + r * Math.cos(a2), y2o = cy + r * Math.sin(a2);
    const x1i = cx + innerR * Math.cos(a2), y1i = cy + innerR * Math.sin(a2);
    const x2i = cx + innerR * Math.cos(a1), y2i = cy + innerR * Math.sin(a1);
    const large = s.pct > 0.5 ? 1 : 0;
    return { ...s, d: `M${x1o},${y1o} A${r},${r} 0 ${large},1 ${x2o},${y2o} L${x1i},${y1i} A${innerR},${innerR} 0 ${large},0 ${x2i},${y2i} Z` };
  });
  return (
    <svg width="120" height="120" viewBox="0 0 120 120">
      {pathData.map((p, i) => <path key={i} d={p.d} fill={p.color} />)}
    </svg>
  );
};

const LineChart = ({ activity = [] }) => {
  const counts = new Map();
  [...activity].reverse().forEach((item) => {
    if (!item.createdAt) return;
    const label = new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    counts.set(label, (counts.get(label) || 0) + 1);
  });
  const labels = counts.size ? [...counts.keys()] : ['—'];
  const data = counts.size ? [...counts.values()] : [0];
  const W = 340, H = 170, pl = 36, pr = 10, pt = 10, pb = 28;
  const cW = W - pl - pr, cH = H - pt - pb;
  const maxV = Math.max(1, ...data);
  const yTicks = [...new Set([0, Math.ceil(maxV / 2), maxV])];
  const tx = i => data.length === 1 ? pl + cW / 2 : pl + (i / (data.length - 1)) * cW;
  const ty = v => pt + cH - (v / maxV) * cH;
  const pathD = data.map((v, i) => `${i === 0 ? 'M' : 'L'}${tx(i)},${ty(v)}`).join(' ');
  const areaD = pathD + ` L${tx(data.length - 1)},${pt + cH} L${tx(0)},${pt + cH} Z`;

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <defs>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2563eb" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#2563eb" stopOpacity="0.01" />
        </linearGradient>
      </defs>
      {yTicks.map(v => (
        <g key={v}>
          <line x1={pl} y1={ty(v)} x2={W - pr} y2={ty(v)} stroke="#e5e7eb" strokeWidth="1" />
          <text x={pl - 4} y={ty(v) + 4} textAnchor="end" fontSize="9" fill="#94a3b8">{v}</text>
        </g>
      ))}
      <path d={areaD} fill="url(#lineGrad)" />
      <path d={pathD} fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {data.map((v, i) => <circle key={i} cx={tx(i)} cy={ty(v)} r="4" fill="#2563eb" stroke="#fff" strokeWidth="2" />)}
      {labels.map((l, i) => <text key={i} x={tx(i)} y={H - 6} textAnchor="middle" fontSize="8.5" fill="#94a3b8">{l}</text>)}
    </svg>
  );
};

// ── LEFT SIDEBAR ──────────────────────────────────────────────────────────────
const LEFT_NAV = [
  { section: null, items: [{ label: 'Dashboard', icon: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z' }] },
  {
    section: 'USER MANAGEMENT', items: [
      { label: 'Users', icon: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 7a4 4 0 100 8 4 4 0 000-8z' },
      { label: 'Roles & Permissions', icon: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 7a4 4 0 100 8 4 4 0 000-8z' },
      { label: 'Access Control', icon: ['M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'] },
    ]
  },
  {
    section: 'SYSTEM MANAGEMENT', items: [
      { label: 'System Settings', icon: ['M12 15a3 3 0 100-6 3 3 0 000 6z', 'M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z'] },
      { label: 'Reports & Data', icon: ['M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z', 'M14 2v6h6', 'M16 13H8M16 17H8M10 9H8'] },
      { label: 'Activity Logs', icon: ['M9 11l3 3L22 4', 'M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11'] },
    ]
  },
];

// ── VIEW COMPONENTS ─────────────────────────────────────────────────────────

// ── ENHANCED USERS VIEW ─────────────────────────────────────────────────────
const EnhancedUsersView = ({ users = [], onDelete, onToggle, onAdd }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [toast, setToast] = useState('');
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'Doctor', department: 'Cardiology' });

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 4000); };

  const filteredUsers = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                       u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    const matchStatus = statusFilter === 'all' || u.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  const getRoleColor = (role) => {
    const colors = { Administrator: '#7c3aed', Doctor: '#16a34a', Nurse: '#2563eb', Trainee: '#d97706', Viewer: '#64748b' };
    return colors[role] || '#64748b';
  };

  const getRoleBg = (role) => {
    const colors = { Administrator: '#f5f3ff', Doctor: '#f0fdf4', Nurse: '#eff6ff', Trainee: '#fffbeb', Viewer: '#f8fafc' };
    return colors[role] || '#f8fafc';
  };

  const deleteUser = async (id) => {
    await onDelete(id);
  };

  const toggleUserStatus = async (id) => {
    const current = users.find((user) => user.id === id);
    await onToggle(id, current?.status === 'Active' ? 'Inactive' : 'Active');
  };

  const addUser = async () => {
    if (!newUser.name || !newUser.email) {
      showToast('Name and email are required');
      return;
    }
    await onAdd(newUser);
    setNewUser({ name: '', email: '', role: 'Doctor', department: 'Cardiology' });
    setShowAddModal(false);
  };

  const inputSt = {
    padding: '8px 12px', border: '1.5px solid #d1d5db', borderRadius: '8px',
    fontSize: '13px', color: '#374151', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
  };

  return (
    <div>
      {toast && (
        <div style={{ position: 'fixed', top: '80px', right: '24px', zIndex: 999, padding: '12px 20px', borderRadius: '10px', backgroundColor: '#1e293b', color: '#fff', fontSize: '13px', fontWeight: '600', boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
          ✅ {toast}
        </div>
      )}

      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '14px', padding: '28px', width: '420px', boxShadow: '0 16px 48px rgba(0,0,0,0.18)' }}>
            <h3 style={{ margin: '0 0 20px', fontSize: '17px', fontWeight: '700', color: '#1e293b' }}>Add New User</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: '#374151', marginBottom: '5px' }}>Full Name</label>
                <input value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} placeholder="Full Name" style={{ ...inputSt, width: '100%' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: '#374151', marginBottom: '5px' }}>Email</label>
                <input value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} placeholder="email@anesguard.com" style={{ ...inputSt, width: '100%' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: '#374151', marginBottom: '5px' }}>Role</label>
                <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})} style={{ ...inputSt, width: '100%', appearance: 'auto' }}>
                  {['Administrator','Doctor','Nurse','Trainee','Viewer'].map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: '#374151', marginBottom: '5px' }}>Department</label>
                <select value={newUser.department} onChange={e => setNewUser({...newUser, department: e.target.value})} style={{ ...inputSt, width: '100%', appearance: 'auto' }}>
                  <option value="">Select Department</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Neurology">Neurology</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="Surgery">Surgery</option>
                  <option value="Radiology">Radiology</option>
                  <option value="Emergency Medicine">Emergency Medicine</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowAddModal(false)} style={{ padding: '9px 20px', borderRadius: '8px', border: '1.5px solid #d1d5db', background: '#fff', fontSize: '13.5px', fontWeight: '600', color: '#374151', cursor: 'pointer' }}>Cancel</button>
              <button onClick={addUser} style={{ padding: '9px 20px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', color: '#fff', fontSize: '13.5px', fontWeight: '600', cursor: 'pointer' }}>Add User</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#1e293b' }}>User Management</h2>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>Manage all system users and their roles</p>
        </div>
        <button onClick={() => setShowAddModal(true)}
          style={{ padding: '9px 20px', borderRadius: '9px', border: 'none', background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', color: '#fff', fontSize: '13px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 3px 10px rgba(37,99,235,0.3)' }}>
          + Add New User
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px', marginBottom: '20px' }}>
        {[
          { label: 'Total Users', value: users.length, icon: '👥', color: '#2563eb' },
          { label: 'Active Users', value: users.filter(u => u.status === 'Active').length, icon: '✅', color: '#16a34a' },
          { label: 'Inactive Users', value: users.filter(u => u.status === 'Inactive').length, icon: '⏸️', color: '#d97706' },
          { label: 'Total Roles', value: '6', icon: '🛡️', color: '#7c3aed' },
        ].map(stat => (
          <div key={stat.label} style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '14px 18px', border: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: `${stat.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>{stat.icon}</div>
              <div>
                <p style={{ margin: 0, fontSize: '22px', fontWeight: '800', color: '#1e293b' }}>{stat.value}</p>
                <p style={{ margin: 0, fontSize: '11px', color: '#64748b' }}>{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '14px 18px', marginBottom: '20px', border: '1px solid #e5e7eb', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
        <input placeholder="Search users..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
          style={{ flex: 1, padding: '8px 12px', border: '1.5px solid #d1d5db', borderRadius: '8px', fontSize: '13px', outline: 'none', minWidth: '200px' }} />
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
          style={{ padding: '8px 12px', border: '1.5px solid #d1d5db', borderRadius: '8px', fontSize: '13px', backgroundColor: '#fff' }}>
          <option value="all">All Roles</option>
          <option value="Administrator">Administrator</option>
          <option value="Doctor">Doctor</option>
          <option value="Nurse">Nurse</option>
          <option value="Trainee">Trainee</option>
          <option value="Viewer">Viewer</option>
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          style={{ padding: '8px 12px', border: '1.5px solid #d1d5db', borderRadius: '8px', fontSize: '13px', backgroundColor: '#fff' }}>
          <option value="all">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc' }}>
                {['Name', 'Email', 'Role', 'Department', 'Status', 'Last Login', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', borderBottom: '1px solid #e5e7eb' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                  <td style={{ padding: '10px 16px', fontWeight: '600', color: '#1e293b' }}>{user.name}</td>
                  <td style={{ padding: '10px 16px', fontSize: '13px', color: '#64748b' }}>{user.email}</td>
                  <td style={{ padding: '10px 16px' }}>
                    <span style={{ padding: '3px 10px', borderRadius: '20px', backgroundColor: getRoleBg(user.role), color: getRoleColor(user.role), fontSize: '11px', fontWeight: '700' }}>{user.role}</span>
                  </td>
                  <td style={{ padding: '10px 16px', fontSize: '13px', color: '#64748b' }}>{user.department}</td>
                  <td style={{ padding: '10px 16px' }}>
                    <span style={{ padding: '3px 10px', borderRadius: '20px', backgroundColor: user.status === 'Active' ? '#f0fdf4' : '#fef2f2', color: user.status === 'Active' ? '#16a34a' : '#dc2626', fontSize: '11px', fontWeight: '700' }}>{user.status}</span>
                  </td>
                  <td style={{ padding: '10px 16px', fontSize: '12px', color: '#94a3b8' }}>{user.lastLogin}</td>
                  <td style={{ padding: '10px 16px' }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => toggleUserStatus(user.id)}
                        style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #d1d5db', backgroundColor: '#fff', fontSize: '11px', cursor: 'pointer' }}>
                        {user.status === 'Active' ? '⏸️' : '▶️'}
                      </button>
                      <button onClick={() => deleteUser(user.id)}
                        style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #ef4444', backgroundColor: '#fef2f2', color: '#dc2626', fontSize: '11px', cursor: 'pointer' }}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ padding: '10px 16px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: '#64748b' }}>Showing {filteredUsers.length} of {users.length} users</span>
        </div>
      </div>
    </div>
  );
};

// Dashboard View
const DashboardContent = ({ 
  users, setUsers, showAddModal, setShowAddModal,
  newUser, setNewUser, addUser, filteredUsers,
  searchQuery, setSearchQuery, roleFilter, setRoleFilter,
  statusFilter, setStatusFilter, deleteUser, toggleUser,
  toast, inputSt, statCards, recentActivity, loadingOverview, loadingActivity, onViewActivity
}) => (
  <>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '14px', marginBottom: '22px' }}>
      {loadingOverview ? (
        <div style={{ gridColumn: '1 / -1', padding: '30px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>Loading system stats...</div>
      ) : statCards.map(card => (
        <div key={card.label} style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '16px 18px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>
              {card.icon}
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: '#1e293b', lineHeight: 1 }}>{card.value}</p>
              <p style={{ margin: '2px 0 0', fontSize: '11.5px', color: '#64748b', fontWeight: '500' }}>{card.label}</p>
            </div>
          </div>
          <button style={{ background: 'none', border: 'none', padding: 0, fontSize: '12px', color: card.color, fontWeight: '600', cursor: 'pointer', textDecoration: 'none' }}
            onMouseOver={e => e.currentTarget.style.textDecoration = 'underline'}
            onMouseOut={e => e.currentTarget.style.textDecoration = 'none'}>
            {card.link}
          </button>
        </div>
      ))}
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '18px', marginBottom: '22px' }}>
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ margin: '0 0 2px', fontSize: '15px', fontWeight: '700', color: '#1e293b' }}>User Management</h2>
            <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Add, update, delete and manage system users.</p>
          </div>
          <button onClick={() => setShowAddModal(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 18px', borderRadius: '9px', border: 'none', background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', color: '#fff', fontSize: '13px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 3px 8px rgba(37,99,235,0.3)', whiteSpace: 'nowrap' }}>
            + Add New User
          </button>
        </div>

        <div style={{ padding: '12px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
              <Icon d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" size={14} color="#94a3b8" />
            </span>
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search users..."
              style={{ ...inputSt, width: '100%', paddingLeft: '32px' }} />
          </div>
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
            style={{ ...inputSt, appearance: 'auto', minWidth: '120px' }}>
            <option>All Roles</option>
            {['Administrator','Doctor','Nurse','Trainee','Viewer'].map(r=><option key={r}>{r}</option>)}
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            style={{ ...inputSt, appearance: 'auto', minWidth: '110px' }}>
            <option>Status</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
          <button style={{ display: 'flex', alignItems: 'center', gap: '5px', ...inputSt, cursor: 'pointer', whiteSpace: 'nowrap', backgroundColor: '#fff' }}>
            <Icon d="M3 6h18M6 12h12M9 18h6" size={13} color="#64748b" /> Filter
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc' }}>
                {['ID','Name','Email','Role','Status','Last Login','Actions'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11.5px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.4px', borderBottom: '1px solid #e5e7eb', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u, i) => (
                <tr key={u.id} style={{ borderBottom: i < filteredUsers.length - 1 ? '1px solid #f8fafc' : 'none', transition: 'background 0.1s' }}
                  onMouseOver={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
                  onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: '#64748b', fontWeight: '600' }}>{u.id}</td>
                  <td style={{ padding: '12px 16px', fontSize: '13.5px', fontWeight: '600', color: '#1e293b', whiteSpace: 'nowrap' }}>{u.name}</td>
                  <td style={{ padding: '12px 16px', fontSize: '12.5px', color: '#64748b' }}>{u.email}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ padding: '3px 10px', borderRadius: '20px', backgroundColor: u.roleBg, color: u.roleColor, fontSize: '11.5px', fontWeight: '700' }}>{u.role}</span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ padding: '3px 10px', borderRadius: '20px', backgroundColor: u.status === 'Active' ? '#f0fdf4' : '#fef2f2', color: u.status === 'Active' ? '#16a34a' : '#dc2626', fontSize: '11.5px', fontWeight: '700' }}>{u.status}</span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '12px', color: '#94a3b8', whiteSpace: 'nowrap' }}>{u.lastLogin}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <button title="Edit" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '3px', color: '#2563eb' }}>
                        <Icon d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" size={15} color="#2563eb" />
                      </button>
                      <button title="Toggle Status" onClick={() => toggleUser(u.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '3px' }}>
                        <Icon d="M18.36 6.64a9 9 0 010 12.73M6.64 6.64a9 9 0 000 12.73M12 8v4l3 3" size={15} color="#d97706" />
                      </button>
                      <button title="Delete" onClick={() => deleteUser(u.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '3px' }}>
                        <Icon d="M3 6h18M8 6V4h8v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" size={15} color="#dc2626" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ padding: '12px 20px', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '12.5px', color: '#64748b' }}>Showing 1 to {filteredUsers.length} of 128 users</span>
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            {['«', '1', '2', '3', '...', '26', '»'].map((p, i) => (
              <button key={i} style={{ width: '30px', height: '30px', borderRadius: '7px', border: `1px solid ${p === '1' ? '#2563eb' : '#e5e7eb'}`, backgroundColor: p === '1' ? '#2563eb' : '#fff', color: p === '1' ? '#fff' : '#374151', fontSize: '12.5px', fontWeight: p === '1' ? '700' : '400', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ margin: 0, fontSize: '13.5px', fontWeight: '700', color: '#1e293b' }}>System Activity <span style={{ color: '#16a34a', fontSize: '11px', fontWeight: '600' }}>(Live)</span></p>
            <button onClick={onViewActivity} style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>View All</button>
          </div>
          <div style={{ padding: '6px 0' }}>
            {loadingActivity ? (
              <p style={{ padding: '12px 16px', fontSize: '12px', color: '#94a3b8' }}>Loading recent activity...</p>
            ) : recentActivity.length === 0 ? (
              <p style={{ padding: '12px 16px', fontSize: '12px', color: '#94a3b8' }}>No activity yet.</p>
            ) : (
              recentActivity.slice(0, 6).map((a, i) => (
                <div key={a._id || i} style={{ padding: '9px 16px', borderBottom: i < Math.min(recentActivity.length, 6) - 1 ? '1px solid #f8fafc' : 'none', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '14px', marginTop: '1px', flexShrink: 0 }}>
                    {a.riskLevel === 'High' ? '🔴' : a.riskLevel === 'Moderate' ? '🟡' : '🟢'}
                  </span>
                  <div>
                    <p style={{ margin: 0, fontSize: '12px', color: '#1e293b', fontWeight: '500', lineHeight: '1.4' }}>
                      {a.status === 'Completed' ? 'Completed assessment' : 'New assessment'} for {a.patientName} ({a.riskLevel} risk)
                    </p>
                    <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#94a3b8' }}>
                      {new Date(a.updatedAt).toLocaleString('en-US', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #f1f5f9' }}>
            <p style={{ margin: 0, fontSize: '13.5px', fontWeight: '700', color: '#1e293b' }}>Quick Settings</p>
          </div>
          <div style={{ padding: '6px 0' }}>
            {QUICK_SETTINGS.map((s, i) => (
              <button key={i} style={{ width: '100%', padding: '10px 16px', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', textAlign: 'left', borderBottom: i < QUICK_SETTINGS.length - 1 ? '1px solid #f8fafc' : 'none', transition: 'background 0.1s' }}
                onMouseOver={e => e.currentTarget.style.background = '#f8fafc'}
                onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                <span style={{ fontSize: '16px', flexShrink: 0 }}>{s.icon}</span>
                <div>
                  <p style={{ margin: 0, fontSize: '12.5px', fontWeight: '600', color: '#1e293b' }}>{s.label}</p>
                  <p style={{ margin: '1px 0 0', fontSize: '11px', color: '#94a3b8' }}>{s.sub}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 1fr', gap: '18px' }}>
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <p style={{ margin: '0 0 14px', fontSize: '13.5px', fontWeight: '700', color: '#1e293b' }}>User Role Overview</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <DonutChart users={users} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
            {[
              { label: 'Super Admin', color: '#7c3aed' },
              { label: 'Administrator', color: '#2563eb' },
              { label: 'Doctor', color: '#16a34a' },
              { label: 'Nurse', color: '#93c5fd' },
              { label: 'Trainee', color: '#f59e0b' },
              { label: 'Viewer', color: '#64748b' },
            ].map(r => {
              const count = users.filter((user) => user.role === r.label).length;
              const pct = users.length ? `${Math.round((count / users.length) * 100)}%` : '0%';
              return (
              <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: r.color, flexShrink: 0 }} />
                <span style={{ fontSize: '11.5px', color: '#374151' }}>{r.label}</span>
                <span style={{ fontSize: '11.5px', color: '#94a3b8', marginLeft: 'auto' }}>{count} ({pct})</span>
              </div>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <p style={{ margin: 0, fontSize: '13.5px', fontWeight: '700', color: '#1e293b' }}>System Activity Overview</p>
          <select style={{ ...inputSt, fontSize: '11.5px', padding: '4px 8px', appearance: 'auto' }}>
            <option>This Week</option>
            <option>Last Week</option>
            <option>This Month</option>
          </select>
        </div>
        <LineChart activity={recentActivity} />
      </div>

      <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <p style={{ margin: '0 0 14px', fontSize: '13.5px', fontWeight: '700', color: '#1e293b' }}>Recent Reports</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {(recentActivity.length ? recentActivity.slice(0, 4) : []).map((item, i, list) => (
            <div key={item._id || i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: i < list.length - 1 ? '14px' : 0, borderBottom: i < list.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
              <div>
                <p style={{ margin: '0 0 2px', fontSize: '13px', fontWeight: '600', color: '#1e293b' }}>{item.patientName} ({item.riskLevel})</p>
                <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8' }}>{item.createdAt ? new Date(item.createdAt).toLocaleString() : '—'}</p>
              </div>
            </div>
          ))}
          {recentActivity.length === 0 && <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>No assessments yet.</p>}
        </div>
      </div>
    </div>
  </>
);

// Roles & Permissions View
const BUILTIN_ROLES = [
  { id: 'Super Admin', name: 'Super Admin', permissions: 'Users, settings, all activity', status: 'Active' },
  { id: 'Administrator', name: 'Administrator', permissions: 'Users, settings, all activity', status: 'Active' },
  { id: 'Doctor', name: 'Doctor', permissions: 'Own assessments', status: 'Active' },
  { id: 'Nurse', name: 'Nurse', permissions: 'Own assessments', status: 'Active' },
  { id: 'Trainee', name: 'Trainee', permissions: 'Own assessments', status: 'Active' },
  { id: 'Viewer', name: 'Viewer', permissions: 'Own assessments', status: 'Active' },
];

const RolesPermissionsView = ({ users = [] }) => {
  const roles = BUILTIN_ROLES.map((role) => ({
    ...role,
    users: users.filter((user) => user.role === role.name).length,
    created: 'Built-in',
  }));
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#1e293b' }}>Roles & Permissions</h2>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>Built-in roles. Counts come from the user list.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px', marginBottom: '20px' }}>
        {[
          { label: 'Total Roles', value: roles.length, icon: '👥', color: '#2563eb' },
          { label: 'Active Roles', value: roles.filter((role) => role.status === 'Active').length, icon: '✅', color: '#16a34a' },
          { label: 'Admin Roles', value: 2, icon: '🔑', color: '#7c3aed' },
          { label: 'Assigned Users', value: users.length, icon: '👤', color: '#d97706' },
        ].map(stat => (
          <div key={stat.label} style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '14px 18px', border: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: `${stat.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>{stat.icon}</div>
              <div>
                <p style={{ margin: 0, fontSize: '22px', fontWeight: '800', color: '#1e293b' }}>{stat.value}</p>
                <p style={{ margin: 0, fontSize: '11px', color: '#64748b' }}>{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid #f1f5f9' }}>
          <input placeholder="Search roles..." style={{ padding: '8px 14px', border: '1.5px solid #d1d5db', borderRadius: '8px', fontSize: '13px', width: '280px', outline: 'none' }} />
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc' }}>
              {['Role Name', 'Users', 'Permissions', 'Status', 'Created Date', 'Type'].map(h => (
                <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', borderBottom: '1px solid #e5e7eb' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {roles.map(role => (
              <tr key={role.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                <td style={{ padding: '10px 16px', fontWeight: '600', color: '#1e293b' }}>{role.name}</td>
                <td style={{ padding: '10px 16px', color: '#64748b' }}>{role.users}</td>
                <td style={{ padding: '10px 16px' }}>
                  <span style={{ padding: '2px 10px', borderRadius: '12px', backgroundColor: '#eff6ff', color: '#2563eb', fontSize: '11px', fontWeight: '600' }}>{role.permissions}</span>
                </td>
                <td style={{ padding: '10px 16px' }}>
                  <span style={{ padding: '3px 12px', borderRadius: '20px', backgroundColor: role.status === 'Active' ? '#f0fdf4' : '#fef2f2', color: role.status === 'Active' ? '#16a34a' : '#dc2626', fontSize: '11px', fontWeight: '600' }}>{role.status}</span>
                </td>
                <td style={{ padding: '10px 16px', fontSize: '12px', color: '#64748b' }}>{role.created}</td>
                <td style={{ padding: '10px 16px', fontSize: '12px', color: '#64748b' }}>Fixed</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Access Control View
const AccessControlView = () => {
  const [rules] = useState(ACCESS_RULES);
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#1e293b' }}>Access Control</h2>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>These rules are enforced by the API. They are not editable here.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px', marginBottom: '20px' }}>
        {[
          { label: 'Total Rules', value: String(rules.length), icon: '📋', color: '#2563eb' },
          { label: 'Active Rules', value: String(rules.filter((rule) => rule.status === 'Active').length), icon: '✅', color: '#16a34a' },
          { label: 'Resources Protected', value: String(new Set(rules.map((rule) => rule.resource)).size), icon: '🛡️', color: '#7c3aed' },
          { label: 'Access Violations', value: '0', icon: '⚠️', color: '#dc2626' },
        ].map(stat => (
          <div key={stat.label} style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '14px 18px', border: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: `${stat.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>{stat.icon}</div>
              <div>
                <p style={{ margin: 0, fontSize: '22px', fontWeight: '800', color: '#1e293b' }}>{stat.value}</p>
                <p style={{ margin: 0, fontSize: '11px', color: '#64748b' }}>{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid #f1f5f9', display: 'flex', gap: '10px' }}>
          <input placeholder="Search resources or roles..." style={{ flex: 1, padding: '8px 14px', border: '1.5px solid #d1d5db', borderRadius: '8px', fontSize: '13px', outline: 'none' }} />
          <select style={{ padding: '8px 14px', border: '1.5px solid #d1d5db', borderRadius: '8px', fontSize: '13px', backgroundColor: '#fff' }}>
            <option>All Resources</option>
            <option>Patient Records</option>
            <option>Risk Assessment</option>
          </select>
          <select style={{ padding: '8px 14px', border: '1.5px solid #d1d5db', borderRadius: '8px', fontSize: '13px', backgroundColor: '#fff' }}>
            <option>All Roles</option>
            <option>Admin</option>
            <option>Doctor</option>
          </select>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc' }}>
              {['Resource', 'Role', 'Access Level', 'Status', 'Actions'].map(h => (
                <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', borderBottom: '1px solid #e5e7eb' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rules.map(rule => (
              <tr key={rule.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                <td style={{ padding: '10px 16px', fontWeight: '600', color: '#1e293b' }}>{rule.resource}</td>
                <td style={{ padding: '10px 16px' }}>
                  <span style={{ padding: '2px 10px', borderRadius: '12px', backgroundColor: '#eff6ff', color: '#2563eb', fontSize: '11px', fontWeight: '600' }}>{rule.role}</span>
                </td>
                <td style={{ padding: '10px 16px' }}>
                  <span style={{ padding: '2px 10px', borderRadius: '12px', backgroundColor: `${accessLevelColors[rule.access]}15`, color: accessLevelColors[rule.access], fontSize: '11px', fontWeight: '600' }}>{rule.access}</span>
                </td>
                <td style={{ padding: '10px 16px' }}>
                  <span style={{ padding: '3px 12px', borderRadius: '20px', backgroundColor: rule.status === 'Active' ? '#f0fdf4' : '#fef2f2', color: rule.status === 'Active' ? '#16a34a' : '#dc2626', fontSize: '11px', fontWeight: '600' }}>{rule.status}</span>
                </td>
                <td style={{ padding: '10px 16px' }}>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #d1d5db', backgroundColor: '#fff', fontSize: '11px', cursor: 'pointer' }}>✏️</button>
                    <button style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #ef4444', backgroundColor: '#fef2f2', color: '#dc2626', fontSize: '11px', cursor: 'pointer' }}>🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// System Settings View
const SystemSettingsView = () => {
  const [settings, setSettings] = useState(initialSettings);
  const [activeTab, setActiveTab] = useState('general');
  const [statusNote, setStatusNote] = useState('Loading saved settings...');
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getSettings();
        setSettings((current) => ({
          ...current,
          general: { ...current.general, ...data.settings.general },
          security: { ...current.security, ...data.settings.security },
          notifications: { ...current.notifications, ...data.settings.notifications },
        }));
        setStatusNote(data.settings.updatedAt
          ? `Last saved ${new Date(data.settings.updatedAt).toLocaleString()}`
          : 'No custom settings saved yet.');
      } catch (error) {
        setStatusNote('Could not load settings. You can still edit and save them.');
      }
    };
    load();
  }, []);

  const updateSection = (section, key, value) => {
    setSettings((current) => ({ ...current, [section]: { ...current[section], [key]: value } }));
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      const data = await saveSettings({
        general: settings.general,
        security: settings.security,
        notifications: settings.notifications,
      });
      setStatusNote(data.settings?.updatedAt
        ? `Last saved ${new Date(data.settings.updatedAt).toLocaleString()}`
        : 'Settings saved.');
    } catch (error) {
      setStatusNote(error.response?.data?.message || 'Could not save settings.');
    } finally {
      setSavingSettings(false);
    }
  };

  const tabs = [
    { id: 'general', label: '⚙️ General' },
    { id: 'security', label: '🔒 Security' },
    { id: 'notifications', label: '🔔 Notifications' },
    { id: 'integrations', label: '🔌 Integrations' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#1e293b' }}>System Settings</h2>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>These values are stored for this installation.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setSettings(initialSettings)} style={{ padding: '8px 18px', borderRadius: '8px', border: '1.5px solid #d1d5db', backgroundColor: '#fff', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>Reset form</button>
          <button onClick={handleSaveSettings} disabled={savingSettings} style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', color: '#fff', fontSize: '13px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 3px 10px rgba(37,99,235,0.3)' }}>{savingSettings ? 'Saving...' : 'Save Settings'}</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '4px', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '10px', marginBottom: '20px' }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', backgroundColor: activeTab === tab.id ? '#fff' : 'transparent', color: activeTab === tab.id ? '#1e293b' : '#64748b', fontWeight: activeTab === tab.id ? '600' : '500', fontSize: '13px', cursor: 'pointer', boxShadow: activeTab === tab.id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}>
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '24px' }}>
        {activeTab === 'general' && (
          <div>
            <h3 style={{ margin: '0 0 20px', fontSize: '15px', fontWeight: '600', color: '#1e293b' }}>General Settings</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {[
                { label: 'System Name', key: 'systemName' },
                { label: 'System Version', key: 'systemVersion' },
                { label: 'Time Zone', key: 'timezone' },
                { label: 'Date Format', key: 'dateFormat' },
                { label: 'Language', key: 'language' },
              ].map(field => (
                <div key={field.key}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>{field.label}</label>
                  <input type="text" value={settings.general[field.key] || ''} onChange={(e) => updateSection('general', field.key, e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #d1d5db', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div>
            <h3 style={{ margin: '0 0 20px', fontSize: '15px', fontWeight: '600', color: '#1e293b' }}>Security Settings</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>Session note (minutes)</label>
                <input type="number" value={settings.security.sessionTimeout || ''} onChange={(e) => updateSection('security', 'sessionTimeout', e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #d1d5db', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>Password policy label</label>
                <select value={settings.security.passwordPolicy || 'Strong'} onChange={(e) => updateSection('security', 'passwordPolicy', e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #d1d5db', fontSize: '13px' }}>
                  <option>Strong</option>
                  <option>Medium</option>
                </select>
                <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#64748b' }}>Accounts already require a password of at least 8 characters.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div>
            <h3 style={{ margin: '0 0 20px', fontSize: '15px', fontWeight: '600', color: '#1e293b' }}>Notification Settings</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { label: 'Email Alerts', key: 'emailAlerts' },
                { label: 'System Updates', key: 'systemUpdates' },
                { label: 'User Activity', key: 'userActivity' },
                { label: 'Report Generation', key: 'reportGeneration' },
              ].map(notification => (
                <label key={notification.key} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px', backgroundColor: '#f8fafc', borderRadius: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={!!settings.notifications[notification.key]} onChange={(e) => updateSection('notifications', notification.key, e.target.checked)} style={{ width: '18px', height: '18px' }} />
                  <span style={{ fontSize: '13px', color: '#374151' }}>{notification.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'integrations' && (
          <div>
            <h3 style={{ margin: '0 0 20px', fontSize: '15px', fontWeight: '600', color: '#1e293b' }}>Integrations</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { label: 'Sign-in', status: 'Email and password', color: '#16a34a' },
                { label: 'Database', status: 'MongoDB', color: '#16a34a' },
                { label: 'Email delivery', status: 'Not configured', color: '#d97706' },
              ].map(integration => (
                <div key={integration.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b' }}>{integration.label}</span>
                  <span style={{ padding: '3px 12px', borderRadius: '12px', backgroundColor: integration.color === '#16a34a' ? '#f0fdf4' : '#fffbeb', color: integration.color, fontSize: '12px', fontWeight: '600' }}>{integration.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ marginTop: '16px', padding: '12px 16px', backgroundColor: '#eff6ff', borderRadius: '10px', border: '1px solid #bfdbfe' }}>
        <p style={{ margin: 0, fontSize: '12px', color: '#1d4ed8' }}>{statusNote}</p>
      </div>
    </div>
  );
};

// Reports & Data View
const ReportsDataView = ({ activity = [], onNavigate }) => {
  const [reportType, setReportType] = useState('all');
  const reports = activity.map((item) => ({
    id: item._id,
    title: `${item.patientName || 'Patient'} assessment`,
    type: item.riskLevel || 'Risk',
    date: item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '—',
    status: item.status === 'Completed' ? 'Generated' : 'Processing',
  })).filter((report) => reportType === 'all' || report.type === reportType || (reportType === 'risk' && ['Low', 'Moderate', 'High'].includes(report.type)));

  const today = new Date().toLocaleDateString();
  const reportStats = [
    { label: 'Total Reports', value: activity.length, icon: '📄', color: '#2563eb' },
    { label: 'Completed', value: activity.filter((item) => item.status === 'Completed').length, icon: '✅', color: '#16a34a' },
    { label: 'Pending', value: activity.filter((item) => item.status !== 'Completed').length, icon: '⏳', color: '#d97706' },
    { label: 'Created today', value: activity.filter((item) => item.createdAt && new Date(item.createdAt).toLocaleDateString() === today).length, icon: '📅', color: '#7c3aed' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#1e293b' }}>Reports & Data</h2>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>Saved assessments across the system</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px', marginBottom: '20px' }}>
        {reportStats.map(stat => (
          <div key={stat.label} style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '14px 18px', border: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: `${stat.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>{stat.icon}</div>
              <div>
                <p style={{ margin: 0, fontSize: '22px', fontWeight: '800', color: '#1e293b' }}>{stat.value}</p>
                <p style={{ margin: 0, fontSize: '11px', color: '#64748b' }}>{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '16px 20px', marginBottom: '20px', display: 'flex', gap: '12px', alignItems: 'center' }}>
        <select value={reportType} onChange={e => setReportType(e.target.value)} style={{ padding: '8px 14px', border: '1.5px solid #d1d5db', borderRadius: '8px', fontSize: '13px' }}>
          <option value="all">All risk levels</option>
          <option value="Low">Low</option>
          <option value="Moderate">Moderate</option>
          <option value="High">High</option>
        </select>
      </div>

      <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc' }}>
              {['Patient', 'Risk', 'Date', 'Status', 'Open'].map(h => (
                <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', borderBottom: '1px solid #e5e7eb' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {reports.length === 0 ? (
              <tr><td colSpan="5" style={{ padding: '28px', textAlign: 'center', color: '#64748b' }}>No assessments yet.</td></tr>
            ) : reports.map(report => (
              <tr key={report.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                <td style={{ padding: '10px 16px', fontWeight: '600', color: '#1e293b' }}>{report.title}</td>
                <td style={{ padding: '10px 16px' }}>
                  <span style={{ padding: '2px 10px', borderRadius: '12px', backgroundColor: '#eff6ff', color: '#2563eb', fontSize: '11px', fontWeight: '600' }}>{report.type}</span>
                </td>
                <td style={{ padding: '10px 16px', fontSize: '12px', color: '#64748b' }}>{report.date}</td>
                <td style={{ padding: '10px 16px' }}>
                  <span style={{ padding: '3px 12px', borderRadius: '20px', backgroundColor: report.status === 'Generated' ? '#f0fdf4' : '#fffbeb', color: report.status === 'Generated' ? '#16a34a' : '#d97706', fontSize: '11px', fontWeight: '600' }}>{report.status}</span>
                </td>
                <td style={{ padding: '10px 16px' }}>
                  <button onClick={() => onNavigate && onNavigate('patientDetails', { id: report.id })} style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #d1d5db', backgroundColor: '#fff', fontSize: '11px', cursor: 'pointer' }}>View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Activity Logs View
const ActivityLogsView = ({ activity = [] }) => {
  const logs = activity.map((item) => ({
    id: item._id,
    user: item.createdBy?.fullName || 'User',
    action: item.status === 'Completed' ? 'Completed assessment' : 'Created assessment',
    resource: item.patientName || 'Assessment',
    timestamp: new Date(item.updatedAt || item.createdAt).toLocaleString(),
    status: 'Success',
  }));

  const logStats = [
    { label: 'Recent events', value: logs.length, icon: '📊', color: '#2563eb' },
    { label: 'Completed', value: activity.filter((item) => item.status === 'Completed').length, icon: '✅', color: '#16a34a' },
    { label: 'Pending', value: activity.filter((item) => item.status !== 'Completed').length, icon: '⏳', color: '#d97706' },
    { label: 'People', value: new Set(logs.map((log) => log.user)).size, icon: '👤', color: '#7c3aed' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#1e293b' }}>Activity Logs</h2>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>Recent assessments saved in the system</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px', marginBottom: '20px' }}>
        {logStats.map(stat => (
          <div key={stat.label} style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '14px 18px', border: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: `${stat.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>{stat.icon}</div>
              <div>
                <p style={{ margin: 0, fontSize: '22px', fontWeight: '800', color: '#1e293b' }}>{stat.value}</p>
                <p style={{ margin: 0, fontSize: '11px', color: '#64748b' }}>{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc' }}>
              {['User', 'Action', 'Patient', 'Timestamp', 'Status'].map(h => (
                <th key={h} style={{ padding: '8px 14px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', borderBottom: '1px solid #e5e7eb' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr><td colSpan="5" style={{ padding: '28px', textAlign: 'center', color: '#64748b' }}>No activity yet.</td></tr>
            ) : logs.map(log => (
              <tr key={log.id} style={{ borderBottom: '1px solid #f8fafc', transition: 'background 0.1s' }}
                onMouseOver={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
                onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                <td style={{ padding: '8px 14px', fontWeight: '600', color: '#1e293b', fontSize: '13px' }}>{log.user}</td>
                <td style={{ padding: '8px 14px', fontSize: '13px', color: '#374151' }}>{log.action}</td>
                <td style={{ padding: '8px 14px', fontSize: '13px', color: '#64748b' }}>{log.resource}</td>
                <td style={{ padding: '8px 14px', fontSize: '12px', color: '#64748b' }}>{log.timestamp}</td>
                <td style={{ padding: '8px 14px' }}>
                  <span style={{ padding: '2px 10px', borderRadius: '12px', backgroundColor: '#f0fdf4', color: '#16a34a', fontSize: '11px', fontWeight: '600' }}>{log.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ── MAIN COMPONENT ─────────────────────────────────────────────────────────────
// Turns a real backend role ("student"/"doctor"/"admin") into the display
// label + colors the table already expects.
const ROLE_DISPLAY = {
  'Super Admin': { label: 'Super Admin', color: '#7c3aed', bg: '#f5f3ff' },
  Administrator: { label: 'Administrator', color: '#6d28d9', bg: '#f5f3ff' },
  Doctor: { label: 'Doctor', color: '#16a34a', bg: '#f0fdf4' },
  Nurse: { label: 'Nurse', color: '#2563eb', bg: '#eff6ff' },
  Trainee: { label: 'Trainee', color: '#d97706', bg: '#fffbeb' },
  Viewer: { label: 'Viewer', color: '#64748b', bg: '#f8fafc' },
};

const mapRealUser = (u) => {
  const display = ROLE_DISPLAY[u.role] || { label: u.role || 'Viewer', color: '#64748b', bg: '#f8fafc' };
  const lastSeen = u.lastLogin || u.lastLoginAt;
  return {
    id: u._id || u.id,
    name: u.fullName || u.displayName || u.email,
    email: u.email,
    role: display.label,
    department: u.department || '—',
    roleColor: display.color,
    roleBg: display.bg,
    status: u.status || 'Active',
    lastLogin: lastSeen
      ? new Date(lastSeen).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
      : '—',
  };
};

const AdminPanel = ({ onNavigate }) => {
  const [activeNav, setActiveNav] = useState('Dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All Roles');
  const [statusFilter, setStatusFilter] = useState('Status');
  const [users, setUsers] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'Doctor' });
  const [toast, setToast] = useState('');

  // New: real system-wide stats, real recent activity, and the real user list.
  const [statCards, setStatCards] = useState([]);
  const [loadingOverview, setLoadingOverview] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loadingActivity, setLoadingActivity] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  useEffect(() => {
    const loadOverview = async () => {
      try {
        const data = await getSystemOverview();
        setStatCards([
          { icon: '👥', value: data.users.total, label: 'Total Users', link: 'View users below →', color: '#2563eb', bg: '#eff6ff' },
          { icon: '📄', value: data.assessments.total, label: 'Total Assessments', link: '', color: '#7c3aed', bg: '#f5f3ff' },
          { icon: '🟢', value: data.assessments.low, label: 'Low Risk Assessments', link: '', color: '#16a34a', bg: '#f0fdf4' },
          { icon: '🟡', value: data.assessments.moderate, label: 'Moderate Risk Assessments', link: '', color: '#d97706', bg: '#fffbeb' },
          { icon: '🔴', value: data.assessments.high, label: 'High Risk Assessments', link: '', color: '#dc2626', bg: '#fef2f2' },
        ]);
      } catch (err) {
        console.error('Failed to load admin overview:', err);
        if (err.response?.status === 403) setAccessDenied(true);
      } finally {
        setLoadingOverview(false);
      }
    };

    const loadActivity = async () => {
      try {
        const data = await getRecentActivity(50);
        setRecentActivity(data);
      } catch (err) {
        console.error('Failed to load recent activity:', err);
      } finally {
        setLoadingActivity(false);
      }
    };

    const loadUsers = async () => {
      try {
        const data = await getAllUsers();
        setUsers(data.map(mapRealUser));
      } catch (err) {
        console.error('Failed to load users:', err);
        if (err.response?.status === 403) setAccessDenied(true);
      } finally {
        setLoadingUsers(false);
      }
    };

    loadOverview();
    loadActivity();
    loadUsers();
  }, []);

  const filteredUsers = users.filter(u => {
    const matchSearch = !searchQuery || u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchRole   = roleFilter === 'All Roles' || u.role === roleFilter;
    const matchStatus = statusFilter === 'Status' || u.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  // Honest placeholders: deleting/toggling/creating real Firebase-backed
  // users needs more backend work (Firebase Admin user deletion, etc.) that
  // isn't built yet. Rather than silently pretending it worked on fake local
  // data, these tell you clearly that the action isn't wired up yet.
  const deleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await deleteUserRequest(id);
      setUsers((current) => current.filter((user) => user.id !== id));
      showToast('User deleted');
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not delete user');
    }
  };

  const toggleUser = async (id, nextStatus) => {
    const current = users.find((user) => user.id === id);
    const status = nextStatus || (current?.status === 'Active' ? 'Inactive' : 'Active');
    try {
      const result = await updateUserStatus(id, status);
      setUsers((list) => list.map((user) => user.id === id ? mapRealUser(result.user) : user));
      showToast(`User is now ${status}`);
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not update status');
    }
  };

  const addUser = async (draft) => {
    const payload = draft && draft.name ? draft : newUser;
    if (!payload.name || !payload.email) {
      showToast('Name and email are required');
      return;
    }
    try {
      const created = await createUserRequest({
        fullName: payload.name,
        email: payload.email,
        role: payload.role,
        department: payload.department || 'Cardiology',
      });
      setUsers((current) => [mapRealUser(created.user), ...current]);
      setShowAddModal(false);
      setNewUser({ name: '', email: '', role: 'Doctor' });
      showToast(`User created. Temporary password: ${created.temporaryPassword}`);
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not create user');
    }
  };

  const inputSt = {
    padding: '8px 12px', border: '1.5px solid #d1d5db', borderRadius: '8px',
    fontSize: '13px', color: '#374151', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
  };

  if (accessDenied) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', flexDirection: 'column', gap: '12px' }}>
        <p style={{ fontSize: '16px', fontWeight: '700', color: '#dc2626' }}>Admin access required</p>
        <p style={{ fontSize: '13px', color: '#64748b' }}>Your account isn't set up as an admin yet.</p>
        <button onClick={() => onNavigate && onNavigate('dashboard')}
          style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: '#2563eb', color: '#fff', cursor: 'pointer' }}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  const renderContent = () => {
    switch(activeNav) {
      case 'Users':
        return <EnhancedUsersView users={users} onDelete={deleteUser} onToggle={toggleUser} onAdd={addUser} />;
      case 'Roles & Permissions':
        return <RolesPermissionsView users={users} />;
      case 'Access Control':
        return <AccessControlView />;
      case 'System Settings':
        return <SystemSettingsView />;
      case 'Reports & Data':
        return <ReportsDataView activity={recentActivity} onNavigate={onNavigate} />;
      case 'Activity Logs':
        return <ActivityLogsView activity={recentActivity} />;
      default:
        return (
          <DashboardContent 
            users={users} setUsers={setUsers}
            showAddModal={showAddModal} setShowAddModal={setShowAddModal}
            newUser={newUser} setNewUser={setNewUser} addUser={addUser}
            filteredUsers={filteredUsers}
            searchQuery={searchQuery} setSearchQuery={setSearchQuery}
            roleFilter={roleFilter} setRoleFilter={setRoleFilter}
            statusFilter={statusFilter} setStatusFilter={setStatusFilter}
            deleteUser={deleteUser} toggleUser={toggleUser}
            toast={toast} inputSt={inputSt}
            statCards={statCards} recentActivity={recentActivity}
            loadingOverview={loadingOverview} loadingActivity={loadingActivity}
            onViewActivity={() => setActiveNav('Activity Logs')}
          />
        );
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: "'Segoe UI', sans-serif", backgroundColor: '#f8fafc' }}>
      <aside style={{ width: '215px', flexShrink: 0, background: 'linear-gradient(180deg,#1e3a8a 0%,#1a2f6b 100%)', display: 'flex', flexDirection: 'column', boxShadow: '2px 0 12px rgba(0,0,0,0.15)' }}>
        <div style={{ padding: '20px 18px', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldLogo />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#fff', letterSpacing: '0.3px' }}>AnesGuard</p>
            <p style={{ margin: 0, fontSize: '10.5px', color: 'rgba(255,255,255,0.55)' }}>Admin Panel</p>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '12px 0', overflowY: 'auto' }}>
          {LEFT_NAV.map((group, gi) => (
            <div key={gi}>
              {group.section && (
                <p style={{ margin: '14px 18px 6px', fontSize: '9.5px', fontWeight: '700', color: 'rgba(255,255,255,0.38)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                  {group.section}
                </p>
              )}
              {group.items.map(item => {
                const isActive = activeNav === item.label;
                return (
                  <button key={item.label} onClick={() => setActiveNav(item.label)}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '10px 18px', border: 'none', cursor: 'pointer',
                      background: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
                      borderLeft: isActive ? '3px solid #60a5fa' : '3px solid transparent',
                      color: isActive ? '#fff' : 'rgba(255,255,255,0.65)',
                      fontSize: '13px', fontWeight: isActive ? '600' : '400',
                      textAlign: 'left', transition: 'all 0.15s'
                    }}
                    onMouseOver={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; }}
                    onMouseOut={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}>
                    <Icon d={item.icon} size={15} color={isActive ? '#93c5fd' : 'rgba(255,255,255,0.65)'} />
                    {item.label}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        <div style={{ padding: '14px 18px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: '14px', fontWeight: '700', color: '#fff' }}>A</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Admin User</p>
              <p style={{ margin: 0, fontSize: '11px', color: '#22c55e', fontWeight: '600' }}>Super Administrator</p>
            </div>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>▾</span>
          </div>
          <button
            onClick={() => onNavigate && onNavigate('login')}
            style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1.5px solid rgba(220,38,38,0.6)', background: 'rgba(220,38,38,0.08)', color: '#fca5a5', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            onMouseOver={e => { e.currentTarget.style.background = 'rgba(220,38,38,0.18)'; }}
            onMouseOut={e => { e.currentTarget.style.background = 'rgba(220,38,38,0.08)'; }}>
            <Icon d={['M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4','M16 17l5-5-5-5','M21 12H9']} size={14} color="#fca5a5" />
            Log Out
          </button>
        </div>
      </aside>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header style={{ backgroundColor: '#fff', padding: '0 24px', height: '62px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e5e7eb', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px' }}>
              <Icon d="M3 12h18M3 6h18M3 18h18" size={20} color="#475569" />
            </button>
            <div>
              <h1 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#1e293b' }}>
                {activeNav === 'Dashboard' ? 'Admin Dashboard' : activeNav}
              </h1>
              <p style={{ margin: 0, fontSize: '11.5px', color: '#64748b' }}>
                {activeNav === 'Dashboard' 
                  ? 'Manage users, system settings, permissions, reports and monitor system activity.'
                  : `Manage ${activeNav.toLowerCase()}`
                }
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '20px', border: '1px solid #bbf7d0', backgroundColor: '#f0fdf4' }}>
              <Icon d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" size={14} color="#16a34a" fill="#f0fdf4" />
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#16a34a' }}>Secure Session</span>
            </div>
            <div style={{ position: 'relative' }}>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px' }}>
                <Icon d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" size={20} color="#475569" />
              </button>
              <span style={{ position: 'absolute', top: '2px', right: '2px', width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#ef4444', color: '#fff', fontSize: '9px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>3</span>
            </div>
          </div>
        </header>

        <div style={{ flex: 1, overflowY: 'auto', padding: '22px 24px', backgroundColor: '#f8fafc', position: 'relative' }}>
          {toast && (
            <div style={{ position: 'fixed', top: '80px', right: '24px', zIndex: 999, padding: '12px 20px', borderRadius: '10px', backgroundColor: '#1e293b', color: '#fff', fontSize: '13px', fontWeight: '600', boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
              ✅ {toast}
            </div>
          )}

          {showAddModal && (
            <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
              <div style={{ backgroundColor: '#fff', borderRadius: '14px', padding: '28px', width: '420px', boxShadow: '0 16px 48px rgba(0,0,0,0.18)' }}>
                <h3 style={{ margin: '0 0 20px', fontSize: '17px', fontWeight: '700', color: '#1e293b' }}>Add New User</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: '#374151', marginBottom: '5px' }}>Full Name</label>
                    <input value={newUser.name} onChange={e => setNewUser(p=>({...p,name:e.target.value}))} placeholder="Dr. Full Name" style={{ ...inputSt, width: '100%' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: '#374151', marginBottom: '5px' }}>Email</label>
                    <input value={newUser.email} onChange={e => setNewUser(p=>({...p,email:e.target.value}))} placeholder="email@anesguard.com" style={{ ...inputSt, width: '100%' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: '#374151', marginBottom: '5px' }}>Role</label>
                    <select value={newUser.role} onChange={e => setNewUser(p=>({...p,role:e.target.value}))} style={{ ...inputSt, width: '100%', appearance: 'auto' }}>
                      {['Administrator','Doctor','Nurse','Trainee','Viewer'].map(r=><option key={r}>{r}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button onClick={() => setShowAddModal(false)} style={{ padding: '9px 20px', borderRadius: '8px', border: '1.5px solid #d1d5db', background: '#fff', fontSize: '13.5px', fontWeight: '600', color: '#374151', cursor: 'pointer' }}>Cancel</button>
                  <button onClick={addUser} style={{ padding: '9px 20px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', color: '#fff', fontSize: '13.5px', fontWeight: '600', cursor: 'pointer' }}>Add User</button>
                </div>
              </div>
            </div>
          )}

          {renderContent()}

          <div style={{
            position: 'sticky',
            bottom: '20px',
            display: 'flex',
            justifyContent: 'flex-end',
            marginTop: '20px',
            paddingTop: '16px',
            borderTop: '1px solid #e5e7eb',
          }}>
            <button
              onClick={() => onNavigate && onNavigate('dashboard')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 24px',
                borderRadius: '10px',
                border: 'none',
                background: 'linear-gradient(135deg,#2563eb,#1d4ed8)',
                color: '#fff',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(37,99,235,0.3)',
                transition: 'all 0.2s',
              }}
              onMouseOver={e => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(37,99,235,0.4)';
              }}
              onMouseOut={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(37,99,235,0.3)';
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12l9-9 9 9" />
                <path d="M12 3v18" />
              </svg>
              Back to Dashboard
            </button>
          </div>

          <div style={{ textAlign: 'center', padding: '12px 0 4px', borderTop: '1px solid #e5e7eb', marginTop: '8px' }}>
            <p style={{ margin: 0, fontSize: '11.5px', color: '#94a3b8' }}>© 2025 AnesGuard | Pre-Anesthesia Assessment Educational System</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;