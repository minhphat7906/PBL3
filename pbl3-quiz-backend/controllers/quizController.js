const quizService = require('../services/quizService');
const quizRepository = require('../repositories/quizRepository');
const geminiService = require('../services/geminiService');
const notificationRepository = require('../repositories/notificationRepository');

const coverImages = {
    'Toán học': [
        'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&q=80&fit=crop',
        'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=600&q=80&fit=crop'
    ],
    'Công nghệ thông tin': [
        'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=600&q=80&fit=crop',
        'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&q=80&fit=crop'
    ],
    'Vật lý': [
        'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=600&q=80&fit=crop'
    ],
    'Hóa học': [
        'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=600&q=80&fit=crop'
    ],
    'Văn học': [
        'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=600&q=80&fit=crop'
    ],
    'Chung': [
        'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&q=80&fit=crop',
        'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&q=80&fit=crop'
    ]
};

const createQuiz = async (req, res) => {
    try {
        let categoryInput = req.body.category;
        if (!categoryInput || categoryInput.trim() === '') categoryInput = 'Chung';
        
        let difficultyInput = req.body.difficulty;
        if (!difficultyInput || difficultyInput.trim() === '') difficultyInput = 'Trung bình';

        const pool = coverImages[categoryInput] || coverImages['Chung'];
        const randomImage = pool[Math.floor(Math.random() * pool.length)];

        const quizData = { 
            ...req.body, 
            userId: req.user.id,
            category: categoryInput,
            difficulty: difficultyInput,
            image_url: randomImage 
        };
        const newQuizId = await quizService.createFullQuiz(quizData);
        
        // Gửi thông báo
        await notificationRepository.createNotification({
            user_id: req.user.id,
            type: 'success',
            content: `Bạn đã tạo thành công đề thi: ${req.body.title}`
        });

        res.status(201).json({ success: true, message: 'Tạo đề thi thành công!', quiz_id: newQuizId });
    } catch (error) {
        console.error("Lỗi tạo quiz:", error);
        res.status(500).json({ success: false, message: 'Lỗi Server' });
    }
};

const getAllQuizzes = async (req, res) => {
    try {
        const quizzes = await quizRepository.getAllPublicQuizzes();
        res.status(200).json({ success: true, quizzes });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi lấy đề thi công khai" });
    }
};

const getQuizzesByUser = async (req, res) => {
    try {
        const userId = req.user.id;
        const quizzes = await quizRepository.getQuizzesByUserId(userId);
        res.status(200).json({ success: true, quizzes });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi lấy danh sách đề thi" });
    }
};

const getQuizById = async (req, res) => {
    try {
        const quiz = await quizService.getQuizDetail(req.params.id);
        if (!quiz) return res.status(404).json({ success: false, message: "Không tìm thấy đề thi" });
        res.json({ success: true, quiz });
    } catch (error) { 
        res.status(500).json({ success: false }); 
    }
};

const deleteQuiz = async (req, res) => {
    try {
        const quizId = req.params.id;
        const quiz = await quizService.getQuizDetail(quizId);
        if (!quiz) return res.status(404).json({ success: false, message: "Không tìm thấy đề thi" });
        if (quiz.creator_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: "Bạn không có quyền xóa đề thi này!" });
        }
        await quizService.deleteFullQuiz(quizId);
        res.json({ success: true, message: "Đã xóa sạch đề thi!" });
    } catch (error) { 
        res.status(500).json({ success: false, message: "Lỗi xóa" }); 
    }
};

const submitQuiz = async (req, res) => {
    try {
        const userId = req.user.id; 
        const quizData = req.body;
        const result = await quizService.processQuizSubmission(userId, quizData);
        
        // Gửi thông báo kết quả
        await notificationRepository.createNotification({
            user_id: userId,
            type: 'info',
            content: `Bạn đã hoàn thành bài thi "${result.quizTitle}" với ${result.score.toFixed(0)} điểm!`
        });

        res.status(200).json({ success: true, result });
    } catch (error) {
        console.error("Lỗi chấm điểm:", error);
        res.status(500).json({ success: false, message: 'Lỗi Server khi chấm điểm' });
    }
};

