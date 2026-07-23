const express = require('express');
const router = express.Router();
const path = require('path');
const { readData, writeData, sanitizeInput, normalizePhone } = require('../utils/db');

const ordersFilePath = path.join(__dirname, '../data/orders.json');
const settingsFilePath = path.join(__dirname, '../data/settings.json');

function getOrders() {
  return readData(ordersFilePath, []);
}

function saveOrders(orders) {
  return writeData(ordersFilePath, orders);
}

function getSettings() {
  return readData(settingsFilePath, { freeShippingThreshold: 499, standardShippingFee: 49 });
}

const placeOrderHandler = (req, res) => {
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

    const orders = getOrders();
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

    orders.unshift(newOrder);
    saveOrders(orders);

    res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      order: newOrder
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Checkout failed', error: err.message });
  }
};

router.post('/', placeOrderHandler);
router.post('/checkout', placeOrderHandler);

router.get('/', (req, res) => {
  try {
    const orders = getOrders();
    res.json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch orders', error: err.message });
  }
});

router.get('/track/:orderId', (req, res) => {
  try {
    const orders = getOrders();
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

router.get('/user/:phoneOrEmail', (req, res) => {
  try {
    const rawKey = req.params.phoneOrEmail.toLowerCase().trim();
    const cleanDigits = normalizePhone(rawKey);
    const orders = getOrders();

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

router.put('/:orderId/status', (req, res) => {
  try {
    const { status, shippingFee } = req.body;
    const orders = getOrders();
    const orderIndex = orders.findIndex(o => o.orderId.toLowerCase() === req.params.orderId.toLowerCase());

    if (orderIndex === -1) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (status) orders[orderIndex].status = sanitizeInput(status);
    if (shippingFee !== undefined) {
      const parsedFee = parseFloat(shippingFee);
      orders[orderIndex].shipping = parsedFee;
      orders[orderIndex].total = orders[orderIndex].subtotal + parsedFee;
    }
    orders[orderIndex].updatedAt = new Date().toISOString();

    saveOrders(orders);

    res.json({
      success: true,
      message: `Order #${orders[orderIndex].orderId} updated successfully!`,
      order: orders[orderIndex]
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update order status', error: err.message });
  }
});

module.exports = router;
