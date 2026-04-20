const { sql } = require('../db');

// ─── Kho ảnh bìa theo Chủ đề ──────────────────────────────────────────────────
const COVER_IMAGE_POOL = {
  'toán học': [
    'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&q=80&fit=crop',
    'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=600&q=80&fit=crop',
    'https://images.unsplash.com/photo-1596495577886-d920f1fb7238?w=600&q=80&fit=crop',
  ],
  'văn học': [
    'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=600&q=80&fit=crop',
    'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=600&q=80&fit=crop',
    'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&q=80&fit=crop',
  ],
  'ngoại ngữ': [
    'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=600&q=80&fit=crop',
    'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&q=80&fit=crop',
  ],
  'công nghệ thông tin': [
    'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=600&q=80&fit=crop',
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&q=80&fit=crop',
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&q=80&fit=crop',
  ],
  'lịch sử': [
    'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=600&q=80&fit=crop',
    'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=600&q=80&fit=crop',
  ],
  'vật lý': [
    'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=600&q=80&fit=crop',
    'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=600&q=80&fit=crop',
  ],
  'hóa học': [
    'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=600&q=80&fit=crop',
    'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?w=600&q=80&fit=crop',
  ],
  'sinh học': [
    'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=600&q=80&fit=crop',
    'https://images.unsplash.com/photo-1628595351029-c2bf17511435?w=600&q=80&fit=crop',
  ],
  'địa lý': [
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&q=80&fit=crop',
    'https://images.unsplash.com/photo-1494389945381-0fe114b8ea4d?w=600&q=80&fit=crop',
  ],
  'default': [
    'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&q=80&fit=crop',
    'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&q=80&fit=crop',
    'https://images.unsplash.com/photo-1471107340929-a87cd0f5b5f3?w=600&q=80&fit=crop',
  ]
};

const getRandomCover = (category) => {
  const key = (category || '').toLowerCase().trim();
  const pool = COVER_IMAGE_POOL[key] || COVER_IMAGE_POOL['default'];
  return pool[Math.floor(Math.random() * pool.length)];
};


