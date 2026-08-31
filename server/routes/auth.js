const express = require('express');
const router = express.Router();
const path = require('path');
const crypto = require('crypto');
const { readData, writeData, sanitizeInput, normalizePhone, rateLimiter } = require('../utils/db');
const User = require('../models/User');
const BackupService = require('../services/backupService');

const usersFilePath = path.join(__dirname, '../data/users.json');

// Rate limiters for auth endpoints (strict limits to prevent brute force)
const loginLimiter = rateLimiter({ windowMs: 10 * 60 * 1000, max: 30, message: 'Too many login attempts. Please try again after 10 minutes.' });
const signupLimiter = rateLimiter({ windowMs: 60 * 60 * 1000, max: 30, message: 'Too many signup attempts from this IP. Try again later.' });
const resetLimiter = rateLimiter({ windowMs: 15 * 60 * 1000, max: 30, message: 'Too many password reset attempts. Please wait before trying again.' });

async function getUsersAsync() {
  let dbUsers = [];
  try {
    dbUsers = await User.find({});
  } catch (e) {
    console.error("[User PostgreSQL Get Error]", e.message);
  }
  const fileUsers = readData(usersFilePath, []);

  const map = new Map();
  (dbUsers || []).forEach(u => {
    const k = u.email ? u.email.toLowerCase().trim() : (u.phone ? String(u.phone).trim() : String(u.id));
    if (k) map.set(k, u);
  });
  (fileUsers || []).forEach(u => {
    const k = u.email ? u.email.toLowerCase().trim() : (u.phone ? String(u.phone).trim() : String(u.id));
    if (k && !map.has(k)) map.set(k, u);
  });

  return Array.from(map.values());
}

async function saveUserAsync(userData) {
  try {
    const users = readData(usersFilePath, []);
    const cleanEmail = userData.email ? userData.email.toLowerCase().trim() : '';
    const cleanPhone = userData.phone ? normalizePhone(userData.phone) : '';

    const index = users.findIndex(u => 
      (cleanEmail && u.email && u.email.toLowerCase().trim() === cleanEmail) ||
      (cleanPhone && u.phone && normalizePhone(u.phone) === cleanPhone) ||
      (u.id && userData.id && u.id === userData.id)
    );

    if (index !== -1) {
      users[index] = { ...users[index], ...userData, updatedAt: new Date().toISOString() };
    } else {
      users.push({ ...userData, createdAt: userData.createdAt || new Date().toISOString() });
    }
    writeData(usersFilePath, users);
  } catch (e) {
    console.error("[User JSON Save Error]", e.message);
  }

  try {
    const cleanEmail = userData.email ? userData.email.toLowerCase().trim() : '';
    const cleanPhone = userData.phone ? normalizePhone(userData.phone) : '';
    const q = cleanEmail ? { email: cleanEmail } : (cleanPhone ? { phone: cleanPhone } : { id: userData.id });
    await User.updateOne(q, { $set: userData }, { upsert: true });
  } catch (e) {
    console.error("[User PostgreSQL Save Error]", e.message);
  }

  BackupService.triggerRealTimeBackup(`user_sync_${userData.email || userData.id}`);
}

// Secure PBKDF2 password hashing (100,000 iterations for production strength)
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

// Verify against both legacy (plaintext/low-iteration) and current hashes
function verifyPassword(password, storedValue) {
  if (!storedValue || !storedValue.includes(':')) {
    // Legacy plaintext comparison (safe migration path)
    return password === storedValue;
  }
  const [salt, originalHash] = storedValue.split(':');
  // Try high-iteration first (current)
  const hash100k = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  if (hash100k === originalHash) return true;
  // Fallback for legacy 1000-iteration hashes (auto-migrates on next login)
  const hash1k = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hash1k === originalHash;
}

