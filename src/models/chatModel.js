const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Tenant = require('./company');

const ChatModel = sequelize.define('ChatModel', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  provider: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  config: {
    type: DataTypes.JSONB,
    allowNull: true,
  },
  tenantId: {
    type: DataTypes.UUID,
    allowNull: true, // null means global model, otherwise company-specific
    references: {
      model: 'Tenants',
      key: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
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
  tableName: 'ChatModels',
});

module.exports = ChatModel;
