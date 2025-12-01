const express = require('express');
const router = express.Router();

const { detectPII } = require('../controllers/piiController');

// Example route
router.get('/', (req, res) => {
  res.json({ message: 'Welcome to Kotwal API!' });
});

// POST /detect-pii
router.post('/detect-pii', (req, res) => {
  let text = req.body;
  // If body is an object with a 'data' property, use that
  if (typeof text === 'object' && text !== null && text.data) {
    text = text.data;
  }
  console.log("Received text for PII detection:", text);
  const result = detectPII(text);
  res.json(result);
});

module.exports = router;
