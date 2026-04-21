const { sql, connectDB } = require('../db');

async function migrate() {
    try {
        console.log('--- Connecting to Database ---');
        await connectDB();
        
        console.log('--- MIGRATION: Creating pending_users table ---');

        const request = new sql.Request();
        await request.query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='pending_users' AND xtype='U')
            BEGIN
                CREATE TABLE pending_users (
                    id INT IDENTITY(1,1) PRIMARY KEY,
                    username NVARCHAR(50) NOT NULL,
                    email VARCHAR(100) NOT NULL,
                    password_hash VARCHAR(255) NOT NULL,
                    otp CHAR(6) NOT NULL,
                    expires_at DATETIME NOT NULL,
                    created_at DATETIME DEFAULT GETDATE()
                );
                
                CREATE INDEX idx_pending_email_otp ON pending_users(email, otp);
                PRINT 'Success: Table pending_users created.';
            END
            ELSE
            BEGIN
                PRINT 'Status: Table pending_users already exists.';
            END
        `);

        console.log('Migration finished successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err.message);
        console.error(err);
        process.exit(1);
    }
}

migrate();
