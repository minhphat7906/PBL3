const nodemailer = require('nodemailer');
require('dotenv').config();

// Cấu hình transporter (Lưu ý: Bạn cần cấu hình EMAIL_USER và EMAIL_PASS trong .env)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS // Đây là 'App Password' từ Gmail
    }
});

/**
 * Gửi Email chứa mã OTP (Dùng cho cả Đăng ký và Quên mật khẩu)
 * @param {string} email 
 * @param {string} otp 
 * @param {string} type 'REGISTER' | 'RESET'
 */
const sendOTPEmail = async (email, otp, type = 'REGISTER') => {
    const isRegister = type === 'REGISTER';
    const title = isRegister ? 'Xác thực đăng ký tài khoản' : 'Khôi phục mật khẩu';
    const actionText = isRegister ? 'để hoàn tất quá trình đăng ký' : 'để đặt lại mật khẩu mới cho tài khoản';

    const mailOptions = {
        from: `"QuizSmart Support" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `[QuizSmart] - ${title}`,
        html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
            <div style="background-color: #4f46e5; padding: 30px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 28px; letter-spacing: 1px;">QuizSmart</h1>
            </div>
            <div style="padding: 40px; background-color: white;">
                <h2 style="color: #1e293b; margin-top: 0;">${title}</h2>
                <p style="color: #475569; line-height: 1.6; font-size: 16px;">
                    Chào bạn, chúng tôi nhận được yêu cầu ${actionText} của bạn trên hệ thống <b>QuizSmart</b>.
                </p>
                <div style="background-color: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 20px; text-align: center; margin: 30px 0;">
                    <span style="font-size: 36px; font-weight: 800; color: #4f46e5; letter-spacing: 8px;">${otp}</span>
                </div>
                <p style="color: #64748b; font-size: 14px;">
                    Mã xác thực này có hiệu lực trong vòng <b>5 phút</b>. Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này hoặc liên hệ hỗ trợ nếu thấy có dấu hiệu bất thường.
                </p>
            </div>
            <div style="background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8;">
                © 2026 QuizSmart Team. Nền tảng học tập bứt phá cho sinh viên.
            </div>
        </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`OTP (${type}) sent to ${email}`);
    } catch (error) {
        console.error("Lỗi gửi Email OTP:", error);
        throw new Error("Không thể gửi email lúc này. Vui lòng thử lại sau.");
    }
};

module.exports = { sendOTPEmail };
