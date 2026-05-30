const { sql, connectDB } = require('./db');

async function migrate() {
    await connectDB();
    const request = new sql.Request();
    
    console.log('--- BẮT ĐẦU MIGRATION CACHE AI ---');
    
    try {
        // Thêm cột ai_explanation vào bảng questions nếu chưa có
        await request.query(`
            IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'questions' AND COLUMN_NAME = 'ai_explanation')
            BEGIN
                ALTER TABLE questions ADD ai_explanation NVARCHAR(MAX) NULL;
                PRINT 'Đã thêm cột ai_explanation vào bảng questions';
            END
        `);

        console.log('Migration hoàn tất thành công!');
    } catch (err) {
        console.error('Lỗi Migration:', err);
    } finally {
        process.exit();
    }
}

migrate();
