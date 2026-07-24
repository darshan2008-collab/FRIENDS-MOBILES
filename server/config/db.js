const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@127.0.0.1:5432/friends_mobile';

const pool = new Pool({
  connectionString,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('[PostgreSQL Pool Error]', err.message);
});

let isInitialized = false;

const initTablesSQL = `
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  discount VARCHAR(50) DEFAULT '',
  price NUMERIC(10,2) NOT NULL,
  original_price NUMERIC(10,2) NOT NULL,
  rating NUMERIC(3,2) DEFAULT 0,
  reviews INTEGER DEFAULT 0,
  in_stock BOOLEAN DEFAULT TRUE,
  stock INTEGER DEFAULT 50,
  img TEXT DEFAULT '',
  fallback TEXT DEFAULT '',
  description TEXT DEFAULT '',
  brand VARCHAR(100) DEFAULT '',
  badge VARCHAR(100) DEFAULT '',
  is_trending BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) DEFAULT '',
  phone VARCHAR(50) NOT NULL,
  password TEXT NOT NULL,
  address TEXT DEFAULT '',
  pincode VARCHAR(20) DEFAULT '',
  role VARCHAR(50) DEFAULT 'customer',
  google_id VARCHAR(255) DEFAULT '',
  picture TEXT DEFAULT '',
  auth_provider VARCHAR(50) DEFAULT 'local',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
  order_id VARCHAR(100) PRIMARY KEY,
  customer JSONB NOT NULL,
  items JSONB NOT NULL,
  total NUMERIC(10,2) NOT NULL,
  subtotal NUMERIC(10,2) DEFAULT 0,
  shipping_fee NUMERIC(10,2) DEFAULT 0,
  payment_method VARCHAR(100) DEFAULT 'COD',
  payment_status VARCHAR(50) DEFAULT 'Pending',
  status VARCHAR(100) DEFAULT 'Processing',
  razorpay_order_id VARCHAR(255) DEFAULT '',
  razorpay_payment_id VARCHAR(255) DEFAULT '',
  estimated_delivery VARCHAR(100) DEFAULT '',
  payment_verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS banners (
  id SERIAL PRIMARY KEY,
  slides JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS settings (
  id SERIAL PRIMARY KEY,
  free_shipping_threshold NUMERIC(10,2) DEFAULT 499,
  standard_shipping_fee NUMERIC(10,2) DEFAULT 49,
  store_name VARCHAR(255) DEFAULT 'FRIENDS MOBILE',
  store_city VARCHAR(255) DEFAULT 'Madurai, Tamil Nadu',
  store_phone VARCHAR(50) DEFAULT '+91 74485 78507',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS subscribers (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  subscribed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS otp_verifications (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  otp_hash TEXT NOT NULL,
  purpose VARCHAR(50) DEFAULT 'password_reset',
  attempts INTEGER DEFAULT 0,
  verified BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
`;

const connectDB = async () => {
  if (isInitialized) return true;
  try {
    const client = await pool.connect();
    try {
      await client.query(initTablesSQL);
      isInitialized = true;
      console.log(`[PostgreSQL] Connected & Database Schema Verified.`);
      return true;
    } finally {
      client.release();
    }
  } catch (error) {
    console.warn(`[PostgreSQL Warning] Connection/Init failed (${error.message}). Will retry on next request.`);
    return false;
  }
};

module.exports = {
  pool,
  query: (text, params) => pool.query(text, params),
  connectDB
};
