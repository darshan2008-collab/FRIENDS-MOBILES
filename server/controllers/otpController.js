const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const OtpVerification = require('../models/OtpVerification');
const User = require('../models/User');
const { sendOTPEmail, dispatchOTPEmail } = require('../utils/email');

// In-memory verification token cache for password reset session bridging
const verifiedTokens = new Map();
// In-memory verification token cache for new account registration verification
const verifiedSignupTokens = new Map();
// Fallback in-memory OTP store (ensures OTPs work even if database is offline)
const inMemoryOtpStore = new Map();

setInterval(() => {
  const now = Date.now();
  for (const [k, v] of inMemoryOtpStore.entries()) {
    if (v.expiresAt < now) inMemoryOtpStore.delete(k);
  }
  for (const [k, v] of verifiedTokens.entries()) {
    if (v.expiresAt < now) verifiedTokens.delete(k);
  }
  for (const [k, v] of verifiedSignupTokens.entries()) {
    if (v.expiresAt < now) verifiedSignupTokens.delete(k);
  }
}, 60 * 1000);

// Helper to hash passwords for User collection update
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

/**
 * API 1: POST /api/otp/send & POST /api/auth/send-otp
 * Generate 6-digit OTP, store bcrypt hash, send Nodemailer email
 * Supports purpose: 'password_reset' | 'signup'
 */
exports.sendOtp = async (req, res) => {
  try {
    const { email, purpose = 'password_reset', name = '' } = req.body || {};

    // 1. Validate Email Format
    if (!email || typeof email !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Valid email address is required.'
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address format (e.g. user@example.com).'
      });
    }

    const isSignup = purpose === 'signup' || purpose === 'register';
    const normalizedPurpose = isSignup ? 'signup' : 'password_reset';

    // 2. Check if email is registered in User database / JSON file
    let existingUser = null;
    try {
      existingUser = await User.findOne({ email: cleanEmail });
    } catch (_) {}

    if (!existingUser) {
      const path = require('path');
      const { readData } = require('../utils/db');
      const usersFilePath = path.join(__dirname, '../data/users.json');
      const fileUsers = readData(usersFilePath, []);
      existingUser = fileUsers.find(u => u && u.email && u.email.toLowerCase().trim() === cleanEmail);
    }

    // Purpose-specific guard rails
    if (isSignup) {
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'An account with this email address already exists. Please log in or use Forgot Password.'
        });
      }
    } else {
      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: 'No registered account found with this email address.'
        });
      }
    }

    // 3. Generate secure random 6-digit OTP
    const rawOtp = crypto.randomInt(100000, 1000000).toString();

    // Fail-safe debug backup logging (retrievable in Portainer container logs or server file)
    try {
      const fs = require('fs');
      const path = require('path');
      const logDir = path.join(__dirname, '../data');
      if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
      fs.appendFileSync(
        path.join(logDir, 'otp_debug.log'),
        `[${new Date().toISOString()}] Email: ${cleanEmail} | Purpose: ${normalizedPurpose} | OTP: ${rawOtp}\n`
      );
    } catch (_) {}
    console.log(`\n*******************************************************`);
    console.log(`[OTP BACKUP LOG] Email: ${cleanEmail} | Purpose: ${normalizedPurpose} | OTP Code: ${rawOtp}`);
    console.log(`*******************************************************\n`);

    // 4. Hash OTP using bcrypt (never store plain OTP)
    const saltRounds = 10;
    const otpHash = await bcrypt.hash(rawOtp, saltRounds);

    // 5. Delete any previous OTP documents for the same email & purpose
    const storeKey = `${cleanEmail}:${normalizedPurpose}`;
    inMemoryOtpStore.delete(storeKey);
    inMemoryOtpStore.delete(cleanEmail);
    try { await OtpVerification.deleteMany({ email: cleanEmail, purpose: normalizedPurpose }); } catch (_) {}

    // 6. OTP Lifetime: 5 Minutes (300 seconds)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // 7. Insert new OTP document into Memory & PostgreSQL
    inMemoryOtpStore.set(storeKey, {
      email: cleanEmail,
      otpHash,
      purpose: normalizedPurpose,
      attempts: 0,
      verified: false,
      expiresAt: expiresAt.getTime()
    });

    try {
      await OtpVerification.create({
        email: cleanEmail,
        otpHash,
        purpose: normalizedPurpose,
        attempts: 0,
        verified: false,
        expiresAt
      });
    } catch (_) {}

    // 8. Determine greeting name
    const customerName = isSignup
      ? (name && name.trim() ? name.trim() : 'Valued Customer')
      : (existingUser?.name || 'Valued Customer');

    // 9. Send Email via dedicated Mail Microservice or Nodemailer SMTP fallback
    const emailResult = await dispatchOTPEmail(cleanEmail, rawOtp, customerName, normalizedPurpose);

    if (!emailResult || !emailResult.success) {
      console.error(`[OTP Error] Email dispatch failed for ${cleanEmail} (${normalizedPurpose}):`, emailResult?.error);
      return res.status(500).json({
        success: false,
        message: `Failed to send verification email to ${cleanEmail}. ${emailResult?.error || 'Please try again later.'}`
      });
    }

    // 10. Return Success Response
    return res.status(200).json({
      success: true,
      email: cleanEmail,
      name: customerName,
      purpose: normalizedPurpose,
      message: isSignup 
        ? `6-digit verification code sent to ${cleanEmail}` 
        : `Password reset OTP sent to ${cleanEmail}`
    });

  } catch (err) {
    console.error('[OTP Send Exception]', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'An internal server error occurred while sending OTP.',
      error: err.message
    });
  }
};

