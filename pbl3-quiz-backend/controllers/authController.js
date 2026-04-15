const authService = require('../services/authService');

const register = async (req, res) => {
    try {
        await authService.register(req.body);
        res.status(201).json({ message: "🎉 Đăng ký tài khoản thành công!" });
    } catch (error) {
        if (error.number === 2627 || error.message === "Email đã tồn tại!") {
            return res.status(400).json({ message: "❌ Email hoặc Username đã tồn tại!" });
        }
        res.status(500).json({ message: "Lỗi Server!" });
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

module.exports = { register, login };