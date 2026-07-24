const express = require('express');
const router = express.Router();
const Subscriber = require('../models/Subscriber');

// POST /api/newsletter/subscribe
router.post('/subscribe', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, message: 'Invalid email address' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await Subscriber.findOne({ email: cleanEmail });

    if (existing) {
      return res.json({ success: true, message: 'You are already subscribed!' });
    }

    await Subscriber.create({
      email: cleanEmail,
      subscribedAt: new Date().toISOString()
    });

    res.status(201).json({ success: true, message: 'Subscribed to FRIENDS MOBILE newsletter!' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Subscription failed', error: err.message });
  }
});

module.exports = router;
