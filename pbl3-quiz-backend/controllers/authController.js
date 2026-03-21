const { sql } = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 1. ĐĂNG KÝ
const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Băm mật khẩu (Độ khó 10)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const request = new sql.Request();
        // Nhét dữ liệu vào tham số để chống SQL Injection
        request.input('username', sql.NVarChar, username);
        request.input('email', sql.VarChar, email);
        request.input('password_hash', sql.VarChar, hashedPassword);

        // Chạy lệnh INSERT
        await request.query(`
            INSERT INTO users (username, email, password_hash) 
            VALUES (@username, @email, @password_hash)
        `);

        res.status(201).json({ message: "🎉 Đăng ký tài khoản thành công!" });
    } catch (error) {
        // Lỗi 2627 trong SQL Server là trùng lặp dữ liệu (Unique Key)
        if (error.number === 2627) {
            return res.status(400).json({ message: "❌ Email hoặc Username đã tồn tại!" });
        }
        console.error(error);
        res.status(500).json({ message: "Lỗi Server!" });
    }
};

// 2. ĐĂNG NHẬP
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const request = new sql.Request();
        request.input('email', sql.VarChar, email);
        
        // Tìm User theo Email
        const result = await request.query(`SELECT * FROM users WHERE email = @email`);
        const user = result.recordset[0];

        if (!user) {
            return res.status(400).json({ message: "❌ Sai email hoặc mật khẩu!" });
        }

        // So sánh mật khẩu nhập vào với mật khẩu băm trong DB
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ message: "❌ Sai email hoặc mật khẩu!" });
        }

        // Tạo thẻ bài JWT (Lưu ID và Quyền, hạn dùng 1 ngày)
        const token = jwt.sign(
            { id: user.id, role: user.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1d' }
        );

        res.status(200).json({ 
            message: "🔓 Đăng nhập thành công!", 
            token: token,
            user: { id: user.id, username: user.username, role: user.role }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi Server!" });
    }
};

module.exports = { register, login };