// ─── 1. TẠO ĐỀ THI ─────────────────────────────────────────────────────────────
const createQuiz = async (data, transaction) => {
    const imageUrl = data.image_url || 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&q=80&fit=crop';
    const request = new sql.Request(transaction);
    return await request
        .input('title', sql.NVarChar, data.title)
        .input('description', sql.NVarChar, data.description || '')
        .input('time_limit', sql.Int, data.time_limit || 30)
        .input('creator_id', sql.Int, data.userId)
        .input('is_public', sql.Bit, data.is_public !== undefined ? data.is_public : 1)
        .input('difficulty', sql.NVarChar, data.difficulty)
        .input('category_txt', sql.NVarChar, data.category)
        .input('image_url', sql.NVarChar, imageUrl)
        .query(`
            DECLARE @cat_id INT = 1;
            
            IF @category_txt != ''
            BEGIN
                SELECT @cat_id = id FROM categories WHERE name = @category_txt;
                IF @cat_id IS NULL
                BEGIN
                    BEGIN TRY
                        INSERT INTO categories (name) VALUES (@category_txt);
                        SET @cat_id = SCOPE_IDENTITY();
                    END TRY
                    BEGIN CATCH
                        SET @cat_id = 1;
                    END CATCH
                END
            END

            -- Thêm cột image_url nếu chưa có (an toàn với ALTER TABLE)
            IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'quizzes' AND COLUMN_NAME = 'image_url')
            BEGIN
                ALTER TABLE quizzes ADD image_url NVARCHAR(500) NULL;
            END

            INSERT INTO quizzes (title, description, category_id, time_limit, creator_id, is_public, difficulty, category, image_url) 
            OUTPUT INSERTED.id 
            VALUES (@title, @description, @cat_id, @time_limit, @creator_id, @is_public, @difficulty, @category_txt, @image_url)
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

// ─── 2. DANH SÁCH ────────────────────────────────────────────────────────────────
const getQuizzesByUserId = async (userId) => {
    const request = new sql.Request();
    request.input('userId', sql.Int, userId);
    const result = await request.query(`
        SELECT q.*, u.username as author_name, u.avatar_url as author_avatar, u.id as author_id, c.name as category_name,
        (SELECT COUNT(*) FROM questions qq WHERE qq.quiz_id = q.id) as total_questions
        FROM quizzes q
        LEFT JOIN categories c ON q.category_id = c.id
        JOIN users u ON q.creator_id = u.id
        WHERE q.creator_id = @userId 
        ORDER BY q.created_at DESC
    `);
    return result.recordset;
};

const getAllPublicQuizzes = async () => {
    const request = new sql.Request();
    const result = await request.query(`
        SELECT q.*, u.username as author_name, u.avatar_url as author_avatar, u.id as author_id, c.name as category_name,
        (SELECT COUNT(*) FROM questions qq WHERE qq.quiz_id = q.id) as total_questions,
        (SELECT COUNT(*) FROM results r WHERE r.quiz_id = q.id) as total_attempts
        FROM quizzes q
        LEFT JOIN categories c ON q.category_id = c.id
        JOIN users u ON q.creator_id = u.id
        WHERE q.is_public = 1
        ORDER BY q.created_at DESC
    `);
    return result.recordset;
};

// ─── 3. CHI TIẾT ─────────────────────────────────────────────────────────────────
const getQuizById = async (quizId) => {
    const request = new sql.Request();
    request.input('id', sql.Int, quizId);
    const result = await request.query(`
        SELECT q.*, u.username as author_name, u.avatar_url as author_avatar, u.id as author_id
        FROM quizzes q
        JOIN users u ON q.creator_id = u.id
        WHERE q.id = @id
    `);
    return result.recordset[0];
};

const getQuestionsByQuizId = async (quizId) => {
    const request = new sql.Request();
    request.input('id', sql.Int, quizId);
    const result = await request.query(`SELECT * FROM questions WHERE quiz_id = @id`);
    return result.recordset;
};

// ─── 4. LƯU KẾT QUẢ + STREAK ─────────────────────────────────────────────────────
const saveResult = async (resultData) => {
    const { user_id, quiz_id, total_points, correct_answers, wrong_answers, time_spent, answers_json } = resultData;
    const request = new sql.Request();
    request.input('user_id', sql.Int, user_id);
    request.input('quiz_id', sql.Int, quiz_id);
    request.input('total_points', sql.Int, total_points);
    request.input('correct_answers', sql.Int, correct_answers);
    request.input('wrong_answers', sql.Int, wrong_answers);
    request.input('time_spent', sql.Int, time_spent || 0);
    request.input('answers_json', sql.NVarChar, answers_json || '{}');

    await request.query(`
        INSERT INTO results (user_id, quiz_id, total_points, correct_answers, wrong_answers, time_spent, answers_json, completed_at)
        VALUES (@user_id, @quiz_id, @total_points, @correct_answers, @wrong_answers, @time_spent, @answers_json, GETDATE())
    `);

    // --- Cập nhật Streak ---
    const streakReq = new sql.Request();
    streakReq.input('uid', sql.Int, user_id);

    // Đảm bảo cột tồn tại (tự động migration an toàn)
    await streakReq.query(`
        IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='users' AND COLUMN_NAME='current_streak')
            ALTER TABLE users ADD current_streak INT DEFAULT 0;
        IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='users' AND COLUMN_NAME='last_active_date')
            ALTER TABLE users ADD last_active_date DATE NULL;
    `);

    const userRow = await new sql.Request()
        .input('uid2', sql.Int, user_id)
        .query(`SELECT current_streak, last_active_date FROM users WHERE id = @uid2`);
    
    const user = userRow.recordset[0];
    const todayDate = new Date().toISOString().slice(0, 10);
    const lastActive = user?.last_active_date ? new Date(user.last_active_date).toISOString().slice(0, 10) : null;

    let newStreak = user?.current_streak || 0;

    if (lastActive === todayDate) {
        // Hôm nay đã học rồi, giữ nguyên
    } else {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().slice(0, 10);

        if (lastActive === yesterdayStr) {
            newStreak = newStreak + 1; // Chuỗi liên tục +1
        } else {
            newStreak = 1; // Phá chuỗi, reset
        }
    }

    await new sql.Request()
        .input('uid3', sql.Int, user_id)
        .input('streak', sql.Int, newStreak)
        .input('today', sql.Date, new Date())
        .query(`UPDATE users SET current_streak = @streak, last_active_date = @today WHERE id = @uid3`);
};


// ─── 5. XÓA ──────────────────────────────────────────────────────────────────────
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

// ─── 6. SỬA ĐỀ ───────────────────────────────────────────────────────────────────
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
            SET title = @title, description = @description, time_limit = @time_limit, is_public = @is_public
            WHERE id = @id
        `);
};

