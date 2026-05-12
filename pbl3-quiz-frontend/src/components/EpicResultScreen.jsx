import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CountUpRaw from 'react-countup';
const CountUp = CountUpRaw.default || CountUpRaw;
import confettiRaw from 'canvas-confetti';
const confetti = confettiRaw.default || confettiRaw;
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  ResponsiveContainer, Tooltip 
} from 'recharts';
import { 
  Trophy, Clock, Target, Zap, ChevronDown, ChevronUp, 
  CheckCircle2, XCircle, Sparkles, Search
} from 'lucide-react';
import ReviewModal from './ReviewModal';

const EpicResultScreen = ({ score, totalQuestions, answers, quizData, timeSpent }) => {
  const navigate = useNavigate();
  const percentage = Math.round((score / totalQuestions) * 100);
  const [leaderboard, setLeaderboard] = useState({ top: [], currentUser: null });
  const [expandedQ, setExpandedQ] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  
  const currentUserId = JSON.parse(localStorage.getItem('user') || '{}')?.id;
  const username = localStorage.getItem('username') || 'Bạn';

  // Mock Data for Radar Chart (Until backend supports it)
  const radarData = [
    { subject: 'Tốc độ', A: Math.min(100, Math.max(40, 100 - (timeSpent / totalQuestions) * 2)), fullMark: 100 },
    { subject: 'Chính xác', A: percentage, fullMark: 100 },
    { subject: 'Kiên định', A: percentage > 50 ? 80 : 40, fullMark: 100 },
    { subject: 'Ghi nhớ', A: percentage > 70 ? 90 : 50, fullMark: 100 },
    { subject: 'Suy luận', A: percentage > 80 ? 85 : 60, fullMark: 100 },
  ];

  useEffect(() => {
    // Bắn pháo hoa nếu điểm cao
    if (percentage >= 80) {
      const duration = 3 * 1000;
      const end = Date.now() + duration;
      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#4f46e5', '#10b981', '#f59e0b']
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#4f46e5', '#10b981', '#f59e0b']
        });
        if (Date.now() < end) requestAnimationFrame(frame);
      };
      frame();
    }

    // Fetch Leaderboard
    const fetchLeaderboard = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`http://localhost:3000/api/v1/quizzes/${quizData.id}/leaderboard`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) {
          setLeaderboard({
            top: res.data.data.top || [],
            currentUser: res.data.data.currentUser || null
          });
        }
      } catch (err) {
        console.error("Lỗi lấy bảng xếp hạng", err);
      }
    };
    if (quizData?.id) fetchLeaderboard();
  }, [percentage, quizData]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}p ${s}s`;
  };

  const getMessage = () => {
    if (percentage === 100) return "Hoàn hảo! Bạn là một thiên tài!";
    if (percentage >= 80) return "Xuất sắc! Bạn đã nắm rất vững kiến thức.";
    if (percentage >= 50) return "Khá tốt! Nhưng bạn vẫn có thể làm tốt hơn.";
    return "Đừng nản chí! Hãy xem lại đáp án và thử lại nhé.";
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in zoom-in duration-500">
      
      {/* HEADER TỔNG KẾT */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white drop-shadow-sm">
          {getMessage()}
        </h1>
        <p className="text-lg text-slate-500 dark:text-slate-400">
          Bài thi: <span className="font-bold text-indigo-600 dark:text-indigo-400">{quizData?.title}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* CỘT TRÁI: ĐIỂM & RADAR */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Box Điểm số */}
          <div className="glass-card bg-white dark:bg-slate-800 rounded-[32px] p-8 flex flex-col md:flex-row items-center justify-around gap-8 shadow-xl border border-slate-100 dark:border-slate-700 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-primary-light)]"></div>
            
            {/* Vòng quay đếm số */}
            <div className="relative w-48 h-48 flex items-center justify-center">
              <svg className="absolute w-full h-full transform -rotate-90">
                <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100 dark:text-slate-700" />
                <motion.circle 
                  cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" 
                  className="text-[var(--theme-primary)]"
                  strokeDasharray="552.9" 
                  initial={{ strokeDashoffset: 552.9 }}
                  animate={{ strokeDashoffset: 552.9 - (552.9 * percentage) / 100 }}
                  transition={{ duration: 2, ease: "easeOut" }}
                  strokeLinecap="round"
                />
              </svg>
              <div className="text-center">
                <div className="text-5xl font-black text-slate-900 dark:text-white">
                  {CountUp ? (
                    <CountUp end={score} duration={2.5} />
                  ) : score}
                  <span className="text-2xl text-slate-400">/{totalQuestions}</span>
                </div>
                <p className="text-sm font-bold text-[var(--theme-primary)] uppercase tracking-widest mt-1">Chính xác</p>
              </div>
            </div>

            {/* Thống kê nhanh */}
            <div className="flex flex-col gap-4 w-full md:w-auto">
              <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl">
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Clock size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Thời gian</p>
                  <p className="text-xl font-black text-slate-800 dark:text-slate-100">{formatTime(timeSpent)}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl">
                <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <Zap size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tốc độ trung bình</p>
                  <p className="text-xl font-black text-slate-800 dark:text-slate-100">{(timeSpent / totalQuestions).toFixed(1)}s <span className="text-sm font-normal">/câu</span></p>
                </div>
              </div>
            </div>
          </div>

          {/* Phân tích kỹ năng & Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="glass-card bg-white dark:bg-slate-800 rounded-[32px] p-6 shadow-lg border border-slate-100 dark:border-slate-700 flex flex-col items-center">
              <h3 className="font-black text-slate-800 dark:text-slate-200 mb-2">Phân tích kỹ năng</h3>
              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 700 }} />
                    <Tooltip wrapperStyle={{ outline: 'none' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                    <Radar name={username} dataKey="A" stroke="var(--theme-primary)" fill="var(--theme-primary)" fillOpacity={0.4} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass-card bg-white dark:bg-slate-800 rounded-[32px] p-6 shadow-lg border border-slate-100 dark:border-slate-700">
              <h3 className="font-black text-slate-800 dark:text-slate-200 mb-4">Danh hiệu đạt được</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-3 rounded-xl bg-gradient-to-r from-amber-50 to-transparent dark:from-amber-900/20 border-l-4 border-amber-500">
                  <Trophy size={24} className="text-amber-500" />
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-200">Kẻ hủy diệt đề thi</p>
                    <p className="text-xs text-slate-500">Hoàn thành bài thi thành công.</p>
                  </div>
                </div>
                {percentage >= 80 && (
                  <div className="flex items-center gap-4 p-3 rounded-xl bg-gradient-to-r from-rose-50 to-transparent dark:from-rose-900/20 border-l-4 border-rose-500">
                    <Target size={24} className="text-rose-500" />
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-200">Thánh phán đoán</p>
                      <p className="text-xs text-slate-500">Độ chính xác vượt mức 80%.</p>
                    </div>
                  </div>
                )}
                {(timeSpent / totalQuestions) < 15 && (
                  <div className="flex items-center gap-4 p-3 rounded-xl bg-gradient-to-r from-emerald-50 to-transparent dark:from-emerald-900/20 border-l-4 border-emerald-500">
                    <Zap size={24} className="text-emerald-500" />
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-200">Tốc độ ánh sáng</p>
                      <p className="text-xs text-slate-500">Trung bình dưới 15s/câu.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Accordion Lịch sử câu hỏi */}
          <div className="glass-card bg-white dark:bg-slate-800 rounded-[32px] p-6 md:p-8 shadow-lg border border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-black text-xl text-slate-800 dark:text-slate-200">Chi tiết bài làm</h3>
              <button 
                onClick={() => setShowReviewModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-sm hover:scale-105 transition-all shadow-lg"
              >
                <Search size={16} /> Phân tích chuyên sâu
              </button>
            </div>
            <div className="space-y-4">
              {quizData?.questions?.map((q, idx) => {
                const qId = q.question_id || q.id;
                const userAns = answers[qId];
                const correctAns = q.correct_option || q.correct_answer;
                const isCorrect = Array.isArray(userAns)
                  ? userAns.length > 0 && userAns.every(v => (correctAns || '').split(',').includes(v)) && (correctAns || '').split(',').length === userAns.length
                  : userAns === correctAns;
                const isExpanded = expandedQ === qId;
                
                return (
                  <div key={qId || idx} className={`border rounded-2xl overflow-hidden transition-all duration-300 ${isCorrect ? 'border-emerald-200 dark:border-emerald-900/50' : 'border-rose-200 dark:border-rose-900/50'}`}>
                    <button 
                      onClick={() => setExpandedQ(isExpanded ? null : qId)}
                      className={`w-full flex items-center justify-between p-4 text-left transition-colors ${isCorrect ? 'bg-emerald-50/50 hover:bg-emerald-50 dark:bg-emerald-900/10 dark:hover:bg-emerald-900/20' : 'bg-rose-50/50 hover:bg-rose-50 dark:bg-rose-900/10 dark:hover:bg-rose-900/20'}`}
                    >
                      <div className="flex items-center gap-4 pr-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isCorrect ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400' : 'bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-400'}`}>
                          {isCorrect ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                        </div>
                        <p className="font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">
                          <span className="text-slate-400 mr-2">Câu {idx + 1}:</span>
                          {q.question_text}
                        </p>
                      </div>
                      {isExpanded ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
                    </button>
                    
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }} 
                          animate={{ height: 'auto', opacity: 1 }} 
                          exit={{ height: 0, opacity: 0 }}
                          className="bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700"
                        >
                          <div className="p-6 space-y-6">
                            <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl">
                              <p className="font-medium text-slate-800 dark:text-slate-200 leading-relaxed">{q.question_text}</p>
                            </div>
                            
                            {/* Show all options in accordion too */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {['a', 'b', 'c', 'd'].map(opt => {
                                const label = opt.toUpperCase();
                                const text = q[`option_${opt}`] || q[`option_${label}`] || q[`Option${label}`] || q[`choice_${opt}`] || q[`Choice${label}`] || q[opt] || q[label];
                                
                                if (!text) return null;
                                const isUserChoice = (Array.isArray(userAns) ? userAns.includes(label) : String(userAns || '').toLowerCase() === opt || String(userAns || '').toUpperCase() === label);
                                const isCorrectOpt = String(correctAns || '').toLowerCase() === opt || String(correctAns || '').toUpperCase() === label;
                                
                                let style = "border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-400";
                                if (isUserChoice && isCorrectOpt) style = "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300";
                                if (isUserChoice && !isCorrectOpt) style = "border-rose-500 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300";
                                if (!isUserChoice && isCorrectOpt) style = "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-400";

                                return (
                                  <div key={opt} className={`p-3 rounded-xl border flex items-center gap-3 text-sm font-medium ${style}`}>
                                    <div className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-black ${isCorrectOpt ? 'bg-emerald-500 text-white' : isUserChoice ? 'bg-rose-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>
                                      {label}
                                    </div>
                                    {text}
                                  </div>
                                );
                              })}
                            </div>

                            {q.explanation && (
                              <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800/50">
                                <p className="text-xs font-bold text-indigo-500 uppercase mb-2 flex items-center gap-1"><Sparkles size={14}/> AI Giải thích</p>
                                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{q.explanation}</p>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: LEADERBOARD TRỰC TIẾP */}
        <div className="lg:col-span-1">
          <div className="glass-card bg-gradient-to-b from-[#1e1b4b] to-[#0c0a15] rounded-[32px] overflow-hidden text-white shadow-2xl sticky top-24">
            <div className="p-6 border-b border-white/10 text-center">
              <div className="w-16 h-16 mx-auto bg-yellow-500/20 rounded-full flex items-center justify-center mb-3">
                <Trophy size={32} className="text-yellow-400" />
              </div>
              <h3 className="font-black text-xl mb-1">Bảng vàng</h3>
              <p className="text-xs text-white/50 uppercase tracking-widest">Top 10 xuất sắc nhất</p>
            </div>
            
            <div className="p-4">
              {leaderboard.top.length === 0 ? (
                <div className="py-8 text-center text-white/40 animate-pulse text-sm font-medium">Đang tải bảng xếp hạng...</div>
              ) : (
                <div className="space-y-2">
                  {leaderboard.top.map((u, i) => {
                    const isMe = u.user_id === currentUserId;
                    const medals = ['🥇', '🥈', '🥉'];
                    return (
                      <div key={i} className={`flex items-center justify-between p-3 rounded-xl transition-all ${isMe ? 'bg-[var(--theme-primary)] shadow-lg scale-[1.02]' : 'hover:bg-white/5'}`}>
                        <div className="flex items-center gap-3">
                          <span className="text-xl w-6 text-center">{medals[i] || <span className="text-sm font-bold text-white/50">{i + 1}</span>}</span>
                          <p className={`font-bold text-sm truncate max-w-[120px] ${isMe ? 'text-white' : 'text-white/80'}`}>{isMe ? 'Bạn' : u.username}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-sm text-white">{u.best_score}</p>
                          <p className="text-[10px] text-white/50">{formatTime(u.best_time)}</p>
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Nếu người dùng không nằm trong Top 10 */}
                  {leaderboard.currentUser && leaderboard.currentUser.rank > 10 && (
                    <>
                      <div className="my-4 border-t border-white/10 border-dashed"></div>
                      <div className="flex items-center justify-between p-3 rounded-xl bg-white/10 border border-white/20">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-black w-6 text-center text-white/50">{leaderboard.currentUser.rank}</span>
                          <p className="font-bold text-sm text-white">Bạn</p>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-sm text-white">{leaderboard.currentUser.best_score}</p>
                          <p className="text-[10px] text-white/50">{formatTime(leaderboard.currentUser.best_time)}</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
            
            <div className="p-4 bg-white/5 border-t border-white/10">
              <button 
                onClick={() => navigate('/dashboard')}
                className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition-colors text-sm"
              >
                Về trang chủ
              </button>
            </div>
          </div>
        </div>

      </div>

      <ReviewModal 
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        questions={quizData?.questions || []}
        userAnswers={answers}
      />
    </div>
  );
};

export default EpicResultScreen;
