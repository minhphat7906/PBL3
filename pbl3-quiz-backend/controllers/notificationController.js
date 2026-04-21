const notificationRepository = require('../repositories/notificationRepository');

const getNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const notifications = await notificationRepository.getNotificationsByUserId(userId);
        res.status(200).json({ success: true, notifications });
    } catch (err) {
        console.error('[NotificationController] getNotifications error:', err);
        res.status(500).json({ success: false, message: 'Lỗi server khi lấy thông báo' });
    }
};

const markReadAll = async (req, res) => {
    try {
        const userId = req.user.id;
        await notificationRepository.markAllAsRead(userId);
        res.status(200).json({ success: true, message: 'Đã đánh dấu tất cả là đã đọc' });
    } catch (err) {
        console.error('[NotificationController] markReadAll error:', err);
        res.status(500).json({ success: false, message: 'Lỗi server khi cập nhật thông báo' });
    }
};

module.exports = {
    getNotifications,
    markReadAll
};
