const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

// User login (Sequelize)
async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }
    const user = await User.findOne({ where: { email }, tableName: 'Users' });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid password.' });
    }
    // Generate JWT with companyId
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, companyId: user.companyId },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    return res.json({ token });
  } catch (err) {
    console.error(err);
    let errorText = 'Login failed.';
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

module.exports = { login };
