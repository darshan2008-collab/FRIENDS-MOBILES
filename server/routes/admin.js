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
      const custPhone = o.customer?.phone || '';
      const custAddr = o.customer?.address || '';
      const itemsFormatted = (o.items || []).map(i => `${i.title || 'Product'} (x${i.quantity || 1}) - Rs.${i.price || 0}`).join('; ');
      const subtotal = parseFloat(o.subtotal || o.total || 0);
      const shipping = (o.shipping === 0 || o.shipping === '0' || o.shipping === 'FREE' || subtotal >= 1000) ? 0 : (typeof o.shipping === 'number' ? o.shipping : 60);
      const total = parseFloat(o.total || (subtotal + shipping));
      const payMethod = o.paymentMethod || 'COD';
      const payStatus = o.paymentStatus || (payMethod === 'COD' ? 'Pending' : 'Paid');
      const orderStatus = o.status || 'Order Placed';
      const dateStr = o.createdAt ? new Date(o.createdAt).toLocaleString('en-IN') : new Date().toLocaleString('en-IN');
      const bg = idx % 2 === 0 ? '#ffffff' : '#f8fafc';

      return `
        <tr style="background-color: ${bg};">
          <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center; font-weight: bold; color: #ff5500;">${escapeXml(o.orderId)}</td>
          <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center;">${escapeXml(dateStr)}</td>
          <td style="border: 1px solid #cbd5e1; padding: 8px; font-weight: 600;">${escapeXml(custName)}</td>
          <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center;">${escapeXml(custPhone)}</td>
          <td style="border: 1px solid #cbd5e1; padding: 8px;">${escapeXml(custAddr)}</td>
          <td style="border: 1px solid #cbd5e1; padding: 8px;">${escapeXml(itemsFormatted)}</td>
          <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: right;">Rs. ${subtotal.toLocaleString('en-IN')}</td>
          <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: right; color: ${shipping === 0 ? '#16a34a' : '#1e293b'};">${shipping === 0 ? 'FREE' : `Rs. ${shipping}`}</td>
          <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: right; font-weight: bold; color: #ff5500;">Rs. ${total.toLocaleString('en-IN')}</td>
          <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center;">${escapeXml(payMethod)}</td>
          <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center;">${escapeXml(payStatus)}</td>
          <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center; font-weight: 600;">${escapeXml(orderStatus)}</td>
        </tr>
      `;
    }).join('');

    const htmlContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>Master Order History</x:Name>
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
          th { background-color: #FF5500; color: #ffffff; font-weight: bold; padding: 10px; border: 1px solid #ea580c; text-align: center; font-size: 13px; }
          td { padding: 8px; border: 1px solid #cbd5e1; vertical-align: middle; }
        </style>
      </head>
      <body>
        <table>
          <thead>
            <tr>
              <th style="width: 150px;">Order ID</th>
              <th style="width: 180px;">Order Date &amp; Time</th>
              <th style="width: 180px;">Customer Name</th>
              <th style="width: 140px;">Phone Number</th>
              <th style="width: 320px;">Delivery Address</th>
              <th style="width: 380px;">Products Added &amp; Quantity</th>
              <th style="width: 130px;">Subtotal (INR)</th>
              <th style="width: 140px;">Shipping Fee (INR)</th>
              <th style="width: 140px;">Grand Total (INR)</th>
              <th style="width: 130px;">Payment Method</th>
              <th style="width: 130px;">Payment Status</th>
              <th style="width: 140px;">Order Status</th>
            </tr>
          </thead>
          <tbody>
            ${rowsXml}
          </tbody>
        </table>
      </body>
      </html>
    `;

    fs.writeFileSync(filePath, '\uFEFF' + htmlContent, 'utf8');
    return filePath;
  } catch (err) {
    console.error("[Master Excel Sync Error]", err.message);
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

    const filename = `FRIENDS_MOBILE_Orders_Master_${new Date().toISOString().slice(0, 10)}.csv`;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
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
    res.status(500).json({ success: false, message: 'Failed to restore database backup', error: err.message });
  }
});

module.exports = router;
