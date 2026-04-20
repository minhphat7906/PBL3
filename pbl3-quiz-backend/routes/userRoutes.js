const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, changePassword, submitSupport } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

// GET /api/v1/users/profile      → Profile của chính mình (cần token)
router.get('/profile', authMiddleware, getProfile);
// GET /api/v1/users/profile/:id  → Profile công khai của user khác (cần token để verify danh tính)
router.get('/profile/:id', authMiddleware, getProfile);

// PUT /api/v1/users/profile      → Cập nhật Bio/Name (chỉ chính mình)
router.put('/profile', authMiddleware, updateProfile);

// PUT /api/v1/users/change-password
router.put('/change-password', authMiddleware, changePassword);

// POST /api/v1/users/support  → Gửi yêu cầu hỗ trợ (không cần đăng nhập)
router.post('/support', submitSupport);

module.exports = router;
