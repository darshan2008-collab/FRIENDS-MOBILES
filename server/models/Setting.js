const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  freeShippingThreshold: { type: Number, default: 499 },
  standardShippingFee: { type: Number, default: 49 },
  storeName: { type: String, default: 'FRIENDS MOBILE' },
  storeCity: { type: String, default: 'Madurai, Tamil Nadu' },
  storePhone: { type: String, default: '+91 74485 78507' }
}, {
  timestamps: true
});

module.exports = mongoose.model('Setting', settingSchema);
