const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const { detectPII } = require('../controllers/piiController');
const { onboardTenant } = require('../controllers/tenantController');

// Onboard new tenant (company)
router.post('/onboard-tenant', onboardTenant);


// Example route (protected)
router.get('/', authMiddleware, (req, res) => {
  res.json({ message: 'Welcome to Kotwal API!' });
});


// Helper to extract text
function extractText(req) {
  let text = req.body;
  if (typeof text === 'object' && text !== null && text.data) {
    text = text.data;
  }
  return text;
}


// High security: strictest
router.post('/detect-pii-high', authMiddleware, async (req, res) => {
  const text = extractText(req);
  const result = await detectPII(text, 'high');
  res.json(result);
});

// Medium security: moderate
router.post('/detect-pii-medium', authMiddleware, async (req, res) => {
  const text = extractText(req);
  const result = await detectPII(text, 'medium');
  res.json(result);
});

// Low security: only block on actual values
router.post('/detect-pii-low', authMiddleware, async (req, res) => {
  const text = extractText(req);
  const result = await detectPII(text, 'low');
  res.json(result);
});

module.exports = router;
