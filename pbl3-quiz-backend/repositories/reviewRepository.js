const { sql } = require('../db');

const createOrUpdateReview = async (userId, quizId, rating, comment) => {
    // Sử dụng UPSERT logic (vì đã có constraint UNIQUE trên userId, quizId)
    // Nhưng T-SQL không có UPSERT gọn như Postgres, nên dùng IF EXISTS
    const query = `
        IF EXISTS (SELECT 1 FROM reviews WHERE user_id = @userId AND quiz_id = @quizId)
        BEGIN
            UPDATE reviews 
            SET rating = @rating, review_text = @comment, updated_at = GETDATE()
            WHERE user_id = @userId AND quiz_id = @quizId
        END
        ELSE
        BEGIN
            INSERT INTO reviews (user_id, quiz_id, rating, review_text)
            VALUES (@userId, @quizId, @rating, @comment)
        END

        -- Cập nhật thông số rating trong bảng quizzes
        DECLARE @avg FLOAT;
        DECLARE @total INT;
        
        SELECT @avg = AVG(CAST(rating AS FLOAT)), @total = COUNT(*) 
        FROM reviews 
        WHERE quiz_id = @quizId;

        UPDATE quizzes 
        SET average_rating = @avg, total_reviews = @total 
        WHERE id = @quizId;
    `;

    const request = new sql.Request();
    request.input('userId', sql.Int, userId);
    request.input('quizId', sql.Int, quizId);
    request.input('rating', sql.Int, rating);
    request.input('comment', sql.NVarChar(sql.MAX), comment);

    return await request.query(query);
};

const getQuizReviews = async (quizId) => {
    const result = await sql.query`
        SELECT r.*, u.username, u.avatar_url
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        WHERE r.quiz_id = ${quizId}
        ORDER BY r.created_at DESC
    `;
    return result.recordset;
};

const getUserQuizReview = async (userId, quizId) => {
    const result = await sql.query`
        SELECT * FROM reviews 
        WHERE user_id = ${userId} AND quiz_id = ${quizId}
    `;
    return result.recordset[0];
};

module.exports = {
    createOrUpdateReview,
    getQuizReviews,
    getUserQuizReview
};
