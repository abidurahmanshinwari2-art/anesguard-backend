const Settings = require('../models/Settings');

const DEFAULT_ACCESS_RULES = [
  { id: '1', resource: 'User accounts', role: 'Super Admin', access: 'Full Control', status: 'Active' },
  { id: '2', resource: 'User accounts', role: 'Administrator', access: 'Full Control', status: 'Active' },
  { id: '3', resource: 'User accounts', role: 'Doctor, Nurse, Trainee, Viewer', access: 'No Access', status: 'Active' },
  { id: '4', resource: 'Own assessments', role: 'Every signed-in role', access: 'Read/Write', status: 'Active' },
  { id: '5', resource: 'System settings', role: 'Super Admin', access: 'Full Control', status: 'Active' },
  { id: '6', resource: 'System settings', role: 'Administrator', access: 'Full Control', status: 'Active' },
  { id: '7', resource: 'All activity', role: 'Super Admin', access: 'Read Only', status: 'Active' },
  { id: '8', resource: 'All activity', role: 'Administrator', access: 'Read Only', status: 'Active' },
];

const RESOURCES = ['User accounts', 'Own assessments', 'System settings', 'All activity'];
const LEVELS = ['Full Control', 'Read/Write', 'Read Only', 'No Access'];
const STATUSES = ['Active', 'Inactive'];
const RANK = { 'No Access': 0, 'Read Only': 1, 'Read/Write': 2, 'Full Control': 3 };

const roleMatches = (userRole, ruleRole) => {
  if (ruleRole === 'Every signed-in role') return true;
  return String(ruleRole).split(',').map((part) => part.trim()).includes(userRole);
};

const levelFor = (userRole, resource, rules) => {
  if (userRole === 'Super Admin') return 'Full Control';
  const active = (rules || []).filter((rule) => (
    rule.status === 'Active' && rule.resource === resource && roleMatches(userRole, rule.role)
  ));
  const exact = active.filter((rule) => rule.role !== 'Every signed-in role' && !String(rule.role).includes(','));
  const pool = exact.length ? exact : active;
  if (!pool.length) return 'No Access';
  return pool.reduce((best, rule) => (RANK[rule.access] > RANK[best] ? rule.access : best), 'No Access');
};

const hasAccess = (userRole, resource, minimum, rules) => RANK[levelFor(userRole, resource, rules)] >= RANK[minimum];

const loadAccessRules = async () => {
  const saved = await Settings.findOne({ key: 'system' }).select('accessRules');
  if (saved && Array.isArray(saved.accessRules)) return saved.accessRules;
  return DEFAULT_ACCESS_RULES;
};

const validateAccessRules = (rules) => {
  if (!Array.isArray(rules)) return 'Rules must be a list';
  for (const rule of rules) {
    if (!rule || !RESOURCES.includes(rule.resource)) return 'Unknown resource';
    if (!LEVELS.includes(rule.access)) return 'Unknown access level';
    if (!STATUSES.includes(rule.status)) return 'Unknown status';
    const role = String(rule.role || '').trim();
    if (!role || role.length > 120) return 'Each rule needs a role';
  }
  return null;
};

module.exports = {
  DEFAULT_ACCESS_RULES,
  RESOURCES,
  LEVELS,
  STATUSES,
  loadAccessRules,
  validateAccessRules,
  hasAccess,
};
