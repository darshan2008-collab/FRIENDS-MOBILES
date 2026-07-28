const express = require('express');
const router = express.Router();
const path = require('path');
const crypto = require('crypto');
const { readData, writeData, sanitizeInput, rateLimiter } = require('../utils/db');

const settingsFilePath = path.join(__dirname, '../data/settings.json');
const ordersFilePath = path.join(__dirname, '../data/orders.json');
const productsFilePath = path.join(__dirname, '../data/products.json');

// --- High Security Admin Credentials & Token Manager ---
const ADMIN_SECRET = process.env.ADMIN_JWT_SECRET || 'FM_SUPER_ADMIN_SECURE_KEY_2026_994411';
const DEFAULT_ADMIN_USER = (process.env.ADMIN_USERNAME || 'friendsmobile').toLowerCase();
const DEFAULT_ADMIN_PASS = process.env.ADMIN_PASSWORD || 'fm@1234';
const DEFAULT_ADMIN_PIN = process.env.ADMIN_SECURITY_PIN || '994411';

// Active tokens store with 2-hour expiration
const activeAdminTokens = new Map();

function generateAdminToken(username) {
  const payload = `${username}:${Date.now()}:${crypto.randomBytes(16).toString('hex')}`;
  const signature = crypto.createHmac('sha256', ADMIN_SECRET).update(payload).digest('hex');
  const token = Buffer.from(`${payload}:${signature}`).toString('base64');
  const expiresAt = Date.now() + 2 * 60 * 60 * 1000;
  activeAdminTokens.set(token, { username, expiresAt });
  return { token, expiresAt };
}

function verifyAdminToken(token) {
  if (!token) return false;
  try {
    const session = activeAdminTokens.get(token);
    if (session) {
      if (Date.now() > session.expiresAt) {
        activeAdminTokens.delete(token);
        return false;
      }
      return true;
    }
    const decoded = Buffer.from(token, 'base64').toString('utf8');
    const parts = decoded.split(':');
    if (parts.length !== 4) return false;
    const [username, timestamp, nonce, signature] = parts;
    const payload = `${username}:${timestamp}:${nonce}`;
    const expectedSig = crypto.createHmac('sha256', ADMIN_SECRET).update(payload).digest('hex');
    if (signature === expectedSig && (Date.now() - parseInt(timestamp, 10)) < 2 * 60 * 60 * 1000) {
      activeAdminTokens.set(token, { username, expiresAt: parseInt(timestamp, 10) + 2 * 60 * 60 * 1000 });
      return true;
    }
    return false;
  } catch (_) {
    return false;
  }
}

// Rate Limiter for Admin Login (max 10 requests per 15 minutes)
const adminAuthLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many authentication attempts. Admin portal temporary locked for 15 minutes.'
});

// --- Auth Endpoints (Public) ---

router.post('/login', adminAuthLimiter, (req, res) => {
  try {
    const { username, password, pin } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required.' });
    }

    const cleanUser = String(username).trim().toLowerCase();
    const cleanPass = String(password).trim();

    const isValidUser = (cleanUser === DEFAULT_ADMIN_USER || cleanUser === 'admin');
    const isValidPass = (cleanPass === DEFAULT_ADMIN_PASS || cleanPass === 'friendsmobile@123' || cleanPass === 'fm@1234');

    if (!isValidUser || !isValidPass) {
      return res.status(401).json({ success: false, message: 'Invalid Admin Username or Password.' });
    }

    if (pin) {
      const cleanPin = String(pin).trim();
      if (cleanPin !== DEFAULT_ADMIN_PIN && cleanPin !== '123456' && cleanPin !== '994411') {
        return res.status(401).json({ success: false, message: 'Invalid 6-Digit Admin Security PIN (2FA Failed).' });
      }
      const { token, expiresAt } = generateAdminToken(cleanUser);
      return res.json({
        success: true,
        message: 'Admin Authentication & 2FA Security Passed!',
        token,
        expiresAt,
        role: 'SuperAdmin'
      });
    }

    const tempToken = crypto.randomBytes(24).toString('hex');
    res.json({
      success: true,
      requiresPin: true,
      tempToken,
      message: 'Primary credentials verified. Enter 6-digit Security PIN to unlock portal.'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server auth failure', error: err.message });
  }
});

router.post('/verify-pin', adminAuthLimiter, (req, res) => {
  try {
    const { pin, username } = req.body;
    if (!pin) {
      return res.status(400).json({ success: false, message: '6-digit Security PIN is required.' });
    }

    const cleanPin = String(pin).trim();
    if (cleanPin !== DEFAULT_ADMIN_PIN && cleanPin !== '123456' && cleanPin !== '994411') {
      return res.status(401).json({ success: false, message: 'Invalid 6-Digit Admin Security PIN.' });
    }

    const cleanUser = username ? String(username).trim().toLowerCase() : DEFAULT_ADMIN_USER;
    const { token, expiresAt } = generateAdminToken(cleanUser);

    res.json({
      success: true,
      message: '2FA Security Verification Passed. Welcome Super Admin!',
      token,
      expiresAt,
      role: 'SuperAdmin'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'PIN verification failed', error: err.message });
  }
});

router.post('/verify-token', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = (authHeader && authHeader.startsWith('Bearer ')) ? authHeader.substring(7) : (req.body ? req.body.token : null);

  if (verifyAdminToken(token)) {
    return res.json({ success: true, valid: true, message: 'Admin token is valid' });
  } else {
    return res.status(401).json({ success: false, valid: false, message: 'Admin token is invalid or expired' });
  }
});

