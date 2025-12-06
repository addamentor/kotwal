const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const UsageLog = sequelize.define('UsageLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  tenantId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  modelId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  tokensUsed: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  cost: {
    type: DataTypes.DECIMAL(12, 4),
    allowNull: false,
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  chatLogId: {
    type: DataTypes.UUID,
    allowNull: true,
  }
}, {
  tableName: 'UsageLogs',
});

module.exports = UsageLog;
