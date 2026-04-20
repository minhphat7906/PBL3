const { sql, connectDB } = require('./db');
require('dotenv').config();

async function migrate() {
    try {
        await connectDB();
        console.log('🔄 Đang nâng cấp cột trong bảng questions...');

        // Nâng cấp độ dài cho các cột option để tránh lỗi truncation (cắt dữ liệu)
        await sql.query(`
            ALTER TABLE questions ALTER COLUMN option_a NVARCHAR(MAX) NOT NULL;
            ALTER TABLE questions ALTER COLUMN option_b NVARCHAR(MAX) NOT NULL;
            ALTER TABLE questions ALTER COLUMN option_c NVARCHAR(MAX) NOT NULL;
            ALTER TABLE questions ALTER COLUMN option_d NVARCHAR(MAX) NOT NULL;
            PRINT '✅ Đã nâng cấp các cột option_a/b/c/d lên NVARCHAR(MAX)';
        `);

        console.log('✅ Migration hoàn tất!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Lỗi Migration:', err);
        process.exit(1);
    }
}

migrate();
