const express = require('express');
const router = express.Router();
const path = require('path');
const { readData, writeData, sanitizeInput } = require('../utils/db');
const Setting = require('../models/Setting');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Complaint = require('../models/Complaint');
const BackupService = require('../services/backupService');

const settingsFilePath = path.join(__dirname, '../data/settings.json');
const ordersFilePath = path.join(__dirname, '../data/orders.json');
const productsFilePath = path.join(__dirname, '../data/products.json');

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
  try {
    return await Order.find({});
  } catch (e) {
    console.error("[Admin Orders Get Error]", e.message);
    return [];
  }
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

// GET /api/admin/orders
router.get('/orders', async (req, res) => {
  try {
    const orders = await getOrdersAsync();
    res.json({ success: true, count: orders.length, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch orders', error: err.message });
  }
});

// PUT /api/admin/orders/:orderId
router.put('/orders/:orderId', async (req, res) => {
  try {
    const { status, shipping } = req.body;
    const orders = await getOrdersAsync();
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
      orders[orderIndex].total = (orders[orderIndex].subtotal || 0) + shippingCost;
      if (orders[orderIndex].status === 'Pending Shipping Cost') {
        orders[orderIndex].status = 'Shipping Cost Updated';
      }
    }

    orders[orderIndex].updatedAt = new Date().toISOString();

    // Save to PostgreSQL
    await Order.updateOne({ orderId: orders[orderIndex].orderId }, { $set: orders[orderIndex] }, { upsert: true });

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
    res.status(500).json({ success: false, message: 'Failed to restore database backup', error: err.message });
  }
});

module.exports = router;
