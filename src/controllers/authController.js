const bcrypt = require('bcryptjs');
const User = require('../models/user');

// Register a new user (Sequelize)
async function register(req, res) {
  try {
    const { email, password, role, name, companyId } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }
    const existing = await User.findOne({ where: { email }, tableName: 'Users' });
    if (existing) {
      return res.status(409).json({ error: 'User already exists.' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, passwordHash, role, name, companyId }, { tableName: 'Users' });
    return res.status(201).json({ message: 'User registered successfully.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Registration failed.' });
  }
}

module.exports = { register };
