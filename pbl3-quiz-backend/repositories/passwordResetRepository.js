const { sql } = require('../db');

/**
 * Lưu mã OTP reset mật khẩu
 */
const saveResetOTP = async (email, otp, expires_at) => {
    const request = new sql.Request();
    
    // Xoá yêu cầu cũ nếu có
    request.input('email', sql.VarChar, email);
    await request.query('DELETE FROM password_resets WHERE email = @email');

    const insertRequest = new sql.Request();
    insertRequest.input('email', sql.VarChar, email);
    insertRequest.input('otp', sql.Char(6), otp);
    insertRequest.input('expires_at', sql.DateTime, expires_at);
    
    return await insertRequest.query(`
        INSERT INTO password_resets (email, otp, expires_at) 
        VALUES (@email, @otp, @expires_at)
    `);
};

/**
 * Tìm mã OTP reset mật khẩu còn hiệu lực
 */
const findResetRequest = async (email, otp) => {
    const request = new sql.Request();
    request.input('email', sql.VarChar, email);
    request.input('otp', sql.Char(6), otp);
    
    const result = await request.query(`
        SELECT * FROM password_resets 
        WHERE email = @email AND otp = @otp AND expires_at > GETUTCDATE()
    `);
    return result.recordset[0];
};

/**
 * Xoá bản ghi sau khi đã reset xong
 */
const deleteResetRequest = async (email) => {
    const request = new sql.Request();
    request.input('email', sql.VarChar, email);
    return await request.query('DELETE FROM password_resets WHERE email = @email');
};

module.exports = {
    saveResetOTP,
    findResetRequest,
    deleteResetRequest
};
