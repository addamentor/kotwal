const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const BillingRecord = require('../models/billingRecord');
const { aggregateBillingForPeriod, aggregateBillingForCurrentMonth } = require('../controllers/billingController');

// Get billing records for current tenant
router.get('/', authMiddleware, async (req, res) => {
  try {
    const tenantId = req.user.companyId;
    const records = await BillingRecord.findAll({ where: { tenantId } });
    return res.json({ records });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch billing records.', description: err.message });
  }
});

// Aggregate billing for any period (admin only)
router.post('/aggregate', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Only admin can aggregate billing.' });
    }
    const tenantId = req.user.companyId;
    const { periodStart, periodEnd } = req.body;
    if (!periodStart || !periodEnd) {
      return res.status(400).json({ error: 'periodStart and periodEnd are required.' });
    }
    const record = await aggregateBillingForPeriod(tenantId, new Date(periodStart), new Date(periodEnd));
    return res.json({ record });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to aggregate billing.', description: err.message });
  }
});

// Aggregate billing for current month (admin only)
router.post('/aggregate-monthly', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Only admin can aggregate billing.' });
    }
    const tenantId = req.user.companyId;
    const record = await aggregateBillingForCurrentMonth(tenantId);
    return res.json({ record });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to aggregate monthly billing.', description: err.message });
  }
});

module.exports = router;