// ─── 7. FAVORITES ─────────────────────────────────────────────────────────────────
const toggleFavorite = async (userId, quizId) => {
    const request = new sql.Request();
    const check = await request
        .input('u', sql.Int, userId)
        .input('q', sql.Int, quizId)
        .query('SELECT id FROM favorites WHERE user_id = @u AND quiz_id = @q');

    if (check.recordset.length > 0) {
        await new sql.Request()
            .input('id', sql.Int, check.recordset[0].id)
            .query('DELETE FROM favorites WHERE id = @id');
        return { status: 'unfavorited' };
    } else {
        await new sql.Request()
            .input('u2', sql.Int, userId)
            .input('q2', sql.Int, quizId)
            .query('INSERT INTO favorites (user_id, quiz_id) VALUES (@u2, @q2)');
        return { status: 'favorited' };
    }
};

// ─── 8. EXPLORE (Phân trang) ──────────────────────────────────────────────────────
const getExploreQuizzes = async (userId, filters = {}) => {
    const { tab = 'public', search, category, difficulty, sortBy, page = 1, limit = 12 } = filters;
    const request = new sql.Request();
    request.input('userId', sql.Int, userId);
    const offset = (page - 1) * limit;
    request.input('offset', sql.Int, offset);
    request.input('limit', sql.Int, limit);

    let whereConditions = [];
    if (tab === 'mine') {
        whereConditions.push('q.creator_id = @userId');
    } else if (tab === 'favorites') {
        whereConditions.push('EXISTS (SELECT 1 FROM favorites f WHERE f.user_id = @userId AND f.quiz_id = q.id)');
    } else {
        whereConditions.push('q.is_public = 1');
    }

    if (search) {
        request.input('search', sql.NVarChar, `%${search}%`);
        whereConditions.push('(q.title LIKE @search OR u.username LIKE @search)');
    }
    if (category && category !== 'all' && category !== '') {
        request.input('category', sql.NVarChar, category);
        whereConditions.push('(q.category = @category OR c.name = @category)');
    }
    if (difficulty && difficulty !== 'all' && difficulty !== '') {
        request.input('difficulty', sql.NVarChar, difficulty);
        whereConditions.push('q.difficulty = @difficulty');
    }

    let whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';
    let orderBy = sortBy === 'popular' ? 'ORDER BY total_attempts DESC' : 'ORDER BY q.created_at DESC';

    const query = `
        SELECT q.*, u.username as author_name, u.avatar_url as author_avatar, u.id as author_id, c.name as category_name,
        COUNT(*) OVER() as total_count,
        (SELECT COUNT(*) FROM favorites f WHERE f.quiz_id = q.id) as total_likes,
        (SELECT COUNT(*) FROM questions qq WHERE qq.quiz_id = q.id) as total_questions,
        CASE WHEN EXISTS (SELECT 1 FROM favorites f WHERE f.user_id = @userId AND f.quiz_id = q.id) 
             THEN 1 ELSE 0 END as is_favorite,
        (SELECT COUNT(*) FROM results r WHERE r.quiz_id = q.id) as total_attempts
        FROM quizzes q
        JOIN users u ON q.creator_id = u.id
        LEFT JOIN categories c ON q.category_id = c.id
        ${whereClause}
        ${orderBy}
        OFFSET @offset ROWS
        FETCH NEXT @limit ROWS ONLY
    `;

    try {
        const result = await request.query(query);
        const totalItems = result.recordset.length > 0 ? result.recordset[0].total_count : 0;
        const totalPages = Math.ceil(totalItems / limit);
        return { quizzes: result.recordset, totalItems, totalPages };
    } catch (err) {
        console.log("Error Explore API:", err.message);
        return { quizzes: [], totalItems: 0, totalPages: 0 };
    }
};

