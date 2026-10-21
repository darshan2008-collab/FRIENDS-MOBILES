const { query } = require('../config/db');

const formatSetting = (row) => {
  if (!row) return null;
  return {
    freeShippingThreshold: parseFloat(row.free_shipping_threshold || 1000),
    standardShippingFee: parseFloat(row.standard_shipping_fee || 70),
    expressShippingFee: parseFloat(row.express_shipping_fee || 99),
    codFee: parseFloat(row.cod_fee !== undefined && row.cod_fee !== null ? row.cod_fee : 0),
    codMinAmount: parseFloat(row.cod_min_amount !== undefined && row.cod_min_amount !== null ? row.cod_min_amount : 300),
    codEnabled: row.cod_enabled !== undefined && row.cod_enabled !== null ? Boolean(row.cod_enabled) : true,
    storeName: row.store_name || 'FRIENDS MOBILE',
    storeCity: row.store_city || 'Madurai, Tamil Nadu',
    storePhone: row.support_phone || row.store_phone || '+91 93445 22086',
    supportPhone: row.support_phone || row.store_phone || '+91 93445 22086',
    supportEmail: row.support_email || 'friendsmobile@gmail.com',
    storeUpiId: row.store_upi_id || 'darshankannan2008@oksbi',
    storePayeeName: row.store_payee_name || 'FRIENDS MOBILE',
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

    const freeShippingThreshold = data.freeShippingThreshold !== undefined ? parseFloat(data.freeShippingThreshold) : (existing?.freeShippingThreshold || 1000);
    const standardShippingFee = data.standardShippingFee !== undefined ? parseFloat(data.standardShippingFee) : (existing?.standardShippingFee || 70);
    const expressShippingFee = data.expressShippingFee !== undefined ? parseFloat(data.expressShippingFee) : (existing?.expressShippingFee || 99);
    const codFee = data.codFee !== undefined ? parseFloat(data.codFee) : (existing?.codFee !== undefined ? existing.codFee : 0);
    const codMinAmount = data.codMinAmount !== undefined ? parseFloat(data.codMinAmount) : (existing?.codMinAmount !== undefined ? existing.codMinAmount : 300);
    const codEnabled = data.codEnabled !== undefined ? Boolean(data.codEnabled) : (existing?.codEnabled !== undefined ? existing.codEnabled : true);
    const storeName = data.storeName || existing?.storeName || 'FRIENDS MOBILE';
    const storeCity = data.storeCity || existing?.storeCity || 'Madurai, Tamil Nadu';
    const storePhone = data.supportPhone || data.storePhone || existing?.supportPhone || existing?.storePhone || '+91 93445 22086';
    const supportPhone = data.supportPhone || existing?.supportPhone || storePhone;
    const supportEmail = data.supportEmail || existing?.supportEmail || 'friendsmobile@gmail.com';
    const storeUpiId = data.storeUpiId || existing?.storeUpiId || 'darshankannan2008@oksbi';
    const storePayeeName = data.storePayeeName || existing?.storePayeeName || 'FRIENDS MOBILE';

    const res = await query(`
      INSERT INTO settings (id, free_shipping_threshold, standard_shipping_fee, express_shipping_fee, cod_fee, cod_min_amount, cod_enabled, store_name, store_city, store_phone, support_phone, support_email, store_upi_id, store_payee_name, updated_at)
      VALUES (1, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
      ON CONFLICT (id) DO UPDATE SET
        free_shipping_threshold = EXCLUDED.free_shipping_threshold,
        standard_shipping_fee = EXCLUDED.standard_shipping_fee,
        express_shipping_fee = EXCLUDED.express_shipping_fee,
        cod_fee = EXCLUDED.cod_fee,
        cod_min_amount = EXCLUDED.cod_min_amount,
        cod_enabled = EXCLUDED.cod_enabled,
        store_name = EXCLUDED.store_name,
        store_city = EXCLUDED.store_city,
        store_phone = EXCLUDED.store_phone,
        support_phone = EXCLUDED.support_phone,
        support_email = EXCLUDED.support_email,
        store_upi_id = EXCLUDED.store_upi_id,
        store_payee_name = EXCLUDED.store_payee_name,
        updated_at = NOW()
      RETURNING *;
    `, [freeShippingThreshold, standardShippingFee, expressShippingFee, codFee, codMinAmount, codEnabled, storeName, storeCity, storePhone, supportPhone, supportEmail, storeUpiId, storePayeeName]);

    return { matchedCount: 1, modifiedCount: 1, settings: formatSetting(res.rows[0]) };
  }
};

module.exports = Setting;
