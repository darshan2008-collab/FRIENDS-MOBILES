process.on('uncaughtException', (err) => {
  console.error('[Worker Microservice Uncaught Exception]', err?.stack || err?.message || err);
});

process.on('unhandledRejection', (reason) => {
  console.error('[Worker Microservice Unhandled Rejection]', reason?.stack || reason?.message || reason);
});

const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '.env') });
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { connectDB } = require('./config/db');
const migrateData = require('./scripts/migrateToPostgres');
const BackupService = require('./services/backupService');

console.log(`\n=======================================================`);
console.log(`  FRIENDS MOBILE — Dedicated Background & Backup Worker`);
console.log(`  Process ID : ${process.pid}`);
console.log(`=======================================================\n`);

(async () => {
  console.log('[Worker] Bootstrapping background service...');
  
  // Connect to PostgreSQL database if available
  const isConnected = await connectDB();
  if (isConnected) {
    console.log('[Worker] Synchronizing database schema & pre-postgres migrations...');
    await migrateData().catch(err => console.error('[Worker Migration Error]', err.message));
  } else {
    console.log('[Worker] PostgreSQL unavailable. Using persistent JSON data store fallback.');
  }

  // Auto-restore latest database snapshot on worker startup
  console.log('[Worker] Checking for latest database snapshot auto-restore...');
  await BackupService.autoRestoreLatestBackup().catch(err => console.error('[Worker Auto-Restore Error]', err.message));

  // Initial boot backup snapshot
  setTimeout(() => {
    console.log('[Worker] Creating initial boot backup snapshot...');
    BackupService.createBackup().catch(err => console.error('[Worker Initial Backup Error]', err.message));
  }, 5000);
})();

// Automated Database Backup Schedule (Every 1 Hour)
const backupIntervalHours = parseInt(process.env.BACKUP_INTERVAL_HOURS || '1', 10);
const backupIntervalMs = Math.max(1, backupIntervalHours) * 60 * 60 * 1000;

setInterval(() => {
  console.log(`[Worker Cron] Running scheduled database backup snapshot (Every ${backupIntervalHours} Hour(s))...`);
  BackupService.createBackup().catch(err => console.error('[Worker Cron Backup Error]', err.message));
}, backupIntervalMs);

// Keep process alive gracefully
setInterval(() => {}, 1000 * 60 * 60);
