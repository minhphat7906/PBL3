import React, { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import {
  BookOpen, Clock, Search, Trophy, ArrowRight,
  TrendingUp, X, CheckCircle2, RefreshCw, ChevronDown, SlidersHorizontal,
  Layers, Filter, ArrowUpDown, RotateCcw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import RatingModal from '../components/RatingModal';
import { Star } from 'lucide-react';

// ─── Component Dropdown tuỳ chỉnh ──────────────────────────────────────────────
const CustomDropdown = ({ value, onChange, options, placeholder, icon: Icon }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const selected = options.find(o => o.value === value);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm rounded-xl px-4 py-2.5 font-semibold outline-none hover:border-indigo-400 dark:hover:border-indigo-500 transition-all shadow-sm whitespace-nowrap"
      >
        {Icon && <Icon size={15} className="text-slate-400 dark:text-slate-500" />}
        <span>{selected?.label || placeholder}</span>
        <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute top-[calc(100%+6px)] left-0 min-w-[180px] bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-xl z-50 py-1.5 animate-in fade-in zoom-in-95 duration-150">
          {options.map(opt => (
            <div
              key={opt.value}
              onClick={() => { onChange(opt.value); setIsOpen(false); }}
              className={`px-4 py-2.5 text-sm font-medium cursor-pointer transition-colors ${
                value === opt.value
                  ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
              }`}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Score Badge ────────────────────────────────────────────────────────────────
const getScoreStyle = (score) => {
  if (score >= 80) return { bg: 'from-emerald-500 to-teal-500', text: 'Xuất sắc', dot: 'bg-emerald-400' };
  if (score >= 60) return { bg: 'from-indigo-500 to-purple-500', text: 'Khá',     dot: 'bg-indigo-400' };
  if (score >= 40) return { bg: 'from-amber-400 to-orange-500', text: 'TB',       dot: 'bg-amber-400' };
  return              { bg: 'from-rose-500 to-red-500',        text: 'Yếu',       dot: 'bg-rose-400' };
};

// ─── History Card ────────────────────────────────────────────────────────────────
const HistoryCard = ({ quiz, onClick }) => {
  const style = getScoreStyle(quiz.best_score);
  const latestDate = quiz.attempts_list?.[0]?.completed_at
    ? new Date(quiz.attempts_list[0].completed_at)
    : null;

  return (
    <div
      onClick={() => onClick(quiz)}
      className="group relative bg-white dark:bg-slate-800 rounded-[24px] border border-slate-200 dark:border-slate-700 overflow-hidden cursor-pointer shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1.5 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all duration-300"
    >
      {/* Cover Image */}
      <div className="relative h-40 overflow-hidden bg-slate-100 dark:bg-slate-700">
        {quiz.image_url ? (
          <img
            src={quiz.image_url}
            alt={quiz.quiz_title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={e => { e.target.style.display = 'none'; }}
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${style.bg} flex items-center justify-center`}>
            <BookOpen size={40} className="text-white/60" />
          </div>
        )}

        {/* Score Badge overlay */}
        <div className={`absolute top-3 right-3 bg-gradient-to-r ${style.bg} text-white text-xs font-black px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5`}>
          <Trophy size={12} fill="currentColor" />
          {quiz.best_score}%
        </div>

        {/* Attempt count */}
        <div className="absolute top-3 left-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm text-slate-700 dark:text-slate-300 text-xs font-black px-2.5 py-1 rounded-full shadow">
          {quiz.attempt_count} lượt
        </div>
      </div>

      {/* Body */}
      <div className="p-5">
        <h3 className="text-base font-black text-slate-800 dark:text-slate-100 leading-snug line-clamp-2 mb-3 min-h-[44px]">
          {quiz.quiz_title}
        </h3>

        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 size={13} className="text-emerald-500" />
            <span className="font-semibold">{quiz.total_questions} câu</span>
          </div>
          <div className="flex items-center gap-1 font-medium">
            <Clock size={12} />
            {latestDate ? latestDate.toLocaleDateString('vi-VN') : '—'}
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${style.bg} rounded-full transition-all duration-700`}
              style={{ width: `${quiz.best_score}%` }}
            />
          </div>
        </div>

        <button className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-indigo-200 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400 text-sm font-bold hover:bg-indigo-600 hover:text-white hover:border-indigo-600 dark:hover:bg-indigo-600 dark:hover:border-indigo-600 dark:hover:text-white transition-all duration-200">
          Xem lịch sử <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
};

// ─── Skeleton Card ───────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="bg-white dark:bg-slate-800 rounded-[24px] border border-slate-100 dark:border-slate-700 overflow-hidden animate-pulse">
    <div className="h-40 bg-slate-200 dark:bg-slate-700" />
    <div className="p-5 space-y-3">
      <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded-lg w-3/4" />
      <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded-lg w-1/2" />
      <div className="h-8 bg-slate-100 dark:bg-slate-700 rounded-xl mt-4" />
    </div>
  </div>
);

// ─── DANH SÁCH CATEGORY mặc định ──────────────────────────────────────────────
const DEFAULT_CATEGORIES = [
  'Toán học', 'Văn học', 'Ngoại ngữ', 'Công nghệ thông tin',
  'Lịch sử', 'Vật lý', 'Hóa học', 'Sinh học', 'Địa lý', 'Kinh tế', 'Chung',
];

// ═══════════════════════════════════════════════════════════════════════════════
const HistoryPage = () => {
  const navigate = useNavigate();
  const [groupedHistory, setGroupedHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [showRatingModal, setShowRatingModal] = useState(false);

  // ── Filter states ──────────────────────────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [scoreRange, setScoreRange] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:3000/api/v1/quizzes/history', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) setGroupedHistory(res.data.history);
    } catch (err) {
      console.error('Lỗi lấy lịch sử:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchHistory(); }, []);

  // ── Build dynamic category list from actual data ───────────────────────────
  const categoryOptions = useMemo(() => {
    // History data doesn't have category in grouped form yet; use defaults
    return [
      { value: 'all', label: 'Tất cả chủ đề' },
      ...DEFAULT_CATEGORIES.map(c => ({ value: c, label: c }))
    ];
  }, []);

  // ── Filter + Sort logic (all client-side) ──────────────────────────────────
  const filteredHistory = useMemo(() => {
    let list = [...groupedHistory];

    // 1. Tìm theo tên
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(item => item.quiz_title.toLowerCase().includes(q));
    }

    // 2. Lọc khoảng điểm (best_score là % 0-100)
    if (scoreRange !== 'all') {
      const [min, max] = scoreRange.split('-').map(Number);
      list = list.filter(item => {
        const s = item.best_score;
        return s >= min && s <= max;
      });
    }

    // 3. Sắp xếp
    list.sort((a, b) => {
      if (sortBy === 'newest') {
        const da = new Date(a.attempts_list[0]?.completed_at || 0);
        const db = new Date(b.attempts_list[0]?.completed_at || 0);
        return db - da;
      }
      if (sortBy === 'oldest') {
        const da = new Date(a.attempts_list[a.attempts_list.length - 1]?.completed_at || 0);
        const db = new Date(b.attempts_list[b.attempts_list.length - 1]?.completed_at || 0);
        return da - db;
      }
      if (sortBy === 'score_desc') return b.best_score - a.best_score;
      if (sortBy === 'score_asc') return a.best_score - b.best_score;
      return 0;
    });

    return list;
  }, [groupedHistory, searchTerm, categoryFilter, scoreRange, sortBy]);

  // ── Summary stats ──────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    if (!groupedHistory.length) return null;
    const totalAttempts = groupedHistory.reduce((s, q) => s + q.attempt_count, 0);
    const avgScore = Math.round(
      groupedHistory.reduce((s, q) => s + q.best_score, 0) / groupedHistory.length
    );
    const topQuiz = [...groupedHistory].sort((a, b) => b.best_score - a.best_score)[0];
    return { totalQuizzes: groupedHistory.length, totalAttempts, avgScore, topQuiz };
  }, [groupedHistory]);

  const hasActiveFilters = searchTerm || categoryFilter !== 'all' || scoreRange !== 'all' || sortBy !== 'newest';

  const resetFilters = () => {
    setSearchTerm('');
    setCategoryFilter('all');
    setScoreRange('all');
    setSortBy('newest');
  };

  return (
    <div className="flex min-h-screen bg-[#f8f9fc] dark:bg-slate-900 font-sans text-slate-900 dark:text-slate-200 transition-colors duration-300">

      {/* ── SIDEBAR ── */}
      <Sidebar />

      {/* ── MAIN ── */}
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-7xl mx-auto">

          {/* Header - Sticky */}
          <header className="sticky top-0 z-20 bg-[#f8f9fc]/80 dark:bg-slate-900/80 backdrop-blur-md pb-6 pt-2 -mx-2 px-2 border-b border-slate-200/50 dark:border-slate-700/50 mb-8">
            <div className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest mb-3">
              Học tập &amp; Rèn luyện
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-slate-100 leading-tight">
              Lịch sử bài làm
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-lg mt-2 font-medium">
              Theo dõi tiến trình và phân tích điểm yếu của bản thân.
            </p>
          </header>

          {/* ── MINI STATS ── */}
          {!isLoading && stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { icon: <Layers size={20} />, label: 'Đề đã làm', value: stats.totalQuizzes, color: 'from-indigo-500 to-purple-600' },
                { icon: <RefreshCw size={20} />, label: 'Tổng lượt', value: stats.totalAttempts, color: 'from-emerald-400 to-teal-500' },
                { icon: <Trophy size={20} />, label: 'Điểm TB tốt nhất', value: `${stats.avgScore}%`, color: 'from-amber-400 to-orange-500' },
                { icon: <TrendingUp size={20} />, label: 'Cao nhất', value: `${stats.topQuiz?.best_score ?? 0}%`, color: 'from-rose-400 to-pink-600' },
              ].map((s, i) => (
                <div key={i} className={`bg-gradient-to-br ${s.color} rounded-2xl p-5 text-white shadow-md`}>
                  <div className="bg-white/20 w-10 h-10 rounded-xl flex items-center justify-center mb-3">
                    {s.icon}
                  </div>
                  <div className="text-2xl font-black">{s.value}</div>
                  <div className="text-white/80 text-xs font-semibold mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* ── FILTER / SEARCH BAR ── */}
          <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-sm p-4 mb-8">
            <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center">

              {/* Search Input */}
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Tìm tên đề thi..."
                  className="w-full pl-11 pr-10 py-3 bg-[#f8f9fc] dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-indigo-500/30 focus:border-indigo-500 dark:focus:border-indigo-500 transition-all font-semibold text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Dropdowns */}
              <div className="flex flex-wrap gap-2 items-center">
                <CustomDropdown
                  value={scoreRange}
                  onChange={setScoreRange}
                  icon={Filter}
                  options={[
                    { value: 'all',    label: 'Tất cả điểm' },
                    { value: '80-100', label: '≥ 80% (Xuất sắc)' },
                    { value: '60-79',  label: '60–79% (Khá)' },
                    { value: '40-59',  label: '40–59% (Trung bình)' },
                    { value: '0-39',   label: '< 40% (Yếu)' },
                  ]}
                />
                <CustomDropdown
                  value={sortBy}
                  onChange={setSortBy}
                  icon={ArrowUpDown}
                  options={[
                    { value: 'newest',     label: 'Mới nhất' },
                    { value: 'oldest',     label: 'Cũ nhất' },
                    { value: 'score_desc', label: 'Điểm cao → thấp' },
                    { value: 'score_asc',  label: 'Điểm thấp → cao' },
                  ]}
                />

                {/* Reset nếu có filter đang active */}
                {hasActiveFilters && (
                  <button
                    onClick={resetFilters}
                    className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold text-rose-500 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-700/50 rounded-xl hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-all"
                  >
                    <RotateCcw size={14} /> Xóa lọc
                  </button>
                )}
              </div>
            </div>

            {/* Result count */}
            {!isLoading && (
              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                <SlidersHorizontal size={13} />
                Tìm thấy <span className="text-indigo-600 dark:text-indigo-400 font-black">{filteredHistory.length}</span> đề thi
                {hasActiveFilters && <span className="text-slate-400 dark:text-slate-500">· (đã lọc từ {groupedHistory.length})</span>}
              </div>
            )}
          </div>

          {/* ── CONTENT ── */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array(8).fill(0).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="text-center py-24 bg-white dark:bg-slate-800 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700">
              {groupedHistory.length === 0 ? (
                <>
                  <div className="text-7xl mb-6">🏜️</div>
                  <h3 className="text-2xl font-black text-slate-700 dark:text-slate-300 mb-2">Chưa có bài làm nào!</h3>
                  <p className="text-slate-500 dark:text-slate-400 font-medium max-w-sm mx-auto">
                    Hãy bắt đầu hành trình của bạn bằng cách thử thách bản thân với một bộ đề thi mới.
                  </p>
                  <button
                    onClick={() => navigate('/explore')}
                    className="mt-8 px-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl shadow-xl shadow-indigo-200 dark:shadow-indigo-900/30 transition-all flex items-center gap-3 mx-auto"
                  >
                    <TrendingUp size={20} /> KHÁM PHÁ KHO ĐỀ NGAY
                  </button>
                </>
              ) : (
                <>
                  <div className="text-7xl mb-6">🔍</div>
                  <h3 className="text-xl font-black text-slate-700 dark:text-slate-300 mb-2">Không tìm thấy kết quả</h3>
                  <p className="text-slate-500 dark:text-slate-400 font-medium max-w-xs mx-auto">
                    Thử điều chỉnh từ khoá tìm kiếm hoặc bộ lọc khác.
                  </p>
                  <button
                    onClick={resetFilters}
                    className="mt-6 px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl transition-all flex items-center gap-2 mx-auto"
                  >
                    <RotateCcw size={16} /> Xóa tất cả bộ lọc
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredHistory.map(quiz => (
                <HistoryCard
                  key={quiz.quiz_id}
                  quiz={quiz}
                  onClick={setSelectedQuiz}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* ── DRAWER: Timeline ── */}
      {selectedQuiz && (
        <div className="fixed inset-0 z-[100] flex items-center justify-end">
          <div
            className="absolute inset-0 bg-slate-900/40 dark:bg-slate-900/70 backdrop-blur-sm"
            onClick={() => setSelectedQuiz(null)}
          />
          <div className="relative w-full max-w-md h-full bg-white dark:bg-slate-800 shadow-[-20px_0_60px_rgba(30,27,75,0.15)] flex flex-col animate-slide-in">

            {/* Drawer header */}
            <div className="p-7 border-b border-slate-100 dark:border-slate-700 flex items-start justify-between sticky top-0 bg-white dark:bg-slate-800 z-10">
              <div className="flex-1 pr-4">
                <div className={`inline-flex items-center gap-1.5 text-xs font-black px-2.5 py-1 rounded-full mb-2 bg-gradient-to-r ${getScoreStyle(selectedQuiz.best_score).bg} text-white`}>
                  <Trophy size={11} fill="currentColor" /> Best: {selectedQuiz.best_score}%
                </div>
                <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 leading-snug line-clamp-2">
                  {selectedQuiz.quiz_title}
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium">
                  {selectedQuiz.attempt_count} lần thực hiện
                </p>
              </div>
              <button
                onClick={() => setSelectedQuiz(null)}
                className="p-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-500 dark:text-slate-400 rounded-full transition-colors flex-shrink-0"
              >
                <X size={20} />
              </button>
            </div>

            {/* Timeline */}
            <div className="flex-1 overflow-y-auto p-7 bg-slate-50/30 dark:bg-slate-900/40">
              <div className="relative space-y-5 before:absolute before:left-5 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-200 dark:before:bg-slate-700 before:rounded-full">
                {selectedQuiz.attempts_list.map((attempt, idx) => {
                  const s = attempt.total_points;
                  const scoreColor = s >= 80 ? 'text-emerald-600 dark:text-emerald-400' : s >= 50 ? 'text-amber-500 dark:text-amber-400' : 'text-rose-500 dark:text-rose-400';
                  return (
                    <div key={attempt.id} className="relative pl-12 group">
                      <div className={`absolute left-3.5 top-3 w-3.5 h-3.5 rounded-full border-4 border-white dark:border-slate-800 shadow z-10 transition-all ${idx === 0 ? 'bg-indigo-600 scale-125' : 'bg-slate-300 dark:bg-slate-600 group-hover:bg-indigo-400'}`} />

                      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-700 dark:hover:bg-slate-700/50 transition-all">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wide bg-slate-50 dark:bg-slate-700 px-2.5 py-1 rounded-lg">
                            #{selectedQuiz.attempt_count - idx} · {new Date(attempt.completed_at).toLocaleDateString('vi-VN')}
                          </span>
                          <span className={`font-black text-xl ${scoreColor}`}>
                            {(attempt.total_points / 10).toFixed(1)} / 10
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
                            <span className="flex items-center gap-1"><CheckCircle2 size={13} className="text-emerald-500" /> {attempt.correct_answers} đúng</span>
                            <span className="flex items-center gap-1"><X size={13} className="text-rose-400" /> {attempt.wrong_answers} sai</span>
                          </div>
                          <button
                            onClick={() => navigate(`/result/${attempt.id}`)}
                            className="text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:underline flex items-center gap-1"
                          >
                            Chi tiết <ArrowRight size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CTA */}
            <div className="p-6 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 flex gap-3">
              <button
                onClick={() => setShowRatingModal(true)}
                className="flex-1 py-4 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 font-black text-sm rounded-2xl border border-amber-200 dark:border-amber-800/50 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-all flex items-center justify-center gap-2"
              >
                <Star size={18} fill="currentColor" /> ĐÁNH GIÁ
              </button>
              <button
                onClick={() => navigate(`/play/${selectedQuiz.quiz_id}`)}
                className="flex-[2] py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-black text-base rounded-2xl shadow-xl shadow-indigo-500/20 transition-all flex items-center justify-center gap-3"
              >
                <RefreshCw size={18} /> LÀM LẠI ĐỀ NÀY
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rating Modal */}
      {showRatingModal && selectedQuiz && (
          <RatingModal 
              quizId={selectedQuiz.quiz_id}
              quizTitle={selectedQuiz.title}
              onClose={() => setShowRatingModal(false)}
          />
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slide-in {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        .animate-slide-in { animation: slide-in 0.35s cubic-bezier(0.16, 1, 0.3, 1); }
      ` }} />
    </div>
  );
};

export default HistoryPage;
