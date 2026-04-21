const authService = require('../services/authService');

const registerRequest = async (req, res) => {
    try {
        const data = await authService.registerRequest(req.body);
        res.status(200).json(data);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const data = await authService.verifyOTP(email, otp);
        res.status(201).json(data);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const data = await authService.login(email, password);
        res.status(200).json(data);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = { registerRequest, verifyOTP, login };