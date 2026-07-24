const express = require('express');
const router = express.Router();
const path = require('path');
const crypto = require('crypto');
const { readData, writeData, sanitizeInput, normalizePhone, rateLimiter } = require('../utils/db');
const User = require('../models/User');

const usersFilePath = path.join(__dirname, '../data/users.json');

// Rate limiters for auth endpoints (strict limits to prevent brute force)
const loginLimiter = rateLimiter({ windowMs: 10 * 60 * 1000, max: 30, message: 'Too many login attempts. Please try again after 10 minutes.' });
const signupLimiter = rateLimiter({ windowMs: 60 * 60 * 1000, max: 30, message: 'Too many signup attempts from this IP. Try again later.' });
const resetLimiter = rateLimiter({ windowMs: 15 * 60 * 1000, max: 30, message: 'Too many password reset attempts. Please wait before trying again.' });

async function getUsersAsync() {
  const fileUsers = readData(usersFilePath, []);
  try {
    const dbUsers = await User.find({});
    if (dbUsers && dbUsers.length > 0) {
      const combinedMap = new Map();
      fileUsers.forEach(u => {
        if (u.email) combinedMap.set(u.email.toLowerCase().trim(), u);
        else if (u.phone) combinedMap.set(normalizePhone(u.phone), u);
      });
      dbUsers.forEach(u => {
        if (u.email) combinedMap.set(u.email.toLowerCase().trim(), u);
        else if (u.phone) combinedMap.set(normalizePhone(u.phone), u);
      });
      return Array.from(combinedMap.values());
    }
  } catch (e) {
    console.error("[User PostgreSQL Get Error]", e.message);
  }
  return fileUsers;
}

async function saveUserAsync(userData) {
  // 1. Update normal local file storage
  const fileUsers = readData(usersFilePath, []);
  const cleanEmail = userData.email ? userData.email.toLowerCase().trim() : '';
  const cleanPhone = userData.phone ? normalizePhone(userData.phone) : '';

  const idx = fileUsers.findIndex(u =>
    (cleanEmail && u.email && u.email.toLowerCase().trim() === cleanEmail) ||
    (cleanPhone && cleanPhone.length >= 10 && normalizePhone(u.phone) === cleanPhone) ||
    (userData.id && u.id === userData.id)
  );

  if (idx !== -1) {
    fileUsers[idx] = { ...fileUsers[idx], ...userData };
  } else {
    fileUsers.push(userData);
  }
  writeData(usersFilePath, fileUsers);

  // 2. Save in PostgreSQL
  try {
    const query = cleanEmail
      ? { email: cleanEmail }
      : (cleanPhone ? { phone: cleanPhone } : { id: userData.id });

    await User.updateOne(query, { $set: userData }, { upsert: true });
  } catch (e) {
    console.error("[User PostgreSQL Save Error]", e.message);
  }
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
      createdAt: new Date().toISOString()
    };

    await saveUserAsync(newUser);

    const userProfile = { id: newUser.id, name: newUser.name, email: newUser.email, phone: newUser.phone, address: newUser.address };

    res.status(201).json({
      success: true,
      message: 'Account created successfully! Welcome to FRIENDS MOBILE.',
      user: userProfile
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Signup failed', error: err.message });
  }
});

// POST /api/auth/google-auth (Google OAuth Registration & Login Database Sync)
router.post('/google-auth', async (req, res) => {
  try {
    const { email, name, googleId, picture, phone } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, message: 'Valid Google email address is required' });
    }

    const cleanEmail = sanitizeInput(email).toLowerCase().trim();
    const cleanName = name ? sanitizeInput(name) : cleanEmail.split('@')[0];
    const cleanPhone = phone ? normalizePhone(phone) : '';

    const users = await getUsersAsync();
    let existing = users.find(u => u.email && u.email.toLowerCase().trim() === cleanEmail);

    if (existing) {
      const updatedUser = {
        ...existing,
        name: existing.name || cleanName,
        googleId: googleId || existing.googleId || 'google_' + Date.now(),
        updatedAt: new Date().toISOString()
      };
      await saveUserAsync(updatedUser);
      const userProfile = { id: updatedUser.id, name: updatedUser.name, email: updatedUser.email, phone: updatedUser.phone || '', address: updatedUser.address || '' };

      return res.json({
        success: true,
        message: `Welcome back, ${updatedUser.name}!`,
        user: userProfile
      });
    }

    const newId = users.length > 0 ? Math.max(...users.map(u => u.id || 0)) + 1 : 1;
    const newUser = {
      id: newId,
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      password: hashPassword('google_oauth_' + Math.random().toString(36).substring(2)),
      address: 'Tamil Nadu',
      googleId: googleId || 'google_' + Date.now(),
      role: 'customer',
      createdAt: new Date().toISOString()
    };

    await saveUserAsync(newUser);
    const userProfile = { id: newUser.id, name: newUser.name, email: newUser.email, phone: newUser.phone, address: newUser.address };

    res.status(201).json({
      success: true,
      message: `Account registered with Google! Welcome, ${newUser.name}.`,
      user: userProfile
    });
  } catch (err) {
    console.error("[Google Auth Error]", err);
    res.status(500).json({ success: false, message: 'Google authentication failed', error: err.message });
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

// POST /api/auth/reset-password
router.post('/reset-password', resetLimiter, async (req, res) => {
  try {
    const { phone, email, identity, newPassword, resetToken } = req.body;

    if (!newPassword || newPassword.length < 4) {
      return res.status(400).json({ success: false, message: 'New password must be at least 4 characters long' });
    }

    // Check reset token if provided
    let verifiedSession = null;
    if (resetToken) {
      verifiedSession = resetTokenCache.get(resetToken);
      if (!verifiedSession || Date.now() > verifiedSession.expiresAt) {
        return res.status(403).json({ success: false, message: 'Password reset session has expired or is invalid. Please request a new OTP.' });
      }
    }

    const targetIdentity = identity || email || phone || (verifiedSession ? (verifiedSession.phone || verifiedSession.email) : null);
    if (!targetIdentity) {
      return res.status(400).json({ success: false, message: 'Phone number or email is required to identify account' });
    }

    const cleanPhone = normalizePhone(targetIdentity);
    const cleanEmail = targetIdentity.includes('@') ? targetIdentity.toLowerCase().trim() : null;

    const users = await getUsersAsync();
    const user = users.find(u =>
      (verifiedSession && verifiedSession.userId && u.id === verifiedSession.userId) ||
      (cleanPhone && normalizePhone(u.phone) === cleanPhone) ||
      (cleanEmail && u.email && u.email.toLowerCase().trim() === cleanEmail)
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found with this registered phone or email' });
    }

    const updatedUser = { 
      ...user, 
      password: hashPassword(newPassword), 
      otpCode: null, 
      otpExpires: null,
      updatedAt: new Date().toISOString() 
    };
    await saveUserAsync(updatedUser);

    // Consume reset token
    if (resetToken) {
      resetTokenCache.delete(resetToken);
    }

    res.json({
      success: true,
      message: 'Password reset successfully! Please log in with your new password.'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Password reset failed', error: err.message });
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
