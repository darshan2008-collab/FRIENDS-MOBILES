const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const subscribersFilePath = path.join(__dirname, '../data/subscribers.json');

function getSubscribers() {
  const data = fs.readFileSync(subscribersFilePath, 'utf8');
  return JSON.parse(data);
}

function saveSubscribers(subscribers) {
  fs.writeFileSync(subscribersFilePath, JSON.stringify(subscribers, null, 2), 'utf8');
}

// POST /api/newsletter/subscribe
router.post('/subscribe', (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, message: 'Invalid email address' });
    }

    const subscribers = getSubscribers();
    const exists = subscribers.some(s => s.email.toLowerCase() === email.toLowerCase());

    if (exists) {
      return res.json({ success: true, message: 'You are already subscribed!' });
    }

    subscribers.push({
      email: email.toLowerCase(),
      subscribedAt: new Date().toISOString()
    });

    saveSubscribers(subscribers);

    res.status(201).json({ success: true, message: 'Subscribed to FRIENDS MOBILE newsletter!' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Subscription failed', error: err.message });
  }
});

module.exports = router;
