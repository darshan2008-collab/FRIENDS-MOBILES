const { query } = require('../config/db');

const formatSubscriber = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    subscribedAt: row.subscribed_at || row.created_at
  };
};

const Subscriber = {
  find: async () => {
    const res = await query('SELECT * FROM subscribers ORDER BY id ASC');
    return res.rows.map(formatSubscriber);
  },

  findOne: async (conditions = {}) => {
    if (conditions.email) {
      const res = await query('SELECT * FROM subscribers WHERE LOWER(email) = LOWER($1) LIMIT 1', [conditions.email.toLowerCase().trim()]);
      return res.rows.length > 0 ? formatSubscriber(res.rows[0]) : null;
    }
    return null;
  },

  create: async (data) => {
    const email = data.email ? data.email.toLowerCase().trim() : '';
    const res = await query(`
      INSERT INTO subscribers (email)
      VALUES ($1)
      ON CONFLICT (email) DO UPDATE SET updated_at = NOW()
      RETURNING *;
    `, [email]);
    return formatSubscriber(res.rows[0]);
  },

  updateOne: async (whereQuery, updateData, options = {}) => {
    const email = (whereQuery.email || updateData.email || updateData.$set?.email || '').toLowerCase().trim();
    if (!email) return { matchedCount: 0, modifiedCount: 0 };
    const res = await query(`
      INSERT INTO subscribers (email)
      VALUES ($1)
      ON CONFLICT (email) DO UPDATE SET updated_at = NOW()
      RETURNING *;
    `, [email]);
    return { matchedCount: 1, modifiedCount: 1, subscriber: formatSubscriber(res.rows[0]) };
  }
};

module.exports = Subscriber;
