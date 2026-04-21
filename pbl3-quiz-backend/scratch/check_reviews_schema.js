const { sql, poolPromise } = require('./db');

async function checkSchema() {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'reviews'");
        console.log('Columns in reviews table:', result.recordset.map(r => r.COLUMN_NAME));
        
        const hasComment = result.recordset.some(r => r.COLUMN_NAME === 'comment');
        const hasReviewText = result.recordset.some(r => r.COLUMN_NAME === 'review_text');
        
        if (hasComment && !hasReviewText) {
            console.log('Renaming column comment to review_text...');
            await pool.request().query("EXEC sp_rename 'reviews.comment', 'review_text', 'COLUMN'");
            console.log('Success!');
        } else if (!hasComment && !hasReviewText) {
            console.log('Error: Neither comment nor review_text exists in reviews table.');
        } else {
            console.log('Schema is already correct or in expected state.');
        }
    } catch (err) {
        console.error('Error checking schema:', err);
    } finally {
        process.exit();
    }
}

checkSchema();
