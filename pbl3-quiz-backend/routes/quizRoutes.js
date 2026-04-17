const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const authMiddleware = require('../middleware/authMiddleware'); 

// Route đặc biệt phải đứng TRƯỚC /:id (tránh Express hiểu nhầm 'explore' là id)
router.get('/explore', authMiddleware, quizController.getExploreQuizzes);
router.get('/my-quizzes', authMiddleware, quizController.getQuizzesByUser);
router.get('/history', authMiddleware, quizController.getHistory);
router.get('/results/:id', authMiddleware, quizController.getResultDetail);
router.get('/stats', authMiddleware, quizController.getDashboardStats);

// Route có tham số động
router.post('/', authMiddleware, quizController.createQuiz);
router.post('/submit', authMiddleware, quizController.submitQuiz);
router.delete('/:id', authMiddleware, quizController.deleteQuiz);
router.put('/:id', authMiddleware, quizController.updateQuiz);
router.post('/:id/favorite', authMiddleware, quizController.toggleFavorite);

// Route công khai
router.get('/', quizController.getAllQuizzes);
router.get('/:id', quizController.getQuizById);

module.exports = router;