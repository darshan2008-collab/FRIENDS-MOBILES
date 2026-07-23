const express = require('express');
const router = express.Router();
const path = require('path');
const { readData, writeData, sanitizeInput } = require('../utils/db');

const productsFilePath = path.join(__dirname, '../data/products.json');

function getProducts() {
  return readData(productsFilePath, []);
}

function saveProducts(products) {
  return writeData(productsFilePath, products);
}

router.get('/', (req, res) => {
  try {
    let products = getProducts();
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

router.get('/:id', (req, res) => {
  try {
    const products = getProducts();
    const product = products.find(p => p.id === parseInt(req.params.id));

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch product', error: err.message });
  }
});

router.post('/', (req, res) => {
  try {
    const { title, category, price, originalPrice, discount, img, fallback, description, inStock, rating, reviews } = req.body;

    if (!title || price === undefined || isNaN(price)) {
      return res.status(400).json({ success: false, message: 'Valid product title and numeric price are required' });
    }

    const sanitizedTitle = sanitizeInput(title);
    const sanitizedDesc = sanitizeInput(description || 'Premium mobile accessory from FRIENDS MOBILE.');
    const sanitizedCategory = sanitizeInput(category || 'Accessories');

    const products = getProducts();
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

    products.push(newProduct);
    saveProducts(products);

    res.status(201).json({
      success: true,
      message: 'Product added successfully!',
      product: newProduct
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to add product', error: err.message });
  }
});

router.put('/:id', (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const products = getProducts();
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

    products[index] = updatedProduct;
    saveProducts(products);

    res.json({
      success: true,
      message: 'Product updated successfully!',
      product: updatedProduct
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update product', error: err.message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    let products = getProducts();
    const initialCount = products.length;

    products = products.filter(p => p.id !== productId);

    if (products.length === initialCount) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    saveProducts(products);

    res.json({
      success: true,
      message: `Product #${productId} deleted successfully!`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete product', error: err.message });
  }
});

module.exports = router;