// ─── 9. LỊCH SỬ (Nhóm theo quiz) ─────────────────────────────────────────────────
const getHistoryByUserId = async (userId) => {
    const request = new sql.Request();
    request.input('userId', sql.Int, userId);
    const result = await request.query(`
        SELECT r.id, r.quiz_id, r.total_points, r.correct_answers, r.wrong_answers, r.completed_at,
               q.title as quiz_title, q.time_limit, q.image_url,
               (SELECT COUNT(*) FROM questions qq WHERE qq.quiz_id = q.id) as total_questions
        FROM results r
        JOIN quizzes q ON r.quiz_id = q.id
        WHERE r.user_id = @userId
        ORDER BY r.completed_at DESC
    `);

    const groupedOrder = [];
    const grouped = {};
    result.recordset.forEach(r => {
        if (!grouped[r.quiz_id]) {
            grouped[r.quiz_id] = {
                quiz_id: r.quiz_id, quiz_title: r.quiz_title, time_limit: r.time_limit,
                image_url: r.image_url, total_questions: r.total_questions,
                attempt_count: 0, best_score: 0, attempts_list: []
            };
            groupedOrder.push(r.quiz_id);
        }
        grouped[r.quiz_id].attempt_count += 1;
        if (r.total_points > grouped[r.quiz_id].best_score) grouped[r.quiz_id].best_score = r.total_points;
        grouped[r.quiz_id].attempts_list.push({
            id: r.id, total_points: r.total_points, correct_answers: r.correct_answers,
            wrong_answers: r.wrong_answers, completed_at: r.completed_at
        });
    });
    return groupedOrder.map(id => grouped[id]);
};

// ─── 10. STATS dashboard ─────────────────────────────────────────────────────────
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

// ─── 11. STREAK INFO ─────────────────────────────────────────────────────────────
const getStreakInfo = async (userId) => {
    try {
        const request = new sql.Request();
        request.input('uid', sql.Int, userId);
        const result = await request.query(`
            SELECT ISNULL(current_streak, 0) as current_streak, last_active_date
            FROM users WHERE id = @uid
        `);
        const user = result.recordset[0];
        const todayStr = new Date().toISOString().slice(0, 10);
        const lastActiveStr = user?.last_active_date ? new Date(user.last_active_date).toISOString().slice(0, 10) : null;
        return {
            streak: user?.current_streak || 0,
            isActiveToday: lastActiveStr === todayStr
        };
    } catch (err) {
        return { streak: 0, isActiveToday: false };
    }
};

// ─── 12. WEEKLY ACTIVITY (Biểu đồ thật) ─────────────────────────────────────────
const getWeeklyActivity = async (userId) => {
    const request = new sql.Request();
    request.input('userId', sql.Int, userId);
    const result = await request.query(`
        SELECT 
            CAST(completed_at AS DATE) as day_date,
            COUNT(*) as count
        FROM results
        WHERE user_id = @userId
          AND completed_at >= DATEADD(day, -6, CAST(GETDATE() AS DATE))
        GROUP BY CAST(completed_at AS DATE)
        ORDER BY day_date ASC
    `);
    
    // Tạo mảng 7 ngày đầy đủ, fill 0 nếu ngày không có data
    const days = [];
    const dayLabels = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().slice(0, 10);
        const dayLabel = dayLabels[d.getDay()];
        const found = result.recordset.find(r => new Date(r.day_date).toISOString().slice(0, 10) === dateStr);
        days.push({ name: dayLabel, date: dateStr, value: found ? found.count : 0 });
    }
    return days;
};

