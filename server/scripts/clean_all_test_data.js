const fs = require('fs');
const path = require('path');
const { pool, connectDB, query } = require('../config/db');

async function runCleanup() {
  console.log('====================================================');
  console.log('  FRIENDS MOBILE - CLEANUP DEMO & TEST DATA');
  console.log('====================================================\n');

  const connected = await connectDB();
  console.log('[PostgreSQL] Connection status:', connected ? 'CONNECTED' : 'FAILED');

  const serverDataDir = path.join(__dirname, '../data');
  const backendDataDir = path.join(__dirname, '../../backend/data');
  const backupsDir = path.join(serverDataDir, 'backups');
  const archiveDir = path.join(backupsDir, 'test_archive');

  // 1. Create Archive Directory and move any old backup files
  if (!fs.existsSync(archiveDir)) {
    fs.mkdirSync(archiveDir, { recursive: true });
  }

  if (fs.existsSync(backupsDir)) {
    const backupFiles = fs.readdirSync(backupsDir).filter(f => f.endsWith('.json'));
    for (const f of backupFiles) {
      const src = path.join(backupsDir, f);
      const dest = path.join(archiveDir, f);
      try {
        fs.renameSync(src, dest);
        console.log(`[Archive] Moved test backup to archive: ${f}`);
      } catch (e) {
        console.error(`[Archive Error] ${f}:`, e.message);
      }
    }
  }

  // 2. Wipe PostgreSQL Tables
  if (connected && pool) {
    console.log('\n[PostgreSQL] Removing products, users, and test orders from database...');
    try {
      const delProducts = await pool.query('DELETE FROM products');
      console.log(`[PostgreSQL] Products deleted: ${delProducts.rowCount}`);

      const delUsers = await pool.query('DELETE FROM users');
      console.log(`[PostgreSQL] Users deleted: ${delUsers.rowCount}`);

      const delOrders = await pool.query('DELETE FROM orders');
      console.log(`[PostgreSQL] Orders deleted: ${delOrders.rowCount}`);

      // Reset auto-increment sequences if they exist
      try {
        await pool.query('ALTER SEQUENCE IF EXISTS users_id_seq RESTART WITH 1');
        await pool.query('ALTER SEQUENCE IF EXISTS banners_id_seq RESTART WITH 1');
        await pool.query('ALTER SEQUENCE IF EXISTS subscribers_id_seq RESTART WITH 1');
        await pool.query('ALTER SEQUENCE IF EXISTS complaints_id_seq RESTART WITH 1');
        await pool.query('ALTER SEQUENCE IF EXISTS service_requests_id_seq RESTART WITH 1');
        console.log('[PostgreSQL] Sequences reset successfully.');
      } catch (seqErr) {
        console.warn('[PostgreSQL Sequence Warning]', seqErr.message);
      }

      // Verify counts in DB
      const pCount = await pool.query('SELECT count(*) FROM products');
      const uCount = await pool.query('SELECT count(*) FROM users');
      const oCount = await pool.query('SELECT count(*) FROM orders');
      console.log(`[PostgreSQL Verification] Products: ${pCount.rows[0].count}, Users: ${uCount.rows[0].count}, Orders: ${oCount.rows[0].count}`);
    } catch (dbErr) {
      console.error('[PostgreSQL Cleanup Error]', dbErr.message);
    }
  }

  // 3. Reset JSON Files in server/data
  console.log('\n[File Storage] Resetting JSON files to empty state...');
  const resetFiles = [
    { dir: serverDataDir, name: 'products.json', content: '[]' },
    { dir: serverDataDir, name: 'users.json', content: '[]' },
    { dir: serverDataDir, name: 'orders.json', content: '[]' },
    { dir: serverDataDir, name: 'service_requests.json', content: '[]' },
    { dir: backendDataDir, name: 'products.json', content: '[]' },
    { dir: backendDataDir, name: 'users.json', content: '[]' },
    { dir: backendDataDir, name: 'orders.json', content: '[]' }
  ];

  for (const item of resetFiles) {
    if (fs.existsSync(item.dir)) {
      const filePath = path.join(item.dir, item.name);
      fs.writeFileSync(filePath, item.content, 'utf8');
      console.log(`[File Storage] Cleared: ${filePath}`);
    }
  }

  // 4. Create a clean initial backup snapshot so auto-restore restores clean state
  const cleanSnapshot = {
    timestamp: new Date().toISOString(),
    status: 'clean_initialized',
    note: 'Database and catalog reset for production / second-level testing',
    products: [],
    users: [],
    orders: [],
    complaints: []
  };
  fs.writeFileSync(
    path.join(backupsDir, 'clean_initial_state.json'),
    JSON.stringify(cleanSnapshot, null, 2),
    'utf8'
  );
  console.log('[Backup] Created clean initial backup snapshot: clean_initial_state.json');

  console.log('\n====================================================');
  console.log('  CLEANUP COMPLETE: Ready for owner products & testing');
  console.log('====================================================');
  process.exit(0);
}

runCleanup().catch(err => {
  console.error('[Fatal Error]', err);
  process.exit(1);
});
