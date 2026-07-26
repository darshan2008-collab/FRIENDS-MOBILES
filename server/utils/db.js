const fs = require('fs');
const path = require('path');

// Safe JSON file reading (returns fallback array if file does not exist)
function readData(filePath, fallbackData = []) {
  try {
    if (!fs.existsSync(filePath)) {
      return fallbackData;
    }
    const content = fs.readFileSync(filePath, 'utf8');
    if (!content || !content.trim()) return fallbackData;
    return JSON.parse(content);
  } catch (err) {
    return fallbackData;
  }
}

function writeData(filePath, data) {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error(`[writeData Error] ${filePath}:`, err.message);
    return false;
  }
}

// XSS Sanitization helper
function sanitizeInput(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .trim();
}

// Normalize phone numbers (retains digits only)
function normalizePhone(phone) {
  if (!phone) return '';
  const digits = String(phone).replace(/\D/g, '');
  if (digits.length > 10) return digits.slice(-10);
  return digits;
}

// Rate Limiter Memory Store
function rateLimiter({ windowMs = 15 * 60 * 1000, max = 20, message = 'Too many requests, please try again later.' }) {
  const rateLimitMap = new Map();
  return (req, res, next) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    const now = Date.now();
    
    if (!rateLimitMap.has(ip)) {
      rateLimitMap.set(ip, []);
    }
    
    const timestamps = rateLimitMap.get(ip).filter(time => now - time < windowMs);
    timestamps.push(now);
    rateLimitMap.set(ip, timestamps);
    
    if (timestamps.length > max) {
      return res.status(429).json({ success: false, message });
    }
    
    next();
  };
}

module.exports = {
  readData,
  writeData,
  sanitizeInput,
  normalizePhone,
  rateLimiter
};
