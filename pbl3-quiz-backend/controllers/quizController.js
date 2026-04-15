const sql = require('mssql');

// 1. Tạo đề thi
const createQuiz = async (req, res) => {
    const { title, description, time_limit, category_id, questions } = req.body;
    try {
        const transaction = new sql.Transaction();
        await transaction.begin();
        try {
            const quizRequest = new sql.Request(transaction);
            const quizResult = await quizRequest
                .input('title', sql.NVarChar, title).input('description', sql.NVarChar, description || '')
                .input('category_id', sql.Int, category_id || 1).input('time_limit', sql.Int, time_limit || 30)
                .query(`INSERT INTO quizzes (title, description, category_id, time_limit) OUTPUT INSERTED.id VALUES (@title, @description, @category_id, @time_limit)`);

            const newQuizId = quizResult.recordset[0].id;
            for (const q of questions) {
    const qReq = new sql.Request(transaction);
    await qReq
        .input('quiz_id', sql.Int, newQuizId)
        .input('question_text', sql.NVarChar, q.question_text)
        .input('image_url', sql.NVarChar, q.image_url || null) // Trả lại cột hình ảnh cho sếp
        .input('option_a', sql.NVarChar, q.option_a)
        .input('option_b', sql.NVarChar, q.option_b)
        .input('option_c', sql.NVarChar, q.option_c)
        .input('option_d', sql.NVarChar, q.option_d)
        .input('correct_option', sql.Char(1), q.correct_option)
        .input('explanation', sql.NVarChar, q.explanation || null)
        .input('points', sql.Int, 10)
        .query(`
            INSERT INTO questions (quiz_id, question_text, image_url, option_a, option_b, option_c, option_d, correct_option, explanation, points) 
            VALUES (@quiz_id, @question_text, @image_url, @option_a, @option_b, @option_c, @option_d, @correct_option, @explanation, @points)
        `);
}
            await transaction.commit();
            res.status(201).json({ success: true, message: 'Tạo đề thi thành công!', quiz_id: newQuizId });
        } catch (err) {
            await transaction.rollback();
            res.status(500).json({ success: false, message: 'Lỗi khi lưu dữ liệu' });
        }
    } catch (error) { res.status(500).json({ success: false, message: 'Lỗi Server' }); }
};

// 2. XÓA ĐỀ THI (Hàm sếp cần đây)
const deleteQuiz = async (req, res) => {
    const { id } = req.params;
    try {
        const transaction = new sql.Transaction();
        await transaction.begin();
        try {
            const request = new sql.Request(transaction);
            request.input('id', sql.Int, id);
            await request.query("DELETE FROM results WHERE quiz_id = @id");
            await request.query("DELETE FROM questions WHERE quiz_id = @id");
            await request.query("DELETE FROM quizzes WHERE id = @id");
            await transaction.commit();
            res.json({ success: true, message: "Đã xóa sạch đề thi!" });
        } catch (err) { await transaction.rollback(); throw err; }
    } catch (error) { res.status(500).json({ success: false, message: "Lỗi xóa" }); }
};

// 3. Các hàm còn lại
const getAllQuizzes = async (req, res) => {
    try {
        const request = new sql.Request(); 
        const result = await request.query(`
            SELECT id, title, description, time_limit, created_at 
            FROM quizzes WHERE is_public = 1 ORDER BY created_at DESC
        `);
        res.json({ success: true, quizzes: result.recordset });
    } catch (error) {
        console.error("Lỗi lấy Kho đề chung:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const getQuizById = async (req, res) => {
    try {
        const request = new sql.Request();
        const quizRes = await request.query(`SELECT * FROM quizzes WHERE id = ${req.params.id}`);
        if (quizRes.recordset.length === 0) return res.status(404).json({ success: false });
        const quiz = quizRes.recordset[0];
        const quesRes = await request.query(`SELECT * FROM questions WHERE quiz_id = ${req.params.id}`);
        quiz.questions = quesRes.recordset;
        res.json({ success: true, quiz });
    } catch (error) { res.status(500).json({ success: false }); }
};

    const getQuizzesByUser = async (req, res) => {
    try {
        const userId = req.user.id;
        const request = new sql.Request();
        const result = await request
            .input('userId', sql.Int, userId)
            .query(`
                SELECT id, title, description, time_limit, is_public, created_at 
                FROM quizzes WHERE user_id = @userId ORDER BY created_at DESC
            `);
        res.json({ success: true, quizzes: result.recordset });
    } catch (error) {
        console.error("Lỗi lấy Đề của tôi:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};


const submitQuiz = async (req, res) => {
    const { quiz_id, time_spent, user_answers } = req.body;
    try {
        const request = new sql.Request();
        const result = await request
            .input('quiz_id', sql.Int, quiz_id)
            .query('SELECT id, correct_option FROM questions WHERE quiz_id = @quiz_id');

        const questions = result.recordset;
        if (questions.length === 0) return res.status(400).json({ success: false, message: 'Đề thi rỗng' });

        let correctCount = 0;
        const totalQuestions = questions.length;

        questions.forEach(q => {
            if (user_answers[q.id] === q.correct_option) correctCount++;
        });

        const wrongCount = totalQuestions - correctCount;
        const scoreUI = ((correctCount / totalQuestions) * 10).toFixed(1);
        const totalPointsDB = Math.round((correctCount / totalQuestions) * 100);
        const userId = req.user ? req.user.id : 1; 

        const insertReq = new sql.Request();
        await insertReq
            .input('user_id', sql.Int, userId)
            .input('quiz_id_param', sql.Int, quiz_id)
            .input('total_points', sql.Int, totalPointsDB)
            .input('correct_answers', sql.Int, correctCount)
            .input('wrong_answers', sql.Int, wrongCount)
            .query(`
                INSERT INTO results (user_id, quiz_id, total_points, correct_answers, wrong_answers, completed_at)
                VALUES (@user_id, @quiz_id_param, @total_points, @correct_answers, @wrong_answers, GETDATE())
            `);

        res.status(200).json({
            success: true,
            result: { score: parseFloat(scoreUI), correctCount, totalQuestions, time_spent }
        });
    } catch (error) {
        console.error("Lỗi chấm điểm:", error);
        res.status(500).json({ success: false, message: 'Lỗi Server khi chấm điểm' });
    }
};

const updateQuiz = async (req, res) => { res.json({ success: true }); };

// BẮT BUỘC PHẢI CÓ DÒNG NÀY ĐỂ SERVER KHÔNG BỊ LỖI TYPE ERROR
module.exports = { createQuiz, deleteQuiz, getAllQuizzes, getQuizById, getQuizzesByUser, submitQuiz, updateQuiz };