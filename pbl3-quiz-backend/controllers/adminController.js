const adminRepo = require('../repositories/adminRepository');
const notificationRepo = require('../repositories/notificationRepository');
const quizRepo = require('../repositories/quizRepository');

// ── GET /api/v1/admin/stats ──────────────────────────────────────────────────
const getStats = async (req, res) => {
    try {
        const stats = await adminRepo.getAdminStats();
        res.json({ success: true, stats });
    } catch (err) {
        console.error('Admin getStats error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// ── GET /api/v1/admin/users ──────────────────────────────────────────────────
const getUsers = async (req, res) => {
    try {
        const { search = '', role = 'all', page = 1, limit = 20 } = req.query;
        const data = await adminRepo.getAllUsers({ search, role, page: +page, limit: +limit });
        res.json({ success: true, ...data });
    } catch (err) {
        console.error('Admin getUsers error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// ── PUT /api/v1/admin/users/:id/role ────────────────────────────────────────
const updateRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;
        if (!['student', 'admin'].includes(role)) {
            return res.status(400).json({ success: false, message: 'Role không hợp lệ!' });
        }
        // Không cho tự đổi role của chính mình
        if (+id === req.user.id) {
            return res.status(400).json({ success: false, message: 'Không thể đổi role của chính mình!' });
        }
        await adminRepo.updateUserRole(+id, role);

        // Thông báo cho người dùng
        await notificationRepo.createNotification({
            user_id: +id,
            type: 'system',
            content: `Vai trò của bạn đã được quản trị viên cập nhật thành: ${role === 'admin' ? 'Quản trị viên' : 'Thành viên'}`
        });

        res.json({ success: true, message: `Đã đổi role thành ${role}` });
    } catch (err) {
        console.error('Admin updateRole error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// ── DELETE /api/v1/admin/users/:id ──────────────────────────────────────────
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        if (+id === req.user.id) {
            return res.status(400).json({ success: false, message: 'Không thể xóa chính mình!' });
        }
        await adminRepo.deleteUser(+id);
        res.json({ success: true, message: 'Đã xóa tài khoản' });
    } catch (err) {
        console.error('Admin deleteUser error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// ── GET /api/v1/admin/quizzes ────────────────────────────────────────────────
const getQuizzes = async (req, res) => {
    try {
        const { search = '', status = 'all', page = 1, limit = 20 } = req.query;
        const data = await adminRepo.getAllQuizzesAdmin({ search, status, page: +page, limit: +limit });
        res.json({ success: true, ...data });
    } catch (err) {
        console.error('Admin getQuizzes error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// ── DELETE /api/v1/admin/quizzes/:id ────────────────────────────────────────
const deleteQuiz = async (req, res) => {
    try {
        const quizId = +req.params.id;
        const quiz = await quizRepo.getQuizById(quizId);
        
        await adminRepo.deleteQuizAdmin(quizId);

        if (quiz) {
            await notificationRepo.createNotification({
                user_id: quiz.creator_id,
                type: 'warning',
                content: `Bài quiz "${quiz.title}" của bạn đã bị gỡ bỏ bởi quản trị viên.`
            });
        }

        res.json({ success: true, message: 'Đã xóa bài quiz' });
    } catch (err) {
        console.error('Admin deleteQuiz error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// ── PUT /api/v1/admin/quizzes/:id/toggle-public ──────────────────────────────
const togglePublic = async (req, res) => {
    try {
        const quizId = +req.params.id;
        const { is_public } = req.body;
        const quiz = await quizRepo.getQuizById(quizId);

        await adminRepo.toggleQuizPublic(quizId, is_public ? 1 : 0);

        if (quiz) {
            await notificationRepo.createNotification({
                user_id: quiz.creator_id,
                type: 'info',
                content: `Quản trị viên đã ${is_public ? 'công khai lại' : 'ẩn'} bài quiz "${quiz.title}" của bạn.`
            });
        }

        res.json({ success: true, message: is_public ? 'Đã bật công khai' : 'Đã ẩn quiz' });
    } catch (err) {
        console.error('Admin togglePublic error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// ── GET /api/v1/admin/tickets ────────────────────────────────────────────────
const getTickets = async (req, res) => {
    try {
        const { status = 'all', page = 1, limit = 20 } = req.query;
        const data = await adminRepo.getSupportRequests({ status, page: +page, limit: +limit });
        res.json({ success: true, ...data });
    } catch (err) {
        console.error('Admin getTickets error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// ── PUT /api/v1/admin/tickets/:id/status ─────────────────────────────────────
const updateTicket = async (req, res) => {
    try {
        const { status } = req.body;
        if (!['pending', 'in_progress', 'resolved'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Trạng thái không hợp lệ!' });
        }
        await adminRepo.updateTicketStatus(+req.params.id, status);
        res.json({ success: true, message: 'Đã cập nhật trạng thái' });
    } catch (err) {
        console.error('Admin updateTicket error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = { getStats, getUsers, updateRole, deleteUser, getQuizzes, deleteQuiz, togglePublic, getTickets, updateTicket };
