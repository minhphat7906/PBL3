const quizRepository = require('../repositories/quizRepository');
const { sql } = require('../db');

const createFullQuiz = async (quizData) => {
    const transaction = new sql.Transaction();
    await transaction.begin();

    try {
        const quizResult = await quizRepository.createQuiz(quizData, transaction);
        const newQuizId = quizResult.recordset[0].id;

        for (const q of quizData.questions) {
            await quizRepository.createQuestion(q, newQuizId, transaction);
        }

        await transaction.commit();
        return newQuizId;
    } catch (err) {
        await transaction.rollback();
        throw err;
    }
};

const getMyQuizzes = async (userId) => {
    return await quizRepository.getQuizzesByUserId(userId);
};

const getHomeQuizzes = async () => {
    return await quizRepository.getAllPublicQuizzes();
};

const getQuizDetail = async (quizId) => {
    // 1. Lấy thông tin bài thi
    const quiz = await quizRepository.getQuizById(quizId);
    if (!quiz) return null;

    // 2. Lấy danh sách câu hỏi và nhét vào bài thi
    const questions = await quizRepository.getQuestionsByQuizId(quizId);
    quiz.questions = questions;
    
    return quiz;
};

const deleteFullQuiz = async (quizId) => {
    const transaction = new sql.Transaction();
    await transaction.begin();
    try {
        // Xóa từ ngoài vào trong: Kết quả -> Câu hỏi -> Đề thi
        await quizRepository.deleteResultsByQuizId(quizId, transaction);
        await quizRepository.deleteQuestionsByQuizId(quizId, transaction);
        await quizRepository.deleteQuizById(quizId, transaction);
        
        await transaction.commit();
    } catch (err) {
        await transaction.rollback();
        throw err;
    }
};

const processQuizSubmission = async (userId, quizData) => {
    const { quiz_id, time_spent, user_answers } = quizData;

    // 1. Lấy danh sách câu hỏi CHUẨN từ Database để so sánh (Bảo mật cao)
    const questions = await quizRepository.getQuestionsByQuizId(quiz_id);
    if (!questions || questions.length === 0) throw new Error('Đề thi rỗng');

    let correctCount = 0;
    const totalQuestions = questions.length;

    // 2. Chấm điểm
    questions.forEach((q) => {
        // Chuẩn hóa đáp án trong DB: Cắt theo dấu phẩy, sắp xếp A-Z rồi nối lại
        const dbAnswer = (q.correct_option || "").split(',').sort().join(',');
        
        // Chuẩn hóa đáp án user gửi lên
        const userAnswerRaw = user_answers[q.id] || "";
        const userAnswer = Array.isArray(userAnswerRaw) 
            ? userAnswerRaw.sort().join(',') 
            : String(userAnswerRaw).split(',').sort().join(',');

        if (userAnswer === dbAnswer && userAnswer !== "") {
            correctCount++;
        }
    });

    const wrongCount = totalQuestions - correctCount;
    const scoreUI = ((correctCount / totalQuestions) * 10).toFixed(1);
    const totalPointsDB = Math.round((correctCount / totalQuestions) * 100);

    // 3. Lưu kết quả
    await quizRepository.saveResult({
        user_id: userId,
        quiz_id,
        total_points: totalPointsDB,
        correct_answers: correctCount,
        wrong_answers: wrongCount
    });

    // 4. Trả về cho Frontend
    return { score: parseFloat(scoreUI), correctCount, totalQuestions, time_spent };
};

module.exports = { 
    createFullQuiz, 
    getMyQuizzes, 
    getHomeQuizzes, 
    getQuizDetail,
    deleteFullQuiz,
    processQuizSubmission 
};