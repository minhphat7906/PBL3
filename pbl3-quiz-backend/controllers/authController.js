const { registerRequest, verifyOTP, login, forgotPasswordRequest, resetPassword } = require('../services/authService');

const registerRequestHandler = async (req, res) => {
    try {
        const data = await registerRequest(req.body);
        res.status(200).json(data);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const verifyOTPHandler = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const data = await verifyOTP(email, otp);
        res.status(201).json(data);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const loginHandler = async (req, res) => {
    try {
        const { email, password } = req.body;
        const data = await login(email, password);
        res.status(200).json(data);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const forgotPasswordRequestHandler = async (req, res) => {
    try {
        const result = await forgotPasswordRequest(req.body.email);
        res.json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const resetPasswordHandler = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        const result = await resetPassword(email, otp, newPassword);
        res.json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = { 
    registerRequest: registerRequestHandler, 
    verifyOTP: verifyOTPHandler, 
    login: loginHandler,
    forgotPasswordRequest: forgotPasswordRequestHandler,
    resetPassword: resetPasswordHandler
};