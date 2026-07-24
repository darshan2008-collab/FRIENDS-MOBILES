const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const OtpVerification = require('../models/OtpVerification');
const User = require('../models/User');
const { sendOTPEmail } = require('../utils/email');

// In-memory verification token cache for password reset session bridging
const verifiedTokens = new Map();
// Fallback in-memory OTP store (ensures OTPs work even if database is offline)
const inMemoryOtpStore = new Map();

setInterval(() => {
  const now = Date.now();
  for (const [k, v] of inMemoryOtpStore.entries()) {
    if (v.expiresAt < now) inMemoryOtpStore.delete(k);
  }
}, 60 * 1000);

// Helper to hash passwords for User collection update
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

/**
 * API 1: POST /api/otp/send
 * Generate 6-digit OTP, store bcrypt hash, send Nodemailer email
 */
exports.sendOtp = async (req, res) => {
  try {
    const { email, purpose = 'password_reset' } = req.body || {};

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

    // 2. Find user if exists (to retrieve name for email header)
    const existingUser = (await User.findOne({ email: cleanEmail })) || {};

    // 3. Generate secure random 6-digit OTP
    const rawOtp = crypto.randomInt(100000, 1000000).toString();

    // 4. Hash OTP using bcrypt (never store plain OTP)
    const saltRounds = 10;
    const otpHash = await bcrypt.hash(rawOtp, saltRounds);

    // 5. Delete any previous OTP documents for the same email
    try { await OtpVerification.deleteMany({ email: cleanEmail }); } catch (_) {}

    // 6. OTP Lifetime: 5 Minutes (300 seconds)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // 7. Insert new OTP document into PostgreSQL & In-Memory Fallback Store
    inMemoryOtpStore.set(cleanEmail, {
      otpHash,
      purpose,
      attempts: 0,
      verified: false,
      expiresAt: expiresAt.getTime()
    });

    try {
      await OtpVerification.create({
        email: cleanEmail,
        otpHash,
        purpose,
        attempts: 0,
        verified: false,
        expiresAt
      });
    } catch (_) {}

    // 8. Log Request
    console.log(`[OTP Info] OTP Requested for ${cleanEmail}`);

    // 9. Send Email via Nodemailer SMTP (or dev console fallback)
    const customerName = existingUser.name || 'Valued Customer';
    const emailResult = await sendOTPEmail(cleanEmail, rawOtp, customerName);

    if (!emailResult || !emailResult.success) {
      console.error(`[OTP Error] Email dispatch failed for ${cleanEmail}:`, emailResult?.error);
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
      message: 'OTP sent successfully'
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
 * API 2: POST /api/otp/verify
 * Validate 6-digit OTP, check attempts, compare bcrypt hash
 */
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body || {};

    // 1. Validation
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email address and OTP code are required.'
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = otp.toString().trim();

    // OTP must contain exactly 6 digits
    if (!/^\d{6}$/.test(cleanOtp)) {
      return res.status(400).json({
        success: false,
        message: 'OTP must contain exactly 6 numeric digits.'
      });
    }

    // 2. Find Active OTP Document (DB or In-Memory Store)
    let record = await OtpVerification.findOne({ email: cleanEmail }).sort({ createdAt: -1 });
    let isMemoryRecord = false;

    if (!record && inMemoryOtpStore.has(cleanEmail)) {
      const memData = inMemoryOtpStore.get(cleanEmail);
      record = {
        _id: 'mem_' + Date.now(),
        email: cleanEmail,
        otpHash: memData.otpHash,
        attempts: memData.attempts || 0,
        expiresAt: new Date(memData.expiresAt),
        save: async function() {
          memData.attempts = this.attempts;
          inMemoryOtpStore.set(cleanEmail, memData);
        }
      };
      isMemoryRecord = true;
    }

    if (!record) {
      return res.status(410).json({
        success: false,
        message: 'OTP has expired or is invalid. Please request a new OTP.'
      });
    }

    // 3. Check Expiry
    if (new Date() > record.expiresAt) {
      if (!isMemoryRecord) try { await OtpVerification.deleteOne({ _id: record._id }); } catch (_) {}
      inMemoryOtpStore.delete(cleanEmail);
      return res.status(410).json({
        success: false,
        message: 'OTP has expired. Please request a new OTP.'
      });
    }

    // 4. Check Maximum Attempts (Limit: 5)
    if (record.attempts >= 5) {
      if (!isMemoryRecord) try { await OtpVerification.deleteOne({ _id: record._id }); } catch (_) {}
      inMemoryOtpStore.delete(cleanEmail);
      return res.status(429).json({
        success: false,
        message: 'Maximum verification attempts exceeded. Please request a new OTP.'
      });
    }

    // 5. Compare bcrypt hash
    const isMatch = await bcrypt.compare(cleanOtp, record.otpHash);

    if (!isMatch) {
      record.attempts += 1;
      await record.save();

      return res.status(401).json({
        success: false,
        message: 'Invalid OTP code'
      });
    }

    // 6. Successful Verification: Delete OTP Document
    if (!isMemoryRecord) try { await OtpVerification.deleteOne({ _id: record._id }); } catch (_) {}
    inMemoryOtpStore.delete(cleanEmail);
    console.log(`[OTP Info] OTP Verified for ${cleanEmail}`);

    // Generate secure single-use reset token
    const resetToken = 'rst_' + crypto.randomBytes(24).toString('hex');
    verifiedTokens.set(cleanEmail, { resetToken, expiresAt: Date.now() + 10 * 60 * 1000 });

    return res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      resetToken
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
 * API 3: POST /api/otp/reset-password
 * Password Reset after successful OTP verification
 */
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, resetToken, newPassword } = req.body || {};

    if (!email || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email address and new password are required.'
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    if (typeof newPassword !== 'string' || newPassword.length < 4) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 4 characters long.'
      });
    }

    // Verify Authorization: Check reset token or OTP match
    let isAuthorized = false;
    if (resetToken && verifiedTokens.has(cleanEmail)) {
      const stored = verifiedTokens.get(cleanEmail);
      if (stored.resetToken === resetToken && stored.expiresAt > Date.now()) {
        isAuthorized = true;
        verifiedTokens.delete(cleanEmail);
      }
    }

    if (!isAuthorized && otp && /^\d{6}$/.test(otp.toString().trim())) {
      let record = await OtpVerification.findOne({ email: cleanEmail });
      let memData = inMemoryOtpStore.get(cleanEmail);
      const hashToTest = record ? record.otpHash : (memData ? memData.otpHash : null);

      if (hashToTest && await bcrypt.compare(otp.toString().trim(), hashToTest)) {
        isAuthorized = true;
        if (record) try { await OtpVerification.deleteOne({ _id: record._id }); } catch (_) {}
        inMemoryOtpStore.delete(cleanEmail);
      }
    }

    if (!isAuthorized) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized password reset attempt. Please complete OTP verification first.'
      });
    }

    // Update Password in User storage
    const hashedPassword = hashPassword(newPassword);
    const updateResult = await User.updateOne(
      { email: cleanEmail },
      { $set: { password: hashedPassword, updatedAt: new Date() } },
      { upsert: true }
    );

    console.log(`[OTP Info] Password Reset completed for ${cleanEmail}`);

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
