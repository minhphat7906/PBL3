const quizService = require('../services/quizService');

const createQuiz = async (req, res) => {
    try {
        const quizData = { ...req.body, userId: req.user.id };
        const newQuizId = await quizService.createFullQuiz(quizData);
        res.status(201).json({ success: true, message: 'Tạo đề thi thành công!', quiz_id: newQuizId });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi Server' });
    }
};

const getAllQuizzes = async (req, res) => {
    try {
        const quizzes = await quizService.getHomeQuizzes();
        res.status(200).json({ success: true, quizzes });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi lấy đề thi công khai" });
    }
};

const getQuizzesByUser = async (req, res) => {
    try {
        const userId = req.user.id;
        const quizzes = await quizService.getMyQuizzes(userId);
        res.status(200).json({ success: true, quizzes });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi lấy danh sách đề thi" });
    }
};

// --- CÁC HÀM ĐƯỢC CHỮA BỆNH ---

const getQuizById = async (req, res) => {
    try {
        // Chỉ gọi Service, an toàn tuyệt đối
        const quiz = await quizService.getQuizDetail(req.params.id);
        if (!quiz) return res.status(404).json({ success: false, message: "Không tìm thấy đề thi" });
        res.json({ success: true, quiz });
    } catch (error) { 
        res.status(500).json({ success: false }); 
    }
};

const deleteQuiz = async (req, res) => {
    try {
        // Gọi Service xử lý Transaction xóa
        await quizService.deleteFullQuiz(req.params.id);
        res.json({ success: true, message: "Đã xóa sạch đề thi!" });
    } catch (error) { 
        res.status(500).json({ success: false, message: "Lỗi xóa" }); 
    }
};

const submitQuiz = async (req, res) => {
    try {
        const userId = req.user.id; 
        const quizData = req.body; // Gồm quiz_id, time_spent, user_answers
        
        // Giao toàn bộ logic chấm điểm cho Service
        const result = await quizService.processQuizSubmission(userId, quizData);
        
        res.status(200).json({ success: true, result });
    } catch (error) {
        console.error("Lỗi chấm điểm:", error);
        res.status(500).json({ success: false, message: 'Lỗi Server khi chấm điểm' });
    }
};

const updateQuiz = async (req, res) => { res.json({ success: true }); };

module.exports = { createQuiz, deleteQuiz, getAllQuizzes, getQuizById, getQuizzesByUser, submitQuiz, updateQuiz };