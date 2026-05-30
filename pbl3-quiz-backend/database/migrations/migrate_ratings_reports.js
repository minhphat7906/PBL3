const { sql, connectDB } = require('./db');

async function migrate() {
    await connectDB();
    const request = new sql.Request();

    console.log('--- Bắt đầu Migration: Ratings & Reports ---');

    try {
        // 1. Thêm cột vào bảng quizzes
        console.log('1. Cập nhật bảng quizzes...');
        await request.query(`
            IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'quizzes' AND COLUMN_NAME = 'average_rating')
            BEGIN
                ALTER TABLE quizzes ADD average_rating FLOAT DEFAULT 0;
                PRINT 'Đã thêm cột average_rating';
            END

            IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'quizzes' AND COLUMN_NAME = 'total_reviews')
            BEGIN
                ALTER TABLE quizzes ADD total_reviews INT DEFAULT 0;
                PRINT 'Đã thêm cột total_reviews';
            END
        `);

        // 2. Tạo bảng reviews
        console.log('2. Tạo bảng reviews...');
        await request.query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='reviews' AND xtype='U')
            BEGIN
                CREATE TABLE reviews (
                    id INT PRIMARY KEY IDENTITY(1,1),
                    user_id INT NOT NULL,
                    quiz_id INT NOT NULL,
                    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
                    review_text NVARCHAR(MAX) NULL,
                    created_at DATETIME DEFAULT GETDATE(),
                    updated_at DATETIME DEFAULT GETDATE(),
                    CONSTRAINT FK_Review_User FOREIGN KEY (user_id) REFERENCES users(id),
                    CONSTRAINT FK_Review_Quiz FOREIGN KEY (quiz_id) REFERENCES quizzes(id),
                    CONSTRAINT UQ_User_Quiz_Review UNIQUE (user_id, quiz_id)
                );
                PRINT 'Đã tạo bảng reviews';
            END
        `);

        // 3. Tạo bảng reports
        console.log('3. Tạo bảng reports...');
        await request.query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='reports' AND xtype='U')
            BEGIN
                CREATE TABLE reports (
                    id INT PRIMARY KEY IDENTITY(1,1),
                    user_id INT NOT NULL,
                    quiz_id INT NOT NULL,
                    reason NVARCHAR(255) NOT NULL,
                    description NVARCHAR(MAX) NULL,
                    status NVARCHAR(50) DEFAULT 'pending', -- pending, resolved, dismissed
                    created_at DATETIME DEFAULT GETDATE(),
                    CONSTRAINT FK_Report_User FOREIGN KEY (user_id) REFERENCES users(id),
                    CONSTRAINT FK_Report_Quiz FOREIGN KEY (quiz_id) REFERENCES quizzes(id)
                );
                PRINT 'Đã tạo bảng reports';
            END
        `);

        console.log('--- Migration thành công! ---');
    } catch (err) {
        console.error('LỖI MIGRATION:', err);
    } finally {
        sql.close();
    }
}

migrate();
