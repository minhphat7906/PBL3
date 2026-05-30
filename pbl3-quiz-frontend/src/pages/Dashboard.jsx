import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen, Bell, LogOut, Sparkles, Plus,
  ChevronRight, Heart, TrendingUp, Zap, Flame, Moon, Sun, Quote,
  User, CreditCard, Settings, HelpCircle, Crown, ChevronDown
} from 'lucide-react';
import axios from 'axios';
import Swal from 'sweetalert2';
import LightQuizCard from '../components/LightQuizCard';
import Sidebar from '../components/Sidebar';
import QuizDetailModal from '../components/QuizDetailModal';
import Header from '../components/Header';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer} 
 from 'recharts';
import CountUpRaw from 'react-countup';
const CountUp = CountUpRaw.default || CountUpRaw;

// ─── Axios helper ─────────────────────────────────────────────────────
const authAxios = () => {
  const token = localStorage.getItem('token');
  return axios.create({ headers: { Authorization: `Bearer ${token}` } });
};

// ─── Custom Chart Tooltip ─────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl p-3 shadow-xl text-xs">
        <p className="font-black text-slate-700 dark:text-slate-200 mb-0.5">{label}</p>
        <p className="text-indigo-600 dark:text-indigo-400 font-bold">{payload[0]?.value} bài làm</p>
      </div>
    );
  }
  return null;
};

