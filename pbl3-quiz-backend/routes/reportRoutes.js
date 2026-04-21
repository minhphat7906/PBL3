const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const authMiddleware = require('../middleware/authMiddleware');

// Gửi báo cáo cho 1 quiz (Cần đăng nhập)
router.post('/:quizId', authMiddleware, reportController.submitReport);

module.exports = router;