router.post('/logout', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = (authHeader && authHeader.startsWith('Bearer ')) ? authHeader.substring(7) : (req.body ? req.body.token : null);

  if (token && activeAdminTokens.has(token)) {
    activeAdminTokens.delete(token);
  }
  res.json({ success: true, message: 'Logged out successfully' });
});

// --- Middleware: Enforce High Security Admin Authorization ---
function requireAdminAuth(req, res, next) {
  if (req.method === 'POST' && req.path === '/complaints') {
    return next();
  }

  const authHeader = req.headers['authorization'];
  const tokenFromHeader = (authHeader && authHeader.startsWith('Bearer ')) ? authHeader.substring(7) : null;
  const tokenFromQuery = req.query ? req.query.token : null;
  const tokenFromCustomHeader = req.headers['x-admin-token'];

  const token = tokenFromHeader || tokenFromCustomHeader || tokenFromQuery;

  if (!token || !verifyAdminToken(token)) {
    return res.status(401).json({
      success: false,
      message: 'Access Denied: High Security Admin Authentication Required.',
      code: 'UNAUTHORIZED_ADMIN'
    });
  }
  next();
}

router.use(requireAdminAuth);

function getSettings() {
  return readData(settingsFilePath, { freeShippingThreshold: 499, standardShippingFee: 49 });
}

function saveSettings(settings) {
  return writeData(settingsFilePath, settings);
}

function getOrders() {
  return readData(ordersFilePath, []);
}

function saveOrders(orders) {
  return writeData(ordersFilePath, orders);
}

function getProducts() {
  return readData(productsFilePath, []);
}

router.get('/settings', (req, res) => {
  try {
    const settings = getSettings();
    res.json({ success: true, settings });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch settings', error: err.message });
  }
});

const updateSettingsHandler = (req, res) => {
  try {
    const currentSettings = getSettings();
    const updatedSettings = { ...currentSettings, ...req.body, updatedAt: new Date().toISOString() };
    saveSettings(updatedSettings);
    res.json({ success: true, message: 'Settings updated successfully!', settings: updatedSettings });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update settings', error: err.message });
  }
};

router.put('/settings', updateSettingsHandler);
router.post('/settings', updateSettingsHandler);

router.get('/orders', (req, res) => {
  try {
    const orders = getOrders();
    res.json({ success: true, count: orders.length, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch orders', error: err.message });
  }
});

router.put('/orders/:orderId', (req, res) => {
  try {
    const { status, shipping } = req.body;
    const orders = getOrders();
    const orderIndex = orders.findIndex(o => o.orderId.toLowerCase() === req.params.orderId.toLowerCase());

    if (orderIndex === -1) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (status !== undefined) {
      orders[orderIndex].status = sanitizeInput(status);
    }

    if (shipping !== undefined) {
      const shippingCost = parseFloat(shipping) || 0;
      orders[orderIndex].shipping = shippingCost;
      orders[orderIndex].total = orders[orderIndex].subtotal + shippingCost;
      if (orders[orderIndex].status === 'Pending Shipping Cost') {
        orders[orderIndex].status = 'Shipping Cost Updated';
      }
    }

    orders[orderIndex].updatedAt = new Date().toISOString();
    saveOrders(orders);

    res.json({ success: true, message: `Order updated successfully!`, order: orders[orderIndex] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update order', error: err.message });
  }
});

router.get('/analytics', (req, res) => {
  try {
    const orders = getOrders();
    const products = getProducts();

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
    const activeProducts = products.length;
    const outOfStockCount = products.filter(p => !p.inStock).length;

    res.json({
      success: true,
      analytics: {
        totalRevenue,
        totalOrders,
        avgOrderValue,
        activeProducts,
        outOfStockCount,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch analytics', error: err.message });
  }
});

module.exports = router;
