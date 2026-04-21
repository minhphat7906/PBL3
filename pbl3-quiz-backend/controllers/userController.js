const { sql } = require('../db');
const bcrypt = require('bcryptjs');
const notificationRepository = require('../repositories/notificationRepository');

// ─── Helper: Tính toán Stats cho bất kỳ userId ────────────────────────────────
const getUserStats = async (userId) => {
    const req = new sql.Request();
    req.input('uid', sql.Int, userId);
    const result = await req.query(`
        SELECT
            (SELECT COUNT(*) FROM quizzes WHERE creator_id = @uid)        AS quizzes_created,
            (SELECT COUNT(*) FROM results WHERE user_id = @uid)           AS quizzes_attempted,
            (SELECT ISNULL(MAX(current_streak), 0) FROM users WHERE id = @uid) AS max_streak
    `);
    return result.recordset[0];
};

// ─── GET /api/v1/users/profile/:id? ──────────────────────────────────────────
// Nếu có :id → trả về thông tin PUBLIC của user đó
// Nếu không có :id → lấy từ token (req.user.id) → trả về đầy đủ (kèm email)
const getProfile = async (req, res) => {
    try {
        const targetId = req.params.id ? parseInt(req.params.id) : req.user.id;
        const isOwnProfile = !req.params.id || parseInt(req.params.id) === req.user.id;

        const userReq = new sql.Request();
        userReq.input('uid', sql.Int, targetId);

        const userResult = await userReq.query(`
            SELECT id, username, bio, avatar_url, created_at
            ${isOwnProfile ? ', email' : ''}
            FROM users
            WHERE id = @uid
        `);

        if (userResult.recordset.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
        }

        const user = userResult.recordset[0];
        const stats = await getUserStats(targetId);

        return res.json({
            success: true,
            isOwnProfile,
            user: {
                ...user,
                // Đảm bảo không bao giờ lộ password/role khi xem người khác
            },
            stats
        });
    } catch (error) {
        console.error('[UserController] getProfile error:', error);
        return res.status(500).json({ success: false, message: 'Lỗi server khi lấy thông tin profile' });
    }
};

// ─── PUT /api/v1/users/profile ────────────────────────────────────────────────
// Chỉ được gọi khi đã đăng nhập (isOwnProfile), cập nhật Bio / Username / Avatar
const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { username, bio, avatar_url } = req.body;

        if (!username || username.trim() === '') {
            return res.status(400).json({ success: false, message: 'Tên người dùng không được để trống' });
        }

        // Kiểm tra cột bio, avatar_url có tồn tại chưa (safe migration)
        const migReq = new sql.Request();
        await migReq.query(`
            IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='users' AND COLUMN_NAME='bio')
                ALTER TABLE users ADD bio NVARCHAR(500) NULL;
            IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='users' AND COLUMN_NAME='avatar_url')
                ALTER TABLE users ADD avatar_url NVARCHAR(500) NULL;
        `);

        const updateReq = new sql.Request();
        updateReq.input('uid', sql.Int, userId);
        updateReq.input('username', sql.NVarChar, username.trim());
        updateReq.input('bio', sql.NVarChar, bio || null);
        updateReq.input('avatar_url', sql.NVarChar, avatar_url || null);

        await updateReq.query(`
            UPDATE users
            SET username = @username, bio = @bio, avatar_url = @avatar_url
            WHERE id = @uid
        `);

        return res.json({ success: true, message: 'Cập nhật profile thành công!' });
    } catch (error) {
        console.error('[UserController] updateProfile error:', error);
        return res.status(500).json({ success: false, message: 'Lỗi server khi cập nhật profile' });
    }
};

// ─── PUT /api/v1/users/change-password ───────────────────────────────────────
const changePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword, confirmPassword } = req.body;

        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ tất cả các trường' });
        }
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ success: false, message: 'Mật khẩu mới và xác nhận không khớp' });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({ success: false, message: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
        }

        // Lấy password hash hiện tại
        const userReq = new sql.Request();
        userReq.input('uid', sql.Int, userId);
        const userResult = await userReq.query(`SELECT password_hash FROM users WHERE id = @uid`);

        if (userResult.recordset.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
        }

        const user = userResult.recordset[0];
        const isMatch = await bcrypt.compare(currentPassword, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Mật khẩu hiện tại không đúng' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        const updateReq = new sql.Request();
        updateReq.input('uid', sql.Int, userId);
        updateReq.input('password', sql.NVarChar, hashedPassword);
        await updateReq.query(`UPDATE users SET password_hash = @password WHERE id = @uid`);

        // Gửi thông báo bảo mật
        await notificationRepository.createNotification({
            user_id: userId,
            type: 'warning',
            content: 'Mật khẩu của bạn vừa được thay đổi thành công.'
        });

        return res.json({ success: true, message: 'Đổi mật khẩu thành công!' });
    } catch (error) {
        console.error('[UserController] changePassword error:', error);
        return res.status(500).json({ success: false, message: 'Lỗi server khi đổi mật khẩu' });
    }
};

// ─── POST /api/v1/users/support ──────────────────────────────────────────────
const submitSupport = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        if (!name || !email || !subject || !message) {
            return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ thông tin!' });
        }
        const r = new sql.Request();
        r.input('name',    sql.NVarChar, name.trim());
        r.input('email',   sql.VarChar,  email.trim());
        r.input('subject', sql.NVarChar, subject.trim());
        r.input('message', sql.NVarChar, message.trim());
        await r.query(`
            INSERT INTO support_requests (name, email, subject, message)
            VALUES (@name, @email, @subject, @message)
        `);
        return res.json({ success: true, message: 'Gửi yêu cầu hỗ trợ thành công!' });
    } catch (error) {
        console.error('[UserController] submitSupport error:', error);
        return res.status(500).json({ success: false, message: 'Lỗi server khi gửi yêu cầu' });
    }
};

module.exports = { getProfile, updateProfile, changePassword, submitSupport };
