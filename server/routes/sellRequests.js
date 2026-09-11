const express = require('express');
const router = express.Router();
const SellPhoneRequest = require('../models/SellPhoneRequest');
const { sanitizeInput, normalizePhone, rateLimiter } = require('../utils/db');

// Rate limiter for sell requests (max 15 requests per 10 minutes)
const sellRequestLimiter = rateLimiter({
  windowMs: 10 * 60 * 1000,
  max: 15,
  message: 'Too many sell requests submitted. Please wait a few minutes or contact us directly on WhatsApp.'
});

// POST /api/sell-requests - Submit a phone buyback / sell request
router.post('/', sellRequestLimiter, async (req, res) => {
  try {
    const {
      customerName,
      customerPhone,
      customerAddress,
      deviceBrand,
      deviceModel,
      deviceStorage,
      screenCondition,
      bodyCondition,
      functionalIssues,
      accessoriesIncluded,
      specifications,
      devicePhotos,
      estimatedQuote,
      pickupPreferredDate
    } = req.body;

    if (!customerName || !customerPhone || !deviceBrand || !deviceModel) {
      return res.status(400).json({
        success: false,
        message: 'Please provide customer name, phone number, device brand, and model.'
      });
    }

    const cleanPhone = normalizePhone(customerPhone);
    if (!cleanPhone || cleanPhone.length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid 10-digit mobile number.'
      });
    }

    const cleanName = sanitizeInput(customerName);
    const cleanAddress = sanitizeInput(customerAddress || 'Direct Store Drop-in / Karur');
    const cleanBrand = sanitizeInput(deviceBrand);
    const cleanModel = sanitizeInput(deviceModel);
    const cleanSpecs = sanitizeInput(specifications || '');
    const cleanStorage = sanitizeInput(deviceStorage || 'Unspecified');
    const cleanScreen = sanitizeInput(screenCondition || 'Good');
    const cleanBody = sanitizeInput(bodyCondition || 'Good');
    const cleanFunctional = sanitizeInput(functionalIssues || 'None');
    const cleanAccessories = sanitizeInput(accessoriesIncluded || 'None');
    const cleanPickupDate = sanitizeInput(pickupPreferredDate || 'Today');
    const parsedQuote = parseFloat(estimatedQuote) || 0;
    const cleanPhotos = Array.isArray(devicePhotos) ? devicePhotos.filter(p => typeof p === 'string' && p.startsWith('data:image/')) : [];

    const requestId = `SELL-${Date.now().toString().slice(-4)}${Math.floor(1000 + Math.random() * 9000)}`;

    const newRequest = await SellPhoneRequest.create({
      requestId,
      customerName: cleanName,
      customerPhone: cleanPhone,
      customerAddress: cleanAddress,
      deviceBrand: cleanBrand,
      deviceModel: cleanModel,
      deviceStorage: cleanStorage,
      screenCondition: cleanScreen,
      bodyCondition: cleanBody,
      functionalIssues: cleanFunctional,
      accessoriesIncluded: cleanAccessories,
      specifications: cleanSpecs,
      devicePhotos: cleanPhotos,
      estimatedQuote: parsedQuote,
      finalOffer: parsedQuote,
      pickupPreferredDate: cleanPickupDate,
      status: 'Pending Inspection'
    });

    return res.status(201).json({
      success: true,
      message: 'Your sell request has been booked successfully! Our technician will verify the phone.',
      request: newRequest
    });
  } catch (error) {
    console.error('Error creating sell request:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit sell request. Please try again or WhatsApp us.'
    });
  }
});

// GET /api/sell-requests/track - Lookup request by requestId or phone
router.get('/track', async (req, res) => {
  try {
    const { query } = req.query;
    if (!query || query.trim().length < 4) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid Request ID (e.g. SELL-1234) or 10-digit phone number.'
      });
    }

    const cleanQuery = query.trim();
    let requests = [];

    if (cleanQuery.toUpperCase().startsWith('SELL-')) {
      const match = await SellPhoneRequest.findOne({ requestId: cleanQuery.toUpperCase() });
      if (match) requests = [match];
    } else {
      const cleanPhone = normalizePhone(cleanQuery);
      if (cleanPhone) {
        requests = await SellPhoneRequest.find({ customerPhone: cleanPhone });
      }
    }

    return res.json({
      success: true,
      count: requests.length,
      requests
    });
  } catch (error) {
    console.error('Error tracking sell request:', error);
    return res.status(500).json({
      success: false,
      message: 'Error searching sell request status.'
    });
  }
});

// GET /api/sell-requests/user/:phone - Get user's sell requests
router.get('/user/:phone', async (req, res) => {
  try {
    const { phone } = req.params;
    const cleanPhone = normalizePhone(phone);
    if (!cleanPhone) {
      return res.status(400).json({ success: false, message: 'Invalid phone number.' });
    }

    const requests = await SellPhoneRequest.find({ customerPhone: cleanPhone });
    return res.json({
      success: true,
      count: requests.length,
      requests
    });
  } catch (error) {
    console.error('Error retrieving user sell requests:', error);
    return res.status(500).json({
      success: false,
      message: 'Error retrieving your sell history.'
    });
  }
});

module.exports = router;
