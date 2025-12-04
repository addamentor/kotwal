const bcrypt = require('bcryptjs');
const User = require('../models/user');

// Admin changes password for any user in their company
async function adminChangeUserPassword(req, res) {
  try {
    // Only allow if admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Only admin can change other users passwords.' });
    }
    const { userId, newPassword } = req.body;
    if (!userId || !newPassword) {
      return res.status(400).json({ error: 'userId and newPassword are required.' });
    }
    // Find user in same company
    const user = await User.findOne({ where: { id: userId, companyId: req.user.companyId } });
    if (!user) {
      return res.status(404).json({ error: 'User not found in your company.' });
    }
    const passwordHash = await bcrypt.hash(newPassword, 10);
    user.passwordHash = passwordHash;
    await user.save();
    return res.json({ message: 'Password changed successfully for user.' });
  } catch (err) {
    console.error(err);
    let errorText = 'Admin password change failed.';
    let description = err && err.message ? err.message : 'Unknown error';
    return res.status(500).json({ error: errorText, description });
  }
}

module.exports = { adminChangeUserPassword };
