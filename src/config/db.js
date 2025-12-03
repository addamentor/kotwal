const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.PG_DATABASE || 'kotwal',
  process.env.PG_USER || 'postgres',
  process.env.PG_PASSWORD || 'root',
  {
    host: process.env.PG_HOST || 'localhost',
    dialect: 'postgres',
    port: process.env.PG_PORT || 5432,
    logging: false,
  }
);

module.exports = sequelize;
