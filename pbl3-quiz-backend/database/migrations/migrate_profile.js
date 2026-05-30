require('dotenv').config();
const { sql, connectDB } = require('./db');

connectDB().then(async () => {
    const req = new sql.Request();
    await req.query(`
        IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='users' AND COLUMN_NAME='bio')
            ALTER TABLE users ADD bio NVARCHAR(500) NULL;
        IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='users' AND COLUMN_NAME='avatar_url')
            ALTER TABLE users ADD avatar_url NVARCHAR(500) NULL;
    `);
    console.log('Migration OK: bio va avatar_url da san sang');
    process.exit(0);
}).catch(e => {
    console.error('Migration FAILED:', e.message);
    process.exit(1);
});
