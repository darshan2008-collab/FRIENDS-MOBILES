const express = require('express');
const router = express.Router();
const path = require('path');
const { readData, writeData, sanitizeInput, normalizePhone } = require('../utils/db');
const Order = require('../models/Order');
const Setting = require('../models/Setting');
const BackupService = require('../services/backupService');

async function getOrdersAsync() {
  try {
    return await Order.find({});
  } catch (e) {
    console.error("[Orders DB Get Error]", e.message);
    return [];
  }
}

async function saveOrderAsync(orderData) {
  try {
    await Order.updateOne({ orderId: orderData.orderId }, { $set: orderData }, { upsert: true });
  } catch (e) {
    console.error("[Orders DB Save Error]", e.message);
  }
}

async function getSettingsAsync() {
  try {
    const dbSettings = await Setting.findOne({});
    if (dbSettings) return dbSettings;
  } catch (_) {}
  return { freeShippingThreshold: 499, standardShippingFee: 49 };
}

// Handler for placing an order
const placeOrderHandler = async (req, res) => {
  try {
    const { customer, items, paymentMethod, orderId: clientOrderId, subtotal: clientSubtotal, shipping: clientShipping, total: clientTotal } = req.body;

    if (!customer || !customer.name || !customer.phone || !customer.address) {
      return res.status(400).json({ success: false, message: 'Please provide full customer details (name, phone, address)' });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart items cannot be empty' });
    }

    const sanitizedCustomer = {
      name: sanitizeInput(customer.name),
      phone: normalizePhone(customer.phone),
      email: customer.email ? sanitizeInput(customer.email) : '',
      address: sanitizeInput(customer.address)
    };

    const settings = await getSettingsAsync();
    const subtotal = clientSubtotal || items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
    const shipping = clientShipping !== undefined ? clientShipping : (subtotal >= (settings.freeShippingThreshold || 499) ? 0 : (settings.standardShippingFee || 49));
    const total = clientTotal || (subtotal + (typeof shipping === 'number' ? shipping : 0));

    const orderId = clientOrderId || `FM-ORD-${Math.floor(100000 + Math.random() * 900000)}`;

    const newOrder = {
      orderId,
      createdAt: new Date().toISOString(),
      customer: sanitizedCustomer,
      items,
      subtotal,
      shipping,
      total,
      paymentMethod: paymentMethod || 'Cash on Delivery',
      status: 'Order Placed',
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };

    await saveOrderAsync(newOrder);

    // Trigger real-time instant backup sync
    BackupService.triggerRealTimeBackup(`new_order_${newOrder.orderId}`);

    res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      order: newOrder
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Checkout failed', error: err.message });
  }
};

// Accept both POST /api/orders and POST /api/orders/checkout
router.post('/', placeOrderHandler);
router.post('/checkout', placeOrderHandler);

// GET /api/orders (Admin list all orders)
router.get('/', async (req, res) => {
  try {
    const orders = await getOrdersAsync();
    res.json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch orders', error: err.message });
  }
});

// GET /api/orders/track/:orderId
router.get('/track/:orderId', async (req, res) => {
  try {
    const orders = await getOrdersAsync();
    const rawQ = req.params.orderId.toLowerCase().trim();
    const cleanQ = rawQ.replace(/[^a-z0-9]/g, '');

    const order = orders.find(o => {
      if (!o || !o.orderId) return false;
      const rawOId = String(o.orderId).toLowerCase().trim();
      const cleanOId = rawOId.replace(/[^a-z0-9]/g, '');
      
      return (
        rawOId === rawQ ||
        cleanOId === cleanQ ||
        (cleanQ.length >= 4 && cleanOId.endsWith(cleanQ)) ||
        (cleanOId.length >= 4 && cleanQ.endsWith(cleanOId))
      );
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order tracking ID not found' });
    }

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Order tracking failed', error: err.message });
  }
});

// GET /api/orders/user/:phoneOrEmail (Fetch user order history)
router.get('/user/:phoneOrEmail', async (req, res) => {
  try {
    const rawKey = req.params.phoneOrEmail.toLowerCase().trim();
    const cleanDigits = normalizePhone(rawKey);
    const orders = await getOrdersAsync();

    const userOrders = orders.filter(o => {
      if (!o.customer) return false;
      const phone = normalizePhone(o.customer.phone);
      const email = o.customer.email ? o.customer.email.toLowerCase().trim() : '';
      return (cleanDigits && phone === cleanDigits) || email === rawKey;
    });

    res.json({
      success: true,
      count: userOrders.length,
      orders: userOrders
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch user order history', error: err.message });
  }
});

// PUT /api/orders/:orderId/status (Update Order Fulfillment Status)
router.put('/:orderId/status', async (req, res) => {
  try {
    const { status, shippingFee } = req.body;
    const orders = await getOrdersAsync();
    const orderIndex = orders.findIndex(o => o.orderId.toLowerCase() === req.params.orderId.toLowerCase());

    if (orderIndex === -1) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const targetOrder = { ...orders[orderIndex] };
    if (status) targetOrder.status = sanitizeInput(status);
    if (shippingFee !== undefined) {
      const parsedFee = parseFloat(shippingFee);
      targetOrder.shipping = parsedFee;
      targetOrder.total = (targetOrder.subtotal || 0) + parsedFee;
    }
    targetOrder.updatedAt = new Date().toISOString();

    await saveOrderAsync(targetOrder);

    res.json({
      success: true,
      message: `Order #${targetOrder.orderId} updated successfully!`,
      order: targetOrder
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update order status', error: err.message });
  }
});

module.exports = router;
