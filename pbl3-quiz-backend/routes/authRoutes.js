const express = require('express');
const router = express.Router();
const { registerRequest, verifyOTP, login, forgotPasswordRequest, resetPassword } = require('../controllers/authController');

router.post('/register-request', registerRequest);
router.post('/verify-otp', verifyOTP);
router.post('/login', login);
router.post('/forgot-password-request', forgotPasswordRequest);
router.post('/reset-password', resetPassword);

module.exports = router;