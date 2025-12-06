const express = require('express');
const router = express.Router();


const { register } = require('../controllers/authController');
const { getUserRole } = require('../controllers/authController');
const { login } = require('../controllers/loginController');
const { refreshToken } = require('../controllers/refreshController');
const { changePassword } = require('../controllers/passwordController');
const { adminChangeUserPassword } = require('../controllers/adminPasswordController');


// User registration endpoint (table: Users)
const authMiddleware = require('../middlewares/auth');
router.post('/create-user', authMiddleware, register);
// Fetch current user's role and permissions
router.get('/user/role', authMiddleware, getUserRole);


// Admin change password for any user in company (protected)
router.post('/admin-change-password', authMiddleware, adminChangeUserPassword);

// Change password endpoint (protected)
router.post('/change-password', authMiddleware, changePassword);


// User login endpoint (table: Users)
router.post('/login', login);

// Token refresh endpoint (protected)
router.post('/refresh', authMiddleware, refreshToken);



module.exports = router;