// ─── 13. LEADERBOARD API ─────────────────────────────────────────────────────────
const getLeaderboard = async (type = 'streak', limit = 10, filters = {}) => {
    const request = new sql.Request();
    request.input('lim', sql.Int, limit);
    
    let baseWhere = [];
    if (filters.search && filters.search.trim() !== '') {
        baseWhere.push(`u.username LIKE @search`);
        request.input('search', sql.NVarChar, `%${filters.search}%`);
    }

    if (type === 'streak') {
        const whereClause = baseWhere.length > 0 ? `WHERE ${baseWhere.join(' AND ')}` : '';
        const query = `
            SELECT TOP (@lim) u.id, u.username, 
                   ISNULL(u.current_streak, 0) as score,
                   u.last_active_date
            FROM users u
            ${whereClause}
            ORDER BY u.current_streak DESC, u.last_active_date DESC
        `;
        return (await request.query(query)).recordset;
    } else if (type === 'creators') {
        // Creators: Count quizzes created match filters
        if (filters.category && filters.category !== 'all') {
            baseWhere.push(`q.category = @cat`);
            request.input('cat', sql.NVarChar, filters.category);
        }
        if (filters.difficulty && filters.difficulty !== 'all') {
            baseWhere.push(`q.difficulty = @diff`);
            request.input('diff', sql.NVarChar, filters.difficulty);
        }
        
        const query = `
            SELECT TOP (@lim) u.id, u.username, COUNT(q.id) as score
            FROM users u
            INNER JOIN quizzes q ON q.creator_id = u.id
            ${baseWhere.length > 0 ? `WHERE ${baseWhere.join(' AND ')}` : ''}
            GROUP BY u.id, u.username
            ORDER BY score DESC
        `;
        return (await request.query(query)).recordset;
    } else if (type === 'points') {
        // Points: sum of points matching filters
        if (filters.category && filters.category !== 'all') {
            baseWhere.push(`q.category = @cat`);
            request.input('cat', sql.NVarChar, filters.category);
        }
        if (filters.difficulty && filters.difficulty !== 'all') {
            baseWhere.push(`q.difficulty = @diff`);
            request.input('diff', sql.NVarChar, filters.difficulty);
        }

        const query = `
            SELECT TOP (@lim) u.id, u.username, SUM(r.total_points) as score
            FROM users u
            INNER JOIN results r ON r.user_id = u.id
            INNER JOIN quizzes q ON r.quiz_id = q.id
            ${baseWhere.length > 0 ? `WHERE ${baseWhere.join(' AND ')}` : ''}
            GROUP BY u.id, u.username
            ORDER BY score DESC
        `;
        return (await request.query(query)).recordset;
    } else if (type === 'active') {
        // Cày cuốc: total number of quiz attempts (results count)
        const whereClause = baseWhere.length > 0 ? `WHERE ${baseWhere.join(' AND ')}` : '';
        const query = `
            SELECT TOP (@lim) u.id, u.username, COUNT(r.id) as score
            FROM users u
            INNER JOIN results r ON r.user_id = u.id
            ${whereClause}
            GROUP BY u.id, u.username
            ORDER BY score DESC
        `;
        return (await request.query(query)).recordset;
    }
    return [];
};

