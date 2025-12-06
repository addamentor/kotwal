const UsageLog = require('../models/usageLog');
const BillingRecord = require('../models/billingRecord');
const { Op } = require('sequelize');

// Aggregate billing for any period
async function aggregateBillingForPeriod(tenantId, periodStart, periodEnd) {
  // Sum cost for all usage logs in period
  const totalCost = await UsageLog.sum('cost', {
    where: {
      tenantId,
      timestamp: {
        [Op.gte]: periodStart,
        [Op.lt]: periodEnd
      }
    }
  });
  // Create or update billing record
  const [record, created] = await BillingRecord.findOrCreate({
    where: { tenantId, periodStart, periodEnd },
    defaults: { totalCost, status: 'pending' }
  });
  if (!created) {
    record.totalCost = totalCost;
    await record.save();
  }
  return record;
}

// Aggregate billing for current month
async function aggregateBillingForCurrentMonth(tenantId) {
  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return aggregateBillingForPeriod(tenantId, periodStart, periodEnd);
}

module.exports = { aggregateBillingForPeriod, aggregateBillingForCurrentMonth };
