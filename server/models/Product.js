const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  title: { type: String, required: true },
  category: { type: String, required: true },
  discount: { type: String, default: '' },
  price: { type: Number, required: true },
  originalPrice: { type: Number, required: true },
  rating: { type: Number, default: 0 },
  reviews: { type: Number, default: 0 },
  inStock: { type: Boolean, default: true },
  stock: { type: Number, default: 50 },
  img: { type: String, default: '' },
  fallback: { type: String, default: '' },
  description: { type: String, default: '' },
  brand: { type: String, default: '' },
  badge: { type: String, default: '' },
  isTrending: { type: Boolean, default: false }
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);
