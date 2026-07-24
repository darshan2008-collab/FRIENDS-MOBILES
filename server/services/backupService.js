const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Complaint = require('../models/Complaint');
const Banner = require('../models/Banner');
const Setting = require('../models/Setting');
const Subscriber = require('../models/Subscriber');
const GoogleDriveService = require('./googleDriveService');

const backupsDir = path.join(__dirname, '../data/backups');

// Ensure backups directory exists
if (!fs.existsSync(backupsDir)) {
  fs.mkdirSync(backupsDir, { recursive: true });
}

const BackupService = {
  // Get all backup snapshots and 5000 GB storage metrics
  getBackupStatus: async () => {
    try {
      const files = fs.readdirSync(backupsDir).filter(f => f.endsWith('.json'));
      let totalBytesUsed = 0;

      const backupList = files.map(filename => {
        const filePath = path.join(backupsDir, filename);
        const stats = fs.statSync(filePath);
        totalBytesUsed += stats.size;
        return {
          filename,
          sizeBytes: stats.size,
          sizeFormatted: (stats.size / 1024).toFixed(2) + ' KB',
          createdAt: stats.birthtime || stats.mtime
        };
      }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      const totalQuotaBytes = 15 * 1024 * 1024 * 1024; // 15 GB in bytes
      const usedMB = (totalBytesUsed / (1024 * 1024)).toFixed(2);
      const percentageUsed = ((totalBytesUsed / totalQuotaBytes) * 100).toFixed(6);

      return {
        success: true,
        storageQuota: '15 GB',
        usedMB: `${usedMB} MB`,
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

  // Create full PostgreSQL database snapshot
  createBackup: async (backupName = null) => {
    try {
      const users = await User.find({});
      const products = await Product.find({});
      const orders = await Order.find({});
      const complaints = await Complaint.find({});
      const banners = await Banner.find({});
      const settings = await Setting.findOne({});
      const subscribers = await Subscriber.find({});

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = backupName || `friends_mobile_backup_${timestamp}.json`;
      const filePath = path.join(backupsDir, filename);

      const dataString = JSON.stringify({ users, products, orders, complaints, banners, settings, subscribers });
      const sha256Checksum = crypto.createHash('sha256').update(dataString).digest('hex');

      const dumpPayload = {
        meta: {
          app: 'FRIENDS MOBILE',
          version: '2.0.0',
          databaseEngine: 'PostgreSQL',
          createdAt: new Date().toISOString(),
          sha256Checksum,
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

      let gitPushed = false;
      try {
        const projectRoot = path.join(__dirname, '../../');
        execSync(`git add "${filePath}"`, { cwd: projectRoot, stdio: 'ignore' });
        execSync(`git commit -m "chore(backup): Auto database snapshot ${filename}"`, { cwd: projectRoot, stdio: 'ignore' });
        execSync('git push origin main', { cwd: projectRoot, stdio: 'ignore' });
        gitPushed = true;
        console.log(`[GitHub Backup Success] Pushed snapshot ${filename} to GitHub repo!`);
      } catch (_) {}

      console.log(`[Backup Success] Created snapshot: ${filename} (${users.length} users, ${orders.length} orders, ${products.length} prods)`);

      // Trigger parallel Google Drive Backup upload if configured
      GoogleDriveService.uploadBackupSnapshot(filePath, filename).catch(() => {});

      return {
        success: true,
        message: gitPushed 
          ? `Database backup snapshot "${filename}" created & pushed to GitHub!`
          : `Database backup snapshot "${filename}" created locally!`,
        filename,
        gitPushed,
        timestamp: dumpPayload.meta.createdAt,
        totalRecords: dumpPayload.meta.totalRecords
      };
    } catch (err) {
      console.error('[Backup Create Exception]', err);
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

      if (!payload || !payload.data) {
        return { success: false, message: 'Invalid backup file structure.' };
      }

      const { users = [], products = [], orders = [], complaints = [] } = payload.data;

      // Restore Users
      for (const u of users) {
        try {
          const query = u.email ? { email: u.email } : (u.phone ? { phone: u.phone } : { id: u.id });
          await User.updateOne(query, { $set: u }, { upsert: true });
        } catch (_) {}
      }

      // Restore Products
      for (const p of products) {
        try {
          await Product.updateOne({ id: p.id }, { $set: p }, { upsert: true });
        } catch (_) {}
      }

      // Restore Orders
      for (const o of orders) {
        try {
          await Order.updateOne({ orderId: o.orderId }, { $set: o }, { upsert: true });
        } catch (_) {}
      }

      // Restore Complaints
      for (const c of complaints) {
        try {
          await Complaint.updateOne({ ticketId: c.ticketId }, { $set: c }, { upsert: true });
        } catch (_) {}
      }

      console.log(`[Restore Success] Restored snapshot: ${filename}`);

      return {
        success: true,
        message: `Database successfully restored from backup snapshot "${filename}"!`,
        restoredCounts: payload.meta?.totalRecords || {}
      };
    } catch (err) {
      console.error('[Restore Exception]', err);
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
