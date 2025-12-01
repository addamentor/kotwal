require('dotenv').config();
const express = require('express');
const app = express();
const routes = require('./routes');

app.use(express.text({ type: '*/*' })); // Accept plain text and JSON
app.use(express.json());
app.use('/api', routes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Kotwal server running on port ${PORT}`);
});
