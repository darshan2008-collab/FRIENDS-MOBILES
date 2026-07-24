const { query } = require('../config/db');

const formatProduct = (row) => {
  if (!row) return null;
  return {
    id: parseInt(row.id),
    title: row.title,
    category: row.category,
    discount: row.discount || '',
    price: parseFloat(row.price),
    originalPrice: parseFloat(row.original_price),
    rating: parseFloat(row.rating || 5.0),
    reviews: parseInt(row.reviews || 0),
    inStock: Boolean(row.in_stock),
    stock: parseInt(row.stock || 50),
    img: row.img || '',
    fallback: row.fallback || row.img || '',
    description: row.description || '',
    brand: row.brand || '',
    badge: row.badge || '',
    isTrending: Boolean(row.is_trending),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
};

const Product = {
  find: async (conditions = {}) => {
    let sql = 'SELECT * FROM products';
    const params = [];
    const clauses = [];

    if (conditions.id !== undefined) {
      params.push(conditions.id);
      clauses.push(`id = $${params.length}`);
    }
    if (conditions.category) {
      params.push(conditions.category);
      clauses.push(`LOWER(category) = LOWER($${params.length})`);
    }

    if (clauses.length > 0) {
      sql += ' WHERE ' + clauses.join(' AND ');
    }
    sql += ' ORDER BY id ASC';

    const res = await query(sql, params);
    return res.rows.map(formatProduct);
  },

  findOne: async (conditions = {}) => {
    const products = await Product.find(conditions);
    return products.length > 0 ? products[0] : null;
  },

  findById: async (id) => {
    const res = await query('SELECT * FROM products WHERE id = $1', [id]);
    return res.rows.length > 0 ? formatProduct(res.rows[0]) : null;
  },

  updateOne: async (whereQuery, updateData, options = {}) => {
    const pId = whereQuery.id || updateData.id || updateData.$set?.id;
    const data = updateData.$set || updateData;

    if (!pId) throw new Error("Product ID is required for update");

    const existing = await Product.findById(pId);
    if (!existing && !options.upsert) {
      return { matchedCount: 0, modifiedCount: 0 };
    }

    const title = data.title !== undefined ? data.title : existing?.title || 'Product';
    const category = data.category !== undefined ? data.category : existing?.category || 'Accessories';
    const discount = data.discount !== undefined ? data.discount : existing?.discount || '';
    const price = data.price !== undefined ? parseFloat(data.price) : existing?.price || 0;
    const originalPrice = data.originalPrice !== undefined ? parseFloat(data.originalPrice) : existing?.originalPrice || price;
    const rating = data.rating !== undefined ? parseFloat(data.rating) : existing?.rating || 5.0;
    const reviews = data.reviews !== undefined ? parseInt(data.reviews) : existing?.reviews || 0;
    const inStock = data.inStock !== undefined ? Boolean(data.inStock) : (existing ? existing.inStock : true);
    const stock = data.stock !== undefined ? parseInt(data.stock) : existing?.stock || 50;
    const img = data.img !== undefined ? data.img : existing?.img || '';
    const fallback = data.fallback !== undefined ? data.fallback : existing?.fallback || img;
    const description = data.description !== undefined ? data.description : existing?.description || '';
    const brand = data.brand !== undefined ? data.brand : existing?.brand || '';
    const badge = data.badge !== undefined ? data.badge : existing?.badge || '';
    const isTrending = data.isTrending !== undefined ? Boolean(data.isTrending) : existing?.isTrending || false;

    const res = await query(`
      INSERT INTO products (id, title, category, discount, price, original_price, rating, reviews, in_stock, stock, img, fallback, description, brand, badge, is_trending, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW())
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        category = EXCLUDED.category,
        discount = EXCLUDED.discount,
        price = EXCLUDED.price,
        original_price = EXCLUDED.original_price,
        rating = EXCLUDED.rating,
        reviews = EXCLUDED.reviews,
        in_stock = EXCLUDED.in_stock,
        stock = EXCLUDED.stock,
        img = EXCLUDED.img,
        fallback = EXCLUDED.fallback,
        description = EXCLUDED.description,
        brand = EXCLUDED.brand,
        badge = EXCLUDED.badge,
        is_trending = EXCLUDED.is_trending,
        updated_at = NOW()
      RETURNING *;
    `, [pId, title, category, discount, price, originalPrice, rating, reviews, inStock, stock, img, fallback, description, brand, badge, isTrending]);

    return { matchedCount: 1, modifiedCount: 1, product: formatProduct(res.rows[0]) };
  },

  deleteOne: async (whereQuery) => {
    const pId = whereQuery.id;
    if (!pId) return { deletedCount: 0 };
    const res = await query('DELETE FROM products WHERE id = $1', [pId]);
    return { deletedCount: res.rowCount };
  }
};

module.exports = Product;
