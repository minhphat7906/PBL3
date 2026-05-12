const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const authMiddleware = require('../middleware/authMiddleware'); 

// ─── Routes đặc biệt PHẢI đứng TRƯỚC /:id ───────────────────────────
router.get('/categories', authMiddleware, quizController.getCategories);
router.get('/explore/stats', authMiddleware, quizController.getExploreStats);
router.get('/explore', authMiddleware, quizController.getExploreQuizzes);
router.get('/my-quizzes', authMiddleware, quizController.getQuizzesByUser);
router.get('/history', authMiddleware, quizController.getHistory);
router.get('/results/:id', authMiddleware, quizController.getResultDetail);
router.get('/stats', authMiddleware, quizController.getDashboardStats);

// ─── MỚI: MẶT TRẬN 1 - AI API ──────────────────────────────────────────
router.post('/generate-ai', authMiddleware, quizController.generateAIQuizzes);
router.post('/ai/explain', authMiddleware, quizController.explainQuestion);

// ─── MỚI: Streak, Chart, Leaderboard ────────────────────────────────
router.get('/streak', authMiddleware, quizController.getStreakInfo);
router.get('/weekly-activity', authMiddleware, quizController.getWeeklyActivity);
router.get('/leaderboard', authMiddleware, quizController.getLeaderboard);

// ─── Routes có tham số động ──────────────────────────────────────────
router.get('/:id/preview', authMiddleware, quizController.getQuizPreview);
router.get('/:id/leaderboard', authMiddleware, quizController.getQuizLeaderboard);
router.post('/', authMiddleware, quizController.createQuiz);
router.post('/submit', authMiddleware, quizController.submitQuiz);
router.delete('/:id', authMiddleware, quizController.deleteQuiz);
router.put('/:id', authMiddleware, quizController.updateQuiz);
router.post('/:id/favorite', authMiddleware, quizController.toggleFavorite);

// ─── Routes công khai ────────────────────────────────────────────────
router.get('/', quizController.getAllQuizzes);
router.get('/:id', quizController.getQuizById);

module.exports = router;