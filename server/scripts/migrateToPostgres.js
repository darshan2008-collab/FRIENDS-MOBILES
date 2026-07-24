const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { pool, query, connectDB } = require('../config/db');

async function migrate() {
  console.log('[PostgreSQL Migration] Starting data migration & backup process...');

  const dataDir = path.join(__dirname, '../data');
  const backupDir = path.join(__dirname, '../data/backup_pre_postgres');

  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  // 1. Create safety backups of existing JSON files
  const filesToBackup = ['products.json', 'orders.json', 'users.json', 'subscribers.json', 'settings.json', 'banners.json'];
  for (const f of filesToBackup) {
    const src = path.join(dataDir, f);
    const dest = path.join(backupDir, f);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
      console.log(`[Backup] Pre-migration backup created: ${f}`);
    }
  }

  const isConnected = await connectDB();
  if (!isConnected) {
    console.log('[PostgreSQL Migration] Database unavailable at the moment. Migration will auto-run when DB container starts.');
    return;
  }

  const readJSON = (filename, fallback = []) => {
    const file = path.join(dataDir, filename);
    if (!fs.existsSync(file)) return fallback;
    try {
      const content = fs.readFileSync(file, 'utf8');
      return content ? JSON.parse(content) : fallback;
    } catch (e) {
      console.error(`[Migration Read Error] ${filename}:`, e.message);
      return fallback;
    }
  };

  // 2. Migrate Products
  const products = readJSON('products.json', []);
  if (products.length > 0) {
    let pCount = 0;
    for (const p of products) {
      if (!p.id) continue;
      await query(`
        INSERT INTO products (id, title, category, discount, price, original_price, rating, reviews, in_stock, stock, img, fallback, description, brand, badge, is_trending, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW(), NOW())
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          category = EXCLUDED.category,
          discount = EXCLUDED.discount,
          price = EXCLUDED.price,
          original_price = EXCLUDED.original_price,
          rating = EXCLUDED.rating,
          reviews = EXCLUDED.reviews,
          in_stock = EXCLUDED.in_stock,
          stock = EXCLUDED.stock,
          img = EXCLUDED.img,
          fallback = EXCLUDED.fallback,
          description = EXCLUDED.description,
          brand = EXCLUDED.brand,
          badge = EXCLUDED.badge,
          is_trending = EXCLUDED.is_trending,
          updated_at = NOW();
      `, [
        p.id,
        p.title || 'Product',
        p.category || 'Accessories',
        p.discount || '',
        parseFloat(p.price || 0),
        parseFloat(p.originalPrice || p.price || 0),
        parseFloat(p.rating || 5.0),
        parseInt(p.reviews || 0),
        p.inStock !== undefined ? Boolean(p.inStock) : true,
        parseInt(p.stock || 50),
        p.img || '',
        p.fallback || p.img || '',
        p.description || '',
        p.brand || '',
        p.badge || '',
        Boolean(p.isTrending)
      ]);
      pCount++;
    }
    console.log(`[PostgreSQL Migration] Migrated ${pCount} Products to PostgreSQL.`);
  }

  // 3. Migrate Users
  const users = readJSON('users.json', []);
  if (users.length > 0) {
    let uCount = 0;
    for (const u of users) {
      if (!u.phone && !u.email) continue;
      const email = u.email ? u.email.toLowerCase().trim() : '';
      const phone = u.phone ? String(u.phone).trim() : '';
      const name = u.name || (email ? email.split('@')[0] : 'User');
      const password = u.password || 'no_pass';
      const address = u.address || '';
      const pincode = u.pincode || '';
      const role = u.role || 'customer';
      const googleId = u.googleId || '';
      const picture = u.picture || '';
      const authProvider = u.authProvider || 'local';

      // Check existing by email or phone
      const checkRes = await query(
        'SELECT id FROM users WHERE (email != \'\' AND email = $1) OR (phone != \'\' AND phone = $2)',
        [email, phone]
      );

      if (checkRes.rows.length > 0) {
        await query(`
          UPDATE users SET
            name = $1, email = $2, phone = $3, password = $4, address = $5, pincode = $6, role = $7, google_id = $8, picture = $9, auth_provider = $10, updated_at = NOW()
          WHERE id = $11
        `, [name, email, phone, password, address, pincode, role, googleId, picture, authProvider, checkRes.rows[0].id]);
      } else {
        await query(`
          INSERT INTO users (name, email, phone, password, address, pincode, role, google_id, picture, auth_provider)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `, [name, email, phone, password, address, pincode, role, googleId, picture, authProvider]);
      }
      uCount++;
    }
    console.log(`[PostgreSQL Migration] Migrated ${uCount} Users to PostgreSQL.`);
  }

  // 4. Migrate Orders
  const orders = readJSON('orders.json', []);
  if (orders.length > 0) {
    let oCount = 0;
    for (const o of orders) {
      if (!o.orderId) continue;
      await query(`
        INSERT INTO orders (order_id, customer, items, total, subtotal, shipping_fee, payment_method, payment_status, status, razorpay_order_id, razorpay_payment_id, estimated_delivery, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
        ON CONFLICT (order_id) DO UPDATE SET
          customer = EXCLUDED.customer,
          items = EXCLUDED.items,
          total = EXCLUDED.total,
          subtotal = EXCLUDED.subtotal,
          shipping_fee = EXCLUDED.shipping_fee,
          payment_method = EXCLUDED.payment_method,
          payment_status = EXCLUDED.payment_status,
          status = EXCLUDED.status,
          razorpay_order_id = EXCLUDED.razorpay_order_id,
          razorpay_payment_id = EXCLUDED.razorpay_payment_id,
          estimated_delivery = EXCLUDED.estimated_delivery,
          updated_at = NOW();
      `, [
        o.orderId,
        JSON.stringify(o.customer || {}),
        JSON.stringify(o.items || []),
        parseFloat(o.total || 0),
        parseFloat(o.subtotal || 0),
        parseFloat(o.shipping || o.shippingFee || 0),
        o.paymentMethod || 'COD',
        o.paymentStatus || 'Pending',
        o.status || 'Order Placed',
        o.razorpayOrderId || '',
        o.razorpayPaymentId || '',
        o.estimatedDelivery || ''
      ]);
      oCount++;
    }
    console.log(`[PostgreSQL Migration] Migrated ${oCount} Orders to PostgreSQL.`);
  }

  // 5. Migrate Subscribers
  const subscribers = readJSON('subscribers.json', []);
  if (subscribers.length > 0) {
    let sCount = 0;
    for (const sub of subscribers) {
      const email = typeof sub === 'string' ? sub : sub.email;
      if (!email) continue;
      const cleanEmail = email.toLowerCase().trim();
      await query(`
        INSERT INTO subscribers (email)
        VALUES ($1)
        ON CONFLICT (email) DO NOTHING;
      `, [cleanEmail]);
      sCount++;
    }
    console.log(`[PostgreSQL Migration] Migrated ${sCount} Subscribers to PostgreSQL.`);
  }

  // 6. Migrate Store Settings
  const settings = readJSON('settings.json', null);
  if (settings) {
    await query(`
      INSERT INTO settings (id, free_shipping_threshold, standard_shipping_fee, store_name, store_city, store_phone)
      VALUES (1, $1, $2, $3, $4, $5)
      ON CONFLICT (id) DO UPDATE SET
        free_shipping_threshold = EXCLUDED.free_shipping_threshold,
        standard_shipping_fee = EXCLUDED.standard_shipping_fee,
        store_name = EXCLUDED.store_name,
        store_city = EXCLUDED.store_city,
        store_phone = EXCLUDED.store_phone,
        updated_at = NOW();
    `, [
      parseFloat(settings.freeShippingThreshold || 499),
      parseFloat(settings.standardShippingFee || 49),
      settings.storeName || 'FRIENDS MOBILE',
      settings.storeCity || 'Madurai, Tamil Nadu',
      settings.storePhone || '+91 74485 78507'
    ]);
    console.log(`[PostgreSQL Migration] Migrated Store Settings to PostgreSQL.`);
  }

  // 7. Migrate Banners
  const banners = readJSON('banners.json', null);
  if (banners && Array.isArray(banners) && banners.length > 0) {
    await query(`
      INSERT INTO banners (id, slides)
      VALUES (1, $1)
      ON CONFLICT (id) DO UPDATE SET
        slides = EXCLUDED.slides,
        updated_at = NOW();
    `, [JSON.stringify(banners)]);
    console.log(`[PostgreSQL Migration] Migrated ${banners.length} Banner slides to PostgreSQL.`);
  }

  console.log('[PostgreSQL Migration] All data successfully synced with PostgreSQL!');
}

if (require.main === module) {
  migrate().then(() => process.exit(0)).catch(err => {
    console.error('[PostgreSQL Migration Error]', err);
    process.exit(1);
  });
}

module.exports = migrate;