const LEADERBOARD_TABS = [
  { id: 'streak', label: '🔥 Chuỗi' },
  { id: 'creators', label: '✏️ Sáng tác' },
  { id: 'active', label: '🏃 Cày cuốc' },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const username = localStorage.getItem('username') || 'Người học';

  // Toggle Dark Mode globally
  const [isDarkMode, setIsDarkMode] = useState(() => document.documentElement.classList.contains('dark'));

  useEffect(() => {
    // Sync local state if html class changes
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const [quizzes, setQuizzes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ total_created: 0, total_attempts: 0, avg_score: 0, total_favorites: 0 });
  const [streakInfo, setStreakInfo] = useState({ streak: 0, isActiveToday: false });
  const [weekData, setWeekData] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [lbTab, setLbTab] = useState('streak');
  const [lbLoading, setLbLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  // Fetch all data on mount
  useEffect(() => {
    const api = authAxios();

    const fetchQuizzes = async () => {
      setIsLoading(true);
      try {
        const endpoint = activeTab === 'all'
          ? 'http://localhost:3000/api/v1/quizzes'
          : 'http://localhost:3000/api/v1/quizzes/my-quizzes';
        const res = await api.get(endpoint);
        if (res.data.success) setQuizzes(res.data.quizzes);
      } catch (err) { console.error(err); }
      finally { setIsLoading(false); }
    };

    const fetchStats = async () => {
      try {
        const res = await api.get('http://localhost:3000/api/v1/quizzes/stats');
        if (res.data.success) setStats(res.data.stats);
      } catch (err) { console.error(err); }
    };

    const fetchStreak = async () => {
      try {
        const res = await api.get('http://localhost:3000/api/v1/quizzes/streak');
        if (res.data.success) setStreakInfo({ streak: res.data.streak, isActiveToday: res.data.isActiveToday });
      } catch (err) { console.error(err); }
    };

    const fetchChart = async () => {
      try {
        const res = await api.get('http://localhost:3000/api/v1/quizzes/weekly-activity');
        if (res.data.success) setWeekData(res.data.data);
      } catch (err) { console.error(err); }
    };

    fetchQuizzes();
    fetchStats();
    fetchStreak();
    fetchChart();
  }, [activeTab]);

  // Fetch leaderboard on tab change
  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLbLoading(true);
      try {
        const api = authAxios();
        const res = await api.get(`http://localhost:3000/api/v1/quizzes/leaderboard?type=${lbTab}&limit=5`);
        if (res.data.success) setLeaderboard(res.data.data);
      } catch (err) { console.error(err); }
      finally { setLbLoading(false); }
    };
    fetchLeaderboard();
  }, [lbTab]);

  const filteredQuizzes = useMemo(() =>
    quizzes.filter(q => q.title.toLowerCase().includes(searchTerm.toLowerCase())),
    [quizzes, searchTerm]
  );

  const handleLogout = () => {
    Swal.fire({ title: 'Đăng xuất?', icon: 'question', showCancelButton: true, confirmButtonColor: '#4f46e5', confirmButtonText: 'Đăng xuất', cancelButtonText: 'Ở lại' })
      .then(r => { if (r.isConfirmed) { localStorage.clear(); navigate('/login'); } });
  };

  const handleDelete = (id) => {
    Swal.fire({ title: 'Xóa đề thi?', text: 'Không thể khôi phục!', icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444', confirmButtonText: 'Xóa' })
      .then(async r => {
        if (r.isConfirmed) {
          try {
            await authAxios().delete(`http://localhost:3000/api/v1/quizzes/${id}`);
            setQuizzes(prev => prev.filter(q => q.id !== id));
            Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Đã xóa!', timer: 2000, showConfirmButton: false });
          } catch { Swal.fire('Lỗi', 'Không thể xóa lúc này', 'error'); }
        }
      });
  };

  const statCards = [
    { label: 'Đề đã tạo', value: stats.total_created, icon: <BookOpen size={20} />, color: 'indigo', trend: 'bộ đề' },
    { label: 'Lượt thi', value: stats.total_attempts, icon: <TrendingUp size={20} />, color: 'emerald', trend: 'tổng cộng' },
    { label: 'Điểm TB', value: Number(stats.avg_score || 0).toFixed(1), icon: <Zap size={20} />, color: 'amber', trend: 'trên 100' },
    { label: 'Yêu thích', value: stats.total_favorites, icon: <Heart size={20} fill="currentColor" />, color: 'rose', trend: 'bộ sưu tập' },
  ];
  const colorMap = {
    indigo: { light: 'bg-indigo-50 dark:bg-indigo-900/30', text: 'text-indigo-600 dark:text-indigo-400' },
    emerald: { light: 'bg-emerald-50 dark:bg-emerald-900/30', text: 'text-emerald-600 dark:text-emerald-400' },
    amber: { light: 'bg-amber-50 dark:bg-amber-900/30', text: 'text-amber-600 dark:text-amber-400' },
    rose: { light: 'bg-rose-50 dark:bg-rose-900/30', text: 'text-rose-500 dark:text-rose-400' },
  };

  const lbScoreLabel = {
    streak: 'ngày 🔥',
    creators: 'đề',
    active: 'lượt',
  };

  return (
    <div className="flex min-h-screen mesh-gradient-bg font-sans text-slate-900 dark:text-slate-200 transition-colors duration-300">

      {/* ═══ SIDEBAR ═══ */}
      <Sidebar streakInfo={streakInfo} />

      {/* ─── HEADER ─── */}
      <Header />

      {/* ═══ MAIN ═══ */}
      <main className="flex-1 ml-64 p-8 pt-28 overflow-x-hidden">

        <div className="space-y-6">

          {/* ═══ TẦNG 1: BANNER ═══ */}
          <section className="relative bg-gradient-to-r from-[var(--theme-primary-dark)] via-[#1e1b4b] to-[var(--theme-primary)] rounded-[32px] overflow-hidden p-8 shadow-xl shadow-[var(--theme-glow)]">
            <div className="absolute top-0 right-0 w-96 h-96 opacity-10 pointer-events-none">
              <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <path fill="#ffffff" d="M44.7,-62.7C56.1,-53.2,61.2,-36.7,66.1,-20.1C71,-3.4,75.8,13.4,71.4,27.3C66.9,41.2,53.3,52.2,38.7,60.3C24.2,68.4,8.7,73.6,-5.4,70.6C-19.5,67.6,-32.2,56.4,-46.8,46.2C-61.4,36,-77.9,26.8,-81.1,14.5C-84.3,2.2,-74.2,-13.1,-63.3,-25.3C-52.5,-37.5,-41,-46.7,-28.7,-55.4C-16.3,-64.2,-3.2,-72.6,11,-73.1C25.1,-73.7,33.3,-72.2,44.7,-62.7Z" transform="translate(100 100)" />
              </svg>
            </div>
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h1 className="text-3xl font-black text-white mb-1">Chào mừng trở lại, {username}! 👋</h1>
                <p className="text-indigo-200 text-base opacity-80">Chinh phục thử thách mới ngay hôm nay.</p>
              </div>
              <div className="flex gap-3 shrink-0">
                <button onClick={() => navigate('/create-quiz')}
                  className="bg-white/15 hover:bg-white/25 text-white px-5 py-2.5 rounded-xl font-bold border border-white/20 transition-all flex items-center gap-2 text-sm">
                  <Plus size={17} /> Tạo đề
                </button>
                <button 
                  onClick={() => navigate('/create-quiz', { state: { defaultTab: 'ai' } })}
                  className="bg-gradient-to-r from-fuchsia-500 via-pink-500 to-rose-500 text-white px-5 py-2.5 rounded-xl font-black shadow-lg shadow-pink-500/30 flex items-center gap-2 text-sm hover:shadow-pink-500/50 hover:scale-105 transition-all"
                >
                  <Sparkles size={17} /> Tạo bằng AI
                </button>
              </div>
            </div>
          </section>

          {/* ═══ TẦNG 2: STATS + CHART ═══ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Stats 2x2 */}
            <div className="grid grid-cols-2 gap-4">
              {statCards.map((s, i) => {
                const c = colorMap[s.color];
                return (
                  <div key={i} className="glass-card glow-hover rounded-[24px] p-5 hover:-translate-y-1 transition-all duration-300">
                    <div className={`w-10 h-10 ${c.light} ${c.text} rounded-xl flex items-center justify-center mb-3`}>{s.icon}</div>
                    <p className="text-3xl font-black text-slate-800 dark:text-slate-100 mb-0.5">{s.value}</p>
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400">{s.label}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-medium">{s.trend}</p>
                  </div>
                );
              })}
            </div>

            {/* Chart - Dữ liệu thật */}
            <div className="glass-card rounded-[24px] p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-black text-slate-800 dark:text-slate-200 text-sm">Hoạt động tuần</h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Số bài thi thực tế 7 ngày qua</p>
                </div>
                <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[10px] font-black uppercase ${streakInfo.isActiveToday ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-500 dark:text-orange-400' : 'bg-slate-50 dark:bg-slate-700 text-slate-400 dark:text-slate-500'}`}>
                  <Flame size={11} fill={streakInfo.isActiveToday ? 'currentColor' : 'none'} /> {streakInfo.streak} ngày
                </div>
              </div>
              
              {weekData.length === 0 || weekData.reduce((acc, curr) => acc + curr.value, 0) === 0 ? (
                <div className="flex items-center justify-center h-[160px] text-slate-400 dark:text-slate-500 font-medium">Chưa có dữ liệu hoạt động tuần này</div>
              ) : (
                <ResponsiveContainer width="100%" height={160}>
                  <AreaChart data={weekData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gTheme" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--theme-primary)" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="var(--theme-primary)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#1e293b' : '#f1f5f9'} />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: isDarkMode ? '#64748b' : '#94a3b8', fontSize: 10, fontWeight: 700}}
                      dy={5}
                    />
                    <RechartsTooltip content={<ChartTooltip />} cursor={{stroke: 'var(--theme-primary)', strokeWidth: 2}} />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="var(--theme-primary)" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#gTheme)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* ═══ TẦNG 3: BODY 2/3 + 1/3 ═══ */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

            {/* CỘT TRÁI: QUIZ GRID */}
            <section className="lg:col-span-2">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-lg font-black text-slate-800 dark:text-slate-100">Đề thi đề xuất</h2>
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-0.5">Những bộ đề chất lượng</p>
                </div>
                <div className="flex glass-card p-1 rounded-xl shadow-sm">
                  {[{ id: 'all', label: 'Công khai' }, { id: 'mine', label: 'Của tôi' }].map(t => (
                    <button key={t.id} onClick={() => setActiveTab(t.id)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === t.id ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {isLoading ? (
                  Array(4).fill(0).map((_, i) => (
                    <div key={i} className="glass-card rounded-[24px] h-[300px] animate-pulse">
                      <div className="h-36 bg-slate-200/50 dark:bg-slate-700/50 rounded-t-[24px]"></div>
                      <div className="p-4 space-y-3">
                        <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full w-1/3"></div>
                        <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded-lg w-3/4"></div>
                        <div className="h-9 bg-slate-100 dark:bg-slate-700 rounded-xl mt-4"></div>
                      </div>
                    </div>
                  ))
                ) : filteredQuizzes.length === 0 ? (
                  <div className="col-span-full py-16 text-center glass-card rounded-[24px] border border-dashed border-white/20">
                    <div className="text-5xl mb-3">📭</div>
                    <p className="text-slate-500 dark:text-slate-400 font-bold text-sm">Chưa có đề thi nào.</p>
                    <button onClick={() => navigate('/create-quiz')} className="mt-4 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-colors">
                      Tạo đề ngay
                    </button>
                  </div>
                ) : (
                  filteredQuizzes.slice(0, 4).map(quiz => (
                    <LightQuizCard key={quiz.id} quiz={quiz}
                      onClick={() => {
                        setSelectedQuiz(quiz);
                        setShowDetailModal(true);
                      }}
                      onPlayClick={q => navigate(`/play/${q.id}`)}
                      showActions={activeTab === 'mine'}
                      onEdit={id => navigate(`/edit-quiz/${id}`)}
                      onDelete={handleDelete}
                    />
                  ))
                )}
              </div>

              {filteredQuizzes.length > 0 && (
                <button onClick={() => navigate('/explore')}
                  className="w-full mt-5 glass-card glow-hover text-slate-600 dark:text-slate-300 hover:text-indigo-700 dark:hover:text-indigo-400 font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 group text-sm">
                  Xem tất cả trong Kho đề
                  <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
              )}
            </section>

            {/* CỘT PHẢI: WIDGETS */}
            <aside className="space-y-5">

              {/* LEADERBOARD (Dữ liệu thật + Tabs) */}
              <div className="glass-card dark:bg-gradient-to-b dark:from-[#1e1b4b]/80 dark:to-[#0c0a15]/80 rounded-[24px] overflow-hidden text-slate-800 dark:text-white shadow-xl dark:shadow-indigo-900/20 backdrop-blur-xl border border-slate-200/80 dark:border-white/10">
                {/* Tabs */}
                <div className="flex border-b border-slate-100 dark:border-white/10">
                  {LEADERBOARD_TABS.map(tab => (
                    <button key={tab.id} onClick={() => setLbTab(tab.id)}
                      className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all
                        ${lbTab === tab.id 
                          ? 'bg-indigo-600/10 dark:bg-indigo-600/40 text-indigo-600 dark:text-white border-b-2 border-indigo-500 dark:border-indigo-400' 
                          : 'text-slate-400 dark:text-white/40 hover:text-slate-600 dark:hover:text-white/70 hover:bg-slate-50 dark:hover:bg-white/5'}`}>
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="p-5">
                  <div className="space-y-1.5">
                    {lbLoading ? (
                      Array(4).fill(0).map((_, i) => (
                        <div key={i} className="flex items-center gap-3 px-2 py-2.5 rounded-xl animate-pulse">
                          <div className="w-6 h-6 bg-slate-100 dark:bg-white/10 rounded-lg"></div>
                          <div className="flex-1 h-3 bg-slate-200/60 dark:bg-white/10 rounded-full"></div>
                          <div className="w-10 h-3 bg-slate-200/60 dark:bg-white/10 rounded-full"></div>
                        </div>
                      ))
                    ) : leaderboard.length === 0 ? (
                      <p className="text-center text-slate-400 dark:text-white/30 text-xs py-4">Chưa có dữ liệu</p>
                    ) : (
                      leaderboard.map((u, i) => {
                        const medals = ['🥇', '🥈', '🥉'];
                        return (
                          <div key={i} className="flex items-center justify-between px-2 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
                            <div className="flex items-center gap-2.5">
                              <span className="text-base w-5 text-center">{medals[i] || `${i + 1}`}</span>
                              <p className="text-sm font-bold truncate max-w-[100px] text-slate-700 dark:text-slate-200">{u.username}</p>
                            </div>
                            <p className="font-black text-xs text-indigo-600 dark:text-indigo-400 shrink-0">
                              {u.score} <span className="text-slate-400 dark:text-white/30 font-medium">{lbScoreLabel[lbTab]}</span>
                            </p>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

              {/* TIPS */}
              <div className="bg-gradient-to-br from-[var(--theme-primary)] to-[var(--theme-primary-dark)] rounded-[24px] p-5 text-white shadow-lg relative overflow-hidden group glow-hover transition-all">
                <Sparkles className="absolute -bottom-2 -right-2 w-16 h-16 text-white/10 group-hover:rotate-12 transition-transform duration-700" />
                <div className="text-2xl mb-3">💡</div>
                <h3 className="font-black text-sm mb-1.5">Mẹo của ngày</h3>
                <p className="text-indigo-100 text-xs leading-relaxed opacity-90">
                  Làm lại đề sai giúp ghi nhớ lâu hơn <strong>40%</strong>. Hãy review lịch sử định kỳ!
                </p>
                <button onClick={() => navigate('/history')} className="mt-3 text-[10px] font-black text-white/70 hover:text-white underline underline-offset-2 transition-colors">
                  Xem lịch sử làm bài →
                </button>
              </div>

              {/* QUICK ACTIONS */}
              <div className="glass-card rounded-[24px] p-5 glow-hover transition-all">
                <h3 className="font-black text-slate-600 dark:text-slate-400 text-[10px] uppercase tracking-widest mb-3">Thao tác nhanh</h3>
                <div className="space-y-1.5">
                  {[
                    { icon: '✏️', label: 'Tạo đề thi mới', action: () => navigate('/create-quiz'), color: 'hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-700 dark:hover:text-indigo-400' },
                    { icon: '📚', label: 'Kho đề thi', action: () => navigate('/explore'), color: 'hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-700 dark:hover:text-emerald-400' },
                    { icon: '📋', label: 'Lịch sử thi', action: () => navigate('/history'), color: 'hover:bg-amber-50 dark:hover:bg-amber-900/30 hover:text-amber-700 dark:hover:text-amber-400' },
                  ].map((item, i) => (
                    <button key={i} onClick={item.action} className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-slate-600 dark:text-slate-300 text-xs font-bold transition-all duration-200 ${item.color}`}>
                      <span className="text-base">{item.icon}</span> {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;