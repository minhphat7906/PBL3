const { sql, connectDB } = require('./db');
connectDB().then(async () => {
    try {
        await sql.query(`
            IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='results' AND COLUMN_NAME='time_spent')
                ALTER TABLE results ADD time_spent INT DEFAULT 0;
            IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='results' AND COLUMN_NAME='answers_json')
                ALTER TABLE results ADD answers_json NVARCHAR(MAX) NULL;
        `);
        console.log("Migration successful");
        process.exit(0);
    } catch(e) {
        console.error(e);
        process.exit(1);
    }
});
