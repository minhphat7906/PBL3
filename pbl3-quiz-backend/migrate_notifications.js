const { sql, connectDB } = require('./db');
require('dotenv').config();

async function migrate() {
    try {
        await connectDB();

        console.log('🔄 Tạo bảng notifications nếu chưa tồn tại...');
        // Sử dụng sql.query trực tiếp vì sql.connect() đã thiết lập global connection
        await sql.query(`
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'notifications')
            BEGIN
                CREATE TABLE notifications (
                    id INT IDENTITY(1,1) PRIMARY KEY,
                    user_id INT NOT NULL,
                    type NVARCHAR(50) DEFAULT 'info', -- 'info', 'success', 'warning'
                    content NVARCHAR(MAX) NOT NULL,
                    is_read BIT DEFAULT 0,
                    created_at DATETIME DEFAULT GETDATE(),
                    CONSTRAINT FK_Notifications_Users FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                );
                PRINT '✅ Đã tạo bảng notifications';
            END
            ELSE
            BEGIN
                PRINT 'ℹ️ Bảng notifications đã tồn tại';
            END
        `);

        console.log('✅ Migration hoàn tất!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Lỗi Migration:', err);
        process.exit(1);
    }
}

migrate();
