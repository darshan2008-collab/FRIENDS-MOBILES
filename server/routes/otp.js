const express = require('express');
const router = express.Router();
const otpController = require('../controllers/otpController');
const { sendOtpLimiter, verifyOtpLimiter } = require('../middleware/otpRateLimiter');

// POST /api/otp/send - Send 6-digit OTP email
router.post('/send', sendOtpLimiter, otpController.sendOtp);

// POST /api/otp/verify - Verify 6-digit OTP against bcrypt hash
router.post('/verify', verifyOtpLimiter, otpController.verifyOtp);

// POST /api/otp/reset-password - Reset password after successful verification
router.post('/reset-password', otpController.resetPassword);

module.exports = router;
