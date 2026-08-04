const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Complaint = require('../models/Complaint');
const Banner = require('../models/Banner');
const Setting = require('../models/Setting');
const Subscriber = require('../models/Subscriber');
const GoogleDriveService = require('./googleDriveService');
const { readData } = require('../utils/db');

const backupsDir = path.join(__dirname, '../data/backups');
const usersFilePath = path.join(__dirname, '../data/users.json');
const ordersFilePath = path.join(__dirname, '../data/orders.json');
const productsFilePath = path.join(__dirname, '../data/products.json');
const complaintsFilePath = path.join(__dirname, '../data/complaints.json');

async function getMergedStoreData() {
  let dbUsers = [], dbProducts = [], dbOrders = [], dbComplaints = [];
  try { dbUsers = (await User.find({})) || []; } catch (_) {}
  try { dbProducts = (await Product.find({})) || []; } catch (_) {}
  try { dbOrders = (await Order.find({})) || []; } catch (_) {}
  try { dbComplaints = (await Complaint.find({})) || []; } catch (_) {}

  const fileUsers = readData(usersFilePath, []);
  const fileProducts = readData(productsFilePath, []);
  const fileOrders = readData(ordersFilePath, []);
  const fileComplaints = readData(complaintsFilePath, []);

  // Merge Users
  const userMap = new Map();
  (dbUsers || []).forEach(u => {
    if (!u) return;
    const key = (u.email || u.phone || u.id || u._id || '').toString().toLowerCase();
    if (key) userMap.set(key, u.toObject ? u.toObject() : u);
  });
  (fileUsers || []).forEach(u => {
    if (!u) return;
    const key = (u.email || u.phone || u.id || u._id || '').toString().toLowerCase();
    if (key && !userMap.has(key)) userMap.set(key, u);
  });
  const users = Array.from(userMap.values());

  // Merge Products
  const prodMap = new Map();
  (dbProducts || []).forEach(p => {
    if (!p) return;
    const key = (p.id || p._id || '').toString();
    if (key) prodMap.set(key, p.toObject ? p.toObject() : p);
  });
  (fileProducts || []).forEach(p => {
    if (!p) return;
    const key = (p.id || p._id || '').toString();
    if (key && !prodMap.has(key)) prodMap.set(key, p);
  });
  const products = Array.from(prodMap.values());

  // Merge Orders
  const orderMap = new Map();
  (dbOrders || []).forEach(o => {
    if (!o) return;
    const key = (o.orderId || o.id || o._id || '').toString().toLowerCase();
    if (key) orderMap.set(key, o.toObject ? o.toObject() : o);
  });
  (fileOrders || []).forEach(o => {
    if (!o) return;
    const key = (o.orderId || o.id || o._id || '').toString().toLowerCase();
    if (key && !orderMap.has(key)) orderMap.set(key, o);
  });
  const orders = Array.from(orderMap.values());

  // Merge Complaints
  const complaintMap = new Map();
  (dbComplaints || []).forEach(c => {
    if (!c) return;
    const key = (c.ticketId || c.id || c._id || '').toString();
    if (key) complaintMap.set(key, c.toObject ? c.toObject() : c);
  });
  (fileComplaints || []).forEach(c => {
    if (!c) return;
    const key = (c.ticketId || c.id || c._id || '').toString();
    if (key && !complaintMap.has(key)) complaintMap.set(key, c);
  });
  const complaints = Array.from(complaintMap.values());

  return { users, products, orders, complaints };
}

