const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  id: { type: Number },
  name: { type: String, required: true },
  email: { type: String, default: '' },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  address: { type: String, default: '' },
  role: { type: String, default: 'customer' }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
