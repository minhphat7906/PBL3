const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const authMiddleware = require('../middleware/authMiddleware');

// Lấy danh sách đánh giá của 1 quiz (Công khai)
router.get('/:quizId', reviewController.getQuizReviews);

// Lấy đánh giá của bản thân cho 1 quiz (Cần đăng nhập)
router.get('/:quizId/my-review', authMiddleware, reviewController.getMyReview);

// Gửi hoặc cập nhật đánh giá (Cần đăng nhập)
router.post('/:quizId', authMiddleware, reviewController.submitReview);

module.exports = router;
