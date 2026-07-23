const fs = require('fs');
const path = require('path');

function readData(filePath, fallbackData = []) {
  try {
    if (!fs.existsSync(filePath)) {
      writeData(filePath, fallbackData);
      return fallbackData;
    }
    const content = fs.readFileSync(filePath, 'utf8');
    if (!content || !content.trim()) return fallbackData;
    return JSON.parse(content);
  } catch (err) {
    console.error(`[DB Error] Failed to read ${filePath}:`, err.message);
    return fallbackData;
  }
}

// Atomic JSON file writing (writes to temp file first, then renames to prevent file corruption)
function writeData(filePath, data) {
  const writeSingle = (targetPath) => {
    try {
      const dir = path.dirname(targetPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const tempPath = `${targetPath}.${Date.now()}.${Math.random().toString(36).substring(2, 8)}.tmp`;
      const jsonString = JSON.stringify(data, null, 2);
      fs.writeFileSync(tempPath, jsonString, 'utf8');
      fs.renameSync(tempPath, targetPath);
      return true;
    } catch (err) {
      console.error(`[DB Error] Failed atomic write to ${targetPath}:`, err.message);
      try {
        fs.writeFileSync(targetPath, JSON.stringify(data, null, 2), 'utf8');
        return true;
      } catch (fallbackErr) {
        console.error(`[DB Error] Fallback write failed:`, fallbackErr.message);
        return false;
      }
    }
  };

  const primarySuccess = writeSingle(filePath);

  // Sync with twin data directory (server <-> backend)
  try {
    const normalizedPath = filePath.replace(/\\/g, '/');
    let twinPath = null;
    if (normalizedPath.includes('/server/data/')) {
      twinPath = normalizedPath.replace('/server/data/', '/backend/data/');
    } else if (normalizedPath.includes('/backend/data/')) {
      twinPath = normalizedPath.replace('/backend/data/', '/server/data/');
    }
    if (twinPath && twinPath !== normalizedPath) {
      writeSingle(path.normalize(twinPath));
    }
  } catch (_) {}

  return primarySuccess;
}

function sanitizeInput(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .trim();
}

function normalizePhone(phone) {
  if (!phone) return '';
  const digits = String(phone).replace(/\D/g, '');
  if (digits.length > 10) return digits.slice(-10);
  return digits;
}

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
