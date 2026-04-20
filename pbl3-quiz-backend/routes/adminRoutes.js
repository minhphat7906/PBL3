const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const adminController = require('../controllers/adminController');

// Tất cả route admin đều cần auth + admin role
router.use(authMiddleware, adminMiddleware);

// ── Dashboard stats ──
router.get('/stats', adminController.getStats);

// ── User management ──
router.get('/users', adminController.getUsers);
router.put('/users/:id/role', adminController.updateRole);
router.delete('/users/:id', adminController.deleteUser);

// ── Quiz moderation ──
router.get('/quizzes', adminController.getQuizzes);
router.delete('/quizzes/:id', adminController.deleteQuiz);
router.put('/quizzes/:id/toggle-public', adminController.togglePublic);

// ── Support tickets ──
router.get('/tickets', adminController.getTickets);
router.put('/tickets/:id/status', adminController.updateTicket);

module.exports = router;
