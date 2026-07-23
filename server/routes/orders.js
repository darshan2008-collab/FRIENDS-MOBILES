const express = require('express');
const router = express.Router();
const path = require('path');
const mongoose = require('mongoose');
const { readData, writeData, sanitizeInput, normalizePhone } = require('../utils/db');
const Order = require('../models/Order');

const ordersFilePath = path.join(__dirname, '../data/orders.json');
const settingsFilePath = path.join(__dirname, '../data/settings.json');

async function getOrdersAsync() {
  if (mongoose.connection.readyState === 1) {
    try {
      const dbOrders = await Order.find({}).sort({ createdAt: -1 }).lean();
      if (dbOrders && dbOrders.length > 0) return dbOrders;
    } catch (_) {}
  }
  return readData(ordersFilePath, []);
}

async function saveOrderAsync(orderData) {
  // Save to JSON
  const fileOrders = readData(ordersFilePath, []);
  const idx = fileOrders.findIndex(o => o.orderId === orderData.orderId);
  if (idx >= 0) fileOrders[idx] = orderData;
  else fileOrders.unshift(orderData);
  writeData(ordersFilePath, fileOrders);

  // Save to MongoDB
  if (mongoose.connection.readyState === 1) {
    try {
      await Order.updateOne({ orderId: orderData.orderId }, { $set: orderData }, { upsert: true });
    } catch (_) {}
  }
}

function getSettings() {
  return readData(settingsFilePath, { freeShippingThreshold: 499, standardShippingFee: 49 });
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

    const settings = getSettings();
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
    const q = req.params.orderId.toLowerCase().trim();
    const order = orders.find(o => o.orderId && o.orderId.toLowerCase() === q);

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
