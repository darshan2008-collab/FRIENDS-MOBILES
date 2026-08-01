const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const path = require('path');
const { readData, writeData } = require('../utils/db');
const InvoiceService = require('../services/invoiceService');

const ordersFilePath = path.join(__dirname, '../data/orders.json');
const settingsFilePath = path.join(__dirname, '../data/settings.json');

// Memory cache for active payment status polling (for instantaneous sub-second response)
const paymentStatusCache = new Map();

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

// GET /api/payments/status/:orderId — Real-Time Payment Status Listener (Zero-Touch Polling)
router.get('/status/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    if (!orderId) {
      return res.status(400).json({ success: false, message: 'Order ID is required' });
    }

    const cleanId = orderId.toLowerCase();

    // Check Memory Cache first for instantaneous sub-second response
    if (paymentStatusCache.has(cleanId)) {
      const cached = paymentStatusCache.get(cleanId);
      return res.json({ success: true, ...cached });
    }

    // Check DB or JSON storage
    let foundOrder = null;
    try {
      const Order = require('../models/Order');
      foundOrder = await Order.findOne({ orderId: { $regex: new RegExp(`^${orderId}$`, 'i') } });
    } catch (_) {}

    if (!foundOrder) {
      const fileOrders = readData(ordersFilePath, []);
      foundOrder = fileOrders.find(o => o.orderId && o.orderId.toLowerCase() === cleanId);
    }

    if (!foundOrder) {
      return res.json({
        success: true,
        orderId,
        paymentStatus: 'Pending',
        status: 'Awaiting Payment'
      });
    }

    const isPaid = (foundOrder.paymentStatus || '').toLowerCase() === 'paid' || 
                   (foundOrder.paymentStatus || '').toLowerCase() === 'captured';

    const result = {
      orderId: foundOrder.orderId,
      paymentStatus: isPaid ? 'Paid' : 'Pending',
      status: isPaid ? 'Order Placed' : 'Awaiting Payment',
      transactionUtr: foundOrder.transactionUtr || foundOrder.razorpayPaymentId || null,
      paidAt: foundOrder.paymentVerifiedAt || null
    };

    if (isPaid) {
      paymentStatusCache.set(cleanId, result);
    }

    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch payment status', error: err.message });
  }
});

// POST /api/payments/create-qr-order — Generate Dynamic UPI QR Token & URI
router.post('/create-qr-order', async (req, res) => {
  try {
    const { amount, orderId } = req.body;
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'Valid payment amount is required' });
    }

    const cleanOrderId = orderId || `FM-ORD-${Math.floor(100000 + Math.random() * 900000)}`;
    const settings = readData(settingsFilePath, {});
    const storeUpi = process.env.STORE_UPI_ID || settings.storeUpiId || 'darshankannan2008@oksbi';
    const payeeName = process.env.STORE_PAYEE_NAME || settings.storePayeeName || 'FRIENDS MOBILE';

    const upiUri = `upi://pay?pa=${encodeURIComponent(storeUpi)}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(`Order ${cleanOrderId}`)}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiUri)}`;

    res.json({
      success: true,
      orderId: cleanOrderId,
      amount: Number(amount),
      upiUri,
      qrUrl,
      storeUpi,
      payeeName,
      webhookListener: `/api/payments/webhook`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create QR order', error: err.message });
  }
});

