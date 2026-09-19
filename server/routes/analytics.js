const express = require('express');
const router = express.Router();
const visitorService = require('../services/visitorService');

// POST /api/analytics/visit — Log client visit or pageview
router.post('/visit', (req, res) => {
  try {
    const { sessionId, visitorId, page, referrer } = req.body || {};
    const result = visitorService.recordVisit(req, { sessionId, visitorId, page, referrer });
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/analytics/heartbeat — Keep session alive & log duration
router.post('/heartbeat', (req, res) => {
  try {
    const { sessionId, durationSeconds, currentPage } = req.body || {};
    const result = visitorService.recordHeartbeat(sessionId, durationSeconds, currentPage);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/analytics/live — Real-time active visitors
router.get('/live', (req, res) => {
  try {
    const live = visitorService.getLiveVisitors();
    res.json({ success: true, ...live });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/analytics/stats — Full traffic, demographic & duration statistics
router.get('/stats', (req, res) => {
  try {
    const stats = visitorService.getTrafficStats();
    res.json({ success: true, stats });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
