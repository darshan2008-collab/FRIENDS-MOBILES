const { query } = require('../config/db');

const formatOrder = (row) => {
  if (!row) return null;
  const customer = typeof row.customer === 'string' ? JSON.parse(row.customer) : row.customer;
  const items = typeof row.items === 'string' ? JSON.parse(row.items) : row.items;
  return {
    orderId: row.order_id,
    customer: customer || {},
    items: items || [],
    total: parseFloat(row.total || 0),
    subtotal: parseFloat(row.subtotal || 0),
    shipping: parseFloat(row.shipping_fee || 0),
    shippingFee: parseFloat(row.shipping_fee || 0),
    paymentMethod: row.payment_method || 'COD',
    paymentStatus: row.payment_status || 'Pending',
    status: row.status || 'Processing',
    razorpayOrderId: row.razorpay_order_id || '',
    razorpayPaymentId: row.razorpay_payment_id || '',
    estimatedDelivery: row.estimated_delivery || '',
    paymentVerifiedAt: row.payment_verified_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
};

const Order = {
  find: async (conditions = {}) => {
    let sql = 'SELECT * FROM orders';
    const params = [];
    const clauses = [];

    if (conditions.orderId) {
      params.push(conditions.orderId);
      clauses.push(`order_id = $${params.length}`);
    }

    if (clauses.length > 0) {
      sql += ' WHERE ' + clauses.join(' AND ');
    }
    sql += ' ORDER BY created_at DESC';

    const res = await query(sql, params);
    return res.rows.map(formatOrder);
  },

  findOne: async (conditions = {}) => {
    if (conditions.orderId) {
      const res = await query('SELECT * FROM orders WHERE LOWER(order_id) = LOWER($1) LIMIT 1', [conditions.orderId.trim()]);
      return res.rows.length > 0 ? formatOrder(res.rows[0]) : null;
    }
    const orders = await Order.find(conditions);
    return orders.length > 0 ? orders[0] : null;
  },

  updateOne: async (whereQuery, updateData, options = {}) => {
    const data = updateData.$set || updateData;
    const orderId = whereQuery.orderId || data.orderId;

    if (!orderId) throw new Error("orderId is required for Order update");

    const customerJSON = JSON.stringify(data.customer || {});
    const itemsJSON = JSON.stringify(data.items || []);
    const total = parseFloat(data.total || 0);
    const subtotal = parseFloat(data.subtotal || 0);
    const shippingFee = parseFloat(data.shipping !== undefined ? data.shipping : (data.shippingFee || 0));
    const paymentMethod = data.paymentMethod || 'COD';
    const paymentStatus = data.paymentStatus || 'Pending';
    const status = data.status || 'Processing';
    const razorpayOrderId = data.razorpayOrderId || '';
    const razorpayPaymentId = data.razorpayPaymentId || '';
    const estimatedDelivery = data.estimatedDelivery || '';

    const res = await query(`
      INSERT INTO orders (order_id, customer, items, total, subtotal, shipping_fee, payment_method, payment_status, status, razorpay_order_id, razorpay_payment_id, estimated_delivery, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
      ON CONFLICT (order_id) DO UPDATE SET
        customer = EXCLUDED.customer,
        items = EXCLUDED.items,
        total = EXCLUDED.total,
        subtotal = EXCLUDED.subtotal,
        shipping_fee = EXCLUDED.shipping_fee,
        payment_method = EXCLUDED.payment_method,
        payment_status = EXCLUDED.payment_status,
        status = EXCLUDED.status,
        razorpay_order_id = EXCLUDED.razorpay_order_id,
        razorpay_payment_id = EXCLUDED.razorpay_payment_id,
        estimated_delivery = EXCLUDED.estimated_delivery,
        updated_at = NOW()
      RETURNING *;
    `, [orderId, customerJSON, itemsJSON, total, subtotal, shippingFee, paymentMethod, paymentStatus, status, razorpayOrderId, razorpayPaymentId, estimatedDelivery]);

    return { matchedCount: 1, modifiedCount: 1, order: formatOrder(res.rows[0]) };
  },

  deleteOne: async (whereQuery) => {
    const orderId = whereQuery.orderId;
    if (!orderId) return { deletedCount: 0 };
    const res = await query('DELETE FROM orders WHERE order_id = $1', [orderId]);
    return { deletedCount: res.rowCount };
  }
};

module.exports = Order;
