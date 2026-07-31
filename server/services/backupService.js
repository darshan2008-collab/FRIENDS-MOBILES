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
    const key = (u.email || u.phone || u.id || '').toString().toLowerCase();
    if (key) userMap.set(key, u.toObject ? u.toObject() : u);
  });
  (fileUsers || []).forEach(u => {
    if (!u) return;
    const key = (u.email || u.phone || u.id || '').toString().toLowerCase();
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
    const key = (o.orderId || o.id || '').toString().toLowerCase();
    if (key) orderMap.set(key, o.toObject ? o.toObject() : o);
  });
  (fileOrders || []).forEach(o => {
    if (!o) return;
    const key = (o.orderId || o.id || '').toString().toLowerCase();
    if (key && !orderMap.has(key)) orderMap.set(key, o);
  });
  const orders = Array.from(orderMap.values());

  // Merge Complaints
  const complaintMap = new Map();
  (dbComplaints || []).forEach(c => {
    if (!c) return;
    const key = (c.ticketId || c.id || '').toString();
    if (key) complaintMap.set(key, c.toObject ? c.toObject() : c);
  });
  (fileComplaints || []).forEach(c => {
    if (!c) return;
    const key = (c.ticketId || c.id || '').toString();
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

      // Upload files to Google Drive
      const driveResult = await GoogleDriveService.uploadBackupSnapshot(filePath, filename);
      await GoogleDriveService.uploadBackupSnapshot(usersFilePath, usersFilename).catch(() => {});
      await GoogleDriveService.uploadBackupSnapshot(ordersFilePath, ordersFilename).catch(() => {});
      await GoogleDriveService.uploadBackupSnapshot(productsFilePath, productsFilename).catch(() => {});

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
  }
};

module.exports = BackupService;
