const { query } = require('../config/db');

const formatSetting = (row) => {
  if (!row) return null;
  return {
    freeShippingThreshold: parseFloat(row.free_shipping_threshold || 499),
    standardShippingFee: parseFloat(row.standard_shipping_fee || 49),
    storeName: row.store_name || 'FRIENDS MOBILE',
    storeCity: row.store_city || 'Madurai, Tamil Nadu',
    storePhone: row.store_phone || '+91 74485 78507',
    updatedAt: row.updated_at
  };
};

const Setting = {
  findOne: async () => {
    const res = await query('SELECT * FROM settings ORDER BY id ASC LIMIT 1');
    return res.rows.length > 0 ? formatSetting(res.rows[0]) : null;
  },

  updateOne: async (whereQuery, updateData, options = {}) => {
    const data = updateData.$set || updateData;
    const existing = await Setting.findOne();

    const freeShippingThreshold = data.freeShippingThreshold !== undefined ? parseFloat(data.freeShippingThreshold) : (existing?.freeShippingThreshold || 499);
    const standardShippingFee = data.standardShippingFee !== undefined ? parseFloat(data.standardShippingFee) : (existing?.standardShippingFee || 49);
    const storeName = data.storeName || existing?.storeName || 'FRIENDS MOBILE';
    const storeCity = data.storeCity || existing?.storeCity || 'Madurai, Tamil Nadu';
    const storePhone = data.storePhone || existing?.storePhone || '+91 74485 78507';

    const res = await query(`
      INSERT INTO settings (id, free_shipping_threshold, standard_shipping_fee, store_name, store_city, store_phone, updated_at)
      VALUES (1, $1, $2, $3, $4, $5, NOW())
      ON CONFLICT (id) DO UPDATE SET
        free_shipping_threshold = EXCLUDED.free_shipping_threshold,
        standard_shipping_fee = EXCLUDED.standard_shipping_fee,
        store_name = EXCLUDED.store_name,
        store_city = EXCLUDED.store_city,
        store_phone = EXCLUDED.store_phone,
        updated_at = NOW()
      RETURNING *;
    `, [freeShippingThreshold, standardShippingFee, storeName, storeCity, storePhone]);

    return { matchedCount: 1, modifiedCount: 1, settings: formatSetting(res.rows[0]) };
  }
};

module.exports = Setting;