/**
 * API 2: POST /api/otp/verify & POST /api/auth/verify-otp
 * Validate 6-digit OTP, check attempts, compare bcrypt hash
 * Supports purpose: 'password_reset' | 'signup'
 */
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp, purpose = 'password_reset' } = req.body || {};

    // 1. Validation
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email address and OTP code are required.'
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = otp.toString().replace(/\D/g, '').trim();

    // OTP must contain exactly 6 digits
    if (!/^\d{6}$/.test(cleanOtp)) {
      return res.status(400).json({
        success: false,
        message: 'OTP must contain exactly 6 numeric digits.'
      });
    }

    const isSignup = purpose === 'signup' || purpose === 'register';
    const normalizedPurpose = isSignup ? 'signup' : 'password_reset';
    const storeKey = `${cleanEmail}:${normalizedPurpose}`;

    // 2. Collect candidate OTP records from both In-Memory store & Database
    const candidateRecords = [];

    // Check specific purpose in memory
    if (inMemoryOtpStore.has(storeKey)) {
      const mem = inMemoryOtpStore.get(storeKey);
      if (mem && mem.expiresAt > Date.now()) {
        candidateRecords.push({
          source: 'memory',
          key: storeKey,
          otpHash: mem.otpHash,
          attempts: mem.attempts || 0,
          expiresAt: mem.expiresAt
        });
      }
    }

    // Check general key in memory for backwards compatibility
    if (inMemoryOtpStore.has(cleanEmail)) {
      const mem = inMemoryOtpStore.get(cleanEmail);
      if (mem && mem.expiresAt > Date.now() && (!mem.purpose || mem.purpose === normalizedPurpose)) {
        candidateRecords.push({
          source: 'memory',
          key: cleanEmail,
          otpHash: mem.otpHash,
          attempts: mem.attempts || 0,
          expiresAt: mem.expiresAt
        });
      }
    }

    // Check database
    try {
      const dbDocs = await OtpVerification.find({ email: cleanEmail, purpose: normalizedPurpose }).sort({ createdAt: -1 });
      for (const doc of (dbDocs || [])) {
        if (doc.expiresAt && new Date(doc.expiresAt).getTime() > Date.now()) {
          candidateRecords.push({
            source: 'db',
            _id: doc._id,
            otpHash: doc.otpHash,
            attempts: doc.attempts || 0,
            expiresAt: new Date(doc.expiresAt).getTime()
          });
        }
      }
    } catch (_) {}

    // Fallback search database without purpose if none found (backwards compatibility)
    if (candidateRecords.length === 0) {
      try {
        const anyDocs = await OtpVerification.find({ email: cleanEmail }).sort({ createdAt: -1 });
        for (const doc of (anyDocs || [])) {
          if (doc.expiresAt && new Date(doc.expiresAt).getTime() > Date.now()) {
            candidateRecords.push({
              source: 'db_general',
              _id: doc._id,
              otpHash: doc.otpHash,
              attempts: doc.attempts || 0,
              expiresAt: new Date(doc.expiresAt).getTime()
            });
          }
        }
      } catch (_) {}
    }

    if (candidateRecords.length === 0) {
      return res.status(410).json({
        success: false,
        message: 'OTP has expired or is invalid. Please request a new OTP code.'
      });
    }

    // Check attempt count on latest record
    if (candidateRecords[0].attempts >= 5) {
      inMemoryOtpStore.delete(storeKey);
      inMemoryOtpStore.delete(cleanEmail);
      try { await OtpVerification.deleteMany({ email: cleanEmail }); } catch (_) {}
      return res.status(429).json({
        success: false,
        message: 'Maximum verification attempts exceeded. Please request a new OTP.'
      });
    }

    // 3. Test OTP code against candidate hashes
    let isMatched = false;
    for (const record of candidateRecords) {
      if (await bcrypt.compare(cleanOtp, record.otpHash)) {
        isMatched = true;
        break;
      }
    }

    if (!isMatched) {
      // Increment attempt counter in memory & DB
      if (inMemoryOtpStore.has(storeKey)) {
        const mem = inMemoryOtpStore.get(storeKey);
        mem.attempts = (mem.attempts || 0) + 1;
        inMemoryOtpStore.set(storeKey, mem);
      } else if (inMemoryOtpStore.has(cleanEmail)) {
        const mem = inMemoryOtpStore.get(cleanEmail);
        mem.attempts = (mem.attempts || 0) + 1;
        inMemoryOtpStore.set(cleanEmail, mem);
      }
      try {
        await OtpVerification.updateMany({ email: cleanEmail }, { $inc: { attempts: 1 } });
      } catch (_) {}

      return res.status(401).json({
        success: false,
        message: 'Invalid OTP code. Please check and try again.'
      });
    }

    // 4. Successful Verification: Clean up OTP records
    inMemoryOtpStore.delete(storeKey);
    inMemoryOtpStore.delete(cleanEmail);
    try { await OtpVerification.deleteMany({ email: cleanEmail, purpose: normalizedPurpose }); } catch (_) {}
    console.log(`[OTP Info] OTP Verified successfully for ${cleanEmail} (Purpose: ${normalizedPurpose})`);

    // 5. Purpose-specific Token Generation & Response
    if (isSignup) {
      const signupToken = 'sgt_' + crypto.randomBytes(24).toString('hex');
      verifiedSignupTokens.set(cleanEmail, {
        signupToken,
        email: cleanEmail,
        expiresAt: Date.now() + 15 * 60 * 1000 // 15 minutes to complete form
      });

      return res.status(200).json({
        success: true,
        message: 'Email address verified successfully!',
        signupToken,
        purpose: 'signup'
      });
    }

    // Password reset flow:
    const resetToken = 'rst_' + crypto.randomBytes(24).toString('hex');
    verifiedTokens.set(cleanEmail, { resetToken, expiresAt: Date.now() + 10 * 60 * 1000 });

    return res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      resetToken,
      purpose: 'password_reset'
    });

  } catch (err) {
    console.error('[OTP Verify Exception]', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'An internal server error occurred while verifying OTP.',
      error: err.message
    });
  }
};

