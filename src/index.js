require('dotenv').config();
const express = require('express');
const app = express();

const routes = require('./routes');
const authRoutes = require('./routes/auth');

app.use(express.json());
app.use(express.text({ type: '*/*' })); // Accept plain text and JSON
app.use('/api', routes);
app.use('/api/auth', authRoutes);

// Sync Sequelize models
const sequelize = require('./config/db');
sequelize.sync({ alter: true }).then(() => {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Kotwal server running on port ${PORT}`);
  });
}).catch((err) => {
  console.error('Failed to sync database:', err);
});
