const Tenant = require('../models/company');
const User = require('../models/user');
const bcrypt = require('bcryptjs');

// Onboard a new tenant and create admin user (atomic transaction)
async function onboardTenant(req, res) {
  const sequelize = require('../config/db');
  const t = await sequelize.transaction();
  try {
    const { name, legalName, domain, billingEmail, invoiceEmail, adminEmail, adminPassword, adminName, address, phone, billingType, prepaidTokens } = req.body;
    if (!name || !billingEmail || !invoiceEmail || !adminEmail || !adminPassword) {
      await t.rollback();
      return res.status(400).json({ error: 'Missing required tenant or admin fields.' });
    }
    // Create tenant
    const tenant = await Tenant.create({
      name,
      legalName,
      domain,
      billingEmail,
      invoiceEmail,
      adminEmail,
      address,
      phone,
      billingType: billingType || 'postpaid',
      prepaidTokens: billingType === 'prepaid' ? (prepaidTokens || 0) : 0,
    }, { transaction: t });
    // Create admin user for tenant
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    const adminUser = await User.create({
      email: adminEmail,
      passwordHash,
      name: adminName || 'Admin',
      role: 'admin',
      companyId: tenant.id,
      status: 'active',
    }, { transaction: t });
    await t.commit();
    return res.status(201).json({
      tenantId: tenant.id,
      tenantName: tenant.name,
      adminUserId: adminUser.id,
      adminEmail: adminUser.email,
    });
  } catch (err) {
    await t.rollback();
    console.error(err);
    let errorText = 'Tenant onboarding failed.';
    let description = err && err.message ? err.message : 'Unknown error';
    // Sequelize validation error
    if (err.name === 'SequelizeValidationError' && err.errors && err.errors.length > 0) {
      errorText = 'Validation error';
      description = err.errors.map(e => e.message).join('; ');
    }
    // Unique constraint error
    if (err.name === 'SequelizeUniqueConstraintError') {
      errorText = 'Duplicate entry';
      description = err.errors.map(e => e.message).join('; ');
    }
    return res.status(500).json({
      error: errorText,
      description
    });
  }
}

module.exports = { onboardTenant };
