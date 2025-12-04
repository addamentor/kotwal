// Refresh token controller (stateless, for demo; production should use a DB or blacklist for revoked tokens)
const jwt = require('jsonwebtoken');
const User = require('../models/user');

// POST /api/auth/refresh
async function refreshToken(req, res) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header.' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, { ignoreExpiration: true });
    // Optionally, check if user still exists or is active
    const user = await User.findByPk(decoded.id, { tableName: 'Users' });
    if (!user) {
      return res.status(401).json({ error: 'User not found.' });
    }
    // Issue a new token (with new expiry)
    const newToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    return res.json({ token: newToken });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

module.exports = { refreshToken };
