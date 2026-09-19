const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const requestsFilePath = path.join(__dirname, '../data/custom_requests.json');
const pricingFilePath = path.join(__dirname, '../data/custom_pricing.json');

const DEFAULT_CUSTOM_PRICING = {
  hardCase3D: {
    price: 399,
    originalPrice: 499,
    label: 'Full 3D Hard Case (Sides + Back Print)'
  },
  glossyFinish: {
    price: 449,
    originalPrice: 549,
    label: 'Glossy / Glass Finish Case'
  },
  softSilicone: {
    price: 349,
    originalPrice: 449,
    label: 'Soft Silicone TPU Case'
  },
  mobileSkin: {
    price: 299,
    originalPrice: 399,
    label: 'Mobile Skin Wrap (Back & Camera)'
  }
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

function getRequests() {
  return readData(requestsFilePath, []);
}

function saveRequests(reqs) {
  writeData(requestsFilePath, reqs);
}

// GET /api/custom-cover/pricing — Fetch custom studio pricing
router.get('/pricing', (req, res) => {
  try {
    const pricing = readData(pricingFilePath, DEFAULT_CUSTOM_PRICING);
    res.json({ success: true, pricing });
  } catch (err) {
    res.json({ success: true, pricing: DEFAULT_CUSTOM_PRICING });
  }
});

// PUT /api/custom-cover/pricing — Update custom studio pricing
router.put('/pricing', (req, res) => {
  try {
    const { pricing } = req.body;
    if (!pricing || typeof pricing !== 'object') {
      return res.status(400).json({ success: false, message: 'Invalid pricing data provided' });
    }
    const merged = {
      ...DEFAULT_CUSTOM_PRICING,
      ...pricing
    };
    writeData(pricingFilePath, merged);
    res.json({ success: true, message: 'Custom studio pricing updated successfully', pricing: merged });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to save pricing', error: err.message });
  }
});

// POST /api/custom-cover/request
router.post('/request', (req, res) => {
  try {
    const { phoneModel, designDetails, customerPhone, productType } = req.body;

    if (!phoneModel || !customerPhone) {
      return res.status(400).json({ success: false, message: 'Please provide phone model and contact number' });
    }

    const requests = getRequests();
    const newReq = {
      id: `CC-${Date.now()}`,
      phoneModel,
      productType: productType || 'Mobile Back Cover',
      designDetails: designDetails || 'Standard Custom Print',
      customerPhone,
      createdAt: new Date().toISOString(),
      status: 'Received'
    };

    requests.push(newReq);
    saveRequests(requests);

    res.status(201).json({ success: true, message: 'Customization request received!', request: newReq });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Request submission failed', error: err.message });
  }
});

module.exports = router;
