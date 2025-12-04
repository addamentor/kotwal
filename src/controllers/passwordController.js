const bcrypt = require('bcryptjs');
const User = require('../models/user');

// Change password for logged-in user
async function changePassword(req, res) {
  try {
    const userId = req.user.id;
    const { newPassword } = req.body;
    if (!newPassword) {
      return res.status(400).json({ error: 'New password is required.' });
    }
    const passwordHash = await bcrypt.hash(newPassword, 10);
    const [updated] = await User.update(
      { passwordHash },
      { where: { id: userId } }
    );
    if (updated) {
      return res.json({ message: 'Password changed successfully.' });
    } else {
      return res.status(404).json({ error: 'User not found.' });
    }
  } catch (err) {
    console.error(err);
    let errorText = 'Password change failed.';
    let description = err && err.message ? err.message : 'Unknown error';
    return res.status(500).json({ error: errorText, description });
  }
}

module.exports = { changePassword };
