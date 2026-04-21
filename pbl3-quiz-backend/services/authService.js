const userRepository = require('../repositories/userRepository');
const pendingUserRepository = require('../repositories/pendingUserRepository');
const mailService = require('../services/mailService');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * BƯỚC 1: Xử lý yêu cầu đăng ký (Kiểm tra và gửi OTP)
 */
const registerRequest = async (userData) => {
    const { username, email, password } = userData;

    // 1. Kiểm tra email tồn tại trong bảng chính chưa
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
        throw new Error("Email đã được sử dụng!");
    }

    // 2. Băm mật khẩu để lưu vào bảng tạm
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Sinh mã OTP 6 số
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5); // Hết hạn sau 5 phút

    // 4. Lưu vào vùng chờ
    await pendingUserRepository.savePendingUser({
        username,
        email,
        password_hash: hashedPassword,
        otp,
        expires_at: expiresAt
    });

    // 5. Gửi Email OTP
    await mailService.sendOTPEmail(email, otp);

    return { message: "Mã OTP đã được gửi về Email của bạn!" };
};

/**
 * BƯỚC 2: Xác thực OTP và tạo User chính thức
 */
const verifyOTP = async (email, otp) => {
    // 1. Tìm bản ghi trong vùng chờ
    const pendingRequest = await pendingUserRepository.findPendingRequest(email, otp);
    if (!pendingRequest) {
        throw new Error("Mã OTP không chính xác hoặc đã hết hạn!");
    }

    // 2. Tạo User chính thức trong bảng users
    await userRepository.createUser(
        pendingRequest.username, 
        pendingRequest.email, 
        pendingRequest.password_hash
    );

    // 3. Xoá vùng chờ
    await pendingUserRepository.deletePendingRequest(email);

    return { success: true, message: "Xác thực thành công! Tài khoản đã được tạo." };
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

module.exports = { 
    registerRequest, 
    verifyOTP, 
    login 
};