// ─── 14. PER-QUIZ LEADERBOARD ────────────────────────────────────────────────────
const getQuizLeaderboard = async (quizId, limit = 10, userId = null) => {
    const request = new sql.Request();
    request.input('quizId', sql.Int, quizId);
    request.input('lim', sql.Int, limit);
    if(userId) request.input('userId', sql.Int, userId);

    const query = `
        IF OBJECT_ID('tempdb..#TempRanks') IS NOT NULL DROP TABLE #TempRanks;

        WITH RankedUsers AS (
            SELECT u.id as user_id, u.username, 
                   MAX(r.total_points) as best_score, 
                   COUNT(r.id) as attempt_count,
                   RANK() OVER (ORDER BY MAX(r.total_points) DESC) as [rank]
            FROM results r
            JOIN users u ON r.user_id = u.id
            WHERE r.quiz_id = @quizId
            GROUP BY u.id, u.username
        )
        SELECT * INTO #TempRanks FROM RankedUsers;

        SELECT TOP (@lim) * FROM #TempRanks ORDER BY [rank] ASC;
        
        ${userId ? `SELECT * FROM #TempRanks WHERE user_id = @userId;` : `SELECT NULL WHERE 1=0;`}
        
        DROP TABLE #TempRanks;
    `;
    const result = await request.query(query);
    return {
        top: result.recordsets[0] || [],
        currentUser: (result.recordsets[1] && result.recordsets[1].length > 0) ? result.recordsets[1][0] : null
    };
};

// ─── 15. EXPLORE STATS ───────────────────────────────────────────────────────────
const getExploreStats = async () => {
    const request = new sql.Request();
    const result = await request.query(`
        SELECT 
            (SELECT COUNT(*) FROM quizzes WHERE is_public = 1) as totalQuizzes,
            (SELECT COUNT(DISTINCT category_id) FROM quizzes WHERE is_public = 1) as totalCategories,
            (SELECT COUNT(DISTINCT creator_id) FROM quizzes WHERE is_public = 1) as totalAuthors
    `);
    return result.recordset[0];
};

// ─── 16. RESULT DETAIL ───────────────────────────────────────────────────────────
const getResultById = async (resultId) => {
    const request = new sql.Request();
    request.input('id', sql.Int, resultId);
    
    // Wrapped in try catch to return an error correctly instead of crashing server
    try {
        const result = await request.query(`
            SELECT r.*, q.title as quiz_title, q.time_limit, q.image_url, q.difficulty as quiz_difficulty,
                   (SELECT COUNT(*) FROM questions qq WHERE qq.quiz_id = q.id) as total_questions
            FROM results r
            JOIN quizzes q ON r.quiz_id = q.id
            WHERE r.id = @id
        `);
        
        if (result.recordset.length === 0) return null;
        const resRow = result.recordset[0];
        
        const reqQuestions = new sql.Request();
        reqQuestions.input('quiz_id', sql.Int, resRow.quiz_id);
        const qResult = await reqQuestions.query(`
            SELECT id, question_text, correct_option as correct_answer
            FROM questions 
            WHERE quiz_id = @quiz_id
        `);
        
        resRow.questions_list = qResult.recordset;
        // Apply quiz difficulty to each question if they don't have their own
        if (resRow.questions_list) {
            resRow.questions_list = resRow.questions_list.map(q => ({
                ...q,
                difficulty: resRow.quiz_difficulty || 'Trung bình'
            }));
        }
        return resRow;
    } catch (error) {
        console.error("Lỗi trong getResultById:", error);
        throw error;
    }
};

// ─── 17. QUIZ PREVIEW ────────────────────────────────────────────────────────────
const getQuizPreview = async (quizId) => {
    const quiz = await getQuizById(quizId);
    if (!quiz) return null;
    const questions = await getQuestionsByQuizId(quizId);
    // Ẩn đáp án đúng
    const safeQuestions = questions.map(({ correct_option, explanation, ...rest }) => rest);
    return { ...quiz, questions: safeQuestions };
};

// ─── 18. CATEGORIES ──────────────────────────────────────────────────────────────
const getAllCategories = async () => {
    const request = new sql.Request();
    const result = await request.query('SELECT * FROM categories ORDER BY name ASC');
    return result.recordset;
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
    getResultById,
    getExploreStats,
    getQuizPreview,
    getAllCategories,
    getStreakInfo,
    getWeeklyActivity,
    getLeaderboard,
    getQuizLeaderboard,
};