const updateQuiz = async (req, res) => {
    try {
        const quizId = req.params.id;
        const quiz = await quizService.getQuizDetail(quizId);
        if (!quiz) return res.status(404).json({ success: false, message: "Không tìm thấy đề thi" });
        if (quiz.creator_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: "Bạn không có quyền sửa đề thi này!" });
        }
        await quizService.updateFullQuiz(quizId, req.body);
        res.status(200).json({ success: true, message: 'Cập nhật đề thi thành công!' });
    } catch (error) {
        console.error("Lỗi cập nhật:", error);
        res.status(500).json({ success: false, message: 'Lỗi Server' });
    }
};

const getExploreQuizzes = async (req, res) => {
    try {
        const userId = req.user.id;
        const filters = {
            tab: req.query.tab || 'public',
            search: req.query.search || '',
            category: req.query.category || '',
            difficulty: req.query.difficulty || '',
            sortBy: req.query.sortBy || '',
            page: parseInt(req.query.page) || 1,
            limit: parseInt(req.query.limit) || 12
        };
        const { quizzes, totalItems, totalPages } = await quizRepository.getExploreQuizzes(userId, filters);
        res.json({ success: true, quizzes, totalPages, totalItems, currentPage: filters.page });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Lỗi lấy kho đề thi" });
    }
};

const toggleFavorite = async (req, res) => {
    try {
        const result = await quizRepository.toggleFavorite(req.user.id, req.params.id);
        res.json({ success: true, status: result.status });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi thả tim" });
    }
};

const getHistory = async (req, res) => {
    try {
        const history = await quizRepository.getHistoryByUserId(req.user.id);
        res.json({ success: true, history });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Lỗi lấy lịch sử thi' });
    }
};

const getDashboardStats = async (req, res) => {
    try {
        const userId = req.user.id;
        const stats = await quizRepository.getDashboardStats(userId);
        res.json({ success: true, stats });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Lỗi lấy stats' });
    }
};

const getResultDetail = async (req, res) => {
    try {
        const resultDetail = await quizRepository.getResultById(req.params.id);
        if (!resultDetail) return res.status(404).json({ success: false, message: "Không tìm thấy kết quả" });
        res.json({ success: true, result: resultDetail });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi lấy kết quả" });
    }
};

const getCategories = async (req, res) => {
    try {
        const categories = await quizRepository.getAllCategories();
        res.json({ success: true, categories });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Lỗi lấy danh sách danh mục' });
    }
};

const getExploreStats = async (req, res) => {
    try {
        const stats = await quizRepository.getExploreStats();
        res.json({ success: true, stats });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi hệ thống" });
    }
};

const getQuizPreview = async (req, res) => {
    try {
        const quizPreview = await quizRepository.getQuizPreview(req.params.id);
        if (!quizPreview) return res.status(404).json({ success: false, message: "Không tìm thấy đề thi" });
        res.json({ success: true, quiz: quizPreview });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi hệ thống" });
    }
};

// ─── MỚI: Streak Info ─────────────────────────────────────────────────
const getStreakInfo = async (req, res) => {
    try {
        const streakData = await quizRepository.getStreakInfo(req.user.id);
        res.json({ success: true, ...streakData });
    } catch (error) {
        res.status(500).json({ success: false, streak: 0, isActiveToday: false });
    }
};

// ─── MỚI: Weekly Activity Chart ───────────────────────────────────────
const getWeeklyActivity = async (req, res) => {
    try {
        const data = await quizRepository.getWeeklyActivity(req.user.id);
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, data: [] });
    }
};

// ─── MỚI: Leaderboard (3 loại) ────────────────────────────────────────
const getLeaderboard = async (req, res) => {
    try {
        const type = req.query.type || 'points';
        const limit = parseInt(req.query.limit) || 10;
        const filters = {
            category: req.query.category,
            difficulty: req.query.difficulty,
            search: req.query.search
        };
        const data = await quizRepository.getLeaderboard(type, limit, filters);
        res.json({ success: true, data, type });
    } catch (error) {
        res.status(500).json({ success: false, data: [] });
    }
};

// ─── MỚI: Per-Quiz Leaderboard ────────────────────────────────────────
const getQuizLeaderboard = async (req, res) => {
    try {
        const quizId = req.params.id;
        const userId = req.user.id;
        const data = await quizRepository.getQuizLeaderboard(quizId, 10, userId);
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, data: [] });
    }
};

