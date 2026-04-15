const sql = require('mssql');
require('dotenv').config();

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: 'localhost',                 
    database: process.env.DB_NAME,
    options: {
        encrypt: true,
        trustServerCertificate: true,
        instanceName: 'SQLEXPRESS'     
    }
};

const connectDB = async () => {
    try {
        await sql.connect(config);
        console.log('Kết nối SQL Server thành công!');
    } catch (err) {
        console.error('LỖI KẾT NỐI DATABASE:', err);
    }
};

module.exports = { sql, connectDB };