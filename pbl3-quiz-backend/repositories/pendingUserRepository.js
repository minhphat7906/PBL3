const { sql } = require('../db');

/**
 * Lưu thông tin người đăng ký chờ xác thực
 */
const savePendingUser = async (userData) => {
    const { username, email, password_hash, otp, expires_at } = userData;
    
    // Xoá mọi yêu cầu cũ của email này để tránh rác
    const request = new sql.Request();
    request.input('email', sql.VarChar, email);
    await request.query('DELETE FROM pending_users WHERE email = @email');

    // Tạo yêu cầu mới
    const insertRequest = new sql.Request();
    insertRequest.input('username', sql.NVarChar, username);
    insertRequest.input('email', sql.VarChar, email);
    insertRequest.input('password_hash', sql.VarChar, password_hash);
    insertRequest.input('otp', sql.Char(6), otp);
    insertRequest.input('expires_at', sql.DateTime, expires_at);
    
    return await insertRequest.query(`
        INSERT INTO pending_users (username, email, password_hash, otp, expires_at) 
        VALUES (@username, @email, @password_hash, @otp, @expires_at)
    `);
};

/**
 * Tìm yêu cầu đăng ký theo Email và OTP (còn hạn)
 */
const findPendingRequest = async (email, otp) => {
    const request = new sql.Request();
    request.input('email', sql.VarChar, email);
    request.input('otp', sql.Char(6), otp);
    
    const result = await request.query(`
        SELECT * FROM pending_users 
        WHERE email = @email AND otp = @otp AND expires_at > GETUTCDATE()
    `);
    return result.recordset[0];
};

/**
 * Xoá bản ghi sau khi đã xác thực xong
 */
const deletePendingRequest = async (email) => {
    const request = new sql.Request();
    request.input('email', sql.VarChar, email);
    return await request.query('DELETE FROM pending_users WHERE email = @email');
};

module.exports = {
    savePendingUser,
    findPendingRequest,
    deletePendingRequest
};