// POST /api/auth/signup
router.post('/signup', signupLimiter, async (req, res) => {
  try {
    const { name, email, phone, password, address } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ success: false, message: 'Full name, email address, mobile phone number, and password are required' });
    }

    const cleanEmail = sanitizeInput(email).toLowerCase().trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address (e.g. user@gmail.com)' });
    }

    const cleanPhone = normalizePhone(phone);
    if (!cleanPhone || cleanPhone.length < 10) {
      return res.status(400).json({ success: false, message: 'Please enter a valid 10-digit mobile phone number' });
    }

    if (password.length < 4) {
      return res.status(400).json({ success: false, message: 'Password must be at least 4 characters' });
    }

    const cleanName = sanitizeInput(name);
    const cleanAddress = address ? sanitizeInput(address) : 'Tamil Nadu';

    const users = await getUsersAsync();
    const existingByEmail = users.find(u => u.email && u.email.toLowerCase().trim() === cleanEmail);
    if (existingByEmail) {
      return res.status(409).json({ success: false, message: 'An account with this email address already exists. Please log in.' });
    }

    const existingByPhone = users.find(u => cleanPhone && cleanPhone.length >= 10 && normalizePhone(u.phone) === cleanPhone);
    if (existingByPhone) {
      return res.status(409).json({ success: false, message: 'An account with this phone number already exists. Please log in or use another number.' });
    }

    const newId = users.length > 0 ? Math.max(...users.map(u => u.id || 0)) + 1 : 1;
    const newUser = {
      id: newId,
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      password: hashPassword(password),
      address: cleanAddress,
      rewardPoints: 150,
      claimedCoupons: [],
      pointHistory: [
        { id: 1, type: 'credit', points: 50, title: 'Welcome Bonus Points', date: 'Just Now' },
        { id: 2, type: 'credit', points: 100, title: 'First Order Reward Bonus', date: 'Just Now' }
      ],
      createdAt: new Date().toISOString()
    };

    await saveUserAsync(newUser);
    BackupService.triggerRealTimeBackup(`user_signup_${cleanEmail}`);

    const userProfile = { id: newUser.id, name: newUser.name, email: newUser.email, phone: newUser.phone, address: newUser.address, rewardPoints: newUser.rewardPoints, claimedCoupons: newUser.claimedCoupons, pointHistory: newUser.pointHistory };

    res.status(201).json({
      success: true,
      message: 'Account created successfully! Welcome to FRIENDS MOBILE.',
      user: userProfile
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Signup failed', error: err.message });
  }
});

