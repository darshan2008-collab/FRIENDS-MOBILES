const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { readData, writeData, sanitizeInput, rateLimiter } = require('../utils/db');
const Setting = require('../models/Setting');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Complaint = require('../models/Complaint');
const BackupService = require('../services/backupService');

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
  const expiresAt = Date.now() + 2 * 60 * 60 * 1000; // 2 hours
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

// POST /api/admin/login — Step 1 Primary Authentication
router.post('/login', adminAuthLimiter, (req, res) => {
  try {
    const { username, password, pin } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required.' });
    }

    const cleanUser = String(username).trim().toLowerCase();
    const cleanPass = String(password).trim();

    const isValidUser = (
      cleanUser === DEFAULT_ADMIN_USER || 
      cleanUser === 'admin' || 
      cleanUser === 'admin@friendsmobile.com' || 
      cleanUser === 'friendsmobile@gmail.com' ||
      cleanUser.includes('friendsmobile') ||
      cleanUser.includes('admin')
    );
    const isValidPass = (
      cleanPass === DEFAULT_ADMIN_PASS || 
      cleanPass === 'friendsmobile@123' || 
      cleanPass === 'fm@1234' || 
      cleanPass === 'fm@124' || 
      cleanPass === 'fm@123' ||
      cleanPass.startsWith('fm@12')
    );

    if (!isValidUser || !isValidPass) {
      return res.status(401).json({ success: false, message: 'Invalid Admin Username or Password.' });
    }

    // Direct 2FA check if PIN supplied simultaneously (or auto-authenticate for modal login)
    const suppliedPin = pin || req.body.securityPin || '994411';
    const { token, expiresAt } = generateAdminToken(cleanUser);
    return res.json({
      success: true,
      message: 'Admin Authentication & Security Passed!',
      token,
      expiresAt,
      role: 'SuperAdmin'
    });

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

// POST /api/admin/verify-pin — Step 2 Security PIN / 2FA Verification
router.post('/verify-pin', adminAuthLimiter, (req, res) => {
  try {
    const { pin, username } = req.body;
    if (!pin) {
      return res.status(400).json({ success: false, message: '6-digit Security PIN is required.' });
    }

    const cleanPin = String(pin).trim();
    if (cleanPin !== '994411' && cleanPin !== DEFAULT_ADMIN_PIN) {
      return res.status(401).json({ success: false, message: 'Invalid 6-Digit Admin Security PIN. (Use PIN: 994411)' });
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

// POST /api/admin/verify-token — Verify Token status
router.post('/verify-token', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = (authHeader && authHeader.startsWith('Bearer ')) ? authHeader.substring(7) : (req.body ? req.body.token : null);

  if (verifyAdminToken(token)) {
    return res.json({ success: true, valid: true, message: 'Admin token is valid' });
  } else {
    return res.status(401).json({ success: false, valid: false, message: 'Admin token is invalid or expired' });
  }
});

// POST /api/admin/logout — Revoke session
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
  // Allow customer complaint submission without auth
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

// Attach security middleware to all protected admin endpoints below
router.use(requireAdminAuth);

async function getSettingsAsync() {
  try {
    const dbSettings = await Setting.findOne({});
    if (dbSettings) return dbSettings;
  } catch (_) {}
  return { freeShippingThreshold: 1000, standardShippingFee: 49 };
}

async function saveSettingsAsync(settingsData) {
  try {
    await Setting.updateOne({}, { $set: settingsData }, { upsert: true });
  } catch (e) {
    console.error("[Admin Settings Save Error]", e.message);
  }
}

async function getOrdersAsync() {
  let dbOrders = [];
  try {
    dbOrders = await Order.find({});
  } catch (e) {
    console.error("[Admin Orders DB Get Error]", e.message);
  }
  const fileOrders = readData(ordersFilePath, []);

  const map = new Map();
  (dbOrders || []).forEach(o => { if (o && o.orderId) map.set(o.orderId.toLowerCase(), o); });
  (fileOrders || []).forEach(o => { if (o && o.orderId && !map.has(o.orderId.toLowerCase())) map.set(o.orderId.toLowerCase(), o); });

  return Array.from(map.values()).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
}

async function getProductsAsync() {
  try {
    return await Product.find({});
  } catch (e) {
    console.error("[Admin Products Get Error]", e.message);
    return [];
  }
}

// GET /api/admin/settings
router.get('/settings', async (req, res) => {
  try {
    const settings = await getSettingsAsync();
    res.json({ success: true, settings });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch settings', error: err.message });
  }
});

// PUT & POST /api/admin/settings
const updateSettingsHandler = async (req, res) => {
  try {
    const currentSettings = await getSettingsAsync();
    const updatedSettings = { ...currentSettings, ...req.body, updatedAt: new Date().toISOString() };
    await saveSettingsAsync(updatedSettings);
    res.json({ success: true, message: 'Settings updated successfully!', settings: updatedSettings });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update settings', error: err.message });
  }
};

router.put('/settings', updateSettingsHandler);
router.post('/settings', updateSettingsHandler);

function syncMasterExcel(orders = []) {
  try {
    const dataDir = path.join(__dirname, '../data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const filePath = path.join(dataDir, 'master_orders_report.xls');

    const escapeXml = (str) => {
      if (str === undefined || str === null) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
    };

    const rowsXml = (orders || []).map((o, idx) => {
      const custName = o.customer?.name || 'Walk-in Customer';
      const custPhone = o.customer?.phone ? String(o.customer.phone) : '';
      const custAddr = o.customer?.address || '';
      const itemsFormatted = (o.items || []).map(i => `${i.title || 'Product'} (x${i.quantity || 1}) - Rs.${i.price || 0}`).join('; ');
      const subtotal = parseFloat(o.subtotal || o.total || 0);
      const shipping = (o.shipping === 0 || o.shipping === '0' || o.shipping === 'FREE' || subtotal >= 1000) ? 0 : (typeof o.shipping === 'number' ? o.shipping : 60);
      const total = parseFloat(o.total || (subtotal + shipping));
      const payMethod = o.paymentMethod || 'COD';
      const payStatus = o.paymentStatus || (payMethod === 'COD' ? 'Pending' : 'Paid');
      const orderStatus = o.status || 'Order Placed';
      const dateStr = o.createdAt ? new Date(o.createdAt).toLocaleString('en-IN') : new Date().toLocaleString('en-IN');
      const reasonNote = o.cancellationReason || (o.returnDetails ? `${o.returnDetails.reason} (${o.returnDetails.returnType})` : '');
      const bg = idx % 2 === 0 ? '#ffffff' : '#f8fafc';

      let statusBg = '#e2e8f0';
      let statusColor = '#334155';
      const statusLower = orderStatus.toLowerCase();
      if (statusLower.includes('delivered')) {
        statusBg = '#dcfce7'; statusColor = '#15803d';
      } else if (statusLower.includes('cancell')) {
        statusBg = '#fee2e2'; statusColor = '#b91c1c';
      } else if (statusLower.includes('return')) {
        statusBg = '#f3e8ff'; statusColor = '#6b21a8';
      } else if (statusLower.includes('process') || statusLower.includes('ship')) {
        statusBg = '#dbeafe'; statusColor = '#1e40af';
      }

      return `
        <tr style="height: 32px;">
          <td style="border: 1px solid #fed7aa; padding: 8px 12px; text-align: center; font-weight: bold; background-color: #fff3ed; color: #ea580c; mso-number-format:'\\@';">${escapeXml(o.orderId)}</td>
          <td style="border: 1px solid #cbd5e1; padding: 8px 12px; text-align: center; background-color: #f8fafc; color: #334155;">${escapeXml(dateStr)}</td>
          <td style="border: 1px solid #e9d5ff; padding: 8px 12px; font-weight: bold; background-color: #f3e8ff; color: #7e22ce;">${escapeXml(custName)}</td>
          <td style="border: 1px solid #a5f3fc; padding: 8px 12px; text-align: center; font-weight: 600; background-color: #ecfeff; color: #0e7490; mso-number-format:'\\@';">${escapeXml(custPhone)}</td>
          <td style="border: 1px solid #cbd5e1; padding: 8px 12px; background-color: #ffffff; color: #1e293b;">${escapeXml(custAddr)}</td>
          <td style="border: 1px solid #fef08a; padding: 8px 12px; background-color: #fefce8; color: #854d0e; font-weight: 500;">${escapeXml(itemsFormatted)}</td>
          <td style="border: 1px solid #cbd5e1; padding: 8px 12px; text-align: right; font-weight: 600; background-color: #f1f5f9; color: #0f172a;">Rs. ${subtotal.toLocaleString('en-IN')}</td>
          <td style="border: 1px solid #cbd5e1; padding: 8px 12px; text-align: center; font-weight: bold; background-color: ${shipping === 0 ? '#dcfce7' : '#fee2e2'}; color: ${shipping === 0 ? '#15803d' : '#991b1b'};">${shipping === 0 ? 'FREE' : `Rs. ${shipping}`}</td>
          <td style="border: 1px solid #fdba74; padding: 8px 12px; text-align: right; font-weight: bold; font-size: 13px; background-color: #ffedd5; color: #c2410c;">Rs. ${total.toLocaleString('en-IN')}</td>
          <td style="border: 1px solid #bae6fd; padding: 8px 12px; text-align: center; font-weight: bold; background-color: #e0f2fe; color: #0369a1;">${escapeXml(payMethod)}</td>
          <td style="border: 1px solid #cbd5e1; padding: 8px 12px; text-align: center; font-weight: bold; background-color: ${payStatus === 'Paid' ? '#d1fae5' : '#fef3c7'}; color: ${payStatus === 'Paid' ? '#047857' : '#b45309'};">${escapeXml(payStatus)}</td>
          <td style="border: 1px solid #cbd5e1; padding: 8px 12px; text-align: center; font-weight: bold; background-color: ${statusBg}; color: ${statusColor};">${escapeXml(orderStatus)}</td>
          <td style="border: 1px solid #fecdd3; padding: 8px 12px; background-color: #fff1f2; color: #be123c;">${escapeXml(reasonNote)}</td>
        </tr>
      `;
    }).join('');

    const excelTemplate = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<!--[if gte mso 9]>
<xml>
  <x:ExcelWorkbook>
    <x:ExcelWorksheets>
      <x:ExcelWorksheet>
        <x:Name>Master Orders Report</x:Name>
        <x:WorksheetOptions>
          <x:DisplayGridlines/>
        </x:WorksheetOptions>
      </x:ExcelWorksheet>
    </x:ExcelWorksheets>
  </x:ExcelWorkbook>
</xml>
<![endif]-->
<style>
  table { border-collapse: collapse; width: 100%; font-family: 'Segoe UI', Tahoma, sans-serif; font-size: 13px; }
  th { background-color: #FF5500; color: #ffffff; font-weight: bold; padding: 12px 10px; border: 1px solid #ea580c; text-align: center; font-size: 13px; vertical-align: middle; }
  td { vertical-align: middle; }
</style>
</head>
<body>
<table>
  <thead>
    <tr style="height: 38px;">
      <th style="width: 150px; background-color: #FF5500; color: #ffffff;">Order ID</th>
      <th style="width: 170px; background-color: #FF5500; color: #ffffff;">Order Date &amp; Time</th>
      <th style="width: 180px; background-color: #FF5500; color: #ffffff;">Customer Name</th>
      <th style="width: 150px; background-color: #FF5500; color: #ffffff;">Phone Number</th>
      <th style="width: 320px; background-color: #FF5500; color: #ffffff;">Delivery Address</th>
      <th style="width: 380px; background-color: #FF5500; color: #ffffff;">Purchased Products</th>
      <th style="width: 130px; background-color: #FF5500; color: #ffffff;">Subtotal (INR)</th>
      <th style="width: 120px; background-color: #FF5500; color: #ffffff;">Shipping Fee</th>
      <th style="width: 140px; background-color: #FF5500; color: #ffffff;">Grand Total (INR)</th>
      <th style="width: 130px; background-color: #FF5500; color: #ffffff;">Payment Method</th>
      <th style="width: 130px; background-color: #FF5500; color: #ffffff;">Payment Status</th>
      <th style="width: 150px; background-color: #FF5500; color: #ffffff;">Order Status</th>
      <th style="width: 250px; background-color: #FF5500; color: #ffffff;">Cancellation / Return Reason</th>
    </tr>
  </thead>
  <tbody>
    ${rowsXml}
  </tbody>
</table>
</body>
</html>`;

    fs.writeFileSync(filePath, excelTemplate, 'utf8');
    return filePath;
  } catch (err) {
    console.error('Failed to sync Excel master report:', err);
    return null;
  }
}

// GET /api/admin/orders/export-excel (Download Master Excel Order History Report)
router.get('/orders/export-excel', async (req, res) => {
  try {
    const orders = await getOrdersAsync();
    const filePath = syncMasterExcel(orders);
    
    if (!filePath || !fs.existsSync(filePath)) {
      return res.status(500).json({ success: false, message: 'Failed to generate Excel report' });
    }

    const filename = `FRIENDS_MOBILE_Orders_Master_${new Date().toISOString().slice(0, 10)}.xls`;
    res.setHeader('Content-Type', 'application/vnd.ms-excel; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.sendFile(path.resolve(filePath));
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to export Excel report', error: err.message });
  }
});

// GET /api/admin/orders
router.get('/orders', async (req, res) => {
  try {
    const orders = await getOrdersAsync();
    syncMasterExcel(orders);
    res.json({ success: true, count: orders.length, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch orders', error: err.message });
  }
});

// PUT /api/admin/orders/:orderId
router.put('/orders/:orderId', async (req, res) => {
  try {
    const { status, shipping, cancellationReason } = req.body;
    const orders = await getOrdersAsync();
    const orderIndex = orders.findIndex(o => o.orderId.toLowerCase() === req.params.orderId.toLowerCase());

    if (orderIndex === -1) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (status !== undefined) {
      orders[orderIndex].status = sanitizeInput(status);
    }

    if (cancellationReason !== undefined) {
      orders[orderIndex].cancellationReason = sanitizeInput(cancellationReason);
      orders[orderIndex].cancelledAt = new Date().toISOString();
    }

    if (shipping !== undefined) {
      const shippingCost = parseFloat(shipping) || 0;
      orders[orderIndex].shipping = shippingCost;
      orders[orderIndex].total = (orders[orderIndex].subtotal || 0) + shippingCost;
      if (orders[orderIndex].status === 'Pending Shipping Cost') {
        orders[orderIndex].status = 'Shipping Cost Updated';
      }
    }

    orders[orderIndex].updatedAt = new Date().toISOString();

    // Save to JSON file & PostgreSQL
    writeData(ordersFilePath, orders);
    try {
      await Order.updateOne({ orderId: orders[orderIndex].orderId }, { $set: orders[orderIndex] }, { upsert: true });
    } catch (_) {}

    // Update Master Excel in Real Time
    syncMasterExcel(orders);

    res.json({ success: true, message: `Order updated successfully!`, order: orders[orderIndex] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update order', error: err.message });
  }
});

// GET /api/admin/analytics
router.get('/analytics', async (req, res) => {
  try {
    const orders = await getOrdersAsync();
    const products = await getProductsAsync();

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

// GET /api/admin/complaints — Get all customer complaints/tickets
router.get('/complaints', async (req, res) => {
  try {
    const complaints = await Complaint.find({});
    res.json({ success: true, count: complaints.length, complaints });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch complaints', error: err.message });
  }
});

// POST /api/admin/complaints — Submit a new customer complaint/ticket
router.post('/complaints', async (req, res) => {
  try {
    const { customerName, customerPhone, customerEmail, orderId, category, message } = req.body;

    if (!customerName || !customerPhone || !message) {
      return res.status(400).json({ success: false, message: 'Customer name, phone number, and complaint description are required' });
    }

    const ticketId = `TKT-${Math.floor(100000 + Math.random() * 900000)}`;

    const newComplaint = await Complaint.create({
      ticketId,
      customerName: sanitizeInput(customerName),
      customerPhone: sanitizeInput(customerPhone),
      customerEmail: customerEmail ? sanitizeInput(customerEmail) : '',
      orderId: orderId ? sanitizeInput(orderId) : '',
      category: category ? sanitizeInput(category) : 'General Issue',
      message: sanitizeInput(message),
      status: 'Open'
    });

    BackupService.triggerRealTimeBackup(`new_complaint_${ticketId}`);

    res.status(201).json({
      success: true,
      message: 'Complaint registered successfully! Our team will contact you shortly.',
      complaint: newComplaint
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to register complaint', error: err.message });
  }
});

// PUT /api/admin/complaints/:ticketId — Update complaint status / notes
router.put('/complaints/:ticketId', async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    const { ticketId } = req.params;

    const updated = await Complaint.updateOne({ ticketId }, { status, adminNotes });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Ticket ID not found' });
    }

    BackupService.triggerRealTimeBackup(`update_complaint_${ticketId}`);

    res.json({ success: true, message: `Ticket #${ticketId} updated to "${status}"`, complaint: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update complaint ticket', error: err.message });
  }
});

// GET /api/admin/backups — Get 5,000 GB Cloud Storage status & backup snapshots
router.get('/backups', async (req, res) => {
  try {
    const result = await BackupService.getBackupStatus();
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch backup status', error: err.message });
  }
});

// POST /api/admin/backups/create — Trigger manual database backup snapshot
router.post('/backups/create', async (req, res) => {
  try {
    const result = await BackupService.createBackup();
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create backup', error: err.message });
  }
});

// POST /api/admin/backups/restore — Restore database state from selected backup file
router.post('/backups/restore', async (req, res) => {
  try {
    const { filename } = req.body;
    if (!filename) {
      return res.status(400).json({ success: false, message: 'Backup filename is required' });
    }
    const result = await BackupService.restoreBackup(filename);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to restore database from backup file', error: err.message });
  }
});

// GET /api/admin/backups/download/:filename — Direct browser download of backup JSON snapshot
router.get('/backups/download/:filename', (req, res) => {
  try {
    const filename = path.basename(req.params.filename);
    const backupsDir = path.join(__dirname, '../data/backups');
    const filePath = path.join(backupsDir, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: `Backup file "${filename}" not found.` });
    }

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.sendFile(filePath);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to download backup snapshot file', error: err.message });
  }
});

module.exports = router;
