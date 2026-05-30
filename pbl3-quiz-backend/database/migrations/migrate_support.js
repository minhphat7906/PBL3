require('dotenv').config();
const { connectDB, sql } = require('./db');

const migrate = async () => {
    await connectDB();
    const request = new sql.Request();

    console.log('🔄 Tạo bảng support_requests nếu chưa tồn tại...');

    await request.query(`
        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='support_requests' AND xtype='U')
        BEGIN
            CREATE TABLE support_requests (
                id          INT IDENTITY(1,1) PRIMARY KEY,
                name        NVARCHAR(200)    NOT NULL,
                email       VARCHAR(200)     NOT NULL,
                subject     NVARCHAR(300)    NOT NULL,
                message     NVARCHAR(2000)   NOT NULL,
                status      VARCHAR(20)      NOT NULL DEFAULT 'pending',
                created_at  DATETIME         NOT NULL DEFAULT GETDATE()
            );
            PRINT 'Đã tạo bảng support_requests';
        END
        ELSE
        BEGIN
            PRINT 'Bảng support_requests đã tồn tại';
        END
    `);

    console.log('✅ Migration hoàn tất!');
    process.exit(0);
};

migrate().catch(err => {
    console.error('❌ Migration lỗi:', err);
    process.exit(1);
});
