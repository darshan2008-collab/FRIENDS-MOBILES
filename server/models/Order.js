const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderItemSchema = new mongoose.Schema({
  id: { type: Schema.Types.Mixed },
  title: { type: String, required: true },
  category: { type: String },
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  discount: { type: String },
  rating: { type: Number },
  reviews: { type: Number },
  inStock: { type: Boolean },
  img: { type: String },
  fallback: { type: String },
  quantity: { type: Number, default: 1 },
  customizationDetails: { type: Object }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  customer: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, default: '' },
    address: { type: String, required: true }
  },
  items: [orderItemSchema],
  total: { type: Number, required: true },
  subtotal: { type: Number },
  shippingFee: { type: Number, default: 0 },
  paymentMethod: { type: String, default: 'COD' },
  paymentStatus: { type: String, default: 'Pending' },
  status: { type: String, default: 'Processing' },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String }
}, {
  timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);
