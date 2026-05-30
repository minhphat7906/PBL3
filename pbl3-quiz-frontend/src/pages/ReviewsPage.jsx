import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Star, ArrowLeft, MessageSquare, User, Calendar, Award, Loader2, Info } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const ReviewsPage = () => {
    const { quizId } = useParams();
    const navigate = useNavigate();
    const [reviews, setReviews] = useState([]);
    const [quizInfo, setQuizInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                // 1. Lấy thông tin bài quiz (Preview để có title, rating hiện tại)
                const quizRes = await axios.get(`http://localhost:3000/api/v1/quizzes/${quizId}/preview`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (quizRes.data.success) {
                    setQuizInfo(quizRes.data.quiz);
                }

                // 2. Lấy danh sách đánh giá
                const reviewsRes = await axios.get(`http://localhost:3000/api/v1/reviews/${quizId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setReviews(reviewsRes.data);
            } catch (err) {
                console.error("Lỗi lấy dữ liệu đánh giá:", err);
            } finally {
                setLoading(false);
            }
        };

        if (quizId) fetchData();
    }, [quizId]);

    // Tính toán phân bổ sao
    const getStats = () => {
        const stats = [0, 0, 0, 0, 0]; // index 0 = 5 stars, ..., 4 = 1 star
        reviews.forEach(r => {
            if (r.rating >= 1 && r.rating <= 5) {
                stats[5 - r.rating]++;
            }
        });
        return stats;
    };

    const stats = getStats();
    const totalReviews = quizInfo?.total_reviews || reviews.length;

    return (
        <div className="flex min-h-screen bg-[#f8f9fc] dark:bg-slate-950 font-sans transition-colors duration-300">
            <Sidebar />

            {/* HEADER */}
            <Header />

            <main className="flex-1 ml-64 p-8 pt-28">
                <div className="max-w-5xl mx-auto">
                    {/* Back Button */}
                    <button 
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold mb-8 transition-colors group"
                    >
                        <div className="p-2 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 group-hover:border-indigo-200 dark:group-hover:border-indigo-800 group-hover:-translate-x-1 transition-all">
                            <ArrowLeft size={20} />
                        </div>
                        Quay lại
                    </button>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
                            <p className="text-slate-500 dark:text-slate-400 font-bold text-lg">Đang tải đánh giá...</p>
                        </div>
                    ) : (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Quiz Info Header */}
                            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-slate-800 relative overflow-hidden transition-colors">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 dark:bg-indigo-900/10 rounded-full -mr-32 -mt-32 z-0"></div>
                                
                                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-full">Đánh giá cộng đồng</span>
                                            {quizInfo?.difficulty && (
                                                <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-full">{quizInfo.difficulty}</span>
                                            )}
                                        </div>
                                        <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 mb-2">{quizInfo?.title || "Thông tin quiz"}</h1>
                                        <p className="text-slate-500 dark:text-slate-400 font-medium">Tác giả: <span className="text-indigo-600 dark:text-indigo-400 font-bold">{quizInfo?.author_name || "N/A"}</span></p>
                                    </div>

                                    <div className="flex items-center gap-8 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 transition-colors">
                                        <div className="text-center">
                                            <div className="text-4xl font-black text-slate-900 dark:text-slate-100 flex items-center justify-center gap-1">
                                                {quizInfo?.average_rating ? Number(quizInfo.average_rating).toFixed(1) : "0.0"}
                                                <Star className="text-amber-500 fill-amber-500" size={28} />
                                            </div>
                                            <p className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase mt-1">Trung bình</p>
                                        </div>
                                        <div className="w-px h-12 bg-slate-200 dark:bg-slate-700"></div>
                                        <div className="text-center">
                                            <div className="text-4xl font-black text-slate-900 dark:text-slate-100 italic">
                                                {totalReviews}
                                            </div>
                                            <p className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase mt-1">Lượt đánh giá</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                                {/* Stats & Filters */}
                                <div className="space-y-6 lg:sticky lg:top-8">
                                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
                                        <h3 className="font-black text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
                                            <Award className="text-indigo-600" size={20} /> Phân bổ xếp hạng
                                        </h3>
                                        <div className="space-y-4">
                                            {[5, 4, 3, 2, 1].map((star, idx) => {
                                                const count = stats[idx];
                                                const percent = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                                                return (
                                                    <div key={star} className="flex items-center gap-3">
                                                        <div className="flex items-center gap-1 w-10 shrink-0">
                                                            <span className="font-bold text-slate-600 dark:text-slate-400">{star}</span>
                                                            <Star size={12} className="text-amber-500 fill-amber-500" />
                                                        </div>
                                                        <div className="flex-1 h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                            <div 
                                                                className="h-full bg-amber-500 rounded-full transition-all duration-1000" 
                                                                style={{ width: `${percent}%` }}
                                                            ></div>
                                                        </div>
                                                        <span className="w-8 text-right text-xs font-bold text-slate-400 dark:text-slate-500">{count}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-200 dark:shadow-none transition-colors">
                                        <div className="flex items-center gap-3 mb-4">
                                            <Info size={24} className="opacity-80" />
                                            <h4 className="font-bold">Góp ý cho tác giả?</h4>
                                        </div>
                                        <p className="text-indigo-100 text-sm leading-relaxed mb-4">Mọi nhận xét của bạn đều giúp tác giả hoàn thiện bài quiz tốt hơn. Hãy để lại đánh giá của mình sau khi hoàn thành bài thi nhé!</p>
                                    </div>
                                </div>

                                {/* Review List */}
                                <div className="lg:col-span-2 space-y-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="font-black text-slate-800 dark:text-slate-100 text-xl flex items-center gap-3">
                                            <MessageSquare className="text-indigo-600" size={24} /> 
                                            Nhận xét từ người học
                                        </h3>
                                        <div className="text-slate-400 dark:text-slate-500 font-bold text-sm">Sắp xếp: Mới nhất</div>
                                    </div>

                                    {reviews.length === 0 ? (
                                        <div className="bg-white dark:bg-slate-900 rounded-3xl p-16 border-2 border-dashed border-slate-200 dark:border-slate-800 text-center transition-colors">
                                            <div className="text-6xl mb-4 opacity-40">📭</div>
                                            <h4 className="text-lg font-black text-slate-400 dark:text-slate-500">Chưa có đánh giá nào cho bài quiz này</h4>
                                            <p className="text-slate-400 dark:text-slate-600 mt-2">Hãy là người đầu tiên làm bài và để lại nhận xét nhé!</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {reviews.map((item) => (
                                                <div key={item.id} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-200 dark:hover:border-indigo-900 transition-all group">
                                                    <div className="flex gap-4">
                                                        <div className="shrink-0">
                                                            {item.avatar_url ? (
                                                                <img src={item.avatar_url} className="w-12 h-12 rounded-2xl object-cover ring-2 ring-slate-100 dark:ring-slate-800" alt={item.username} />
                                                            ) : (
                                                                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black transition-colors">
                                                                    {item.username[0].toUpperCase()}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                                                                <div className="flex items-center gap-3">
                                                                    <h4 className="font-black text-slate-800 dark:text-slate-100 truncate">{item.username}</h4>
                                                                    <div className="flex items-center gap-0.5 px-2 py-0.5 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg text-xs font-black">
                                                                        {item.rating} <Star size={10} fill="currentColor" />
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider">
                                                                    <Calendar size={12} /> {new Date(item.created_at).toLocaleDateString()}
                                                                </div>
                                                            </div>
                                                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium transition-colors">
                                                                {item.review_text || <span className="italic opacity-60">Không để lại nhận xét.</span>}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default ReviewsPage;

