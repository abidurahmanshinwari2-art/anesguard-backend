const Settings = require('../models/Settings');

const sessionMinutes = async () => {
  const saved = await Settings.findOne({ key: 'system' });
  const minutes = Number(saved?.security?.sessionTimeout);
  if (!Number.isFinite(minutes) || minutes < 1) return 30;
  return Math.min(1440, Math.round(minutes));
};

module.exports = { sessionMinutes };
