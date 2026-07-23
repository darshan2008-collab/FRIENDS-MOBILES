const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

require('dotenv').config({ path: path.join(__dirname, '.env') });
const connectDB = require('./config/db');
const migrateData = require('./scripts/migrateData');

// Connect Database & Migrate Existing Data
(async () => {
  const isConnected = await connectDB();
  if (isConnected) {
    await migrateData();
  }
})();

// ─── Data & Image Directory Bootstrap ─────────────────────────────────────────
const dirsToEnsure = [
  path.join(__dirname, './data'),
  path.join(__dirname, './public/images'),
  path.join(__dirname, '../public/images'),
  path.join(__dirname, '../images')
];

dirsToEnsure.forEach(dir => {
  if (!fs.existsSync(dir)) {
    try { fs.mkdirSync(dir, { recursive: true }); } catch (_) {}
  }
});

// ─── Bootstrap Default Data Files ─────────────────────────────────────────────
const defaultFiles = {
  'data/users.json': [],
  'data/orders.json': [],
  'data/products.json': [],
  'data/settings.json': {
    freeShippingThreshold: 499,
    standardShippingFee: 49,
    storeName: 'FRIENDS MOBILE',
    storeCity: 'Madurai, Tamil Nadu',
    storePhone: '+91 74485 78507'
  }
};

Object.entries(defaultFiles).forEach(([relPath, defaultContent]) => {
  const filePath = path.join(__dirname, relPath);
  if (!fs.existsSync(filePath)) {
    try {
      fs.writeFileSync(filePath, JSON.stringify(defaultContent, null, 2), 'utf8');
      console.log(`[Bootstrap] Created default: ${relPath}`);
    } catch (_) {}
  }
});

// ─── Route Imports ─────────────────────────────────────────────────────────────
const productsRouter = require('./routes/products');
const ordersRouter = require('./routes/orders');
const customCoverRouter = require('./routes/customCover');
const adminRouter = require('./routes/admin');
const authRouter = require('./routes/auth');
const paymentsRouter = require('./routes/payments');

// ─── App Initialization ────────────────────────────────────────────────────────
const app = express();
const PORT = process.env.PORT || 5000;

// ─── Global Rate Limiter (all requests) ───────────────────────────────────────
const globalRequestMap = new Map();
app.use((req, res, next) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const max = 300; // 300 requests per minute per IP

  if (!globalRequestMap.has(ip)) globalRequestMap.set(ip, []);
  const timestamps = globalRequestMap.get(ip).filter(t => now - t < windowMs);
  timestamps.push(now);
  globalRequestMap.set(ip, timestamps);

  if (timestamps.length > max) {
    return res.status(429).json({ success: false, message: 'Rate limit exceeded. Please slow down.' });
  }
  next();
});

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5000', 'http://localhost:8080'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// ─── Security Headers ──────────────────────────────────────────────────────────
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self' http://localhost:* ws://localhost:*; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; connect-src 'self' http://localhost:* ws://localhost:* https://api.razorpay.com; font-src 'self' https://fonts.gstatic.com; frame-src 'self' https://api.razorpay.com https://checkout.razorpay.com;"
  );
  next();
});

// ─── Request Logger ────────────────────────────────────────────────────────────
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const color = status >= 500 ? '\x1b[31m' : status >= 400 ? '\x1b[33m' : '\x1b[32m';
    console.log(`${color}[${new Date().toISOString()}] ${req.method} ${req.path} → ${status} (${duration}ms)\x1b[0m`);
  });
  next();
});

// ─── Static Files ──────────────────────────────────────────────────────────────
app.use('/images', express.static(path.join(__dirname, './public/images')));
app.use('/images', express.static(path.join(__dirname, '../public/images')));
app.use('/images', express.static(path.join(__dirname, '../images')));
app.use(express.static(path.join(__dirname, '../')));

// ─── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/custom-cover', customCoverRouter);
app.use('/api/admin', adminRouter);
app.use('/api/auth', authRouter);
app.use('/api/payments', paymentsRouter);

// ─── Health Check ──────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  const settings = (() => {
    try { return require('./data/settings.json'); } catch { return {}; }
  })();

  res.json({
    status: 'online',
    store: settings.storeName || 'FRIENDS MOBILE',
    city: settings.storeCity || 'Madurai, Tamil Nadu',
    phone: settings.storePhone || '+91 74485 78507',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`
  });
});

// ─── Store Info API ────────────────────────────────────────────────────────────
app.get('/api/store-info', (req, res) => {
  try {
    const settings = require('./data/settings.json');
    res.json({ success: true, settings });
  } catch {
    res.json({ success: true, settings: { storeName: 'FRIENDS MOBILE', storeCity: 'Madurai, Tamil Nadu' } });
  }
});

// ─── 404 Catch ─────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found` });
});

// ─── Global Error Handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[Unhandled Error]', err.stack || err.message);
  res.status(500).json({ success: false, message: 'An internal server error occurred.' });
});

// ─── Start Server ──────────────────────────────────────────────────────────────
if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n=======================================================`);
    console.log(`  FRIENDS MOBILE — REST API Server`);
    console.log(`  Port    : ${PORT}`);
    console.log(`  Health  : http://localhost:${PORT}/api/health`);
    console.log(`  Products: http://localhost:${PORT}/api/products`);
    console.log(`  Orders  : http://localhost:${PORT}/api/orders`);
    console.log(`  Auth    : http://localhost:${PORT}/api/auth`);
    console.log(`  Payments: http://localhost:${PORT}/api/payments`);
    console.log(`=======================================================\n`);
  });
}

module.exports = app;
