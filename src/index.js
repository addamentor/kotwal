require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');

const routes = require('./routes');
const authRoutes = require('./routes/auth');
const billingRoutes = require('./routes/billing');
const prepaidAdminRoutes = require('./routes/prepaidAdmin');

app.use(express.json());
app.use(express.text({ type: '*/*' })); // Accept plain text and JSON
app.use(cors({
  origin: 'http://localhost:8081', // adjust if your frontend runs on a different port
  credentials: true
}));
app.use('/api', routes);
app.use('/api/auth', authRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/prepaid-admin', prepaidAdminRoutes);

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
