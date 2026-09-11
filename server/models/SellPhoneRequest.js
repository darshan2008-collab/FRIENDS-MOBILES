const path = require('path');
const { query } = require('../config/db');
const { readData, writeData } = require('../utils/db');

const fallbackFilePath = path.join(__dirname, '../data/sell_requests.json');

const formatSellRequest = (row) => {
  if (!row) return null;
  return {
    id: parseInt(row.id) || Date.now(),
    requestId: row.request_id || row.requestId,
    customerName: row.customer_name || row.customerName || 'Customer',
    customerPhone: row.customer_phone || row.customerPhone || '',
    customerAddress: row.customer_address || row.customerAddress || '',
    deviceBrand: row.device_brand || row.deviceBrand || 'Other',
    deviceModel: row.device_model || row.deviceModel || 'Unspecified',
    deviceStorage: row.device_storage || row.deviceStorage || '128GB',
    screenCondition: row.screen_condition || row.screenCondition || 'Good',
    bodyCondition: row.body_condition || row.bodyCondition || 'Good',
    functionalIssues: row.functional_issues || row.functionalIssues || 'None',
    accessoriesIncluded: row.accessories_included || row.accessoriesIncluded || 'None',
    specifications: row.specifications || row.device_specifications || '',
    devicePhotos: row.device_photos || row.devicePhotos || [],
    estimatedQuote: row.estimated_quote !== undefined ? parseFloat(row.estimated_quote) : (row.estimatedQuote ? parseFloat(row.estimatedQuote) : 0),
    finalOffer: row.final_offer !== undefined ? parseFloat(row.final_offer) : (row.finalOffer ? parseFloat(row.finalOffer) : 0),
    pickupPreferredDate: row.pickup_preferred_date || row.pickupPreferredDate || '',
    status: row.status || 'Pending Inspection',
    adminNotes: row.admin_notes || row.adminNotes || '',
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
    updatedAt: row.updated_at || row.updatedAt || new Date().toISOString()
  };
};

