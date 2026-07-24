const { query } = require('../config/db');

const formatOtpRecord = (row) => {
  if (!row) return null;
  const instance = {
    _id: row.id,
    id: row.id,
    email: row.email,
    otpHash: row.otp_hash,
    purpose: row.purpose || 'password_reset',
    attempts: parseInt(row.attempts || 0),
    verified: Boolean(row.verified),
    expiresAt: new Date(row.expires_at),
    createdAt: new Date(row.created_at),
    save: async function () {
      await query('UPDATE otp_verifications SET attempts = $1, verified = $2, updated_at = NOW() WHERE id = $3', [this.attempts, this.verified, this.id]);
      return this;
    }
  };
  return instance;
};

const OtpVerification = {
  deleteMany: async (conditions = {}) => {
    if (conditions.email) {
      const res = await query('DELETE FROM otp_verifications WHERE LOWER(email) = LOWER($1)', [conditions.email.toLowerCase().trim()]);
      return { deletedCount: res.rowCount };
    }
    const res = await query('DELETE FROM otp_verifications');
    return { deletedCount: res.rowCount };
  },

  deleteOne: async (conditions = {}) => {
    if (conditions._id || conditions.id) {
      const targetId = conditions._id || conditions.id;
      const res = await query('DELETE FROM otp_verifications WHERE id = $1', [targetId]);
      return { deletedCount: res.rowCount };
    }
    if (conditions.email) {
      const res = await query('DELETE FROM otp_verifications WHERE LOWER(email) = LOWER($1)', [conditions.email.toLowerCase().trim()]);
      return { deletedCount: res.rowCount };
    }
    return { deletedCount: 0 };
  },

  create: async (data) => {
    const email = data.email.toLowerCase().trim();
    const res = await query(`
      INSERT INTO otp_verifications (email, otp_hash, purpose, attempts, verified, expires_at)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `, [
      email,
      data.otpHash,
      data.purpose || 'password_reset',
      data.attempts || 0,
      Boolean(data.verified),
      data.expiresAt
    ]);
    return formatOtpRecord(res.rows[0]);
  },

  findOne: (conditions = {}) => {
    const chainable = {
      sort: async (sortOptions = {}) => {
        if (conditions.email) {
          const res = await query('SELECT * FROM otp_verifications WHERE LOWER(email) = LOWER($1) ORDER BY created_at DESC LIMIT 1', [conditions.email.toLowerCase().trim()]);
          return res.rows.length > 0 ? formatOtpRecord(res.rows[0]) : null;
        }
        const res = await query('SELECT * FROM otp_verifications ORDER BY created_at DESC LIMIT 1');
        return res.rows.length > 0 ? formatOtpRecord(res.rows[0]) : null;
      },
      then: function (resolve, reject) {
        return this.sort().then(resolve, reject);
      }
    };
    return chainable;
  }
};

module.exports = OtpVerification;
