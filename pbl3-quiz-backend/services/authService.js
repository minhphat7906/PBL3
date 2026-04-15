const userRepository = require('../repositories/userRepository');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = async (userData) => {
    const { username, email, password } = userData;

    // 1. Kiểm tra email tồn tại chưa
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
        const error = new Error("Email đã tồn tại!");
        error.number = 2627; // Giả lập mã lỗi để Controller bắt
        throw error;
    }

    // 2. Băm mật khẩu
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Gọi Repo để lưu
    return await userRepository.createUser(username, email, hashedPassword);
};

const login = async (email, password) => {
    // 1. Tìm user
    const user = await userRepository.findByEmail(email);
    if (!user) throw new Error("Sai email hoặc mật khẩu!");

    // 2. Kiểm tra mật khẩu
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) throw new Error("Sai email hoặc mật khẩu!");

    // 3. Tạo Token JWT
    const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
    );

    return { token, user: { id: user.id, username: user.username, role: user.role } };
};

module.exports = { register, login };