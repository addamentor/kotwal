const bcrypt = require('bcryptjs');
const User = require('../models/user');

// Register a new user (Sequelize)
async function register(req, res) {
  try {
    const { email, password, role, name } = req.body;
    // Use companyId from authenticated user if present (admin creating user)
    let companyId = req.user && req.user.companyId ? req.user.companyId : req.body.companyId;
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
    let errorText = 'Registration failed.';
    let description = err && err.message ? err.message : 'Unknown error';
    // Sequelize validation error
    if (err.name === 'SequelizeValidationError' && err.errors && err.errors.length > 0) {
      errorText = 'Validation error';
      description = err.errors.map(e => e.message).join('; ');
    }
    // Unique constraint error
    if (err.name === 'SequelizeUniqueConstraintError') {
      errorText = 'Duplicate entry';
      description = err.errors.map(e => e.message).join('; ');
    }
    return res.status(500).json({
      error: errorText,
      description
    });
  }
}
  // Fetch current user's role and permissions
  async function getUserRole(req, res) {
    const role = req.user.role;
    let permissions = [];
    if (role === 'admin') {
      permissions = ['manage_users', 'manage_models', 'view_billing', 'topup_prepaid'];
    } else if (role === 'dev') {
      permissions = ['send_chat', 'view_models'];
    }
    // Add more roles/permissions as needed
    return res.json({ role, permissions });
  }

module.exports = { register };
module.exports = { register, getUserRole };
