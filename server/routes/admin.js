const express = require('express');
const router = express.Router();
const path = require('path');
const mongoose = require('mongoose');
const { readData, writeData, sanitizeInput } = require('../utils/db');
const Setting = require('../models/Setting');
const Order = require('../models/Order');
const Product = require('../models/Product');

const settingsFilePath = path.join(__dirname, '../data/settings.json');
const ordersFilePath = path.join(__dirname, '../data/orders.json');
const productsFilePath = path.join(__dirname, '../data/products.json');

async function getSettingsAsync() {
  if (mongoose.connection.readyState === 1) {
    try {
      const dbSettings = await Setting.findOne({}).lean();
      if (dbSettings) return dbSettings;
    } catch (_) {}
  }
  return readData(settingsFilePath, { freeShippingThreshold: 499, standardShippingFee: 49 });
}

async function saveSettingsAsync(settingsData) {
  if (mongoose.connection.readyState === 1) {
    try {
      await Setting.updateOne({}, { $set: settingsData }, { upsert: true });
    } catch (_) {}
  }
  try { writeData(settingsFilePath, settingsData); } catch (_) {}
}

async function getOrdersAsync() {
  if (mongoose.connection.readyState === 1) {
    try {
      const dbOrders = await Order.find({}).sort({ createdAt: -1 }).lean();
      if (dbOrders && dbOrders.length > 0) return dbOrders;
    } catch (_) {}
  }
  return readData(ordersFilePath, []);
}

async function getProductsAsync() {
  if (mongoose.connection.readyState === 1) {
    try {
      const dbProducts = await Product.find({}).lean();
      if (dbProducts && dbProducts.length > 0) return dbProducts;
    } catch (_) {}
  }
  return readData(productsFilePath, []);
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

    // Save to MongoDB
    if (mongoose.connection.readyState === 1) {
      try {
        await Order.updateOne({ orderId: orders[orderIndex].orderId }, { $set: orders[orderIndex] }, { upsert: true });
      } catch (_) {}
    }
    // Save to local file backup
    try { writeData(ordersFilePath, orders); } catch (_) {}

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

module.exports = router;
