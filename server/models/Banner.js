const { query } = require('../config/db');

const Banner = {
  findOne: async () => {
    const res = await query('SELECT * FROM banners ORDER BY id ASC LIMIT 1');
    if (res.rows.length === 0) return null;
    const row = res.rows[0];
    const slides = typeof row.slides === 'string' ? JSON.parse(row.slides) : row.slides;
    return {
      id: row.id,
      slides: slides || [],
      updatedAt: row.updated_at
    };
  },

  deleteMany: async () => {
    await query('DELETE FROM banners');
    return { deletedCount: 1 };
  },

  create: async (data) => {
    const slidesJSON = JSON.stringify(data.slides || []);
    const res = await query(`
      INSERT INTO banners (id, slides, updated_at)
      VALUES (1, $1, NOW())
      ON CONFLICT (id) DO UPDATE SET
        slides = EXCLUDED.slides,
        updated_at = NOW()
      RETURNING *;
    `, [slidesJSON]);
    const row = res.rows[0];
    return {
      id: row.id,
      slides: typeof row.slides === 'string' ? JSON.parse(row.slides) : row.slides,
      updatedAt: row.updated_at
    };
  }
};

module.exports = Banner;
