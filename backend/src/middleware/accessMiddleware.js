const { loadAccessRules, hasAccess } = require('../utils/accessRules');

const requireAccess = (resource, minimum) => async (req, res, next) => {
  try {
    const rules = await loadAccessRules();
    if (!hasAccess(req.user?.role, resource, minimum, rules)) {
      return res.status(403).json({ success: false, message: 'You do not have access to this' });
    }
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { requireAccess };
