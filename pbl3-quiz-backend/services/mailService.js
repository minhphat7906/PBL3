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
 * Gửi Email chứa mã OTP với giao diện chuyên nghiệp
 */
const sendOTPEmail = async (email, otp) => {
    const mailOptions = {
        from: `"QuizSmart Team" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Xác thực tài khoản QuizSmart của bạn',
        html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; background-color: #ffffff;">
                <div style="background-color: #4f46e5; padding: 40px 20px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 900; letter-spacing: -0.5px;">QuizSmart</h1>
                </div>
                <div style="padding: 40px 30px; color: #1e293b;">
                    <h2 style="font-size: 22px; font-weight: 800; margin-bottom: 24px; color: #0f172a;">Xác thực đăng ký của bạn</h2>
                    <p style="font-size: 16px; line-height: 1.6; margin-bottom: 32px; color: #475569;">
                        Chào bạn, cảm ơn bạn đã tham gia <b>QuizSmart</b>. Để hoàn tất quy trình đăng ký, vui lòng sử dụng mã xác thực dưới đây:
                    </p>
                    
                    <div style="background-color: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 32px;">
                        <span style="font-family: 'Courier New', Courier, monospace; font-size: 42px; font-weight: 900; letter-spacing: 12px; color: #4f46e5;">${otp}</span>
                    </div>
                    
                    <p style="font-size: 14px; color: #64748b; text-align: center;">
                        Mã này sẽ hết hạn sau <b>5 phút</b>.<br>
                        Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.
                    </p>
                </div>
                <div style="background-color: #f1f5f9; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
                    <p style="font-size: 12px; color: #94a3b8; margin: 0;">
                        &copy; 2026 QuizSmart App. All rights reserved.
                    </p>
                </div>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Lỗi gửi Email OTP:', error);
        throw new Error('Không thể gửi mã OTP về email của bạn. Vui lòng kiểm tra lại địa chỉ email.');
    }
};

module.exports = { sendOTPEmail };
