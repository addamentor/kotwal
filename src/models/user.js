const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  passwordHash: { type: DataTypes.STRING, allowNull: false },
  name: { type: DataTypes.STRING },
  role: { type: DataTypes.STRING, defaultValue: 'user' },
  companyId: { type: DataTypes.INTEGER, allowNull: true }, // for multi-tenancy
  status: { type: DataTypes.STRING, defaultValue: 'active' },
  lastLogin: { type: DataTypes.DATE },
}, {
  tableName: 'Users',
});

module.exports = User;
