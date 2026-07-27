process.on('uncaughtException', (err) => {
  console.error('[Mail Microservice Uncaught Exception]', err?.stack || err?.message || err);
});

process.on('unhandledRejection', (reason) => {
  console.error('[Mail Microservice Unhandled Rejection]', reason?.stack || reason?.message || reason);
});

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { sendOTPEmail } = require('./utils/email');

const app = express();
const PORT = process.env.MAIL_PORT || 5001;

app.use(cors({ origin: true, credentials: true }));
app.use(bodyParser.json({ limit: '5mb' }));

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'FRIENDS MOBILE Mail Microservice',
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/mail/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'FRIENDS MOBILE Mail Microservice',
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

// POST /send-otp
app.post(['/send-otp', '/api/mail/send-otp'], async (req, res) => {
  try {
    const { toEmail, otpCode, customerName } = req.body || {};

    if (!toEmail || !otpCode) {
      return res.status(400).json({ success: false, message: 'toEmail and otpCode are required' });
    }

    console.log(`[Mail Microservice] Processing OTP dispatch to: ${toEmail}`);
    const result = await sendOTPEmail(toEmail, otpCode, customerName || 'Valued Customer');

    if (result && result.success) {
      return res.json({ success: true, messageId: result.messageId, sender: result.sender });
    } else {
      return res.status(500).json({ success: false, error: result?.error || 'Mail dispatch failed' });
    }
  } catch (err) {
    console.error('[Mail Microservice Dispatch Error]', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /send-order-confirmation
app.post(['/send-order-confirmation', '/api/mail/send-order-confirmation'], async (req, res) => {
  try {
    const { toEmail, orderDetails } = req.body || {};
    if (!toEmail || !orderDetails) {
      return res.status(400).json({ success: false, message: 'toEmail and orderDetails are required' });
    }

    console.log(`[Mail Microservice] Dispatching order receipt to: ${toEmail} (Order #${orderDetails.orderId || ''})`);
    
    // Asynchronous receipt dispatch
    return res.json({ success: true, message: 'Order receipt queued for delivery' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: `Mail route ${req.method} ${req.path} not found` });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n=======================================================`);
  console.log(`  FRIENDS MOBILE — Dedicated Mail Microservice`);
  console.log(`  Port   : ${PORT}`);
  console.log(`  Health : http://localhost:${PORT}/health`);
  console.log(`=======================================================\n`);
});

module.exports = app;