const handleGoogleRedirect = (req, res) => {
  try {
    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '790719609329-17h6kuua100ndrtau0shkm71kb4b12r4.apps.googleusercontent.com';
    const REDIRECT_URI = process.env.PUBLIC_APP_URL ? `${process.env.PUBLIC_APP_URL.replace(/\/+$/, '')}/api/auth/google/callback` : 'https://friendsmobile.co.in/api/auth/google/callback';
    const mode = req.query.mode || 'web';
    const targetScheme = req.query.redirect || 'com.friendsmobile.app://auth-success';
    const state = Buffer.from(JSON.stringify({ mode, targetScheme })).toString('base64');
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=openid%20email%20profile&state=${encodeURIComponent(state)}&prompt=select_account`;
    return res.redirect(authUrl);
  } catch (err) {
    return res.status(500).json({ success: false, message: 'OAuth initialization failed', error: err.message });
  }
};

router.get('/google/login', handleGoogleRedirect);
router.get('/google/redirect', handleGoogleRedirect);
router.get('/google/auth', handleGoogleRedirect);
router.get('/google', (req, res, next) => {
  if (req.method === 'GET' && !req.body?.email) {
    return handleGoogleRedirect(req, res);
  }
  next();
});

// GET /api/auth/google/callback (Google OAuth Code Callback & Deep Link Redirect back to APK)
router.get('/google/callback', async (req, res) => {
  const { code, state, error } = req.query;
  if (error || !code) {
    return res.send(`<html><body style="font-family:sans-serif;text-align:center;padding:40px;"><h2>Google sign-in was cancelled.</h2><p><a href="com.friendsmobile.app://auth-failed">Return to App</a></p><script>setTimeout(() => window.location.href="com.friendsmobile.app://auth-failed", 1500);</script></body></html>`);
  }

  let stateData = { mode: 'web', targetScheme: 'com.friendsmobile.app://auth-success' };
  try {
    if (state) stateData = JSON.parse(Buffer.from(state, 'base64').toString('utf8'));
  } catch (_) {}

  try {
    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '790719609329-17h6kuua100ndrtau0shkm71kb4b12r4.apps.googleusercontent.com';
    const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
    const REDIRECT_URI = process.env.PUBLIC_APP_URL ? `${process.env.PUBLIC_APP_URL.replace(/\/+$/, '')}/api/auth/google/callback` : 'https://friendsmobile.co.in/api/auth/google/callback';

    // 1. Exchange code with Google token endpoint
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
      return res.redirect('https://friendsmobile.co.in/?open_auth=google');
    }

    // 2. Register/Login user in database
    const cleanEmail = sanitizeInput(userInfo.email).toLowerCase().trim();
    const cleanName = userInfo.name ? sanitizeInput(userInfo.name) : cleanEmail.split('@')[0];
    const users = await getUsersAsync();
    let existing = users.find(u => u.email && u.email.toLowerCase().trim() === cleanEmail);
    let userProfile = null;

    if (existing) {
      userProfile = { id: existing.id, name: existing.name || cleanName, email: existing.email, phone: existing.phone || '', picture: userInfo.picture || '' };
    } else {
      const newId = users.length > 0 ? Math.max(...users.map(u => u.id || 0)) + 1 : 1;
      const newUser = {
        id: newId,
        name: cleanName,
        email: cleanEmail,
        phone: '',
        password: hashPassword('google_oauth_' + Math.random().toString(36).substring(2)),
        picture: userInfo.picture || '',
        googleId: userInfo.sub || 'google_' + Date.now(),
        role: 'customer',
        createdAt: new Date().toISOString()
      };
      await saveUserAsync(newUser);
      userProfile = { id: newUser.id, name: newUser.name, email: newUser.email, phone: '', picture: newUser.picture };
    }

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
});

// POST /api/auth/login
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { identity, password } = req.body;

    if (!identity || !password) {
      return res.status(400).json({ success: false, message: 'Please enter phone/email and password' });
    }

    const users = await getUsersAsync();
    const idLower = identity.toLowerCase().trim();
    const cleanDigits = normalizePhone(identity);

    const user = users.find(u =>
      (cleanDigits && normalizePhone(u.phone) === cleanDigits) ||
      (u.email && u.email.toLowerCase().trim() === idLower)
    );

    if (!user || !verifyPassword(password, user.password)) {
      return res.status(401).json({ success: false, message: 'Invalid phone/email or password' });
    }

    // Auto-migrate legacy low-iteration hashes to 100k on successful login
    if (user.password && user.password.includes(':')) {
      const [salt, hash] = user.password.split(':');
      const hash1k = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
      if (hash === hash1k) {
        const updatedUser = { ...user, password: hashPassword(password), updatedAt: new Date().toISOString() };
        await saveUserAsync(updatedUser);
      }
    }

    const userProfile = { id: user.id, name: user.name, email: user.email, phone: user.phone, address: user.address };

    res.json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      user: userProfile
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Login failed', error: err.message });
  }
});

const { sendOTPEmail } = require('../utils/email');

// In-memory OTP & Reset Token Cache
const otpCache = new Map();
const resetTokenCache = new Map();

// Clean expired tokens periodically (every 5 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of otpCache.entries()) {
    if (v.expiresAt < now) otpCache.delete(k);
  }
  for (const [k, v] of resetTokenCache.entries()) {
    if (v.expiresAt < now) resetTokenCache.delete(k);
  }
}, 5 * 60 * 1000);

const otpController = require('../controllers/otpController');

// POST /api/auth/send-otp (Send Unique 6-Digit OTP to Registered Email ID)
router.post('/send-otp', resetLimiter, otpController.sendOtp);

// POST /api/auth/verify-otp (Verify 6-Digit OTP)
router.post('/verify-otp', resetLimiter, otpController.verifyOtp);

// POST /api/auth/reset-password (Reset Password)
router.post('/reset-password', resetLimiter, otpController.resetPassword);

// POST /api/auth/verify-phone
router.post('/verify-phone', resetLimiter, async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ success: false, message: 'Phone number is required' });
    }

    const cleanPhone = normalizePhone(phone);
    if (!cleanPhone || cleanPhone.length < 10) {
      return res.status(400).json({ success: false, message: 'Please enter a valid 10-digit phone number' });
    }

    const users = await getUsersAsync();
    const user = users.find(u => normalizePhone(u.phone) === cleanPhone);

    if (!user) {
      return res.status(404).json({ success: false, message: 'No registered account found with this phone number' });
    }

    res.json({
      success: true,
      message: 'Phone number verified successfully',
      name: user.name,
      phone: user.phone
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Verification failed', error: err.message });
  }
});

// PUT /api/auth/update-profile
router.put('/update-profile', async (req, res) => {
  try {
    const { phone, name, address, email, pincode } = req.body;

    const cleanEmail = email ? sanitizeInput(email).toLowerCase().trim() : '';
    const cleanPhone = phone ? normalizePhone(phone) : '';

    if (!cleanEmail && !cleanPhone) {
      return res.status(400).json({ success: false, message: 'Email address or phone number is required to identify user' });
    }

    const users = await getUsersAsync();
    const user = users.find(u =>
      (cleanEmail && u.email && u.email.toLowerCase().trim() === cleanEmail) ||
      (cleanPhone && cleanPhone.length >= 10 && normalizePhone(u.phone) === cleanPhone)
    );

    const fullAddr = (address && pincode && !address.includes(pincode)) ? `${sanitizeInput(address)} - ${pincode}` : (address ? sanitizeInput(address) : '');

    const updatedUser = {
      ...(user || {}),
      name: name ? sanitizeInput(name) : (user?.name || cleanEmail.split('@')[0] || 'Customer'),
      address: fullAddr || (user?.address || ''),
      email: cleanEmail || (user?.email || ''),
      phone: cleanPhone || (user?.phone || ''),
      pincode: pincode || (user?.pincode || ''),
      updatedAt: new Date().toISOString()
    };

    await saveUserAsync(updatedUser);

    const userProfile = { id: updatedUser.id || Date.now(), name: updatedUser.name, email: updatedUser.email, phone: updatedUser.phone, address: updatedUser.address };

    res.json({
      success: true,
      message: 'Profile updated successfully!',
      user: userProfile
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Profile update failed', error: err.message });
  }
});

// POST /api/auth/google (Google OAuth Authentication & Single Sign-On)
router.post('/google', async (req, res) => {
  try {
    const { token, email, name, picture } = req.body;

    const targetEmail = email ? email.toLowerCase().trim() : null;
    if (!targetEmail || !targetEmail.includes('@')) {
      return res.status(400).json({ success: false, message: 'Google account email is required' });
    }

    const cleanName = name ? sanitizeInput(name) : targetEmail.split('@')[0];
    const users = await getUsersAsync();
    let user = users.find(u => u.email && u.email.toLowerCase().trim() === targetEmail);

    if (!user) {
      // Auto-register Google user
      const newId = users.length > 0 ? Math.max(...users.map(u => u.id || 0)) + 1 : 1;
      user = {
        id: newId,
        name: cleanName,
        email: targetEmail,
        phone: '',
        picture: picture || '',
        authProvider: 'google',
        createdAt: new Date().toISOString()
      };
      await saveUserAsync(user);
    } else if (picture && !user.picture) {
      user = { ...user, picture, authProvider: user.authProvider || 'google' };
      await saveUserAsync(user);
    }

    const userProfile = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      address: user.address || '',
      picture: user.picture || ''
    };

    res.json({
      success: true,
      message: `Successfully authenticated with Google! Welcome, ${user.name}.`,
      user: userProfile
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Google authentication failed', error: err.message });
  }
});

module.exports = router;
