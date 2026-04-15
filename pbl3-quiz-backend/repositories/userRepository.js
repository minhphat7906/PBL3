const { sql } = require('../db');

const createQuiz = async (data, transaction) => {
    const request = new sql.Request(transaction);
    return await request
        .input('title', sql.NVarChar, data.title)
        .input('description', sql.NVarChar, data.description || '')
        .input('category_id', sql.Int, data.category_id ? data.category_id : 1)
        .input('time_limit', sql.Int, data.time_limit || 30)
        .input('creator_id', sql.Int, data.userId) // <--- QUAN TRỌNG NHẤT: Lưu ID người tạo
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
        .input('question_text', sql.NVarChar, q.question_text)
        .input('image_url', sql.NVarChar, q.image_url || null)
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
};

const findByEmail = async (email) => {
    const request = new sql.Request();
    request.input('email', sql.VarChar, email);
    const result = await request.query(`SELECT * FROM users WHERE email = @email`);
    return result.recordset[0]; // Trả về user đầu tiên tìm thấy
};

const createUser = async (username, email, hashedPassword) => {
    const request = new sql.Request();
    request.input('username', sql.NVarChar, username);
    request.input('email', sql.VarChar, email);
    request.input('password_hash', sql.VarChar, hashedPassword);
    
    // Role mặc định là student như trong SRS của em
    return await request.query(`
        INSERT INTO users (username, email, password_hash, role) 
        VALUES (@username, @email, @password_hash, 'student')
    `);
};

module.exports = { findByEmail, createUser, createQuiz, createQuestion };