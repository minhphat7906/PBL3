const { sql } = require('../db');

// --- 1. CÁC HÀM TẠO ĐỀ THI ---
const createQuiz = async (data, transaction) => {
    const request = new sql.Request(transaction);
    return await request
        .input('title', sql.NVarChar, data.title)
        .input('description', sql.NVarChar, data.description || '')
        .input('category_id', sql.Int, data.category_id ? data.category_id : 1)
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

//---Hàm sửa đề---
const updateQuizInfo = async (quizId, data, transaction) => {
    const request = new sql.Request(transaction);
    return await request
        .input('id', sql.Int, quizId)
        .input('title', sql.NVarChar, data.title)
        .input('description', sql.NVarChar, data.description || '')
        .input('time_limit', sql.Int, data.time_limit || 30)
        .input('is_public', sql.Bit, data.is_public ? 1 : 0)
        .query(`
            UPDATE quizzes 
            SET title = @title, 
                description = @description, 
                time_limit = @time_limit, 
                is_public = @is_public
            WHERE id = @id
        `);
};

const toggleFavorite = async (userId, quizId) => {
    const request = new sql.Request();
    
    const check = await request
        .input('u', sql.Int, userId)
        .input('q', sql.Int, quizId)
        .query('SELECT id FROM favorites WHERE user_id = @u AND quiz_id = @q');

    if (check.recordset.length > 0) {
        const delReq = new sql.Request();
        await delReq
            .input('id', sql.Int, check.recordset[0].id)
            .query('DELETE FROM favorites WHERE id = @id');
        return { status: 'unfavorited' };
    } else {
        const insReq = new sql.Request();
        await insReq
            .input('u2', sql.Int, userId)
            .input('q2', sql.Int, quizId)
            .query('INSERT INTO favorites (user_id, quiz_id) VALUES (@u2, @q2)');
        return { status: 'favorited' };
    }
};

const getExploreQuizzes = async (userId, tab = 'public') => {
    const request = new sql.Request();
    request.input('userId', sql.Int, userId);

    let whereClause = 'WHERE q.is_public = 1';
    let orderBy = 'ORDER BY q.created_at DESC';

    if (tab === 'mine') {
        whereClause = 'WHERE q.creator_id = @userId';
    } else if (tab === 'favorites') {
        whereClause = 'WHERE EXISTS (SELECT 1 FROM favorites f WHERE f.user_id = @userId AND f.quiz_id = q.id)';
    } else if (tab === 'trending') {
        whereClause = 'WHERE q.is_public = 1 AND q.created_at >= DATEADD(day, -7, GETDATE())';
        orderBy = 'ORDER BY q.created_at DESC';
    }

    const query = `
        SELECT q.*, u.username as author_name,
        (SELECT COUNT(*) FROM favorites f WHERE f.quiz_id = q.id) as total_likes,
        CASE WHEN EXISTS (SELECT 1 FROM favorites f WHERE f.user_id = @userId AND f.quiz_id = q.id) 
             THEN 1 ELSE 0 END as is_favorite,
        0 as avg_rating,
        0 as total_attempts
        FROM quizzes q
        JOIN users u ON q.creator_id = u.id
        ${whereClause}
        ${orderBy}
    `;

    try {
        const result = await request.query(query);
        return result.recordset;
    } catch (err) {
        console.log("Error logic API:", err.message);
        return [];
    }
};

const getHistoryByUserId = async (userId) => {
    const request = new sql.Request();
    request.input('userId', sql.Int, userId);
    const result = await request.query(`
        SELECT r.id, r.total_points, r.correct_answers, r.wrong_answers, r.completed_at,
               r.quiz_id, q.title as quiz_title, q.time_limit,
               (SELECT COUNT(*) FROM questions qq WHERE qq.quiz_id = q.id) as total_questions
        FROM results r
        JOIN quizzes q ON r.quiz_id = q.id
        WHERE r.user_id = @userId
        ORDER BY r.completed_at DESC
    `);
    
    const rawResults = result.recordset;
    
    // Gom nhóm trong JavaScript
    const grouped = {};
    rawResults.forEach(r => {
        if (!grouped[r.quiz_id]) {
            grouped[r.quiz_id] = {
                quiz_id: r.quiz_id,
                quiz_title: r.quiz_title,
                time_limit: r.time_limit,
                total_questions: r.total_questions,
                attempt_count: 0,
                best_score: 0,
                attempts_list: []
            };
        }
        
        grouped[r.quiz_id].attempt_count += 1;
        if (r.total_points > grouped[r.quiz_id].best_score) {
            grouped[r.quiz_id].best_score = r.total_points;
        }
        
        grouped[r.quiz_id].attempts_list.push({
            id: r.id,
            total_points: r.total_points,
            correct_answers: r.correct_answers,
            wrong_answers: r.wrong_answers,
            completed_at: r.completed_at
        });
    });
    
    return Object.values(grouped);
};

const getResultById = async (resultId) => {
    const request = new sql.Request();
    request.input('id', sql.Int, resultId);
    const result = await request.query(`
        SELECT r.*, q.title as quiz_title, q.time_limit,
               (SELECT COUNT(*) FROM questions qq WHERE qq.quiz_id = q.id) as total_questions
        FROM results r
        JOIN quizzes q ON r.quiz_id = q.id
        WHERE r.id = @id
    `);
    return result.recordset[0];
};

const getDashboardStats = async (userId) => {
    const request = new sql.Request();
    request.input('userId', sql.Int, userId);
    const result = await request.query(`
        SELECT 
            (SELECT COUNT(*) FROM quizzes WHERE creator_id = @userId) as total_created,
            (SELECT COUNT(*) FROM results WHERE user_id = @userId) as total_attempts,
            (SELECT ISNULL(AVG(CAST(total_points AS FLOAT)), 0) FROM results WHERE user_id = @userId) as avg_score,
            (SELECT COUNT(*) FROM favorites WHERE user_id = @userId) as total_favorites
    `);
    return result.recordset[0];
};

module.exports = {
    createQuiz, createQuestion,
    getQuizzesByUserId, getAllPublicQuizzes,
    getQuizById, getQuestionsByQuizId,
    saveResult,
    deleteResultsByQuizId, deleteQuestionsByQuizId, deleteQuizById,
    updateQuizInfo,
    getExploreQuizzes,
    toggleFavorite,
    getHistoryByUserId,
    getDashboardStats,
    getResultById
};