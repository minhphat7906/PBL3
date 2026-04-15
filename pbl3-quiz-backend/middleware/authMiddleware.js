const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    // 1. Lấy token từ Frontend gửi lên
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; 

    // 2. Nếu không có token -> Đuổi về
    if (!token) {
        return res.status(401).json({ success: false, message: "Bạn chưa đăng nhập!" });
    }

    // 3. Nếu có token -> Mang ra soi mộc đỏ
    try {
        // Dùng đúng chìa khóa bí mật trong file .env của sếp
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // 4. Soi thành công -> Lấy được ID của user, nhét vào req.user để Controller dùng
        req.user = decoded; 
        next(); // Cho phép đi tiếp vào Controller
    } catch (err) {
        return res.status(403).json({ success: false, message: "Phiên đăng nhập hết hạn hoặc không hợp lệ!" });
    }
};

module.exports = authMiddleware;