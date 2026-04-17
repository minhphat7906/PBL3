import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Home, 
  BookOpen, 
  Clock, 
  BarChart3, 
  Search, 
  Calendar, 
  ChevronRight, 
  Trophy, 
  Layers, 
  ArrowRight,
  TrendingUp,
  X,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HistoryPage = () => {
    const navigate = useNavigate();
    const [groupedHistory, setGroupedHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedQuiz, setSelectedQuiz] = useState(null); // Để mở Drawer/Modal các lần làm

    const fetchHistory = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:3000/api/v1/quizzes/history', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.data.success) {
                setGroupedHistory(response.data.history);
            }
        } catch (error) {
            console.error("Lỗi lấy lịch sử:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const filteredHistory = groupedHistory.filter(item => 
        item.quiz_title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex min-h-screen bg-[#f8f9fc] font-sans text-slate-900">
            {/* SIDEBAR (Bản thu gọn) */}
            <aside className="w-64 bg-[#1e1b4b] text-white/70 p-6 flex flex-col fixed h-full z-20">
                <div className="flex items-center gap-2 text-white font-black text-2xl mb-12 cursor-pointer" onClick={() => navigate('/dashboard')}>
                    <BookOpen className="text-[#4f46e5]" /> QuizSmart
                </div>
                <nav className="flex-1 space-y-2">
                    <button onClick={() => navigate('/dashboard')} className="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-white/10 hover:text-white transition-all"><Home size={20} /> Trang chủ</button>
                    <button onClick={() => navigate('/explore')} className="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-white/10 hover:text-white transition-all"><BookOpen size={20} /> Kho đề thi</button>
                    <button className="w-full flex items-center gap-4 px-4 py-3 rounded-xl bg-[#4f46e5] text-white font-semibold"><Clock size={20} /> Lịch sử thi</button>
                    <button className="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-white/10 hover:text-white transition-all"><BarChart3 size={20} /> Bảng xếp hạng</button>
                </nav>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 ml-64 p-8">
                <div className="max-w-6xl mx-auto">
                    <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest mb-3">Học tập & Rèn luyện</div>
                            <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">Lịch sử bài làm</h1>
                            <p className="text-slate-500 text-lg mt-2 font-medium">Gom nhóm bài thi - Theo dõi tiến trình bền bỉ.</p>
                        </div>
                        
                        <div className="relative w-full md:w-[360px]">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input 
                                className="w-full pl-12 pr-4 py-3.5 bg-white rounded-[20px] border border-slate-200 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm font-semibold" 
                                type="text" 
                                placeholder="Tìm kiếm đề thi đã chinh phục..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </header>

                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="h-64 bg-slate-200 rounded-[35px] animate-pulse"></div>
                            ))}
                        </div>
                    ) : filteredHistory.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-[40px] border-2 border-dashed border-slate-200">
                            <div className="text-8xl mb-6">🏜️</div>
                            <h3 className="text-2xl font-black text-slate-700 mb-2">Chưa có bài làm nào ở đây!</h3>
                            <p className="text-slate-500 font-medium max-w-sm mx-auto">Hãy bắt đầu hành trình của bạn bằng cách thử thách bản thân với một bộ đề thi mới.</p>
                            <button onClick={() => navigate('/explore')} className="mt-8 px-10 py-4 bg-indigo-600 shadow-2xl shadow-indigo-200 text-white font-black rounded-[20px] hover:bg-indigo-700 active:scale-95 transition-all flex items-center gap-3 mx-auto">
                                <TrendingUp size={20} /> KHÁM PHÁ KHO ĐỀ NGAY
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                            {filteredHistory.map((quiz, index) => (
                                <div 
                                  key={quiz.quiz_id} 
                                  onClick={() => setSelectedQuiz(quiz)}
                                  className="group relative cursor-pointer"
                                >
                                    {/* Hiệu ứng Stacked (Xếp chồng) */}
                                    <div className="absolute inset-0 bg-white rounded-[35px] border border-slate-100 shadow-sm translate-x-3 translate-y-3 z-0"></div>
                                    <div className="absolute inset-0 bg-white rounded-[35px] border border-slate-100 shadow-md translate-x-1.5 translate-y-1.5 z-[1]"></div>
                                    
                                    {/* Thẻ chính */}
                                    <div className="relative z-[2] bg-white rounded-[35px] border border-slate-200 p-8 shadow-xl transition-all duration-300 group-hover:-translate-y-2 group-hover:border-indigo-400">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-black text-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                                {quiz.quiz_id}
                                            </div>
                                            <span className="bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase px-3 py-1.5 rounded-lg border border-indigo-100">
                                                {quiz.attempt_count} lượt làm
                                            </span>
                                        </div>

                                        <h3 className="text-2xl font-black text-slate-800 leading-tight mb-4 min-h-[64px] line-clamp-2">
                                            {quiz.quiz_title}
                                        </h3>

                                        <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                                            <div>
                                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Best Score</div>
                                                <div className="flex items-center gap-1.5 text-indigo-600 font-black text-xl">
                                                    <Trophy size={18} fill="currentColor" className="text-amber-400" />
                                                    {quiz.best_score}%
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Cập nhật</div>
                                                <div className="text-slate-600 font-bold text-sm">
                                                    {new Date(quiz.attempts_list[0].completed_at).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* DRAWER / MODAL: DANH SÁCH LẦN LÀM (TIMELINE) */}
            {selectedQuiz && (
                <div className="fixed inset-0 z-[100] flex items-center justify-end">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedQuiz(null)}></div>
                    <div className="relative w-full max-w-md h-full bg-white shadow-[-20px_0_50px_rgba(30,27,75,0.1)] flex flex-col animate-slide-in">
                        
                        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                            <div>
                                <h2 className="text-2xl font-black text-slate-800 leading-tight">{selectedQuiz.quiz_title}</h2>
                                <p className="text-slate-500 font-medium text-sm mt-1">Lịch sử {selectedQuiz.attempt_count} lần thực hiện</p>
                            </div>
                            <button 
                              onClick={() => setSelectedQuiz(null)}
                              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 bg-slate-50/30">
                            <div className="relative space-y-8 before:absolute before:left-6 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-200">
                                {selectedQuiz.attempts_list.map((attempt, idx) => (
                                    <div key={attempt.id} className="relative pl-14 group">
                                        <div className={`absolute left-4 top-2 w-4 h-4 rounded-full border-4 border-white shadow-md z-10 transition-colors ${idx === 0 ? 'bg-indigo-600 scale-125' : 'bg-slate-300'}`}></div>
                                        
                                        <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm hover:shadow-md transition-all hover:border-indigo-200 cursor-pointer">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="text-xs font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2.5 py-1 rounded-md">
                                                    #{selectedQuiz.attempt_count - idx} • {new Date(attempt.completed_at).toLocaleDateString()}
                                                </div>
                                                <div className={`font-black text-xl ${attempt.total_points >= 80 ? 'text-indigo-600' : attempt.total_points >= 50 ? 'text-amber-500' : 'text-rose-500'}`}>
                                                    {attempt.total_points / 10} / 10
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4 text-slate-500 text-xs font-bold font-medium mt-1">
                                                   <span className="flex items-center gap-1"><CheckCircle2 size={14} className="text-emerald-500" /> {attempt.correct_answers}</span>
                                                   <span className="flex items-center gap-1"><Layers size={14} /> {(attempt.total_points / 100 * (selectedQuiz.total_questions || 10)).toFixed(0)} câu</span>
                                                </div>
                                                <button 
                                                    onClick={() => navigate(`/result/${attempt.id}`)}
                                                    className="flex items-center gap-1.5 text-indigo-600 font-bold text-sm hover:underline"
                                                >
                                                    Xem chi tiết <ArrowRight size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-8 border-t border-slate-100 bg-white">
                            <button 
                                onClick={() => navigate(`/play/${selectedQuiz.quiz_id}`)}
                                className="w-full py-4 bg-indigo-600 text-white font-black text-lg rounded-[20px] shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3"
                            >
                                <RefreshCw size={20} /> LÀM LẠI ĐỀ NÀY
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes slide-in {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }
                .animate-slide-in {
                    animation: slide-in 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                }
            ` }} />
        </div>
    );
};

export default HistoryPage;
