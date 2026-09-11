const path = require('path');
const { query } = require('../config/db');
const { readData, writeData } = require('../utils/db');

const fallbackFilePath = path.join(__dirname, '../data/service_requests.json');

const formatServiceRequest = (row) => {
  if (!row) return null;
  return {
    id: parseInt(row.id) || Date.now(),
    requestId: row.request_id || row.requestId,
    customerName: row.customer_name || row.customerName || 'Customer',
    customerPhone: row.customer_phone || row.customerPhone || '',
    customerAddress: row.customer_address || row.customerAddress || '',
    deviceBrand: row.device_brand || row.deviceBrand || 'Other',
    deviceModel: row.device_model || row.deviceModel || 'Unspecified',
    defectType: row.defect_type || row.defectType || 'General Repair',
    defectDescription: row.defect_description || row.defectDescription || '',
    pickupPreferredDate: row.pickup_preferred_date || row.pickupPreferredDate || '',
    status: row.status || 'Pending Pickup',
    estimatedCost: row.estimated_cost !== undefined ? parseFloat(row.estimated_cost) : (row.estimatedCost ? parseFloat(row.estimatedCost) : 0),
    deviceImage: row.device_image || row.deviceImage || '',
    adminNotes: row.admin_notes || row.adminNotes || '',
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
    updatedAt: row.updated_at || row.updatedAt || new Date().toISOString()
  };
};

const ServiceRequest = {
  find: async (conditions = {}) => {
    try {
      let sql = 'SELECT * FROM service_requests';
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
        return res.rows.map(formatServiceRequest);
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
    return items.map(formatServiceRequest);
  },

  findOne: async (conditions = {}) => {
    const res = await ServiceRequest.find(conditions);
    return res.length > 0 ? res[0] : null;
  },

  create: async (data) => {
    const requestId = data.requestId || `SRV-${Math.floor(100000 + Math.random() * 900000)}`;
    const now = new Date().toISOString();
    const newRecord = {
      id: Date.now(),
      requestId,
      customerName: data.customerName || 'Customer',
      customerPhone: data.customerPhone || '',
      customerAddress: data.customerAddress || '',
      deviceBrand: data.deviceBrand || 'Other',
      deviceModel: data.deviceModel || 'Unspecified',
      defectType: data.defectType || 'General Repair',
      defectDescription: data.defectDescription || '',
      pickupPreferredDate: data.pickupPreferredDate || '',
      status: data.status || 'Pending Pickup',
      estimatedCost: data.estimatedCost || 0,
      deviceImage: data.deviceImage || '',
      adminNotes: data.adminNotes || '',
      createdAt: now,
      updatedAt: now
    };

    try {
      const res = await query(`
        INSERT INTO service_requests (
          request_id, customer_name, customer_phone, customer_address, 
          device_brand, device_model, defect_type, defect_description, 
          pickup_preferred_date, status, estimated_cost, admin_notes, created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
        RETURNING *;
      `, [
        requestId,
        newRecord.customerName,
        newRecord.customerPhone,
        newRecord.customerAddress,
        newRecord.deviceBrand,
        newRecord.deviceModel,
        newRecord.defectType,
        newRecord.defectDescription,
        newRecord.pickupPreferredDate,
        newRecord.status,
        newRecord.estimatedCost,
        newRecord.adminNotes
      ]);
      if (res && res.rows && res.rows.length > 0) {
        // Also sync JSON fallback
        const items = readData(fallbackFilePath, []);
        items.unshift(formatServiceRequest(res.rows[0]));
        writeData(fallbackFilePath, items);
        return formatServiceRequest(res.rows[0]);
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
      const existing = await ServiceRequest.findOne({ requestId });
      if (existing) {
        const status = data.status !== undefined ? data.status : existing.status;
        const estimatedCost = data.estimatedCost !== undefined ? data.estimatedCost : existing.estimatedCost;
        const adminNotes = data.adminNotes !== undefined ? data.adminNotes : existing.adminNotes;
        const pickupPreferredDate = data.pickupPreferredDate !== undefined ? data.pickupPreferredDate : existing.pickupPreferredDate;

        const res = await query(`
          UPDATE service_requests
          SET status = $1, estimated_cost = $2, admin_notes = $3, pickup_preferred_date = $4, updated_at = NOW()
          WHERE request_id = $5
          RETURNING *;
        `, [status, estimatedCost, adminNotes, pickupPreferredDate, requestId]);

        if (res && res.rows && res.rows.length > 0) {
          const updated = formatServiceRequest(res.rows[0]);
          // Sync JSON
          const items = readData(fallbackFilePath, []);
          const idx = items.findIndex(i => (i.requestId || i.request_id) === requestId);
          if (idx !== -1) items[idx] = updated;
          writeData(fallbackFilePath, items);
          return updated;
        }
      }
    } catch (_) {}

    // Fallback JSON update
    const items = readData(fallbackFilePath, []);
    const idx = items.findIndex(i => (i.requestId || i.request_id) === requestId);
    if (idx !== -1) {
      items[idx] = {
        ...items[idx],
        ...data,
        updatedAt: new Date().toISOString()
      };
      writeData(fallbackFilePath, items);
      return formatServiceRequest(items[idx]);
    }
    return null;
  },

  deleteOne: async (whereQuery) => {
    const requestId = whereQuery.requestId || whereQuery.id;
    if (!requestId) return false;

    try {
      const res = await query('DELETE FROM service_requests WHERE request_id = $1 RETURNING *;', [requestId]);
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

module.exports = ServiceRequest;

