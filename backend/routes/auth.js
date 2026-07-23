const express = require('express');
const router = express.Router();
const path = require('path');
const crypto = require('crypto');
const { readData, writeData, sanitizeInput, normalizePhone, rateLimiter } = require('../utils/db');

const usersFilePath = path.join(__dirname, '../data/users.json');

const loginLimiter = rateLimiter({ windowMs: 10 * 60 * 1000, max: 10, message: 'Too many login attempts. Please try again after 10 minutes.' });
const signupLimiter = rateLimiter({ windowMs: 60 * 60 * 1000, max: 5, message: 'Too many signup attempts from this IP. Try again later.' });
const resetLimiter = rateLimiter({ windowMs: 15 * 60 * 1000, max: 15, message: 'Too many password reset attempts. Please wait before trying again.' });

function getUsers() {
  return readData(usersFilePath, []);
}

function saveUsers(users) {
  return writeData(usersFilePath, users);
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, storedValue) {
  if (!storedValue || !storedValue.includes(':')) {
    return password === storedValue;
  }
  const [salt, originalHash] = storedValue.split(':');
  const hash100k = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  if (hash100k === originalHash) return true;
  const hash1k = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hash1k === originalHash;
}

router.post('/signup', signupLimiter, (req, res) => {
  try {
    const { name, email, phone, password, address } = req.body;

    if (!name || !phone || !password) {
      return res.status(400).json({ success: false, message: 'Name, phone number, and password are required' });
    }

    if (password.length < 4) {
      return res.status(400).json({ success: false, message: 'Password must be at least 4 characters' });
    }

    const cleanPhone = normalizePhone(phone);
    if (!cleanPhone || cleanPhone.length < 10) {
      return res.status(400).json({ success: false, message: 'Please enter a valid 10-digit phone number' });
    }

    const cleanName = sanitizeInput(name);
    const cleanEmail = email ? sanitizeInput(email).toLowerCase() : '';
    const cleanAddress = address ? sanitizeInput(address) : 'Tamil Nadu';

    const users = getUsers();
    const existing = users.find(u =>
      normalizePhone(u.phone) === cleanPhone ||
      (cleanEmail && u.email && u.email.toLowerCase().trim() === cleanEmail)
    );

    if (existing) {
      return res.status(409).json({ success: false, message: 'An account with this phone or email already exists' });
    }

    const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
    const newUser = {
      id: newId,
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      password: hashPassword(password),
      address: cleanAddress,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    saveUsers(users);

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

router.post('/login', loginLimiter, (req, res) => {
  try {
    const { identity, password } = req.body;

    if (!identity || !password) {
      return res.status(400).json({ success: false, message: 'Please enter phone/email and password' });
    }

    const users = getUsers();
    const idLower = identity.toLowerCase().trim();
    const cleanDigits = normalizePhone(identity);

    const user = users.find(u =>
      (cleanDigits && normalizePhone(u.phone) === cleanDigits) ||
      (u.email && u.email.toLowerCase().trim() === idLower)
    );

    if (!user || !verifyPassword(password, user.password)) {
      return res.status(401).json({ success: false, message: 'Invalid phone/email or password' });
    }

    if (user.password && user.password.includes(':')) {
      const [salt, hash] = user.password.split(':');
      const hash1k = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
      if (hash === hash1k) {
        const allUsers = getUsers();
        const idx = allUsers.findIndex(u => u.id === user.id);
        if (idx !== -1) {
          allUsers[idx].password = hashPassword(password);
          allUsers[idx].updatedAt = new Date().toISOString();
          saveUsers(allUsers);
        }
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

router.post('/verify-phone', resetLimiter, (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ success: false, message: 'Phone number is required' });
    }

    const cleanPhone = normalizePhone(phone);
    if (!cleanPhone || cleanPhone.length < 10) {
      return res.status(400).json({ success: false, message: 'Please enter a valid 10-digit phone number' });
    }

    const users = getUsers();
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

router.post('/reset-password', resetLimiter, (req, res) => {
  try {
    const { phone, newPassword } = req.body;

    if (!phone || !newPassword) {
      return res.status(400).json({ success: false, message: 'Phone number and new password are required' });
    }

    if (newPassword.length < 4) {
      return res.status(400).json({ success: false, message: 'New password must be at least 4 characters long' });
    }

    const cleanPhone = normalizePhone(phone);
    const users = getUsers();
    const userIndex = users.findIndex(u => normalizePhone(u.phone) === cleanPhone);

    if (userIndex === -1) {
      return res.status(404).json({ success: false, message: 'No account found with this registered phone number' });
    }

    users[userIndex].password = hashPassword(newPassword);
    users[userIndex].updatedAt = new Date().toISOString();
    saveUsers(users);

    res.json({
      success: true,
      message: 'Password reset successfully! Please log in with your new password.'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Password reset failed', error: err.message });
  }
});

router.put('/update-profile', (req, res) => {
  try {
    const { phone, name, address, email } = req.body;

    if (!phone) {
      return res.status(400).json({ success: false, message: 'Phone number is required to identify user' });
    }

    const cleanPhone = normalizePhone(phone);
    const users = getUsers();
    const userIndex = users.findIndex(u => normalizePhone(u.phone) === cleanPhone);

    if (userIndex === -1) {
      return res.status(404).json({ success: false, message: 'User account not found' });
    }

    if (name) users[userIndex].name = sanitizeInput(name);
    if (address) users[userIndex].address = sanitizeInput(address);
    if (email) users[userIndex].email = sanitizeInput(email).toLowerCase();
    users[userIndex].updatedAt = new Date().toISOString();

    saveUsers(users);

    const userProfile = { id: users[userIndex].id, name: users[userIndex].name, email: users[userIndex].email, phone: users[userIndex].phone, address: users[userIndex].address };

    res.json({
      success: true,
      message: 'Profile updated successfully!',
      user: userProfile
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Profile update failed', error: err.message });
  }
});

module.exports = router;
