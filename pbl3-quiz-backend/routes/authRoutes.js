const express = require('express');
const router = express.Router();
const { registerRequest, verifyOTP, login } = require('../controllers/authController');

router.post('/register-request', registerRequest);
router.post('/verify-otp', verifyOTP);
router.post('/login', login);

module.exports = router;