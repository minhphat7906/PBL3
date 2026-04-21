const reviewRepository = require('../repositories/reviewRepository');

const submitReview = async (req, res) => {
    try {
        const { quizId } = req.params;
        const { rating, comment } = req.body;
        const userId = req.user.id;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Rating phải từ 1 đến 5 sao' });
        }

        await reviewRepository.createOrUpdateReview(userId, quizId, rating, comment);
        res.status(200).json({ message: 'Đánh giá đã được ghi nhận' });
    } catch (error) {
        console.error('Error submitting review:', error);
        res.status(500).json({ message: 'Lỗi khi gửi đánh giá' });
    }
};

const getQuizReviews = async (req, res) => {
    try {
        const { quizId } = req.params;
        const reviews = await reviewRepository.getQuizReviews(quizId);
        res.status(200).json(reviews);
    } catch (error) {
        console.error('Error getting reviews:', error);
        res.status(500).json({ message: 'Lỗi khi lấy danh sách đánh giá' });
    }
};

const getMyReview = async (req, res) => {
    try {
        const { quizId } = req.params;
        const userId = req.user.id;
        const review = await reviewRepository.getUserQuizReview(userId, quizId);
        res.status(200).json(review || null);
    } catch (error) {
        console.error('Error getting user review:', error);
        res.status(500).json({ message: 'Lỗi khi lấy đánh giá của bạn' });
    }
};

module.exports = {
    submitReview,
    getQuizReviews,
    getMyReview
};

