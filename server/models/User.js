const { query } = require('../config/db');

const formatUser = (row) => {
  if (!row) return null;
  return {
    id: parseInt(row.id),
    name: row.name,
    email: row.email || '',
    phone: row.phone || '',
    password: row.password,
    address: row.address || '',
    pincode: row.pincode || '',
    role: row.role || 'customer',
    googleId: row.google_id || '',
    picture: row.picture || '',
    authProvider: row.auth_provider || 'local',
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
};

const User = {
  find: async (conditions = {}) => {
    let sql = 'SELECT * FROM users';
    const params = [];
    const clauses = [];

    if (conditions.email) {
      params.push(conditions.email.toLowerCase().trim());
      clauses.push(`LOWER(email) = $${params.length}`);
    }
    if (conditions.phone) {
      params.push(conditions.phone.trim());
      clauses.push(`phone = $${params.length}`);
    }
    if (conditions.id) {
      params.push(conditions.id);
      clauses.push(`id = $${params.length}`);
    }

    if (clauses.length > 0) {
      sql += ' WHERE ' + clauses.join(' OR ');
    }
    sql += ' ORDER BY id ASC';

    const res = await query(sql, params);
    return res.rows.map(formatUser);
  },

  findOne: async (conditions = {}) => {
    if (conditions.$or && Array.isArray(conditions.$or)) {
      for (const cond of conditions.$or) {
        const key = Object.keys(cond)[0];
        const val = cond[key];
        if (key === 'email' && val) {
          if (typeof val === 'object' && val.$regex) {
            const pattern = val.$regex.source || String(val.$regex);
            const cleanPattern = pattern.replace(/^\^|\$$/g, '');
            const res = await query('SELECT * FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1', [cleanPattern]);
            if (res.rows.length > 0) return formatUser(res.rows[0]);
          } else {
            const res = await query('SELECT * FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1', [String(val).toLowerCase().trim()]);
            if (res.rows.length > 0) return formatUser(res.rows[0]);
          }
        } else if (key === 'phone' && val) {
          const res = await query('SELECT * FROM users WHERE phone = $1 LIMIT 1', [String(val).trim()]);
          if (res.rows.length > 0) return formatUser(res.rows[0]);
        }
      }
      return null;
    }

    if (conditions.email) {
      const res = await query('SELECT * FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1', [conditions.email.toLowerCase().trim()]);
      return res.rows.length > 0 ? formatUser(res.rows[0]) : null;
    }
    if (conditions.phone) {
      const res = await query('SELECT * FROM users WHERE phone = $1 LIMIT 1', [conditions.phone.trim()]);
      return res.rows.length > 0 ? formatUser(res.rows[0]) : null;
    }
    if (conditions.id) {
      const res = await query('SELECT * FROM users WHERE id = $1 LIMIT 1', [conditions.id]);
      return res.rows.length > 0 ? formatUser(res.rows[0]) : null;
    }

    const res = await query('SELECT * FROM users ORDER BY id ASC LIMIT 1');
    return res.rows.length > 0 ? formatUser(res.rows[0]) : null;
  },

  findById: async (id) => {
    const res = await query('SELECT * FROM users WHERE id = $1', [id]);
    return res.rows.length > 0 ? formatUser(res.rows[0]) : null;
  },

  create: async (data) => {
    const res = await query(`
      INSERT INTO users (name, email, phone, password, address, pincode, role, google_id, picture, auth_provider)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *;
    `, [
      data.name,
      data.email ? data.email.toLowerCase().trim() : '',
      data.phone ? String(data.phone).trim() : '',
      data.password || 'no_pass',
      data.address || '',
      data.pincode || '',
      data.role || 'customer',
      data.googleId || '',
      data.picture || '',
      data.authProvider || 'local'
    ]);
    return formatUser(res.rows[0]);
  },

  updateOne: async (whereQuery, updateData, options = {}) => {
    const data = updateData.$set || updateData;
    const cleanEmail = whereQuery.email ? whereQuery.email.toLowerCase().trim() : (data.email ? data.email.toLowerCase().trim() : '');
    const cleanPhone = whereQuery.phone ? String(whereQuery.phone).trim() : (data.phone ? String(data.phone).trim() : '');
    const userId = whereQuery.id || data.id;

    // Try finding existing user
    let existing = null;
    if (userId) existing = await User.findById(userId);
    if (!existing && cleanEmail) existing = await User.findOne({ email: cleanEmail });
    if (!existing && cleanPhone) existing = await User.findOne({ phone: cleanPhone });

    if (!existing) {
      if (!options.upsert) return { matchedCount: 0, modifiedCount: 0 };
      const created = await User.create(data);
      return { matchedCount: 1, modifiedCount: 1, user: created };
    }

    const name = data.name !== undefined ? data.name : existing.name;
    const email = data.email !== undefined ? data.email.toLowerCase().trim() : existing.email;
    const phone = data.phone !== undefined ? String(data.phone).trim() : existing.phone;
    const password = data.password !== undefined ? data.password : existing.password;
    const address = data.address !== undefined ? data.address : existing.address;
    const pincode = data.pincode !== undefined ? data.pincode : existing.pincode;
    const role = data.role !== undefined ? data.role : existing.role;
    const googleId = data.googleId !== undefined ? data.googleId : existing.googleId;
    const picture = data.picture !== undefined ? data.picture : existing.picture;
    const authProvider = data.authProvider !== undefined ? data.authProvider : existing.authProvider;

    const res = await query(`
      UPDATE users SET
        name = $1, email = $2, phone = $3, password = $4, address = $5, pincode = $6, role = $7, google_id = $8, picture = $9, auth_provider = $10, updated_at = NOW()
      WHERE id = $11
      RETURNING *;
    `, [name, email, phone, password, address, pincode, role, googleId, picture, authProvider, existing.id]);

    return { matchedCount: 1, modifiedCount: 1, user: formatUser(res.rows[0]) };
  }
};

module.exports = User;
