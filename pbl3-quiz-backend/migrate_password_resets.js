const { sql, connectDB } = require('./db');

async function migrate() {
    try {
        await connectDB();
        const request = new sql.Request();
        
        console.log('Creating password_resets table...');
        await request.query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='password_resets' AND xtype='U')
            BEGIN
                CREATE TABLE password_resets (
                    id INT PRIMARY KEY IDENTITY(1,1),
                    email VARCHAR(255) NOT NULL,
                    otp CHAR(6) NOT NULL,
                    expires_at DATETIME NOT NULL,
                    created_at DATETIME DEFAULT GETUTCDATE()
                );
                CREATE INDEX IX_password_resets_email_otp ON password_resets(email, otp);
            END
        `);
        console.log('Table password_resets created successfully!');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        process.exit();
    }
}

migrate();