// ─── MỚI: MẶT TRẬN 1 - TÍCH HỢP GEMINI API + FILE UPLOAD ─────────────
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer: Lưu file vào Ổ CỨNG để chống tràn RAM
const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => cb(null, uploadDir),
        filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
    }),
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
    fileFilter: (req, file, cb) => {
        const allowed = [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/msword',
            'text/plain'
        ];
        if (allowed.includes(file.mimetype)) cb(null, true);
        else cb(new Error('Chỉ chấp nhận file PDF, Word (.docx), hoặc Text (.txt)'));
    }
}).single('file'); // Field name phải là 'file'

const generateAIQuizzes = async (req, res) => {
    // Chạy multer middleware thủ công để xử lý multipart/form-data
    upload(req, res, async (uploadErr) => {
        if (uploadErr) {
            return res.status(400).json({ success: false, message: uploadErr.message });
        }

        try {
            const { topic, questionCount, difficulty } = req.body;
            const count = parseInt(questionCount) || 10;
            const diff = difficulty || 'Trung bình';

            // ─── Bóc tách văn bản từ file đính kèm ──────────────────
            let documentText = '';
            if (req.file) {
                const { mimetype, path: filePath } = req.file;
                console.log(`[AI] Nhận file: ${req.file.originalname} (${mimetype})`);

                try {
                    const fileBuffer = fs.readFileSync(filePath);
                    if (mimetype === 'application/pdf') {
                        const parsed = await pdfParse(fileBuffer);
                        documentText = parsed.text;
                    } else if (
                        mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                        mimetype === 'application/msword'
                    ) {
                        const result = await mammoth.extractRawText({ buffer: fileBuffer });
                        documentText = result.value;
                    } else if (mimetype === 'text/plain') {
                        documentText = fileBuffer.toString('utf-8');
                    }
                } finally {
                    // Luôn xóa file tạm sau khi đọc xong
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                    }
                }
                
                // Giới hạn độ dài để không vượt token limit của Gemini
                if (documentText.length > 15000) {
                    documentText = documentText.substring(0, 15000) + '\n...(tài liệu đã được cắt ngắn)';
                }
                console.log(`[AI] Bóc tách thành công: ${documentText.length} ký tự`);
            }

            // Nếu không có topic VÀ không có file -> lỗi
            if (!topic && !documentText) {
                return res.status(400).json({ success: false, message: "Cần nhập chủ đề hoặc đính kèm tài liệu" });
            }

            const aiQuestions = await geminiService.generateQuizAI(
                topic || 'Nội dung từ tài liệu đính kèm',
                count,
                diff,
                documentText
            );
            res.status(200).json({ success: true, data: aiQuestions });

        } catch (error) {
            console.error("Lỗi từ Controller AI:", error);
            res.status(500).json({ success: false, message: error.message || "Lỗi truy xuất AI" });
        }
    });
};

const explainQuestion = async (req, res) => {
    try {
        const { questionId } = req.body;
        if (!questionId) return res.status(400).json({ success: false, message: "Thiếu ID câu hỏi" });

        // 1. Kiểm tra Cache
        const question = await quizRepository.getQuestionById(questionId);
        if (!question) return res.status(404).json({ success: false, message: "Không tìm thấy câu hỏi" });

        if (question.ai_explanation) {
            return res.json({ success: true, explanation: question.ai_explanation, cached: true });
        }

        // 2. Nếu chưa có, gọi AI
        const aiResponse = await geminiService.explainQuestion(question);
        
        // 3. Lưu vào Cache (Database)
        await quizRepository.updateQuestionAIExplanation(questionId, aiResponse);

        res.json({ success: true, explanation: aiResponse, cached: false });
    } catch (error) {
        console.error("Lỗi AI Explain:", error);
        res.status(500).json({ success: false, message: error.message || "Lỗi AI" });
    }
};

module.exports = { 
    createQuiz, deleteQuiz, getAllQuizzes, getQuizById, getQuizzesByUser, 
    submitQuiz, updateQuiz, getExploreQuizzes, toggleFavorite, getHistory, 
    getDashboardStats, getResultDetail, getExploreStats, getQuizPreview, getCategories,
    // Mới
    getStreakInfo, getWeeklyActivity, getLeaderboard, getQuizLeaderboard,
    generateAIQuizzes, explainQuestion
};