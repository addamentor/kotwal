const express = require('express');
const router = express.Router();


const { register } = require('../controllers/authController');
const { login } = require('../controllers/loginController');
const { refreshToken } = require('../controllers/refreshController');


// User registration endpoint (table: Users)
router.post('/register', register);


// User login endpoint (table: Users)
router.post('/login', login);

// Token refresh endpoint (protected)
const authMiddleware = require('../middlewares/auth');
router.post('/refresh', authMiddleware, refreshToken);



module.exports = router;