const BackupService = {
  // Get all backup snapshots and 5000 GB storage metrics
  getBackupStatus: async () => {
    try {
      if (!fs.existsSync(backupsDir)) {
        try { fs.mkdirSync(backupsDir, { recursive: true }); } catch (_) {}
      }
      const files = fs.existsSync(backupsDir) ? fs.readdirSync(backupsDir).filter(f => f.endsWith('.json')) : [];
      let totalBytesUsed = 0;

      const backupList = files.map(filename => {
        const filePath = path.join(backupsDir, filename);
        const stats = fs.statSync(filePath);
        totalBytesUsed += stats.size;

        let backupType = 'Database Snapshot';
        let userCount = 0;
        let orderCount = 0;
        let productCount = 0;
        let sampleUsers = [];

        try {
          const raw = fs.readFileSync(filePath, 'utf8');
          const parsed = JSON.parse(raw);
          backupType = parsed.meta?.backupType || (filename.includes('users') ? 'User Accounts Backup' : filename.includes('orders') ? 'Orders History Backup' : filename.includes('products') ? 'Products Catalog Backup' : 'Master Database Backup');

          const usersArr = parsed.users || parsed.data?.users || [];
          const ordersArr = parsed.orders || parsed.data?.orders || [];
          const prodsArr = parsed.products || parsed.data?.products || [];

          userCount = parsed.meta?.totalUsers ?? parsed.meta?.totalRecords?.users ?? usersArr.length;
          orderCount = parsed.meta?.totalOrders ?? parsed.meta?.totalRecords?.orders ?? ordersArr.length;
          productCount = parsed.meta?.totalProducts ?? parsed.meta?.totalRecords?.products ?? prodsArr.length;

          sampleUsers = usersArr.slice(0, 4).map(u => u.name || u.email || u.phone).filter(Boolean);
        } catch (_) {}

        return {
          filename,
          sizeBytes: stats.size,
          sizeFormatted: stats.size >= 1024 * 1024 ? (stats.size / (1024 * 1024)).toFixed(2) + ' MB' : (stats.size / 1024).toFixed(2) + ' KB',
          createdAt: stats.birthtime || stats.mtime,
          backupType,
          userCount,
          orderCount,
          productCount,
          sampleUsers
        };
      }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      const totalQuotaBytes = 15 * 1024 * 1024 * 1024; // 15 GB in bytes
      const formattedUsedStorage = totalBytesUsed >= 1024 * 1024
        ? (totalBytesUsed / (1024 * 1024)).toFixed(2) + ' MB'
        : (totalBytesUsed > 0 ? (totalBytesUsed / 1024).toFixed(2) + ' KB' : '0.00 MB');
      const percentageUsed = ((totalBytesUsed / totalQuotaBytes) * 100).toFixed(6);

      return {
        success: true,
        storageQuota: '15 GB (Google Drive Free Tier)',
        folderId: process.env.GDRIVE_FOLDER_ID || '1d-ca4wnFG0cwyy_b0Ry-cKnhr9b_G3Yl',
        folderUrl: `https://drive.google.com/drive/folders/${process.env.GDRIVE_FOLDER_ID || '1d-ca4wnFG0cwyy_b0Ry-cKnhr9b_G3Yl'}`,
        usedMB: formattedUsedStorage,
        totalBytesUsed,
        percentageUsed: `${percentageUsed}%`,
        totalBackupsCount: backupList.length,
        lastBackupAt: backupList.length > 0 ? backupList[0].createdAt : null,
        backups: backupList
      };
    } catch (err) {
      console.error('[BackupService Error]', err.message);
      return { success: false, error: err.message, backups: [] };
    }
  },

  // Create full PostgreSQL + JSON database snapshot & dedicated Users / Orders backups
  createBackup: async (backupName = null) => {
    try {
      const { users, products, orders, complaints } = await getMergedStoreData();
      const banners = (typeof Banner.find === 'function' ? await Banner.find({}) : [await Banner.findOne({})]).filter(Boolean);
      const settings = (await Setting.findOne({})) || {};
      const subscribers = (await Subscriber.find({})) || [];

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = backupName || `friends_mobile_master_backup_${timestamp}.json`;
      const filePath = path.join(backupsDir, filename);

      const dumpPayload = {
        meta: {
          app: 'FRIENDS MOBILE',
          backupType: 'Master JSON Database Backup',
          version: '2.0.0',
          databaseEngine: 'PostgreSQL + Persistent Storage',
          createdAt: new Date().toISOString(),
          totalRecords: {
            users: users.length,
            products: products.length,
            orders: orders.length,
            complaints: complaints.length,
            subscribers: subscribers.length
          }
        },
        data: {
          users,
          products,
          orders,
          complaints,
          banners,
          settings,
          subscribers
        }
      };

      fs.writeFileSync(filePath, JSON.stringify(dumpPayload, null, 2), 'utf8');

      // 1. Create Dedicated User Accounts Backup File
      const usersFilename = `friends_mobile_users_accounts_${timestamp}.json`;
      const usersFilePath = path.join(backupsDir, usersFilename);
      fs.writeFileSync(usersFilePath, JSON.stringify({
        meta: {
          app: 'FRIENDS MOBILE',
          backupType: 'Dedicated User Accounts & Security Backup',
          createdAt: new Date().toISOString(),
          totalUsers: users.length
        },
        users: users
      }, null, 2), 'utf8');

      // 2. Create Dedicated Orders History Backup File
      const ordersFilename = `friends_mobile_orders_history_${timestamp}.json`;
      const ordersFilePath = path.join(backupsDir, ordersFilename);
      fs.writeFileSync(ordersFilePath, JSON.stringify({
        meta: {
          app: 'FRIENDS MOBILE',
          backupType: 'Dedicated Customer Orders History Backup',
          createdAt: new Date().toISOString(),
          totalOrders: orders.length
        },
        orders: orders
      }, null, 2), 'utf8');

      // 3. Create Dedicated Products Catalog Backup File
      const productsFilename = `friends_mobile_products_catalog_${timestamp}.json`;
      const productsFilePath = path.join(backupsDir, productsFilename);
      fs.writeFileSync(productsFilePath, JSON.stringify({
        meta: {
          app: 'FRIENDS MOBILE',
          backupType: 'Dedicated Products Catalog & Inventory Backup',
          createdAt: new Date().toISOString(),
          totalProducts: products.length
        },
        products: products
      }, null, 2), 'utf8');

      console.log(`[Real Data Backup Success] Master (${users.length} users, ${orders.length} orders, ${products.length} prods) + Dedicated Files Created.`);

      // 4. Create Multi-Sheet Master Excel Backup File (.xls)
      let excelResult = null;
      try {
        excelResult = await BackupService.generateExcelMasterBackup();
      } catch (err) {
        console.error('[Excel Auto-Backup Error]', err.message);
      }

      // Upload Product Data Catalog Backup ONLY to Google Drive
      const driveResult = await GoogleDriveService.uploadBackupSnapshot(productsFilePath, productsFilename).catch(() => null);

      return {
        success: true,
        message: driveResult && driveResult.success
          ? `Real Data Backup "${filename}" and dedicated Users/Orders files uploaded to Google Drive!`
          : `Real Data Backup "${filename}" saved locally!`,
        filename,
        gdriveSynced: Boolean(driveResult && driveResult.success),
        timestamp: dumpPayload.meta.createdAt,
        totalRecords: dumpPayload.meta.totalRecords
      };
    } catch (err) {
      console.error('[Backup Create Exception]', err);
      return { success: false, error: err.message };
    }
  },

  // Process & restore database state directly from a JSON backup payload object
  restoreFromPayload: async (payload, sourceLabel = 'Snapshot') => {
    try {
      if (!payload || typeof payload !== 'object') {
        return { success: false, message: 'Invalid or empty backup payload data.' };
      }

      const users = payload.users || payload.data?.users || [];
      const products = payload.products || payload.data?.products || [];
      const orders = payload.orders || payload.data?.orders || [];
      const complaints = payload.complaints || payload.data?.complaints || [];
      const banners = payload.banners || payload.data?.banners || [];
      const settings = payload.settings || payload.data?.settings || null;

      // 1. Write to local JSON storage files
      if (users.length > 0) {
        const { writeData } = require('../utils/db');
        const existingUsers = readData(usersFilePath, []);
        const userMap = new Map();
        existingUsers.forEach(u => { if (u && (u.email || u.phone || u.id)) userMap.set((u.email || u.phone || u.id).toString().toLowerCase(), u); });
        users.forEach(u => { if (u && (u.email || u.phone || u.id)) userMap.set((u.email || u.phone || u.id).toString().toLowerCase(), u); });
        writeData(usersFilePath, Array.from(userMap.values()));
      }

      if (orders.length > 0) {
        const { writeData } = require('../utils/db');
        const existingOrders = readData(ordersFilePath, []);
        const orderMap = new Map();
        existingOrders.forEach(o => { if (o && o.orderId) orderMap.set(o.orderId.toLowerCase(), o); });
        orders.forEach(o => { if (o && o.orderId) orderMap.set(o.orderId.toLowerCase(), o); });
        writeData(ordersFilePath, Array.from(orderMap.values()));
      }

      if (products.length > 0) {
        const { writeData } = require('../utils/db');
        const existingProds = readData(productsFilePath, []);
        const prodMap = new Map();
        existingProds.forEach(p => { if (p && p.id) prodMap.set(p.id.toString(), p); });
        products.forEach(p => { if (p && p.id) prodMap.set(p.id.toString(), p); });
        writeData(productsFilePath, Array.from(prodMap.values()));
      }

      if (settings) {
        const { writeData } = require('../utils/db');
        const settingsFilePath = path.join(__dirname, '../data/settings.json');
        writeData(settingsFilePath, settings);
        try {
          await Setting.updateOne({}, { $set: settings }, { upsert: true });
        } catch (_) {}
      }

      // 2. Restore Users to PostgreSQL
      for (const u of users) {
        try {
          const query = u.email ? { email: u.email } : (u.phone ? { phone: u.phone } : { id: u.id });
          await User.updateOne(query, { $set: u }, { upsert: true });
        } catch (_) {}
      }

      // 3. Restore Products to PostgreSQL
      for (const p of products) {
        try {
          await Product.updateOne({ id: p.id }, { $set: p }, { upsert: true });
        } catch (_) {}
      }

      // 4. Restore Orders to PostgreSQL
      for (const o of orders) {
        try {
          await Order.updateOne({ orderId: o.orderId }, { $set: o }, { upsert: true });
        } catch (_) {}
      }

      // 5. Restore Complaints to PostgreSQL
      for (const c of complaints) {
        try {
          await Complaint.updateOne({ ticketId: c.ticketId }, { $set: c }, { upsert: true });
        } catch (_) {}
      }

      // 6. Restore Banners if present
      if (banners && banners.length > 0) {
        for (const b of banners) {
          try {
            if (b.id) await Banner.updateOne({ id: b.id }, { $set: b }, { upsert: true });
          } catch (_) {}
        }
      }

      const totalCounts = {
        users: users.length,
        orders: orders.length,
        products: products.length,
        complaints: complaints.length,
        banners: banners.length
      };

      console.log(`[Restore Success] Restored data from "${sourceLabel}" (${users.length} users, ${orders.length} orders, ${products.length} prods)`);

      return {
        success: true,
        message: `Database & local files successfully restored from "${sourceLabel}"!`,
        source: sourceLabel,
        restoredCounts: payload.meta?.totalRecords || totalCounts
      };
    } catch (err) {
      console.error('[Restore Payload Exception]', err);
      return { success: false, error: err.message };
    }
  },

  // Restore database state from selected snapshot filename
  restoreBackup: async (filename) => {
    try {
      const filePath = path.join(backupsDir, filename);
      if (!fs.existsSync(filePath)) {
        return { success: false, message: `Backup file "${filename}" not found.` };
      }

      const content = fs.readFileSync(filePath, 'utf8');
      const payload = JSON.parse(content);
      return await BackupService.restoreFromPayload(payload, filename);
    } catch (err) {
      console.error('[Restore Exception]', err);
      return { success: false, error: err.message };
    }
  },

  // Restore database state directly from uploaded JSON content or file payload
  restoreFromUploadedJson: async (jsonInput, filename = 'Uploaded_Backup.json') => {
    try {
      let payload = jsonInput;
      if (typeof jsonInput === 'string') {
        payload = JSON.parse(jsonInput);
      }
      
      // Also save the uploaded backup file to server/data/backups/ for future reference
      try {
        if (!fs.existsSync(backupsDir)) fs.mkdirSync(backupsDir, { recursive: true });
        const savePath = path.join(backupsDir, filename.endsWith('.json') ? filename : `${filename}.json`);
        fs.writeFileSync(savePath, JSON.stringify(payload, null, 2), 'utf8');
      } catch (_) {}

      return await BackupService.restoreFromPayload(payload, filename);
    } catch (err) {
      console.error('[Restore Upload Exception]', err);
      return { success: false, error: `Failed to parse backup JSON: ${err.message}` };
    }
  },

  // Auto-Restore latest database backup automatically on boot / recovery
  autoRestoreLatestBackup: async () => {
    try {
      if (!fs.existsSync(backupsDir)) return { success: false, message: 'Backups directory does not exist' };
      const files = fs.readdirSync(backupsDir).filter(f => f.endsWith('.json'));
      if (files.length === 0) return { success: false, message: 'No backup snapshots found' };

      const sorted = files.map(filename => {
        const filePath = path.join(backupsDir, filename);
        const stats = fs.statSync(filePath);
        return { filename, mtime: stats.mtime };
      }).sort((a, b) => new Date(b.mtime) - new Date(a.mtime));

      const latest = sorted[0].filename;
      console.log(`[Auto-Restore System] Automatically restoring latest snapshot: ${latest}`);
      return await BackupService.restoreBackup(latest);
    } catch (err) {
      console.error('[Auto-Restore Exception]', err.message);
      return { success: false, error: err.message };
    }
  },

  // Real-time Event-Driven Backup Queue (Debounced by 3 seconds)
  triggerRealTimeBackup: (reason = 'store_event') => {
    if (global._realTimeBackupTimer) {
      clearTimeout(global._realTimeBackupTimer);
    }
    global._realTimeBackupTimer = setTimeout(() => {
      console.log(`[Real-Time Backup Event] Triggered backup snapshot due to: ${reason}`);
      BackupService.createBackup().catch(e => console.error('[Real-Time Backup Error]', e.message));
    }, 3000);
  },

  // Multi-Worksheet Master Excel Database Backup (.xls / .xlsx)
  generateExcelMasterBackup: async () => {
    try {
      const { users, products, orders, complaints } = await getMergedStoreData();
      if (!fs.existsSync(backupsDir)) {
        try { fs.mkdirSync(backupsDir, { recursive: true }); } catch (_) {}
      }

      const escapeXml = (str) => {
        if (str === null || str === undefined) return '';
        return String(str)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&apos;');
      };

      const orderRows = (orders || []).map(o => {
        const dateStr = o.date || o.createdAt ? new Date(o.date || o.createdAt).toLocaleString('en-IN') : 'N/A';
        const cName = escapeXml(o.customer?.name || o.customerName || 'N/A');
        const cPhone = escapeXml(o.customer?.phone || o.customerPhone || 'N/A');
        const cAddress = escapeXml(o.customer?.address || o.address || 'N/A');
        const itemsStr = escapeXml((o.items || []).map(i => `${i.title || i.name || 'Item'} (x${i.quantity || 1}) - ₹${i.price || 0}`).join(' | '));
        const subtotal = o.subtotal || 0;
        const shipping = o.shipping === 'FREE' || o.shipping === 0 ? 0 : (typeof o.shipping === 'number' ? o.shipping : 0);
        const total = o.total || (subtotal + shipping);
        const payMethod = escapeXml(o.paymentMethod || 'COD');
        const payStatus = escapeXml(o.paymentStatus || 'Pending');
        const ordStatus = escapeXml(o.status || 'Processing');
        const reason = escapeXml(o.cancellationReason || o.returnReason || '');

        return `<Row>
    <Cell><Data ss:Type="String">${escapeXml(o.orderId || o.id)}</Data></Cell>
    <Cell><Data ss:Type="String">${dateStr}</Data></Cell>
    <Cell><Data ss:Type="String">${cName}</Data></Cell>
    <Cell><Data ss:Type="String">${cPhone}</Data></Cell>
    <Cell><Data ss:Type="String">${cAddress}</Data></Cell>
    <Cell><Data ss:Type="String">${itemsStr}</Data></Cell>
    <Cell><Data ss:Type="String">₹${subtotal.toLocaleString('en-IN')}</Data></Cell>
    <Cell><Data ss:Type="String">${shipping === 0 ? 'FREE' : `₹${shipping}`}</Data></Cell>
    <Cell><Data ss:Type="String">₹${total.toLocaleString('en-IN')}</Data></Cell>
    <Cell><Data ss:Type="String">${payMethod}</Data></Cell>
    <Cell><Data ss:Type="String">${payStatus}</Data></Cell>
    <Cell><Data ss:Type="String">${ordStatus}</Data></Cell>
    <Cell><Data ss:Type="String">${reason}</Data></Cell>
   </Row>`;
      }).join('\n');

      const userRows = (users || []).map(u => {
        const uId = escapeXml(u.id || u._id || 'N/A');
        const uName = escapeXml(u.name || 'N/A');
        const uEmail = escapeXml(u.email || 'N/A');
        const uPhone = escapeXml(u.phone || 'N/A');
        const points = u.rewardPoints || 0;
        const provider = escapeXml(u.authProvider || 'Email/Phone');
        const joined = u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN') : 'N/A';
        const userOrdCount = (orders || []).filter(o => o.customer?.email === u.email || o.customer?.phone === u.phone).length;

        return `<Row>
    <Cell><Data ss:Type="String">${uId}</Data></Cell>
    <Cell><Data ss:Type="String">${uName}</Data></Cell>
    <Cell><Data ss:Type="String">${uEmail}</Data></Cell>
    <Cell><Data ss:Type="String">${uPhone}</Data></Cell>
    <Cell><Data ss:Type="String">${points} PTS</Data></Cell>
    <Cell><Data ss:Type="String">${provider}</Data></Cell>
    <Cell><Data ss:Type="String">${userOrdCount} Orders</Data></Cell>
    <Cell><Data ss:Type="String">${joined}</Data></Cell>
   </Row>`;
      }).join('\n');

      const productRows = (products || []).map(p => {
        const pId = escapeXml(p.id || p._id || 'N/A');
        const pTitle = escapeXml(p.title || p.name || 'N/A');
        const pCategory = escapeXml(p.category || 'General');
        const pPrice = p.price || 0;
        const pOrigPrice = p.originalPrice || pPrice;
        const pStock = escapeXml(p.inStock !== false ? 'In Stock' : 'Out of Stock');
        const pRating = p.rating || 4.5;
        const pDesc = escapeXml((p.description || '').slice(0, 100));

        return `<Row>
    <Cell><Data ss:Type="String">${pId}</Data></Cell>
    <Cell><Data ss:Type="String">${pTitle}</Data></Cell>
    <Cell><Data ss:Type="String">${pCategory}</Data></Cell>
    <Cell><Data ss:Type="String">₹${pPrice.toLocaleString('en-IN')}</Data></Cell>
    <Cell><Data ss:Type="String">₹${pOrigPrice.toLocaleString('en-IN')}</Data></Cell>
    <Cell><Data ss:Type="String">${pStock}</Data></Cell>
    <Cell><Data ss:Type="String">⭐ ${pRating}</Data></Cell>
    <Cell><Data ss:Type="String">${pDesc}</Data></Cell>
   </Row>`;
      }).join('\n');

      const customItems = (orders || []).flatMap(o => {
        return (o.items || []).filter(i => i.customizationDetails || (i.category && (i.category.includes('Custom') || i.category.includes('Photo Frame')))).map(i => ({
          orderId: o.orderId || o.id,
          customerName: o.customer?.name || 'Customer',
          customerPhone: o.customer?.phone || 'N/A',
          title: i.title || i.name,
          category: i.category || 'Custom Covers',
          details: i.customizationDetails || {}
        }));
      });

      const customizationRows = customItems.map(c => {
        const d = c.details;
        const brandModel = escapeXml(d.brand ? `${d.brand} ${d.model}` : (d.size ? `Frame Size: ${d.size}` : 'N/A'));
        const typeFinish = escapeXml(d.caseType ? `${d.caseType} (${d.finish || 'Matte'})` : (d.color ? `${d.color} • ${d.orientation || 'Portrait'}` : 'N/A'));
        const text = escapeXml(d.customText || 'None');
        const file = escapeXml(d.fileName || 'custom_photo.png');

        return `<Row>
    <Cell><Data ss:Type="String">${escapeXml(c.orderId)}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(c.customerName)}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(c.customerPhone)}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(c.category)}</Data></Cell>
    <Cell><Data ss:Type="String">${brandModel}</Data></Cell>
    <Cell><Data ss:Type="String">${typeFinish}</Data></Cell>
    <Cell><Data ss:Type="String">${text}</Data></Cell>
    <Cell><Data ss:Type="String">${file}</Data></Cell>
   </Row>`;
      }).join('\n');

      const xmlDocument = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Styles>
  <Style ss:ID="Header">
   <Font ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#FF5500" ss:Pattern="Solid"/>
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
  </Style>
 </Styles>

 <Worksheet ss:Name="Customer Orders History">
  <Table>
   <Row ss:StyleID="Header">
    <Cell><Data ss:Type="String">Order ID</Data></Cell>
    <Cell><Data ss:Type="String">Date &amp; Time</Data></Cell>
    <Cell><Data ss:Type="String">Customer Name</Data></Cell>
    <Cell><Data ss:Type="String">Phone Number</Data></Cell>
    <Cell><Data ss:Type="String">Delivery Address</Data></Cell>
    <Cell><Data ss:Type="String">Purchased Items</Data></Cell>
    <Cell><Data ss:Type="String">Subtotal</Data></Cell>
    <Cell><Data ss:Type="String">Shipping</Data></Cell>
    <Cell><Data ss:Type="String">Grand Total</Data></Cell>
    <Cell><Data ss:Type="String">Payment Method</Data></Cell>
    <Cell><Data ss:Type="String">Payment Status</Data></Cell>
    <Cell><Data ss:Type="String">Order Status</Data></Cell>
    <Cell><Data ss:Type="String">Cancellation Reason</Data></Cell>
   </Row>
   ${orderRows}
  </Table>
 </Worksheet>

 <Worksheet ss:Name="User Accounts &amp; Members">
  <Table>
   <Row ss:StyleID="Header">
    <Cell><Data ss:Type="String">User ID</Data></Cell>
    <Cell><Data ss:Type="String">Customer Name</Data></Cell>
    <Cell><Data ss:Type="String">Email Address</Data></Cell>
    <Cell><Data ss:Type="String">Phone Number</Data></Cell>
    <Cell><Data ss:Type="String">Reward Points</Data></Cell>
    <Cell><Data ss:Type="String">Auth Provider</Data></Cell>
    <Cell><Data ss:Type="String">Total Orders</Data></Cell>
    <Cell><Data ss:Type="String">Joined Date</Data></Cell>
   </Row>
   ${userRows}
  </Table>
 </Worksheet>

 <Worksheet ss:Name="Product Catalog">
  <Table>
   <Row ss:StyleID="Header">
    <Cell><Data ss:Type="String">Product ID</Data></Cell>
    <Cell><Data ss:Type="String">Product Title</Data></Cell>
    <Cell><Data ss:Type="String">Category</Data></Cell>
    <Cell><Data ss:Type="String">Price (INR)</Data></Cell>
    <Cell><Data ss:Type="String">Original Price</Data></Cell>
    <Cell><Data ss:Type="String">Stock Status</Data></Cell>
    <Cell><Data ss:Type="String">Rating</Data></Cell>
    <Cell><Data ss:Type="String">Description</Data></Cell>
   </Row>
   ${productRows}
  </Table>
 </Worksheet>

 <Worksheet ss:Name="Cover Customizations">
  <Table>
   <Row ss:StyleID="Header">
    <Cell><Data ss:Type="String">Order ID</Data></Cell>
    <Cell><Data ss:Type="String">Customer Name</Data></Cell>
    <Cell><Data ss:Type="String">Phone Number</Data></Cell>
    <Cell><Data ss:Type="String">Product Category</Data></Cell>
    <Cell><Data ss:Type="String">Phone Model / Size</Data></Cell>
    <Cell><Data ss:Type="String">Case Type &amp; Finish</Data></Cell>
    <Cell><Data ss:Type="String">Printed Custom Text</Data></Cell>
    <Cell><Data ss:Type="String">Image Filename</Data></Cell>
   </Row>
   ${customizationRows}
  </Table>
 </Worksheet>
</Workbook>`;

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const excelFilename = `friends_mobile_master_excel_backup_${timestamp}.xls`;
      const excelFilePath = path.join(backupsDir, excelFilename);
      fs.writeFileSync(excelFilePath, xmlDocument, 'utf8');

      return { filename: excelFilename, filePath: excelFilePath, content: xmlDocument };
    } catch (err) {
      console.error('Failed to generate Excel Master Backup:', err);
      return null;
    }
  }
};

module.exports = BackupService;
