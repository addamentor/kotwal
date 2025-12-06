const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const Tenant = require('../models/company');
const UsageLog = require('../models/usageLog');

// Top-up prepaid tokens (admin only)
router.post('/topup', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Only admin can top up tokens.' });
    }
    const tenantId = req.user.companyId;
    const { amount } = req.body;
    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: 'Valid top-up amount is required.' });
    }
    const tenant = await Tenant.findByPk(tenantId);
    if (!tenant || tenant.billingType !== 'prepaid') {
      return res.status(400).json({ error: 'Tenant not found or not on prepaid billing.' });
    }
    tenant.prepaidTokens = parseFloat(tenant.prepaidTokens) + parseFloat(amount);
    await tenant.save();
    return res.json({ message: 'Top-up successful.', prepaidTokens: tenant.prepaidTokens });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Top-up failed.', description: err.message });
  }
});

// Get current prepaid token balance (admin only)
router.get('/balance', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Only admin can view balance.' });
    }
    const tenantId = req.user.companyId;
    const tenant = await Tenant.findByPk(tenantId);
    if (!tenant || tenant.billingType !== 'prepaid') {
      return res.status(400).json({ error: 'Tenant not found or not on prepaid billing.' });
    }
    return res.json({ prepaidTokens: tenant.prepaidTokens });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch balance.', description: err.message });
  }
});

// Get usage logs for current tenant (admin only)
router.get('/usage', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Only admin can view usage.' });
    }
    const tenantId = req.user.companyId;
    const usage = await UsageLog.findAll({ where: { tenantId } });
    return res.json({ usage });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch usage.', description: err.message });
  }
});

module.exports = router;
