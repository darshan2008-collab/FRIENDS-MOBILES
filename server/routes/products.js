const express = require('express');
const router = express.Router();
const path = require('path');
const mongoose = require('mongoose');
const { readData, writeData, sanitizeInput } = require('../utils/db');
const Product = require('../models/Product');

const productsFilePath = path.join(__dirname, '../data/products.json');

async function getProductsAsync() {
  if (mongoose.connection.readyState === 1) {
    try {
      const dbProducts = await Product.find({}).lean();
      if (dbProducts && dbProducts.length > 0) return dbProducts;
    } catch (_) {}
  }
  return readData(productsFilePath, []);
}

async function saveProductAsync(productData) {
  // Always update JSON for local consistency
  const fileProducts = readData(productsFilePath, []);
  const idx = fileProducts.findIndex(p => p.id === productData.id);
  if (idx >= 0) fileProducts[idx] = productData;
  else fileProducts.push(productData);
  writeData(productsFilePath, fileProducts);

  // Sync to MongoDB if connected
  if (mongoose.connection.readyState === 1) {
    try {
      await Product.updateOne({ id: productData.id }, { $set: productData }, { upsert: true });
    } catch (_) {}
  }
}

// GET /api/products (Advanced Search, Filter, Sort, Pagination)
router.get('/', async (req, res) => {
  try {
    let products = await getProductsAsync();
    const { search, category, sort, minPrice, maxPrice, inStockOnly, page, limit } = req.query;

    if (search) {
      const q = sanitizeInput(search).toLowerCase();
      products = products.filter(p => 
        (p.title && p.title.toLowerCase().includes(q)) || 
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q))
      );
    }

    if (category && category !== 'All') {
      const catClean = sanitizeInput(category).toLowerCase();
      products = products.filter(p => p.category && p.category.toLowerCase() === catClean);
    }

    if (minPrice !== undefined && !isNaN(minPrice)) {
      const minP = parseFloat(minPrice);
      products = products.filter(p => p.price >= minP);
    }
    if (maxPrice !== undefined && !isNaN(maxPrice)) {
      const maxP = parseFloat(maxPrice);
      products = products.filter(p => p.price <= maxP);
    }

    if (inStockOnly === 'true' || inStockOnly === '1') {
      products = products.filter(p => p.inStock === true);
    }

    if (sort === 'low-to-high' || sort === 'price_asc') {
      products.sort((a, b) => a.price - b.price);
    } else if (sort === 'high-to-low' || sort === 'price_desc') {
      products.sort((a, b) => b.price - a.price);
    } else if (sort === 'rating') {
      products.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sort === 'newest') {
      products.sort((a, b) => (b.id || 0) - (a.id || 0));
    }

    const totalCount = products.length;

    if (page || limit) {
      const p = Math.max(1, parseInt(page || 1));
      const l = Math.max(1, parseInt(limit || 20));
      const startIndex = (p - 1) * l;
      products = products.slice(startIndex, startIndex + l);
    }

    res.json({
      success: true,
      count: totalCount,
      returned: products.length,
      products
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch products', error: err.message });
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const products = await getProductsAsync();
    const product = products.find(p => p.id === parseInt(req.params.id));

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch product', error: err.message });
  }
});

// POST /api/products (Add New Product)
router.post('/', async (req, res) => {
  try {
    const { title, category, price, originalPrice, discount, img, fallback, description, inStock, rating, reviews } = req.body;

    if (!title || price === undefined || isNaN(price)) {
      return res.status(400).json({ success: false, message: 'Valid product title and numeric price are required' });
    }

    const sanitizedTitle = sanitizeInput(title);
    const sanitizedDesc = sanitizeInput(description || 'Premium mobile accessory from FRIENDS MOBILE.');
    const sanitizedCategory = sanitizeInput(category || 'Accessories');

    const products = await getProductsAsync();
    const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;

    const newProduct = {
      id: newId,
      title: sanitizedTitle,
      category: sanitizedCategory,
      discount: discount || '0%',
      price: parseFloat(price),
      originalPrice: parseFloat(originalPrice || price),
      rating: parseFloat(rating || 5.0),
      reviews: parseInt(reviews || 0),
      inStock: inStock !== undefined ? Boolean(inStock) : true,
      img: img || 'images/prod_airdopes.png',
      fallback: fallback || img || 'images/prod_airdopes.png',
      description: sanitizedDesc,
      createdAt: new Date().toISOString()
    };

    await saveProductAsync(newProduct);

    res.status(201).json({
      success: true,
      message: 'Product added successfully!',
      product: newProduct
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to add product', error: err.message });
  }
});

// PUT /api/products/:id (Update Product)
router.put('/:id', async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const products = await getProductsAsync();
    const index = products.findIndex(p => p.id === productId);

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const updatedProduct = {
      ...products[index],
      ...req.body,
      id: productId,
      title: req.body.title ? sanitizeInput(req.body.title) : products[index].title,
      description: req.body.description ? sanitizeInput(req.body.description) : products[index].description,
      category: req.body.category ? sanitizeInput(req.body.category) : products[index].category,
      price: req.body.price !== undefined ? parseFloat(req.body.price) : products[index].price,
      originalPrice: req.body.originalPrice !== undefined ? parseFloat(req.body.originalPrice) : products[index].originalPrice,
      updatedAt: new Date().toISOString()
    };

    await saveProductAsync(updatedProduct);

    res.json({
      success: true,
      message: 'Product updated successfully!',
      product: updatedProduct
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update product', error: err.message });
  }
});

// DELETE /api/products/:id (Delete Product)
router.delete('/:id', async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    let products = await getProductsAsync();
    const initialCount = products.length;

    products = products.filter(p => p.id !== productId);

    if (products.length === initialCount) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Delete in JSON
    writeData(productsFilePath, products);

    // Delete in MongoDB
    if (mongoose.connection.readyState === 1) {
      try {
        await Product.deleteOne({ id: productId });
      } catch (_) {}
    }

    res.json({
      success: true,
      message: `Product #${productId} deleted successfully!`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete product', error: err.message });
  }
});

module.exports = router;