const SellPhoneRequest = {
  find: async (conditions = {}) => {
    try {
      let sql = 'SELECT * FROM sell_requests';
      const params = [];
      const clauses = [];

      if (conditions.requestId) {
        params.push(conditions.requestId);
        clauses.push(`request_id = $${params.length}`);
      }
      if (conditions.status) {
        params.push(conditions.status);
        clauses.push(`status = $${params.length}`);
      }
      if (conditions.customerPhone) {
        params.push(conditions.customerPhone);
        clauses.push(`customer_phone = $${params.length}`);
      }

      if (clauses.length > 0) {
        sql += ' WHERE ' + clauses.join(' AND ');
      }
      sql += ' ORDER BY id DESC';

      const res = await query(sql, params);
      if (res && res.rows && res.rows.length > 0) {
        return res.rows.map(formatSellRequest);
      }
    } catch (_) {}

    // Fallback to JSON file
    let items = readData(fallbackFilePath, []);
    if (conditions.requestId) {
      items = items.filter(i => (i.requestId || i.request_id) === conditions.requestId);
    }
    if (conditions.status) {
      items = items.filter(i => (i.status || '').toLowerCase() === conditions.status.toLowerCase());
    }
    if (conditions.customerPhone) {
      items = items.filter(i => String(i.customerPhone || i.customer_phone).replace(/\D/g, '').includes(String(conditions.customerPhone).replace(/\D/g, '')));
    }
    return items.map(formatSellRequest);
  },

  findOne: async (conditions = {}) => {
    const res = await SellPhoneRequest.find(conditions);
    return res.length > 0 ? res[0] : null;
  },

  create: async (data) => {
    const requestId = data.requestId || `SELL-${Math.floor(10000 + Math.random() * 90000)}`;
    const now = new Date().toISOString();
    const newRecord = {
      id: Date.now(),
      requestId,
      customerName: data.customerName || 'Customer',
      customerPhone: data.customerPhone || '',
      customerAddress: data.customerAddress || '',
      deviceBrand: data.deviceBrand || 'Other',
      deviceModel: data.deviceModel || 'Unspecified',
      deviceStorage: data.deviceStorage || '128GB',
      screenCondition: data.screenCondition || 'Good',
      bodyCondition: data.bodyCondition || 'Good',
      functionalIssues: data.functionalIssues || 'None',
      accessoriesIncluded: data.accessoriesIncluded || 'None',
      specifications: data.specifications || '',
      devicePhotos: Array.isArray(data.devicePhotos) ? data.devicePhotos : (data.devicePhoto ? [data.devicePhoto] : []),
      estimatedQuote: data.estimatedQuote || 0,
      finalOffer: data.finalOffer || 0,
      pickupPreferredDate: data.pickupPreferredDate || '',
      status: data.status || 'Pending Inspection',
      adminNotes: data.adminNotes || '',
      createdAt: now,
      updatedAt: now
    };

    try {
      const res = await query(`
        INSERT INTO sell_requests (
          request_id, customer_name, customer_phone, customer_address, 
          device_brand, device_model, device_storage, screen_condition, body_condition,
          functional_issues, accessories_included, estimated_quote, final_offer,
          pickup_preferred_date, status, admin_notes, created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW(), NOW())
        RETURNING *;
      `, [
        requestId,
        newRecord.customerName,
        newRecord.customerPhone,
        newRecord.customerAddress,
        newRecord.deviceBrand,
        newRecord.deviceModel,
        newRecord.deviceStorage,
        newRecord.screenCondition,
        newRecord.bodyCondition,
        newRecord.functionalIssues,
        newRecord.accessoriesIncluded,
        newRecord.estimatedQuote,
        newRecord.finalOffer,
        newRecord.pickupPreferredDate,
        newRecord.status,
        newRecord.adminNotes
      ]);
      if (res && res.rows && res.rows.length > 0) {
        const items = readData(fallbackFilePath, []);
        items.unshift(formatSellRequest(res.rows[0]));
        writeData(fallbackFilePath, items);
        return formatSellRequest(res.rows[0]);
      }
    } catch (_) {}

    // Fallback JSON persistence
    const items = readData(fallbackFilePath, []);
    items.unshift(newRecord);
    writeData(fallbackFilePath, items);
    return newRecord;
  },

  updateOne: async (whereQuery, updateData) => {
    const requestId = whereQuery.requestId || whereQuery.id || updateData.requestId;
    const data = updateData.$set || updateData;

    try {
      const existing = await SellPhoneRequest.findOne({ requestId });
      if (existing) {
        const status = data.status !== undefined ? data.status : existing.status;
        const estimatedQuote = data.estimatedQuote !== undefined ? data.estimatedQuote : existing.estimatedQuote;
        const finalOffer = data.finalOffer !== undefined ? data.finalOffer : existing.finalOffer;
        const adminNotes = data.adminNotes !== undefined ? data.adminNotes : existing.adminNotes;
        const pickupPreferredDate = data.pickupPreferredDate !== undefined ? data.pickupPreferredDate : existing.pickupPreferredDate;

        const res = await query(`
          UPDATE sell_requests
          SET status = $1, estimated_quote = $2, final_offer = $3, admin_notes = $4, pickup_preferred_date = $5, updated_at = NOW()
          WHERE request_id = $6
          RETURNING *;
        `, [status, estimatedQuote, finalOffer, adminNotes, pickupPreferredDate, requestId]);

        if (res && res.rows && res.rows.length > 0) {
          const updated = formatSellRequest(res.rows[0]);
          const items = readData(fallbackFilePath, []);
          const idx = items.findIndex(i => (i.requestId || i.request_id) === requestId);
          if (idx !== -1) items[idx] = updated;
          writeData(fallbackFilePath, items);
          return updated;
        }
      }
    } catch (_) {}

    const items = readData(fallbackFilePath, []);
    const idx = items.findIndex(i => (i.requestId || i.request_id) === requestId);
    if (idx !== -1) {
      items[idx] = {
        ...items[idx],
        ...data,
        updatedAt: new Date().toISOString()
      };
      writeData(fallbackFilePath, items);
      return formatSellRequest(items[idx]);
    }
    return null;
  },

  deleteOne: async (whereQuery) => {
    const requestId = whereQuery.requestId || whereQuery.id;
    if (!requestId) return false;

    try {
      const res = await query('DELETE FROM sell_requests WHERE request_id = $1 RETURNING *;', [requestId]);
      if (res && res.rowCount > 0) {
        const items = readData(fallbackFilePath, []);
        const filtered = items.filter(i => (i.requestId || i.request_id) !== requestId);
        writeData(fallbackFilePath, filtered);
        return true;
      }
    } catch (_) {}

    const items = readData(fallbackFilePath, []);
    const filtered = items.filter(i => (i.requestId || i.request_id) !== requestId);
    writeData(fallbackFilePath, filtered);
    return true;
  }
};

module.exports = SellPhoneRequest;
