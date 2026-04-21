const { sql } = require('../db');

const createReport = async (userId, quizId, reason, description) => {
    return await sql.query`
        INSERT INTO reports (user_id, quiz_id, reason, description)
        VALUES (${userId}, ${quizId}, ${reason}, ${description})
    `;
};

module.exports = {
    createReport
};

