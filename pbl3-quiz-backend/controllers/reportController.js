const reportRepository = require('../repositories/reportRepository');

const submitReport = async (req, res) => {
    try {
        const { quizId } = req.params;
        const { reason, description } = req.body;
        const userId = req.user.id;

        if (!reason) {
            return res.status(400).json({ message: 'Vui lòng cung cấp lý do báo cáo' });
        }

        await reportRepository.createReport(userId, quizId, reason, description);
        res.status(200).json({ message: 'Báo cáo của bạn đã được gửi tới quản trị viên' });
    } catch (error) {
        console.error('Error submitting report:', error);
        res.status(500).json({ message: 'Lỗi khi gửi báo cáo' });
    }
};

module.exports = {
    submitReport
};
