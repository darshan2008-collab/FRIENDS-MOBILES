const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const requestsFilePath = path.join(__dirname, '../data/custom_requests.json');

function getRequests() {
  if (!fs.existsSync(requestsFilePath)) {
    fs.writeFileSync(requestsFilePath, '[]', 'utf8');
  }
  const data = fs.readFileSync(requestsFilePath, 'utf8');
  return JSON.parse(data);
}

function saveRequests(reqs) {
  fs.writeFileSync(requestsFilePath, JSON.stringify(reqs, null, 2), 'utf8');
}

// POST /api/custom-cover/request
router.post('/request', (req, res) => {
  try {
    const { phoneModel, designDetails, customerPhone } = req.body;

    if (!phoneModel || !customerPhone) {
      return res.status(400).json({ success: false, message: 'Please provide phone model and contact number' });
    }

    const requests = getRequests();
    const newReq = {
      id: `CC-${Date.now()}`,
      phoneModel,
      designDetails: designDetails || 'Standard Custom Print',
      customerPhone,
      createdAt: new Date().toISOString(),
      status: 'Received'
    };

    requests.push(newReq);
    saveRequests(requests);

    res.status(201).json({ success: true, message: 'Custom back cover request received!', request: newReq });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Request submission failed', error: err.message });
  }
});

module.exports = router;
