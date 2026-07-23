const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const connectDB = require('../config/db');

const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const Subscriber = require('../models/Subscriber');
const Setting = require('../models/Setting');

async function migrate() {
  const isConnected = await connectDB();
  if (!isConnected) {
    console.log('[Migration] Database offline or unavailable. Skipping migration step.');
    return;
  }

  const dataDir = path.join(__dirname, '../data');

  // Helper to safely read JSON
  const readJSON = (filename, fallback = []) => {
    const file = path.join(dataDir, filename);
    if (!fs.existsSync(file)) return fallback;
    try {
      const content = fs.readFileSync(file, 'utf8');
      return content ? JSON.parse(content) : fallback;
    } catch (e) {
      console.error(`[Migration Error] Failed to read ${filename}:`, e.message);
      return fallback;
    }
  };

  // 1. Products
  const products = readJSON('products.json', []);
  if (products.length > 0) {
    let pCount = 0;
    for (const p of products) {
      if (!p.id) continue;
      await Product.updateOne({ id: p.id }, { $set: p }, { upsert: true });
      pCount++;
    }
    console.log(`[Migration] Migrated/synced ${pCount} Products to MongoDB.`);
  }

  // 2. Orders
  const orders = readJSON('orders.json', []);
  if (orders.length > 0) {
    let oCount = 0;
    for (const o of orders) {
      if (!o.orderId) continue;
      await Order.updateOne({ orderId: o.orderId }, { $set: o }, { upsert: true });
      oCount++;
    }
    console.log(`[Migration] Migrated/synced ${oCount} Orders to MongoDB.`);
  }

  // 3. Users
  const users = readJSON('users.json', []);
  if (users.length > 0) {
    let uCount = 0;
    for (const u of users) {
      if (!u.phone && !u.email) continue;
      const query = u.phone ? { phone: u.phone } : { email: u.email };
      await User.updateOne(query, { $set: u }, { upsert: true });
      uCount++;
    }
    console.log(`[Migration] Migrated/synced ${uCount} Users to MongoDB.`);
  }

  // 4. Subscribers
  const subscribers = readJSON('subscribers.json', []);
  if (subscribers.length > 0) {
    let sCount = 0;
    for (const sub of subscribers) {
      const email = typeof sub === 'string' ? sub : sub.email;
      if (!email) continue;
      await Subscriber.updateOne({ email }, { $set: { email } }, { upsert: true });
      sCount++;
    }
    console.log(`[Migration] Migrated/synced ${sCount} Subscribers to MongoDB.`);
  }

  // 5. Settings
  const settings = readJSON('settings.json', null);
  if (settings) {
    await Setting.updateOne({}, { $set: settings }, { upsert: true });
    console.log(`[Migration] Migrated/synced Store Settings to MongoDB.`);
  }

  console.log('[Migration] All JSON database data successfully synced with MongoDB!');
}

if (require.main === module) {
  migrate().then(() => process.exit(0)).catch(err => {
    console.error('[Migration Error]', err);
    process.exit(1);
  });
}

module.exports = migrate;
