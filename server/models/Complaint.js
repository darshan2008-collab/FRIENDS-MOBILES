const { query } = require('../config/db');

const formatComplaint = (row) => {
  if (!row) return null;
  return {
    id: parseInt(row.id),
    ticketId: row.ticket_id,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    customerEmail: row.customer_email || '',
    orderId: row.order_id || '',
    category: row.category || 'General Issue',
    message: row.message,
    status: row.status || 'Open',
    adminNotes: row.admin_notes || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
};

const Complaint = {
  find: async (conditions = {}) => {
    let sql = 'SELECT * FROM complaints';
    const params = [];
    const clauses = [];

    if (conditions.ticketId) {
      params.push(conditions.ticketId);
      clauses.push(`ticket_id = $${params.length}`);
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
    return res.rows.map(formatComplaint);
  },

  findOne: async (conditions = {}) => {
    const res = await Complaint.find(conditions);
    return res.length > 0 ? res[0] : null;
  },

  create: async (data) => {
    const ticketId = data.ticketId || `TKT-${Date.now()}`;
    const res = await query(`
      INSERT INTO complaints (ticket_id, customer_name, customer_phone, customer_email, order_id, category, message, status, admin_notes, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
      RETURNING *;
    `, [
      ticketId,
      data.customerName || 'Customer',
      data.customerPhone || '',
      data.customerEmail || '',
      data.orderId || '',
      data.category || 'General Issue',
      data.message || '',
      data.status || 'Open',
      data.adminNotes || ''
    ]);
    return formatComplaint(res.rows[0]);
  },

  updateOne: async (whereQuery, updateData) => {
    const ticketId = whereQuery.ticketId || whereQuery.id || updateData.ticketId;
    const data = updateData.$set || updateData;

    const existing = await Complaint.findOne({ ticketId });
    if (!existing) return null;

    const status = data.status !== undefined ? data.status : existing.status;
    const adminNotes = data.adminNotes !== undefined ? data.adminNotes : existing.adminNotes;

    const res = await query(`
      UPDATE complaints
      SET status = $1, admin_notes = $2, updated_at = NOW()
      WHERE ticket_id = $3
      RETURNING *;
    `, [status, adminNotes, ticketId]);

    return formatComplaint(res.rows[0]);
  }
};

module.exports = Complaint;
