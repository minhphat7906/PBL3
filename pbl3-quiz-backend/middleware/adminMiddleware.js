/**
 * adminMiddleware.js
 * Chỉ cho phép user có role = 'admin' đi tiếp.
 * Phải dùng SAU authMiddleware (đã có req.user).
 */
const adminMiddleware = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Bạn không có quyền truy cập trang quản trị!'
        });
    }
    next();
};

module.exports = adminMiddleware;