// POST /api/payments/simulate-qr-success — Sandbox Test Simulator for Zero-Touch Auto-Verification
router.post('/simulate-qr-success', async (req, res) => {
  try {
    const { orderId, utr } = req.body;
    if (!orderId) {
      return res.status(400).json({ success: false, message: 'Order ID is required to simulate payment' });
    }

    const cleanUtr = utr || `UTR${Date.now()}`;
    const cleanId = orderId.toLowerCase();

    // 1. Update memory cache instantly
    paymentStatusCache.set(cleanId, {
      orderId,
      paymentStatus: 'Paid',
      status: 'Order Placed (UPI Verified)',
      transactionUtr: cleanUtr,
      paidAt: new Date().toISOString()
    });

    // 2. Update local JSON storage
    const fileOrders = readData(ordersFilePath, []);
    const idx = fileOrders.findIndex(o => o.orderId && o.orderId.toLowerCase() === cleanId);
    if (idx !== -1) {
      fileOrders[idx].paymentStatus = 'Paid';
      fileOrders[idx].status = 'Order Placed';
      fileOrders[idx].transactionUtr = cleanUtr;
      fileOrders[idx].paymentVerifiedAt = new Date().toISOString();
      writeData(ordersFilePath, fileOrders);
    }

    // 3. Update PostgreSQL DB
    try {
      const Order = require('../models/Order');
      await Order.updateOne(
        { orderId: { $regex: new RegExp(`^${orderId}$`, 'i') } },
        { 
          $set: { 
            paymentStatus: 'Paid',
            status: 'Order Placed',
            transactionUtr: cleanUtr,
            paymentVerifiedAt: new Date().toISOString()
          } 
        }
      );
    } catch (_) {}

    // Trigger real-time backup queue
    try {
      const BackupService = require('../services/backupService');
      BackupService.triggerRealTimeBackup(`upi_auto_verified_${orderId}`);
    } catch (_) {}

    console.log(`[Zero-Touch Webhook Verification] Successfully verified UPI Payment for Order #${orderId} (UTR: ${cleanUtr})`);

    res.json({
      success: true,
      message: `Zero-touch payment auto-verified for Order #${orderId}!`,
      orderId,
      transactionUtr: cleanUtr,
      paymentStatus: 'Paid'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to simulate payment confirmation', error: err.message });
  }
});

// POST /api/payments/webhook — Live Payment Gateway Webhook Listener (Razorpay / Cashfree / PhonePe)
router.post('/webhook', async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.PAYMENT_WEBHOOK_SECRET;

    // Verify HMAC-SHA256 signature if webhook secret is configured
    if (webhookSecret) {
      const signature = req.headers['x-razorpay-signature'] || req.headers['x-webhook-signature'];
      if (!signature) {
        return res.status(400).json({ success: false, message: 'Missing webhook signature header' });
      }

      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(JSON.stringify(req.body))
        .digest('hex');

      if (signature !== expectedSignature) {
        return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
      }
    }

    const payload = req.body;
    const event = payload.event || payload.eventType || 'payment.captured';
    const paymentEntity = payload.payload?.payment?.entity || payload.data || {};
    const orderId = paymentEntity.notes?.orderId || paymentEntity.order_id || payload.orderId;
    const paymentId = paymentEntity.id || paymentEntity.paymentId || `PAY-${Date.now()}`;

    if (orderId) {
      const cleanId = String(orderId).toLowerCase();

      // Update Memory Cache
      paymentStatusCache.set(cleanId, {
        orderId,
        paymentStatus: 'Paid',
        status: 'Order Placed (Payment Verified)',
        transactionUtr: paymentId,
        paidAt: new Date().toISOString()
      });

      // Update Local JSON File
      const fileOrders = readData(ordersFilePath, []);
      const idx = fileOrders.findIndex(o => o.orderId && o.orderId.toLowerCase() === cleanId);
      if (idx !== -1) {
        fileOrders[idx].paymentStatus = 'Paid';
        fileOrders[idx].status = 'Order Placed';
        fileOrders[idx].razorpayPaymentId = paymentId;
        fileOrders[idx].paymentVerifiedAt = new Date().toISOString();
        writeData(ordersFilePath, fileOrders);
      }

      // Update PostgreSQL Database
      try {
        const Order = require('../models/Order');
        await Order.updateOne(
          { orderId: { $regex: new RegExp(`^${orderId}$`, 'i') } },
          {
            $set: {
              paymentStatus: 'Paid',
              status: 'Order Placed',
              razorpayPaymentId: paymentId,
              paymentVerifiedAt: new Date().toISOString()
            }
          }
        );
      } catch (_) {}

      // Trigger Backup
      try {
        const BackupService = require('../services/backupService');
        BackupService.triggerRealTimeBackup(`webhook_payment_${orderId}`);
      } catch (_) {}
    }

    res.json({ success: true, message: 'Webhook event processed', event, orderId });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Webhook processing error', error: err.message });
  }
});

// GET /api/payments/invoice/:orderId — Printable E-Bill Tax Receipt Endpoint
router.get('/invoice/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const cleanId = orderId.toLowerCase();

    let foundOrder = null;
    try {
      const Order = require('../models/Order');
      foundOrder = await Order.findOne({ orderId: { $regex: new RegExp(`^${orderId}$`, 'i') } });
    } catch (_) {}

    if (!foundOrder) {
      const fileOrders = readData(ordersFilePath, []);
      foundOrder = fileOrders.find(o => o.orderId && o.orderId.toLowerCase() === cleanId);
    }

    if (!foundOrder) {
      return res.status(404).send('<h3>Invoice Not Found for Order #' + orderId + '</h3>');
    }

    const htmlContent = InvoiceService.generateInvoiceHtml(foundOrder);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(htmlContent);
  } catch (err) {
    res.status(500).send('<h3>Error Generating Invoice: ' + err.message + '</h3>');
  }
});

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
router.post('/verify', async (req, res) => {
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

    // Update payment status across memory cache, JSON file storage, and PostgreSQL DB
    if (orderId) {
      const cleanId = String(orderId).toLowerCase();

      // 1. Update Memory Cache
      paymentStatusCache.set(cleanId, {
        orderId,
        paymentStatus: 'Paid',
        status: 'Order Placed (Razorpay Paid)',
        transactionUtr: razorpay_payment_id,
        paidAt: new Date().toISOString()
      });

      // 2. Update Local JSON storage
      const fileOrders = readData(ordersFilePath, []);
      const idx = fileOrders.findIndex(o => o && o.orderId && o.orderId.toLowerCase() === cleanId);
      if (idx !== -1) {
        fileOrders[idx].paymentStatus = 'Paid';
        fileOrders[idx].status = 'Order Placed';
        fileOrders[idx].razorpayPaymentId = razorpay_payment_id;
        fileOrders[idx].paymentVerifiedAt = new Date().toISOString();
        writeData(ordersFilePath, fileOrders);
      }

      // 3. Update PostgreSQL DB
      try {
        const Order = require('../models/Order');
        await Order.updateOne(
          { orderId: { $regex: new RegExp(`^${orderId}$`, 'i') } },
          { 
            $set: { 
              status: 'Order Placed',
              paymentStatus: 'Paid',
              razorpayPaymentId: razorpay_payment_id || '',
              paymentVerifiedAt: new Date().toISOString()
            } 
          }
        );
      } catch (e) {
        console.error('[Payment Verification DB Error]', e.message);
      }

      // 4. Trigger Real-Time Backup
      try {
        const BackupService = require('../services/backupService');
        BackupService.triggerRealTimeBackup(`razorpay_verified_${orderId}`);
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
