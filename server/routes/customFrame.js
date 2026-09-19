const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const framePricingFilePath = path.join(__dirname, '../data/frame_pricing.json');

const DEFAULT_FRAME_SIZES = [
  {
    id: 'frame_4x6',
    label: '4 x 6 inches (Table Desk Frame)',
    dimensions: '4 x 6 inches',
    price: 299,
    originalPrice: 399,
    active: true,
    order: 1
  },
  {
    id: 'frame_6x8',
    label: '6 x 8 inches (Standard Desk / Wall)',
    dimensions: '6 x 8 inches',
    price: 449,
    originalPrice: 599,
    active: true,
    order: 2
  },
  {
    id: 'frame_8x10',
    label: '8 x 10 inches (Wall Frame)',
    dimensions: '8 x 10 inches',
    price: 649,
    originalPrice: 849,
    active: true,
    order: 3
  },
  {
    id: 'frame_12x18',
    label: '12 x 18 inches (Gallery Wall Frame)',
    dimensions: '12 x 18 inches',
    price: 999,
    originalPrice: 1299,
    active: true,
    order: 4
  },
  {
    id: 'frame_18x24',
    label: '18 x 24 inches (Masterpiece Wall Frame)',
    dimensions: '18 x 24 inches',
    price: 1499,
    originalPrice: 1999,
    active: true,
    order: 5
  }
];

const DEFAULT_CUSTOM_FRAME_FORMULA = {
  basePrice: 150,
  pricePerSqInch: 3.1,
  minPrice: 299,
  maxPrice: 9999,
  allowCustomDimensions: true
};

const DEFAULT_FRAME_CONFIG = {
  sizes: DEFAULT_FRAME_SIZES,
  formula: DEFAULT_CUSTOM_FRAME_FORMULA
};

function readData(filePath, fallback) {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
  } catch (_) {}
  return fallback;
}

function writeData(filePath, data) {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (_) {}
}

// GET /api/custom-frame/pricing — Fetch photo frame pricing and sizes
router.get('/pricing', (req, res) => {
  try {
    const pricing = readData(framePricingFilePath, DEFAULT_FRAME_CONFIG);
    res.json({ success: true, framePricing: pricing });
  } catch (err) {
    console.error('[FramePricing GET Error]', err.message);
    res.json({ success: true, framePricing: DEFAULT_FRAME_CONFIG });
  }
});

// PUT /api/custom-frame/pricing — Update photo frame pricing, sizes & formula
router.put('/pricing', (req, res) => {
  try {
    const { framePricing } = req.body;
    if (!framePricing || typeof framePricing !== 'object') {
      return res.status(400).json({ success: false, message: 'Invalid frame pricing data provided' });
    }

    const sizes = Array.isArray(framePricing.sizes) && framePricing.sizes.length > 0
      ? framePricing.sizes
      : DEFAULT_FRAME_SIZES;

    const formula = framePricing.formula && typeof framePricing.formula === 'object'
      ? { ...DEFAULT_CUSTOM_FRAME_FORMULA, ...framePricing.formula }
      : DEFAULT_CUSTOM_FRAME_FORMULA;

    const configToSave = {
      sizes,
      formula
    };

    writeData(framePricingFilePath, configToSave);
    res.json({
      success: true,
      message: 'Photo frame pricing & sizes saved successfully',
      framePricing: configToSave
    });
  } catch (err) {
    console.error('[FramePricing PUT Error]', err.message);
    res.status(500).json({ success: false, message: 'Failed to save photo frame pricing' });
  }
});

module.exports = router;
