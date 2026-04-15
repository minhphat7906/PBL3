const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const authMiddleware = require('../middleware/authMiddleware'); 

// Đã gắn bảo vệ (authMiddleware) vào các route cần thiết
router.get('/my-quizzes', authMiddleware, quizController.getQuizzesByUser); //lấy đề cá nhân
router.post('/', authMiddleware, quizController.createQuiz);     // tạo đề
router.post('/submit', authMiddleware, quizController.submitQuiz);  //nộp bài
router.delete('/:id', authMiddleware, quizController.deleteQuiz);   //xoá quiz
router.put('/:id', authMiddleware, quizController.updateQuiz); //cập nhập đề

// Route công khai không cần bảo vệ
router.get('/', quizController.getAllQuizzes);  //lấy đề công khai
router.get('/:id', quizController.getQuizById); //chi tiết đề

module.exports = router;