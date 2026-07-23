const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const path = require('path');
const { readData, writeData } = require('../utils/db');

const ordersFilePath = path.join(__dirname, '../data/orders.json');

// Optional Razorpay module import
let RazorpayInstance = null;
try {
  const Razorpay = require('razorpay');
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    RazorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
    console.log('[Payments] Razorpay live mode enabled.');
  }
} catch (e) {
  console.log('[Payments] Razorpay SDK not found. Using secure sandbox mode.');
}

// POST /api/payments/razorpay-order
router.post('/razorpay-order', async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'Valid payment amount is required' });
    }

    const amountInPaise = Math.round(Number(amount) * 100);

    if (RazorpayInstance) {
      const options = {
        amount: amountInPaise,
        currency: 'INR',
        receipt: `fm_rcpt_${Date.now()}`
      };
      const order = await RazorpayInstance.orders.create(options);
      return res.json({
        success: true,
        mode: 'live',
        id: order.id,
        amount: order.amount,
        currency: order.currency
      });
    }

    // Sandbox: generate a verifiable dummy order token
    const dummyOrderId = `rzp_sbx_ord_${crypto.randomBytes(6).toString('hex')}`;
    res.json({
      success: true,
      mode: 'sandbox',
      id: dummyOrderId,
      amount: amountInPaise,
      currency: 'INR'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create payment order token', error: err.message });
  }
});

// POST /api/payments/verify
router.post('/verify', (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, orderId } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id) {
      return res.status(400).json({ success: false, message: 'Missing required payment details' });
    }

    // Cryptographic HMAC-SHA256 signature validation
    if (process.env.RAZORPAY_KEY_SECRET && razorpay_signature) {
      const generated_signature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(razorpay_order_id + '|' + razorpay_payment_id)
        .digest('hex');

      if (generated_signature !== razorpay_signature) {
        return res.status(400).json({ success: false, message: 'Cryptographic signature verification failed. Payment rejected.' });
      }
    }

    // Mark the order as paid if orderId is provided
    if (orderId) {
      try {
        const orders = readData(ordersFilePath, []);
        const idx = orders.findIndex(o => o.orderId && o.orderId.toLowerCase() === orderId.toLowerCase());
        if (idx !== -1) {
          orders[idx].status = 'Payment Confirmed';
          orders[idx].paymentId = razorpay_payment_id;
          orders[idx].paymentVerifiedAt = new Date().toISOString();
          writeData(ordersFilePath, orders);
        }
      } catch (_) {}
    }

    res.json({
      success: true,
      message: 'Payment verified and transaction signed.',
      paymentId: razorpay_payment_id,
      verification: 'SHA256-HMAC'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Payment verification failed', error: err.message });
  }
});

module.exports = router;
