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

const ResultDetail = () => {
    const { resultId } = useParams();
    const navigate = useNavigate();
    const [result, setResult] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`http://localhost:3000/api/v1/quizzes/results/${resultId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.data.success) {
                    setResult(response.data.result);
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
            <div className="min-h-screen bg-[#f8f9fc] flex flex-col items-center justify-center text-indigo-600">
                <Loader2 className="animate-spin mb-4" size={48} />
                <h2 className="text-xl font-bold italic">Đang phân tích dữ liệu...</h2>
            </div>
        );
    }

    if (!result) return <div className="p-10 text-center">Không tìm thấy kết quả.</div>;

    const scorePercent = Math.round((result.correct_answers / result.total_questions) * 100);
    const scoreVal = (result.total_points / 10).toFixed(1);

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
        <div className="min-h-screen bg-[#f8f9fc] pb-20">
            {/* Header / Nav */}
            <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
                <button 
                  onClick={() => navigate('/history')}
                  className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-semibold transition-colors"
                >
                    <ChevronLeft size={20} /> Quay lại lịch sử
                </button>
                <div className="text-slate-400 font-medium text-sm">
                    Mã kết quả: #{resultId}
                </div>
            </div>

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
                                    <div className="text-2xl font-black italic">08:45</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ZONE 2: CALL TO ACTION */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <button 
                      onClick={() => navigate(`/play/${result.quiz_id}`)}
                      className="group bg-white p-6 rounded-[32px] border-2 border-slate-100 hover:border-indigo-600 transition-all flex items-center justify-between shadow-sm hover:shadow-xl hover:-translate-y-1"
                    >
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-[22px] flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                <RefreshCw size={28} />
                            </div>
                            <div className="text-left">
                                <h3 className="font-black text-xl text-slate-800">Làm lại bài thi</h3>
                                <p className="text-slate-500 font-medium text-sm">Cải thiện điểm số ngay bây giờ</p>
                            </div>
                        </div>
                        <ArrowRight size={24} className="text-slate-300 group-hover:text-indigo-600 transition-colors" />
                    </button>

                    <button 
                      className="group bg-white p-6 rounded-[32px] border-2 border-transparent bg-gradient-to-r from-slate-900 to-slate-800 text-white transition-all flex items-center justify-between shadow-lg hover:shadow-2xl hover:-translate-y-1"
                    >
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 bg-white/10 rounded-[22px] flex items-center justify-center">
                                <Search size={28} />
                            </div>
                            <div className="text-left">
                                <h3 className="font-black text-xl">Xem lại bài giải</h3>
                                <p className="text-slate-300 font-medium text-sm">Phân tích từng câu hỏi đã làm</p>
                            </div>
                        </div>
                        <ArrowRight size={24} className="text-white/40 group-hover:text-white transition-colors" />
                    </button>
                </section>

                {/* ZONE 3: ANALYTICS LIST (Mock Data) */}
                <section className="bg-white rounded-[40px] p-10 border border-slate-200 shadow-sm relative overflow-hidden">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                                <Zap className="text-amber-500" fill="currentColor" size={24} /> Lưới phân tích câu hỏi
                            </h2>
                            <p className="text-slate-500 font-medium mt-1">Dựa trên hiệu suất làm bài của bạn</p>
                        </div>
                        <div className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl font-bold text-sm">
                            Phân tích chuyên sâu
                        </div>
                    </div>

                    <div className="space-y-4">
                        {[
                            { id: 14, title: "Hành tinh nào gần mặt trời nhất?", tags: ["Sai nhiều nhất", "Hệ mặt trời"], time: "45s", diff: "Khó" },
                            { id: 8, title: "Lỗ đen là gì?", tags: ["Tốn nhiều thời gian", "Vật lý lý thuyết"], time: "2p 15s", diff: "Rất khó" },
                            { id: 22, title: "Vận tốc ánh sáng là bao nhiêu?", tags: ["Hay nhầm lẫn", "Kiến thức cơ bản"], time: "15s", diff: "Trung bình" }
                        ].map((item, idx) => (
                            <div key={idx} className="group flex items-center justify-between p-6 rounded-3xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/20 transition-all cursor-pointer">
                                <div className="flex items-center gap-6">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                                        {item.id}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800 group-hover:text-indigo-900">{item.title}</h4>
                                        <div className="flex gap-2 mt-2">
                                            {item.tags.map(tag => (
                                                <span key={tag} className="text-[10px] font-black uppercase text-slate-400 border border-slate-100 px-2 py-0.5 rounded-md group-hover:border-indigo-200 group-hover:text-indigo-500 transition-colors">{tag}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-8 text-right hidden md:flex">
                                    <div>
                                        <div className="text-[10px] font-bold text-slate-400 uppercase">Thời gian</div>
                                        <div className="font-bold text-slate-700">{item.time}</div>
                                    </div>
                                    <div className="w-24">
                                        <div className="text-[10px] font-bold text-slate-400 uppercase">Mức độ</div>
                                        <div className={`font-bold ${item.diff === 'Rất khó' ? 'text-red-500' : 'text-amber-500'}`}>{item.diff}</div>
                                    </div>
                                    <ChevronRight className="text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-10 pt-8 border-t border-dashed border-slate-200 text-center">
                        <button className="text-indigo-600 font-bold hover:underline">Xem toàn bộ 40 câu hỏi phân tích</button>
                    </div>
                </section>

            </main>
        </div>
    );
};

export default ResultDetail;
