const { sql } = require('../db');

// ─── 1. Thống kê tổng quan (Dashboard Admin) ──────────────────────────────────
const getAdminStats = async () => {
    const request = new sql.Request();
    const result = await request.query(`
        SELECT 
            (SELECT COUNT(*) FROM users)                    AS total_users,
            (SELECT COUNT(*) FROM users WHERE role = 'admin') AS total_admins,
            (SELECT COUNT(*) FROM quizzes)                 AS total_quizzes,
            (SELECT COUNT(*) FROM quizzes WHERE is_public = 1) AS public_quizzes,
            (SELECT COUNT(*) FROM results)                 AS total_attempts,
            (SELECT COUNT(*) FROM support_requests WHERE status = 'pending') AS pending_tickets
    `);
    return result.recordset[0];
};

// ─── 2. Lấy danh sách tất cả người dùng ──────────────────────────────────────
const getAllUsers = async ({ search = '', role = 'all', page = 1, limit = 20 }) => {
    const request = new sql.Request();
    const offset = (page - 1) * limit;
    request.input('limit', sql.Int, limit);
    request.input('offset', sql.Int, offset);

    let where = [];
    if (search.trim()) {
        where.push(`(u.username LIKE @search OR u.email LIKE @search)`);
        request.input('search', sql.NVarChar, `%${search}%`);
    }
    if (role !== 'all') {
        where.push(`u.role = @role`);
        request.input('role', sql.NVarChar, role);
    }
    const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';

    const result = await request.query(`
        SELECT u.id, u.username, u.email, u.role, u.created_at,
               u.current_streak, u.last_active_date,
               (SELECT COUNT(*) FROM quizzes q WHERE q.creator_id = u.id) AS quiz_count,
               (SELECT COUNT(*) FROM results r WHERE r.user_id = u.id)    AS attempt_count
        FROM users u
        ${whereClause}
        ORDER BY u.created_at DESC
        OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
    `);

    const countRes = await new sql.Request().query(`
        SELECT COUNT(*) AS total FROM users u ${whereClause}
    `);

    return { users: result.recordset, total: countRes.recordset[0].total };
};

// ─── 3. Đổi role user ─────────────────────────────────────────────────────────
const updateUserRole = async (userId, newRole) => {
    const request = new sql.Request();
    request.input('id', sql.Int, userId);
    request.input('role', sql.NVarChar, newRole);
    await request.query(`UPDATE users SET role = @role WHERE id = @id`);
};

// ─── 4. Xóa user ──────────────────────────────────────────────────────────────
const deleteUser = async (userId) => {
    const request = new sql.Request();
    request.input('id', sql.Int, userId);
    await request.query(`DELETE FROM users WHERE id = @id`);
};

// ─── 5. Lấy tất cả quiz (kể cả private) để kiểm duyệt ───────────────────────
const getAllQuizzesAdmin = async ({ search = '', status = 'all', page = 1, limit = 20 }) => {
    const request = new sql.Request();
    const offset = (page - 1) * limit;
    request.input('limit', sql.Int, limit);
    request.input('offset', sql.Int, offset);

    let where = [];
    if (search.trim()) {
        where.push(`(q.title LIKE @search OR u.username LIKE @search)`);
        request.input('search', sql.NVarChar, `%${search}%`);
    }
    if (status === 'public')  where.push(`q.is_public = 1`);
    if (status === 'private') where.push(`q.is_public = 0`);

    const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';

    const result = await request.query(`
        SELECT q.id, q.title, q.category, q.difficulty, q.is_public, q.created_at, q.image_url,
               u.username AS creator_name, u.id AS creator_id,
               (SELECT COUNT(*) FROM questions WHERE quiz_id = q.id)  AS question_count,
               (SELECT COUNT(*) FROM results   WHERE quiz_id = q.id)  AS play_count
        FROM quizzes q
        INNER JOIN users u ON q.creator_id = u.id
        ${whereClause}
        ORDER BY q.created_at DESC
        OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
    `);

    const countRes = await new sql.Request().query(`
        SELECT COUNT(*) AS total FROM quizzes q INNER JOIN users u ON q.creator_id = u.id ${whereClause}
    `);

    return { quizzes: result.recordset, total: countRes.recordset[0].total };
};

// ─── 6. Xóa quiz ──────────────────────────────────────────────────────────────
const deleteQuizAdmin = async (quizId) => {
    const request = new sql.Request();
    request.input('id', sql.Int, quizId);
    await request.query(`DELETE FROM quizzes WHERE id = @id`);
};

// ─── 7. Ẩn/hiện quiz (toggle is_public) ──────────────────────────────────────
const toggleQuizPublic = async (quizId, isPublic) => {
    const request = new sql.Request();
    request.input('id', sql.Int, quizId);
    request.input('is_public', sql.Bit, isPublic);
    await request.query(`UPDATE quizzes SET is_public = @is_public WHERE id = @id`);
};

// ─── 8. Lấy danh sách support tickets ────────────────────────────────────────
const getSupportRequests = async ({ status = 'all', page = 1, limit = 20 }) => {
    const request = new sql.Request();
    const offset = (page - 1) * limit;
    request.input('limit', sql.Int, limit);
    request.input('offset', sql.Int, offset);

    const where = status !== 'all' ? `WHERE status = '${status}'` : '';

    const result = await request.query(`
        SELECT id, name, email, subject, message, status, created_at
        FROM support_requests
        ${where}
        ORDER BY created_at DESC
        OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
    `);

    const countRes = await new sql.Request().query(`
        SELECT COUNT(*) AS total FROM support_requests ${where}
    `);

    return { tickets: result.recordset, total: countRes.recordset[0].total };
};

// ─── 9. Cập nhật trạng thái ticket ───────────────────────────────────────────
const updateTicketStatus = async (ticketId, status) => {
    const request = new sql.Request();
    request.input('id', sql.Int, ticketId);
    request.input('status', sql.NVarChar, status);
    await request.query(`UPDATE support_requests SET status = @status WHERE id = @id`);
};

module.exports = {
    getAdminStats, getAllUsers, updateUserRole, deleteUser,
    getAllQuizzesAdmin, deleteQuizAdmin, toggleQuizPublic,
    getSupportRequests, updateTicketStatus
};
