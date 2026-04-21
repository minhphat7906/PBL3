const { sql } = require('../db');

const getNotificationsByUserId = async (userId) => {
    const request = new sql.Request();
    request.input('userId', sql.Int, userId);
    const result = await request.query(`
        SELECT TOP 20 *
        FROM notifications
        WHERE user_id = @userId
        ORDER BY created_at DESC
    `);
    return result.recordset;
};

const createNotification = async (data) => {
    const { user_id, type, content } = data;
    const request = new sql.Request();
    request.input('user_id', sql.Int, user_id);
    request.input('type', sql.VarChar, type || 'info');
    request.input('content', sql.NVarChar, content);
    await request.query(`
        INSERT INTO notifications (user_id, type, content, is_read, created_at)
        VALUES (@user_id, @type, @content, 0, GETDATE())
    `);
};

const markAllAsRead = async (userId) => {
    const request = new sql.Request();
    request.input('userId', sql.Int, userId);
    await request.query(`
        UPDATE notifications
        SET is_read = 1
        WHERE user_id = @userId
    `);
};

module.exports = {
    getNotificationsByUserId,
    createNotification,
    markAllAsRead
};
