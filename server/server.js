process.on('uncaughtException', (err) => {
  console.error('[Uncaught Exception Guard]', err?.stack || err?.message || err);
});

process.on('unhandledRejection', (reason) => {
  console.error('[Unhandled Rejection Guard]', reason?.stack || reason?.message || reason);
});

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

require('dotenv').config({ path: path.join(__dirname, '.env') });
const { connectDB } = require('./config/db');
const migrateData = require('./scripts/migrateToPostgres');
const BackupService = require('./services/backupService');

// Connect Database
(async () => {
  await new Promise(r => setTimeout(r, 1000));
  await connectDB();
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
const bannersRouter = require('./routes/banners');
const otpRouter = require('./routes/otp');

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
  origin: true, // Allow production & local development origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Ensure Database Connection on Serverless Invocations
app.use(async (req, res, next) => {
  try {
    await connectDB();
  } catch (_) {}
  next();
});

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
    "default-src 'self' https: http://localhost:* ws://localhost:*; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com https://accounts.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; connect-src 'self' https: http://localhost:* ws://localhost:* https://api.razorpay.com https://accounts.google.com; font-src 'self' https://fonts.gstatic.com; frame-src 'self' https://api.razorpay.com https://checkout.razorpay.com https://accounts.google.com;"
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

// ─── API Routes ─────────────────────────────────────────────────────────────
app.use('/api/products', productsRouter);
app.use('/products', productsRouter);

app.use('/api/orders', ordersRouter);
app.use('/orders', ordersRouter);

app.use('/api/custom-cover', customCoverRouter);
app.use('/custom-cover', customCoverRouter);

app.use('/api/admin', adminRouter);
app.use('/admin', adminRouter);

app.use('/api/auth', authRouter);
app.use('/auth', authRouter);

// Direct Google OAuth Redirect Handlers for maximum compatibility
const directGoogleRedirect = (req, res) => {
  const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '929652702793-02ve5do6kgq0fv4hns0vd31g7of00lak.apps.googleusercontent.com';
  const REDIRECT_URI = process.env.PUBLIC_APP_URL ? `${process.env.PUBLIC_APP_URL.replace(/\/+$/, '')}/api/auth/google/callback` : 'https://friendsmobiles.unitaryx.org/api/auth/google/callback';
  const mode = req.query.mode || 'web';
  const targetScheme = req.query.redirect || 'com.friendsmobile.app://auth-success';
  const state = Buffer.from(JSON.stringify({ mode, targetScheme })).toString('base64');
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=openid%20email%20profile&state=${encodeURIComponent(state)}&prompt=select_account`;
  res.redirect(authUrl);
};

app.get('/api/auth/google/login', directGoogleRedirect);
app.get('/auth/google/login', directGoogleRedirect);
app.get('/api/auth/google/redirect', directGoogleRedirect);
app.get('/oauth/google', directGoogleRedirect);

const directGoogleCallback = async (req, res) => {
  const { code, state, error } = req.query;
  if (error || !code) {
    return res.send(`<html><body style="font-family:sans-serif;text-align:center;padding:40px;"><h2>Google sign-in was cancelled.</h2><p><a href="com.friendsmobile.app://auth-failed">Return to App</a></p><script>setTimeout(() => window.location.href="com.friendsmobile.app://auth-failed", 1500);</script></body></html>`);
  }

  let stateData = { mode: 'web', targetScheme: 'com.friendsmobile.app://auth-success' };
  try {
    if (state) stateData = JSON.parse(Buffer.from(state, 'base64').toString('utf8'));
  } catch (_) {}

  try {
    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '929652702793-02ve5do6kgq0fv4hns0vd31g7of00lak.apps.googleusercontent.com';
    const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
    const REDIRECT_URI = process.env.PUBLIC_APP_URL ? `${process.env.PUBLIC_APP_URL.replace(/\/+$/, '')}/api/auth/google/callback` : 'https://friendsmobiles.unitaryx.org/api/auth/google/callback';

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code'
      })
    });

    const tokenData = await tokenRes.json();
    let userInfo = null;

    if (tokenData.access_token) {
      const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` }
      });
      userInfo = await userRes.json();
    } else if (tokenData.id_token) {
      const payload = tokenData.id_token.split('.')[1];
      userInfo = JSON.parse(Buffer.from(payload, 'base64').toString('utf8'));
    }

    if (!userInfo || !userInfo.email) {
      return res.redirect('https://friendsmobiles.unitaryx.org/?open_auth=google');
    }

    const cleanEmail = userInfo.email.toLowerCase().trim();
    const cleanName = userInfo.name || cleanEmail.split('@')[0];
    const userProfile = { id: Date.now(), name: cleanName, email: cleanEmail, phone: '', picture: userInfo.picture || '' };
    const userJsonStr = encodeURIComponent(JSON.stringify(userProfile));
    const deepLinkUrl = `com.friendsmobile.app://auth-success?user=${userJsonStr}`;
    const intentUrl = `intent://auth-success?user=${userJsonStr}#Intent;scheme=com.friendsmobile.app;package=com.friendsmobile.app;end`;

    return res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Google Sign-In Success</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #0f172a; color: #ffffff; text-align: center; }
          .card { background: #1e293b; padding: 32px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); max-width: 360px; width: 90%; border: 1px solid #334155; }
          .btn { display: inline-block; margin-top: 16px; padding: 12px 24px; background: #FF5500; color: #ffffff; border-radius: 12px; text-decoration: none; font-weight: 800; }
        </style>
      </head>
      <body>
        <div class="card">
          <h2 style="color:#FF5500; margin-top:0;">Signed In Successfully!</h2>
          <p>Welcome, <strong>${userProfile.name}</strong>!</p>
          <p style="font-size:0.88rem; color:#94a3b8;">Returning to FRIENDS MOBILE App...</p>
          <a href="${intentUrl}" class="btn">Open FRIENDS MOBILE App</a>
        </div>
        <script>
          window.location.href = "${intentUrl}";
          setTimeout(function() {
            window.location.href = "${deepLinkUrl}";
          }, 300);
        </script>
      </body>
      </html>
    `);
  } catch (err) {
    console.error("[Google OAuth Callback Error]", err);
    res.status(500).send("Authentication error: " + err.message);
  }
};

app.get('/api/auth/google/callback', directGoogleCallback);
app.get('/auth/google/callback', directGoogleCallback);

app.use('/api/payments', paymentsRouter);
app.use('/payments', paymentsRouter);

app.use('/api/banners', bannersRouter);
app.use('/banners', bannersRouter);

app.use('/api/otp', otpRouter);
app.use('/otp', otpRouter);

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

// ─── Diagnostic Mail Service Connection API ────────────────────────────────────
app.get('/api/health-mail', async (req, res) => {
  try {
    const mailUrl = process.env.MAIL_SERVICE_URL || 'http://backend_mail:5001';
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const response = await fetch(`${mailUrl}/health`, { signal: controller.signal });
    clearTimeout(timeout);
    
    if (response.ok) {
      const data = await response.json();
      return res.json({ success: true, mailServer: data });
    }
    return res.status(response.status).json({ success: false, message: `Mail server responded with status: ${response.status}` });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ─── Google Site Verification Explicit Route ──────────────────────────────────
app.get('/google59412e20cd0a6f03.html', (req, res) => {
  const gFile = path.join(__dirname, '../public/google59412e20cd0a6f03.html');
  const distFile = path.join(__dirname, '../dist/google59412e20cd0a6f03.html');
  if (fs.existsSync(distFile)) return res.sendFile(distFile);
  if (fs.existsSync(gFile)) return res.sendFile(gFile);
  res.type('text/plain').send('google-site-verification: google59412e20cd0a6f03.html');
});

// ─── Production SPA Fallback Routing ─────────────────────────────────────────
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/images')) return next();
  if (req.path.includes('google59412e20cd0a6f03.html')) return next();
  const distIndex = path.join(__dirname, '../dist/index.html');
  const rootIndex = path.join(__dirname, '../index.html');
  if (fs.existsSync(distIndex)) {
    return res.sendFile(distIndex);
  } else if (fs.existsSync(rootIndex)) {
    return res.sendFile(rootIndex);
  }
  next();
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
