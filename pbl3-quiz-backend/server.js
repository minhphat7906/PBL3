require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./db');

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Để Backend đọc được file JSON

// Kích hoạt kết nối Database
connectDB();

// API Test đường truyền
app.get('/api/v1/test', (req, res) => {
    res.json({ message: "Hello từ Backend Node.js! Mọi thứ đang chạy ngon lành!" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Máy chủ Backend đang chạy tại: http://localhost:${PORT}`);
});

// Import Routes
const authRoutes = require('./routes/authRoutes');
app.use('/api/v1/auth', authRoutes);

const quizRoutes = require('./routes/quizRoutes');
app.use('/api/v1/quizzes', quizRoutes);