const rateLimitMap = new Map();

// Clean expired rate limit buckets periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Rate Limiter Middleware for OTP Generation (Max 5 requests per hour)
 */
const sendOtpLimiter = (req, res, next) => {
  const email = req.body.email ? req.body.email.toLowerCase().trim() : '';
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
  const key = `send_otp_${email || ip}`;
  const now = Date.now();
  const windowMs = 60 * 60 * 1000; // 1 Hour
  const maxRequests = 5;

  if (!rateLimitMap.has(key)) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return next();
  }

  const record = rateLimitMap.get(key);
  if (now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return next();
  }

  if (record.count >= maxRequests) {
    console.warn(`[OTP Rate Limit Exceeded] Email/IP ${key} attempted > ${maxRequests} requests per hour.`);
    return res.status(429).json({
      success: false,
      message: 'Too many OTP requests. Maximum 5 requests allowed per hour. Please try again later.'
    });
  }

  record.count += 1;
  rateLimitMap.set(key, record);
  next();
};

/**
 * Rate Limiter Middleware for OTP Verification (Max 5 verification attempts per window)
 */
const verifyOtpLimiter = (req, res, next) => {
  const email = req.body.email ? req.body.email.toLowerCase().trim() : '';
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
  const key = `verify_otp_${email || ip}`;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 Minutes
  const maxAttempts = 10;

  if (!rateLimitMap.has(key)) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return next();
  }

  const record = rateLimitMap.get(key);
  if (now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return next();
  }

  if (record.count >= maxAttempts) {
    console.warn(`[OTP Verification Rate Limit Exceeded] Email/IP ${key} attempted > ${maxAttempts} verifications.`);
    return res.status(429).json({
      success: false,
      message: 'Too many verification attempts. Please wait 15 minutes before trying again.'
    });
  }

  record.count += 1;
  rateLimitMap.set(key, record);
  next();
};

module.exports = {
  sendOtpLimiter,
  verifyOtpLimiter
};
