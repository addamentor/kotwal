const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ChatLog = sequelize.define('ChatLog', {
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
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  response: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  piiFlag: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  piiDetails: {
    type: DataTypes.JSONB,
    allowNull: true,
  },
  override: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  }
}, {
  tableName: 'ChatLogs',
});

module.exports = ChatLog;