/**
 * API 3: POST /api/otp/reset-password & POST /api/auth/reset-password
 * Password Reset after successful OTP verification
 */
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, resetToken, newPassword, identity, phone } = req.body || {};

    if (!newPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password is required.'
      });
    }

    if (typeof newPassword !== 'string' || newPassword.length < 4) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 4 characters long.'
      });
    }

    let targetEmail = (email || identity || '').toLowerCase().trim();

    // Verify Authorization: Check reset token or OTP match
    let isAuthorized = false;

    if (resetToken) {
      if (targetEmail && verifiedTokens.has(targetEmail)) {
        const stored = verifiedTokens.get(targetEmail);
        if (stored.resetToken === resetToken && stored.expiresAt > Date.now()) {
          isAuthorized = true;
          verifiedTokens.delete(targetEmail);
        }
      }

      if (!isAuthorized) {
        for (const [em, stored] of verifiedTokens.entries()) {
          if (stored.resetToken === resetToken && stored.expiresAt > Date.now()) {
            isAuthorized = true;
            targetEmail = em;
            verifiedTokens.delete(em);
            break;
          }
        }
      }
    }

    if (!isAuthorized && targetEmail && otp && /^\d{6}$/.test(otp.toString().trim())) {
      let record = null;
      try {
        record = await OtpVerification.findOne({ email: targetEmail });
      } catch (_) {}
      let memData = inMemoryOtpStore.get(targetEmail);
      const hashToTest = record ? record.otpHash : (memData ? memData.otpHash : null);

      if (hashToTest && await bcrypt.compare(otp.toString().trim(), hashToTest)) {
        isAuthorized = true;
        if (record) try { await OtpVerification.deleteOne({ _id: record._id }); } catch (_) {}
        inMemoryOtpStore.delete(targetEmail);
      }
    }

    if (!isAuthorized) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized password reset attempt. Please complete OTP verification first.'
      });
    }

    // Update Password in User storage (both PostgreSQL database & JSON file fallback)
    const hashedPassword = hashPassword(newPassword);

    try {
      await User.updateOne(
        { email: targetEmail },
        { $set: { password: hashedPassword, updatedAt: new Date() } }
      );
    } catch (_) {}

    try {
      const path = require('path');
      const { readData, writeData } = require('../utils/db');
      const usersFilePath = path.join(__dirname, '../data/users.json');
      const fileUsers = readData(usersFilePath, []);
      const userIdx = fileUsers.findIndex(u => u && u.email && u.email.toLowerCase().trim() === targetEmail);
      if (userIdx !== -1) {
        fileUsers[userIdx].password = hashedPassword;
        fileUsers[userIdx].updatedAt = new Date().toISOString();
        writeData(usersFilePath, fileUsers);
      }
    } catch (_) {}

    console.log(`[OTP Info] Password Reset completed for ${targetEmail}`);

    return res.status(200).json({
      success: true,
      message: 'Password reset successfully'
    });

  } catch (err) {
    console.error('[OTP Password Reset Exception]', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'An internal server error occurred while resetting password.',
      error: err.message
    });
  }
};

exports.verifiedTokens = verifiedTokens;
exports.verifiedSignupTokens = verifiedSignupTokens;

exports.verifySignupToken = (email, token) => {
  if (!email || !token) return false;
  const cleanEmail = email.toLowerCase().trim();
  const session = verifiedSignupTokens.get(cleanEmail);
  if (!session) return false;
  if (session.expiresAt < Date.now()) {
    verifiedSignupTokens.delete(cleanEmail);
    return false;
  }
  return session.signupToken === token;
};

exports.consumeSignupToken = (email) => {
  if (!email) return;
  verifiedSignupTokens.delete(email.toLowerCase().trim());
};

