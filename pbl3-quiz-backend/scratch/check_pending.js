const { sql, connectDB } = require('../db');

async function checkPendingUsers() {
    try {
        await connectDB();
        const request = new sql.Request();
        const result = await request.query('SELECT *, GETDATE() as current_db_time, GETUTCDATE() as current_db_utc_time FROM pending_users');
        console.log('Current Data in pending_users:');
        console.log(JSON.stringify(result.recordset, null, 2));
        
        console.log('\nNode.js Current Time (Locale):', new Date().toLocaleString());
        console.log('Node.js Current Time (ISO):', new Date().toISOString());
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

checkPendingUsers();
