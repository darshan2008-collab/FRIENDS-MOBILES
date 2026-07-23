const mongoose = require('mongoose');

let cachedConn = null;

const connectDB = async () => {
  if (cachedConn && mongoose.connection.readyState === 1) {
    return true;
  }
  try {
    const connStr = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/friends_mobile';
    const conn = await mongoose.connect(connStr, {
      serverSelectionTimeoutMS: 5000
    });
    cachedConn = conn;
    console.log(`[MongoDB] Connected Successfully: ${conn.connection.host}/${conn.connection.name}`);
    return true;
  } catch (error) {
    console.warn(`[MongoDB Warning] Connection failed (${error.message}). Will retry on next request.`);
    return false;
  }
};

module.exports = connectDB;
