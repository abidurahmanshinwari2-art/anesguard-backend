const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  key: { type: String, unique: true, default: 'system' },
  general: { type: Object, default: {} },
  security: { type: Object, default: {} },
  notifications: { type: Object, default: {} },
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
