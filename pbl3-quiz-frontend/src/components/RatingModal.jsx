import React, { useState, useEffect } from 'react';
import { X, Star, Send, MessageSquareText, Loader2 } from 'lucide-react';
import axios from 'axios';
import Swal from 'sweetalert2';

const RatingModal = ({ quizId, quizTitle, onClose, onSubmitSuccess }) => {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        const fetchMyReview = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;
                const res = await axios.get(`http://localhost:3000/api/v1/reviews/${quizId}/my-review`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.data) {
                    setRating(res.data.rating);
                    setComment(res.data.review_text || '');
                }
            } catch (err) {
                console.error("Lỗi lấy đánh giá của tôi:", err);
            } finally {
                setFetching(false);
            }
        };
        if (quizId) fetchMyReview();
    }, [quizId]);

    const handleSubmit = async () => {
        if (rating === 0) {
            Swal.fire({ icon: 'warning', title: 'Thiếu thông tin', text: 'Vui lòng chọn số sao đánh giá!' });
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post(`http://localhost:3000/api/v1/reviews/${quizId}`, 
                { rating, comment },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            Swal.fire({
                icon: 'success',
                title: 'Thành công',
                text: 'Cảm ơn bạn đã đóng góp ý kiến!',
                timer: 2000,
                showConfirmButton: false
            });
            
            if (onSubmitSuccess) onSubmitSuccess();
            onClose();
        } catch (err) {
            console.error("Lỗi gửi đánh giá:", err);
            Swal.fire({ icon: 'error', title: 'Thất bại', text: 'Không thể gửi đánh giá. Vui lòng thử lại sau.' });
        } finally {
            setLoading(false);
        }
    };

    if (!quizId) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" 
                onClick={onClose}
            ></div>

            {/* Modal */}
            <div className="relative bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl w-full max-w-md flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-200 dark:border-slate-800">
                
                {/* Header */}
                <div className="px-6 pt-6 pb-4 flex justify-between items-center border-b border-slate-100 dark:border-slate-800 transition-colors">
                    <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <Star className="text-amber-500 fill-amber-500" size={24} /> {rating > 0 ? 'Cập nhật đánh giá' : 'Đánh giá Quiz'}
                    </h2>
                    <button 
                        onClick={onClose} 
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-full transition-all"
                    >
                        <X size={20} strokeWidth={2.5} />
                    </button>
                </div>

                <div className="p-8">
                    {fetching ? (
                        <div className="flex flex-col items-center justify-center py-10">
                            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
                            <p className="text-slate-500 dark:text-slate-400 font-medium">Đang kiểm tra đánh giá...</p>
                        </div>
                    ) : (
                        <div className="space-y-8 flex flex-col items-center">
                            <div className="text-center">
                                <p className="text-slate-500 dark:text-slate-400 font-medium mb-1">Bạn thấy bộ đề này như thế nào?</p>
                                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 line-clamp-1 px-4">{quizTitle}</h3>
                            </div>

                            {/* Stars Container */}
                            <div className="flex items-center gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        className="transition-transform active:scale-90 hover:scale-110 p-1 focus:outline-none"
                                        onClick={() => setRating(star)}
                                        onMouseEnter={() => setHover(star)}
                                        onMouseLeave={() => setHover(0)}
                                    >
                                        <Star 
                                            size={44} 
                                            className={`transition-all duration-200 ${
                                                (hover || rating) >= star 
                                                ? 'text-amber-500 fill-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]' 
                                                : 'text-slate-200 dark:text-slate-700'
                                            }`} 
                                        />
                                    </button>
                                ))}
                            </div>

                            <div className="w-full space-y-3">
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-400 ml-1">
                                    <MessageSquareText size={16} /> Nhận xét của bạn
                                </label>
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Chia sẻ trải nghiệm của bạn về bài quiz này..."
                                    className="w-full min-h-[120px] p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 resize-none font-medium"
                                />
                            </div>

                            <div className="w-full flex gap-3 pt-2">
                                <button
                                    onClick={onClose}
                                    className="flex-1 py-4 px-6 rounded-2xl font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-200"
                                >
                                    Để sau
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading || rating === 0}
                                    className="flex-[1.5] py-4 px-6 rounded-2xl font-black text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-200 dark:shadow-none transition-all duration-200 flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <><Send size={18} /> Gửi đánh giá</>
                                    )}
                                </button>
                            </div>

                            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium italic text-center">
                                * Mỗi người dùng chỉ có thể đánh giá một lần, <br /> bạn có thể chỉnh sửa đánh giá cũ.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RatingModal;

