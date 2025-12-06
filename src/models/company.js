
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Tenant = sequelize.define('Tenant', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  legalName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  domain: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  billingEmail: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { isEmail: true },
  },
  invoiceEmail: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { isEmail: true },
  },
  adminEmail: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { isEmail: true },
  },
  address: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  billingType: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'postpaid', // 'prepaid' or 'postpaid'
  },
  prepaidTokens: {
    type: DataTypes.DECIMAL(18, 4),
    allowNull: true,
    defaultValue: 0,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'active',
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  }
}, {
  tableName: 'Tenants',
});

module.exports = Tenant;
