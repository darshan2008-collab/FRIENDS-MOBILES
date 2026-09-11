const express = require('express');
const router = express.Router();
const ServiceRequest = require('../models/ServiceRequest');
const { sanitizeInput, normalizePhone, rateLimiter } = require('../utils/db');

// Rate limiter for creating repair requests (max 15 requests per 10 minutes)
const serviceRequestLimiter = rateLimiter({
  windowMs: 10 * 60 * 1000,
  max: 15,
  message: 'Too many repair requests submitted. Please wait a few minutes or contact us directly on WhatsApp.'
});

// POST /api/service-requests - Create a new mobile repair / pickup request
router.post('/', serviceRequestLimiter, async (req, res) => {
  try {
    const {
      customerName,
      customerPhone,
      customerAddress,
      deviceBrand,
      deviceModel,
      defectType,
      defectDescription,
      pickupPreferredDate,
      deviceImage
    } = req.body;

    if (!customerName || !customerPhone || !customerAddress || !deviceModel || !defectDescription) {
      return res.status(400).json({
        success: false,
        message: 'Please provide customer name, phone number, pickup address, device model, and defect description.'
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
    const cleanAddress = sanitizeInput(customerAddress);
    const cleanBrand = sanitizeInput(deviceBrand || 'Other');
    const cleanModel = sanitizeInput(deviceModel);
    const cleanDefectType = sanitizeInput(defectType || 'General Repair');
    const cleanDefectDesc = sanitizeInput(defectDescription);
    const cleanPickupDate = sanitizeInput(pickupPreferredDate || '');

    const requestId = `SRV-${Date.now().toString().slice(-4)}${Math.floor(1000 + Math.random() * 9000)}`;

    const newRequest = await ServiceRequest.create({
      requestId,
      customerName: cleanName,
      customerPhone: cleanPhone,
      customerAddress: cleanAddress,
      deviceBrand: cleanBrand,
      deviceModel: cleanModel,
      defectType: cleanDefectType,
      defectDescription: cleanDefectDesc,
      pickupPreferredDate: cleanPickupDate,
      deviceImage: deviceImage || '',
      status: 'Pending Pickup',
      estimatedCost: 0,
      adminNotes: ''
    });

    return res.status(201).json({
      success: true,
      message: 'Mobile repair request registered successfully. Our store executive will contact you for doorstep pickup!',
      request: newRequest
    });
  } catch (error) {
    console.error('[ServiceRequest Route Error - Create]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit repair request. Please try again or WhatsApp us at +91 93445 22086.'
    });
  }
});

// GET /api/service-requests/track - Lookup request by requestId or phone
router.get('/track', async (req, res) => {
  try {
    const { requestId, phone } = req.query;

    if (!requestId && !phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a Service Request ID or 10-digit phone number to track status.'
      });
    }

    let results = [];
    if (requestId) {
      const cleanRequestId = sanitizeInput(requestId).trim().toUpperCase();
      const match = await ServiceRequest.findOne({ requestId: cleanRequestId });
      if (match) results.push(match);
    } else if (phone) {
      const cleanPhone = normalizePhone(phone);
      results = await ServiceRequest.find({ customerPhone: cleanPhone });
    }

    return res.json({
      success: true,
      requests: results
    });
  } catch (error) {
    console.error('[ServiceRequest Route Error - Track]:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to query repair request status. Please try again.'
    });
  }
});

// GET /api/service-requests/user/:phone - Get user's repair requests
router.get('/user/:phone', async (req, res) => {
  try {
    const cleanPhone = normalizePhone(req.params.phone);
    if (!cleanPhone) {
      return res.json({ success: true, requests: [] });
    }

    const requests = await ServiceRequest.find({ customerPhone: cleanPhone });
    return res.json({
      success: true,
      requests
    });
  } catch (error) {
    console.error('[ServiceRequest Route Error - User]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve repair history.'
    });
  }
});

module.exports = router;
