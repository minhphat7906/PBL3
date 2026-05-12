import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  RefreshCw, 
  Search, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Zap, 
  BarChart3, 
  ArrowRight,
  Target,
  Trophy,
  Loader2,
  ChevronRight
} from 'lucide-react';
import axios from 'axios';
import Swal from 'sweetalert2';
import RatingModal from '../components/RatingModal';
import ReviewModal from '../components/ReviewModal';
import { Star } from 'lucide-react';

const ResultDetail = () => {
    const { resultId } = useParams();
    const navigate = useNavigate();
    const [result, setResult] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);
    const [currentUserRank, setCurrentUserRank] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`http://localhost:3000/api/v1/quizzes/results/${resultId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.data.success) {
                    setResult(response.data.result);
                    try {
                        const lbResponse = await axios.get(`http://localhost:3000/api/v1/quizzes/${response.data.result.quiz_id}/leaderboard`, {
                            headers: { 'Authorization': `Bearer ${token}` }
                        });
                        if (lbResponse.data.success) {
                            setLeaderboard(lbResponse.data.data?.top || []);
                            setCurrentUserRank(lbResponse.data.data?.currentUser || null);
                        }
                    } catch (e) {
                         console.error('Leaderboard error', e);
                    }
                }
            } catch (error) {
                console.error("Lỗi lấy chi tiết:", error);
                Swal.fire('Lỗi', 'Không thể tải chi tiết kết quả', 'error');
            } finally {
                setIsLoading(false);
            }
        };
        fetchDetail();
    }, [resultId]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#f8f9fc] dark:bg-slate-950 flex flex-col items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Loader2 className="animate-spin mb-4" size={48} />
                <h2 className="text-xl font-bold italic dark:text-slate-300">Đang phân tích dữ liệu...</h2>
            </div>
        );
    }

    if (!result) return <div className="p-10 text-center">Không tìm thấy kết quả.</div>;

    const scorePercent = Math.round((result.correct_answers / result.total_questions) * 100);
    const scoreVal = (result.total_points / 10).toFixed(1);
    const timeSpentMsg = result.time_spent 
        ? `${Math.floor(result.time_spent / 60).toString().padStart(2, '0')}:${(result.time_spent % 60).toString().padStart(2, '0')}`
        : '00:00';

    const userAnswers = JSON.parse(result.answers_json || '{}');

    const getGreeting = () => {
        if (scorePercent >= 80) return "Tuyệt vời, bạn thuộc top 10% người dẫn đầu!";
        if (scorePercent >= 50) return "Rất tốt! Bạn đang tiến bộ rất nhanh.";
        return "Cố gắng hơn nữa nhé! Luyện tập thêm để nâng hạng.";
    };

    const getHeroGradient = () => {
        if (scorePercent >= 80) return "from-[#1e1b4b] to-[#4f46e5]";
        if (scorePercent >= 50) return "from-[#4338ca] to-[#6366f1]";
        return "from-[#4c1d95] to-[#7c3aed]";
    };

    return (
        <div className="min-h-screen bg-[#f8f9fc] dark:bg-slate-950 pb-20 transition-colors duration-300">
            {/* Header / Nav */}
            <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
                <button 
                  onClick={() => navigate('/history')}
                  className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold transition-colors"
                >
                    <ChevronLeft size={20} /> Quay lại lịch sử
                </button>
                <div className="flex items-center gap-3">
                    <div className="text-slate-400 dark:text-slate-500 font-medium text-sm hidden sm:block">
                        Mã kết quả: #{resultId}
                    </div>
                </div>
            </div>

            {/* Rating Modal */}
            {showRatingModal && (
                <RatingModal 
                    quizId={result.quiz_id}
                    quizTitle={result.title || "Bài thi"}
                    onClose={() => setShowRatingModal(false)}
                />
            )}

            <main className="max-w-6xl mx-auto px-6 space-y-8">
                
                {/* ZONE 1: HERO STATS */}
                <section className={`rounded-[40px] p-10 md:p-12 text-white shadow-2xl bg-gradient-to-br ${getHeroGradient()} relative overflow-hidden`}>
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl -ml-20 -mb-20"></div>

                    <div className="relative z-10 flex flex-col lg:flex-row items-center gap-12">
                        {/* Hero Text */}
                        <div className="flex-1 text-center lg:text-left">
                            <h4 className="text-indigo-200 font-black text-sm uppercase tracking-[4px] mb-4">Phân tích kết quả</h4>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-[1.1]">{result.quiz_title}</h1>
                            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/20">
                                <Trophy className="text-amber-400" size={24} />
                                <span className="font-bold text-lg">{getGreeting()}</span>
                            </div>
                        </div>

                        {/* Circular Progress & Mini Stats */}
                        <div className="flex flex-col items-center gap-8 shrink-0">
                            <div className="relative w-56 h-56 flex items-center justify-center rounded-full bg-white/5 border-[12px] border-white/10 shadow-2xl backdrop-blur-sm">
                                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
                                    <path 
                                      className="text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]" 
                                      strokeDasharray={`${scorePercent}, 100`} 
                                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                                      fill="none" 
                                      stroke="currentColor" 
                                      strokeWidth="3" 
                                      strokeLinecap="round"
                                      style={{ transition: 'stroke-dasharray 1.5s ease-out' }}
                                    />
                                </svg>
                                <div className="text-center">
                                    <div className="text-6xl font-black">{scoreVal}</div>
                                    <div className="text-indigo-200 font-bold text-sm uppercase tracking-widest border-t border-white/20 pt-1 mt-1">/ 10</div>
                                </div>
                            </div>

                            <div className="flex gap-4 w-full">
                                <div className="flex-1 bg-white/10 backdrop-blur-md p-4 rounded-3xl border border-white/10 text-center">
                                    <div className="text-indigo-200 text-[10px] font-black uppercase mb-1">Độ chính xác</div>
                                    <div className="text-2xl font-black italic">{scorePercent}%</div>
                                </div>
                                <div className="flex-1 bg-white/10 backdrop-blur-md p-4 rounded-3xl border border-white/10 text-center">
                                    <div className="text-indigo-200 text-[10px] font-black uppercase mb-1">Thời gian</div>
                                    <div className="text-2xl font-black italic">{timeSpentMsg}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <button 
                      onClick={() => navigate(`/play/${result.quiz_id}`)}
                      className="group bg-white dark:bg-slate-900 p-6 rounded-[32px] border-2 border-slate-100 dark:border-slate-800 hover:border-indigo-600 dark:hover:border-indigo-500 transition-all flex items-center justify-between shadow-sm hover:shadow-xl hover:-translate-y-1"
                    >
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-[22px] flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                <RefreshCw size={28} />
                            </div>
                            <div className="text-left">
                                <h3 className="font-black text-xl text-slate-800 dark:text-slate-100">Làm lại bài thi</h3>
                                <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Cải thiện điểm số ngay</p>
                            </div>
                        </div>
                        <ArrowRight size={24} className="text-slate-300 dark:text-slate-600 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
                    </button>

                    <button 
                      onClick={() => setShowRatingModal(true)}
                      className="group bg-white dark:bg-slate-900 p-6 rounded-[32px] border-2 border-amber-100 dark:border-amber-900/30 hover:border-amber-500 transition-all flex items-center justify-between shadow-sm hover:shadow-xl hover:-translate-y-1"
                    >
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-[22px] flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-colors">
                                <Star size={28} fill="currentColor" />
                            </div>
                            <div className="text-left">
                                <h3 className="font-black text-xl text-slate-800 dark:text-slate-100">Đánh giá quiz</h3>
                                <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Góp ý để hoàn thiện hơn</p>
                            </div>
                        </div>
                        <ArrowRight size={24} className="text-amber-300 dark:text-amber-600 group-hover:text-amber-500 transition-colors" />
                    </button>

                    <button 
                      onClick={() => setShowReviewModal(true)}
                      className="group bg-white p-6 rounded-[32px] border-2 border-transparent bg-gradient-to-r from-slate-900 to-slate-800 text-white transition-all flex items-center justify-between shadow-lg hover:shadow-2xl hover:-translate-y-1"
                    >
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 bg-white/10 rounded-[22px] flex items-center justify-center">
                                <Search size={28} />
                            </div>
                            <div className="text-left">
                                <h3 className="font-black text-xl">Xem lại bài giải</h3>
                                <p className="text-slate-300 font-medium text-sm">Phân tích từng câu hỏi</p>
                            </div>
                        </div>
                        <ArrowRight size={24} className="text-white/40 group-hover:text-white transition-colors" />
                    </button>
                </section>

                {/* ZONE 3: ANALYTICS & LEADERBOARD */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Lưới phân tích câu hỏi (2 cột) */}
                    <section className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-[40px] p-8 md:p-10 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
                            <div>
                                <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-3">
                                    <Zap className="text-amber-500" fill="currentColor" size={24} /> Lưới phân tích câu hỏi
                                </h2>
                                <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Dựa trên hiệu suất làm bài mới nhất của bạn</p>
                            </div>
                            <div className="mt-4 md:mt-0 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-4 py-2 rounded-xl font-bold text-sm shrink-0">
                                Dữ liệu thực tế
                            </div>
                        </div>

                        <div className="space-y-4">
                            {result.questions_list?.map((q, idx) => {
                                const dbAns = (q.correct_answer || "").split(',').sort().join(',');
                                const rawAns = userAnswers[q.id] || "";
                                const myAns = Array.isArray(rawAns) ? rawAns.sort().join(',') : String(rawAns).split(',').sort().join(',');
                                const isSkipped = myAns === "";
                                const isCorrect = (myAns === dbAns && !isSkipped);
                                const isWrong = (!isCorrect && !isSkipped);

                                return (
                                    <div key={q.id} className={`group flex flex-col md:flex-row md:items-center justify-between p-6 rounded-3xl border transition-all cursor-default ${isCorrect ? 'border-emerald-100 bg-emerald-50/30 dark:border-emerald-900/40 dark:bg-emerald-900/20' : isWrong ? 'border-rose-100 bg-rose-50/30 dark:border-rose-900/40 dark:bg-rose-900/20' : 'border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50'}`}>
                                        <div className="flex items-start md:items-center gap-6">
                                            <div className={`w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center font-black ${isCorrect ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400' : isWrong ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-400' : 'bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400'} transition-colors`}>
                                                {idx + 1}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-800 dark:text-slate-200">{q.question_text}</h4>
                                                <div className="flex flex-wrap gap-2 mt-3">
                                                    {isCorrect && <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 px-2.5 py-1 rounded-md bg-emerald-100 dark:bg-emerald-900/30">Câu Đúng</span>}
                                                    {isWrong && <span className="text-[10px] font-black uppercase text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50 px-2.5 py-1 rounded-md bg-rose-100 dark:bg-rose-900/30">Câu Sai</span>}
                                                    {isSkipped && <span className="text-[10px] font-black uppercase text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700 px-2.5 py-1 rounded-md bg-slate-200 dark:bg-slate-800">Bỏ qua</span>}
                                                    <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-800 px-2.5 py-1 rounded-md">Độ khó: {q.difficulty || 'Chung'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            {!result.questions_list?.length && (
                                <div className="text-center text-slate-500 py-10">Không có dữ liệu câu trả lời chi tiết.</div>
                            )}
                        </div>
                    </section>

                    {/* Bảng xếp hạng (1 cột) */}
                    <section className="bg-white dark:bg-slate-900 rounded-[40px] p-8 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
                        <div className="mb-6 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-500 dark:text-amber-400">
                                <Trophy size={20} fill="currentColor" />
                            </div>
                            <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 leading-tight">
                                Bảng xếp hạng<br/><span className="text-indigo-600 dark:text-indigo-400">bài thi này</span>
                            </h2>
                        </div>
                        
                        <div className="flex-1 space-y-3">
                            {leaderboard.length === 0 ? (
                                <div className="text-center text-sm text-slate-400 py-6">Chưa có ai thi bài này</div>
                            ) : (
                                <>
                                    {/* Render Top N */}
                                    {leaderboard.map((user, index) => (
                                        <div key={user.id || index} className={`flex items-center justify-between p-4 rounded-2xl ${index === 0 ? 'bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800/50' : 'bg-slate-50 dark:bg-slate-800/50 border border-transparent dark:border-slate-800'}`}>
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black ${index === 0 ? 'bg-amber-400 text-white shadow-md' : index === 1 ? 'bg-slate-300 text-slate-700 dark:bg-slate-600 dark:text-slate-300' : index === 2 ? 'bg-orange-300 text-orange-900 dark:bg-orange-800/70 dark:text-orange-200' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'} text-xs`}>
                                                    {user.rank}
                                                </div>
                                                <div className="font-bold text-slate-800 dark:text-slate-200">{user.username}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className={`font-black ${index === 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-600 dark:text-slate-400'} text-sm`}>{(user.best_score/10).toFixed(1)} <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">điểm</span></div>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Hiển thị Rank của chính mình nếu không nằm trong Top */}
                                    {currentUserRank && (!leaderboard.some(u => u.username === currentUserRank.username)) && (
                                        <>
                                            <div className="flex justify-center my-1"><div className="w-1 h-3 bg-slate-200 rounded-full"></div><div className="w-1 h-3 bg-slate-200 rounded-full mx-1"></div><div className="w-1 h-3 bg-slate-200 rounded-full"></div></div>
                                            <div className="flex items-center justify-between p-4 rounded-2xl bg-indigo-50 border border-indigo-200">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center font-black text-white text-xs shadow-md">
                                                        {currentUserRank.rank}
                                                    </div>
                                                    <div className="font-bold text-indigo-700">{currentUserRank.username} (Bạn)</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-black text-indigo-600 text-sm">{(currentUserRank.best_score/10).toFixed(1)} <span className="text-[10px] font-bold text-indigo-400">điểm</span></div>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                    </section>
                </div>
            </main>

            {/* Review Modal */}
            <ReviewModal 
                isOpen={showReviewModal}
                onClose={() => setShowReviewModal(false)}
                questions={result.questions_list || []}
                userAnswers={userAnswers}
            />
        </div>
    );
};

export default ResultDetail;
