const { sql } = require('../db');

// --- 1. CÁC HÀM TẠO ĐỀ THI ---
const createQuiz = async (data, transaction) => {
    const request = new sql.Request(transaction);
    return await request
        .input('title', sql.NVarChar, data.title)
        .input('description', sql.NVarChar, data.description || '')
        .input('category_id', sql.Int, data.category_id ? data.category_id : 1) // Chống lỗi NULL
        .input('time_limit', sql.Int, data.time_limit || 30)
        .input('creator_id', sql.Int, data.userId)
        .input('is_public', sql.Bit, data.is_public !== undefined ? data.is_public : 1)
        .query(`
            INSERT INTO quizzes (title, description, category_id, time_limit, creator_id, is_public) 
            OUTPUT INSERTED.id 
            VALUES (@title, @description, @category_id, @time_limit, @creator_id, @is_public)
        `);
};

const createQuestion = async (q, quizId, transaction) => {
    const request = new sql.Request(transaction);
    return await request
        .input('quiz_id', sql.Int, quizId)
        .input('question_type', sql.VarChar, q.question_type || 'single')
        .input('question_text', sql.NVarChar, q.question_text)
        .input('image_url', sql.NVarChar, q.image_url || null)
        .input('option_a', sql.NVarChar, q.option_a)
        .input('option_b', sql.NVarChar, q.option_b)
        .input('option_c', sql.NVarChar, q.option_c ? q.option_c : '') 
        .input('option_d', sql.NVarChar, q.option_d ? q.option_d : '') 
        .input('correct_option', sql.VarChar, q.correct_option)
        .input('explanation', sql.NVarChar, q.explanation || null)
        .input('points', sql.Int, 10)
        .query(`
            INSERT INTO questions (quiz_id, question_type, question_text, image_url, option_a, option_b, option_c, option_d, correct_option, explanation, points) 
            VALUES (@quiz_id, @question_type, @question_text, @image_url, @option_a, @option_b, @option_c, @option_d, @correct_option, @explanation, @points)
        `);
};

// --- 2. CÁC HÀM LẤY DANH SÁCH ---
const getQuizzesByUserId = async (userId) => {
    const request = new sql.Request();
    request.input('userId', sql.Int, userId);
    const result = await request.query(`
        SELECT q.*, c.name as category_name 
        FROM quizzes q
        LEFT JOIN categories c ON q.category_id = c.id
        WHERE q.creator_id = @userId 
        ORDER BY q.created_at DESC
    `);
    return result.recordset;
};

const getAllPublicQuizzes = async () => {
    const request = new sql.Request();
    const result = await request.query(`
        SELECT q.*, c.name as category_name 
        FROM quizzes q
        LEFT JOIN categories c ON q.category_id = c.id
        WHERE q.is_public = 1
        ORDER BY q.created_at DESC
    `);
    return result.recordset;
};

// --- 3. CÁC HÀM LẤY CHI TIẾT ---
const getQuizById = async (quizId) => {
    const request = new sql.Request();
    request.input('id', sql.Int, quizId);
    const result = await request.query(`SELECT * FROM quizzes WHERE id = @id`);
    return result.recordset[0];
};

const getQuestionsByQuizId = async (quizId) => {
    const request = new sql.Request();
    request.input('id', sql.Int, quizId);
    const result = await request.query(`SELECT * FROM questions WHERE quiz_id = @id`);
    return result.recordset;
};

// --- 4. CÁC HÀM CHẤM ĐIỂM & KẾT QUẢ ---
const saveResult = async (resultData) => {
    const { user_id, quiz_id, total_points, correct_answers, wrong_answers } = resultData;
    const request = new sql.Request();
    request.input('user_id', sql.Int, user_id);
    request.input('quiz_id', sql.Int, quiz_id);
    request.input('total_points', sql.Int, total_points);
    request.input('correct_answers', sql.Int, correct_answers);
    request.input('wrong_answers', sql.Int, wrong_answers);

    return await request.query(`
        INSERT INTO results (user_id, quiz_id, total_points, correct_answers, wrong_answers, completed_at)
        VALUES (@user_id, @quiz_id, @total_points, @correct_answers, @wrong_answers, GETDATE())
    `);
};

// --- 5. CÁC HÀM XÓA (Dùng cho Transaction) ---
const deleteResultsByQuizId = async (quizId, transaction) => {
    const request = new sql.Request(transaction);
    await request.input('id', sql.Int, quizId).query(`DELETE FROM results WHERE quiz_id = @id`);
};
const deleteQuestionsByQuizId = async (quizId, transaction) => {
    const request = new sql.Request(transaction);
    await request.input('id', sql.Int, quizId).query(`DELETE FROM questions WHERE quiz_id = @id`);
};
const deleteQuizById = async (quizId, transaction) => {
    const request = new sql.Request(transaction);
    await request.input('id', sql.Int, quizId).query(`DELETE FROM quizzes WHERE id = @id`);
};



module.exports = { 
    createQuiz, createQuestion, 
    getQuizzesByUserId, getAllPublicQuizzes, 
    getQuizById, getQuestionsByQuizId, 
    saveResult, 
    deleteResultsByQuizId, deleteQuestionsByQuizId, deleteQuizById 
};