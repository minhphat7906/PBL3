import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Beaker, BookOpen, PlayCircle, Heart, Star, MessageSquare, 
  Plus, Edit, Trash2, Loader2, Sparkles, AlertCircle, Eye,
  LayoutGrid, TableProperties, ChevronLeft, ChevronRight
} from 'lucide-react';
import axios from 'axios';
import Swal from 'sweetalert2';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import QuizDetailModal from '../components/QuizDetailModal';

const API_BASE = 'http://localhost:3000/api/v1';

const PersonalLab = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // View Toggle: 'grid' (Dạng Thẻ) vs 'table' (Dạng Bảng)
  const [viewMode, setViewMode] = useState('table'); // Default to table for optimized high-volume management
  
  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // Page size option: 10, 20, 50, 100

  // Quiz Detail Modal States
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  // Axios helper
  const authAxios = () => {
    const token = localStorage.getItem('token');
    return axios.create({ headers: { Authorization: `Bearer ${token}` } });
  };

  // Fetch user's quizzes
  const fetchMyQuizzes = async () => {
    setIsLoading(true);
    try {
      const res = await authAxios().get(`${API_BASE}/quizzes/my-quizzes`);
      if (res.data.success) {
        setQuizzes(res.data.quizzes || []);
      }
    } catch (err) {
      console.error('Lỗi khi tải phòng lab:', err);
      Swal.fire({
        title: 'Thất bại',
        text: 'Không thể tải danh sách đề thi của bạn.',
        icon: 'error',
        confirmButtonColor: '#4f46e5'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyQuizzes();
  }, []);

  // Reset page number on search query change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, itemsPerPage]);

  // Filter quizzes by search term
  const filteredQuizzes = useMemo(() => {
    return quizzes.filter(q => 
      q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (q.description && q.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [quizzes, searchTerm]);

  // Compute stats across all quizzes
  const stats = useMemo(() => {
    const totalCreated = quizzes.length;
    const totalAttempts = quizzes.reduce((sum, q) => sum + (Number(q.total_attempts) || 0), 0);
    const totalLikes = quizzes.reduce((sum, q) => sum + (Number(q.total_likes) || 0), 0);
    
    // Average rating of quizzes that have reviews
    const quizzesWithReviews = quizzes.filter(q => Number(q.total_reviews) > 0);
    const avgRating = quizzesWithReviews.length > 0
      ? quizzesWithReviews.reduce((sum, q) => sum + (Number(q.average_rating) || 0), 0) / quizzesWithReviews.length
      : 0;

    return { totalCreated, totalAttempts, totalLikes, avgRating };
  }, [quizzes]);

  // Paginated quizzes
  const paginatedQuizzes = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredQuizzes.slice(start, end);
  }, [filteredQuizzes, currentPage, itemsPerPage]);

  // Total pages count
  const totalPages = useMemo(() => {
    return Math.ceil(filteredQuizzes.length / itemsPerPage) || 1;
  }, [filteredQuizzes, itemsPerPage]);

  // Handle Delete Quiz
  const handleDeleteQuiz = (id, title) => {
    Swal.fire({
      title: 'Xóa đề thi vĩnh viễn?',
      text: `Hành động này sẽ xóa đề "${title}" và toàn bộ lịch sử làm bài liên quan. Bạn không thể hoàn tác!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Đồng ý xóa',
      cancelButtonText: 'Hủy bỏ',
      background: document.documentElement.classList.contains('dark') ? '#171527' : '#ffffff',
      color: document.documentElement.classList.contains('dark') ? '#f1f5f9' : '#1e293b'
    }).then(async (result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Đang xóa đề thi...',
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading()
        });
        try {
          const res = await authAxios().delete(`${API_BASE}/quizzes/${id}`);
          if (res.data.success) {
            Swal.fire({
              toast: true,
              position: 'top-end',
              icon: 'success',
              title: 'Đã xóa đề thi thành công!',
              showConfirmButton: false,
              timer: 2000
            });
            fetchMyQuizzes();
          }
        } catch (err) {
          console.error(err);
          Swal.fire('Lỗi', 'Không thể xóa đề thi lúc này. Vui lòng thử lại sau!', 'error');
        }
      }
    });
  };

  // Get difficulty styles
  const getDifficultyBadge = (diff) => {
    switch (diff) {
      case 'Dễ':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40';
      case 'Khó':
        return 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40';
      default:
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40';
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f8f9fc] dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-200 transition-colors duration-300">
      
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Persistent fixed top header */}
      <Header />

      {/* MAIN CONTAINER */}
      <main className="flex-1 ml-64 p-8 pt-28 overflow-x-hidden">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* BANNER / PAGE TITLE */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200/60 dark:border-slate-800/60">
            <div>
              <h1 className="text-3xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-3">
                <div className="p-2.5 bg-violet-100 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 rounded-2xl border border-violet-200 dark:border-violet-850 shadow-inner">
                  <Beaker size={28} className="animate-pulse" />
                </div>
                Phòng Lab Cá Nhân
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm font-bold">
                Quản lý các bộ đề thi tự tạo, theo dõi lượng tương tác và số liệu đo đạc thực tế của học sinh.
              </p>
            </div>
            
            {/* Quick action buttons */}
            <div className="flex items-center gap-3 shrink-0">
              <button 
                onClick={() => navigate('/create-quiz', { state: { defaultTab: 'ai' } })}
                className="flex items-center gap-2 bg-gradient-to-r from-fuchsia-500 to-pink-500 hover:from-fuchsia-600 hover:to-pink-600 text-white font-black text-xs uppercase tracking-wider px-5 py-3 rounded-2xl shadow-lg shadow-pink-500/20 hover:shadow-pink-500/30 transition-all hover:scale-105"
              >
                <Sparkles size={16} /> Tạo bằng AI
              </button>
              <button 
                onClick={() => navigate('/create-quiz')}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider px-5 py-3 rounded-2xl shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all hover:scale-105 border border-indigo-500/20"
              >
                <Plus size={16} /> Tạo Đề Thủ Công
              </button>
            </div>
          </div>

          {/* COMBINED STATISTICS CARDS */}
          {!isLoading && quizzes.length > 0 && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Đề Đã Nghiên Cứu', value: stats.totalCreated, desc: 'Tổng số đề thi bạn tự tạo', color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900/30', icon: BookOpen },
                { label: 'Lượt Làm Bài', value: stats.totalAttempts, desc: 'Tổng số lượt thi trên đề của bạn', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30', icon: PlayCircle },
                { label: 'Lượt Yêu Thích', value: stats.totalLikes, desc: 'Lượt thả tim nhận được', color: 'text-rose-500 dark:text-rose-455', bg: 'bg-rose-50 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/30', icon: Heart },
                { label: 'Đánh Giá Sao TB', value: stats.avgRating > 0 ? `${stats.avgRating.toFixed(1)} ★` : 'Chưa có', desc: 'Độ hài lòng trung bình', color: 'text-amber-500 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/30', icon: Star }
              ].map((card, i) => {
                const Icon = card.icon;
                return (
                  <div key={i} className={`p-5 rounded-3xl border shadow-sm ${card.bg} flex flex-col justify-between transition-all hover:-translate-y-1`}>
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] uppercase tracking-widest font-black text-slate-400 dark:text-slate-500 leading-none">
                        {card.label}
                      </span>
                      <Icon className={`${card.color} opacity-80`} size={20} />
                    </div>
                    <div className="mt-3">
                      <p className={`text-2xl font-black ${card.color} leading-none`}>{card.value}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold mt-1.5">{card.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* CONTROLS HEADER (SEARCH + VIEW MODE TOGGLE + PAGE SIZE SELECTOR) */}
          {!isLoading && quizzes.length > 0 && (
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm transition-colors">
              
              {/* Search */}
              <div className="relative flex-1 group">
                <input 
                  type="text" 
                  placeholder="Tìm kiếm nhanh theo tên đề hoặc mô tả..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-[#f8f9fc] dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-violet-500/10 focus:border-violet-500 transition-all font-bold text-sm text-slate-800 dark:text-slate-105"
                />
                <Beaker className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-500 transition-colors" size={18} />
              </div>

              {/* View toggle and items size */}
              <div className="flex items-center justify-between sm:justify-start gap-4">
                
                {/* Items Per Page Selector */}
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Số hàng:</label>
                  <select 
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="bg-[#f8f9fc] dark:bg-slate-800 border border-slate-250 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 outline-none cursor-pointer"
                  >
                    <option value={10}>10 dòng</option>
                    <option value={20}>20 dòng</option>
                    <option value={50}>50 dòng</option>
                    <option value={100}>100 dòng</option>
                  </select>
                </div>

                {/* Vertical Separator */}
                <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

                {/* Grid vs Table View Mode Selector */}
                <div className="bg-slate-50 dark:bg-slate-800/60 p-1.5 rounded-2xl flex items-center border border-slate-200/50 dark:border-slate-850">
                  <button
                    onClick={() => setViewMode('table')}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                      viewMode === 'table'
                        ? 'bg-white dark:bg-slate-900 text-violet-600 dark:text-violet-400 shadow-sm border border-slate-200/40 dark:border-slate-800/40'
                        : 'text-slate-450 hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
                    title="Dạng bảng tối ưu"
                  >
                    <TableProperties size={15} />
                    <span>Dạng Bảng</span>
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                      viewMode === 'grid'
                        ? 'bg-white dark:bg-slate-900 text-violet-600 dark:text-violet-400 shadow-sm border border-slate-200/40 dark:border-slate-800/40'
                        : 'text-slate-450 hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
                    title="Dạng thẻ trực quan"
                  >
                    <LayoutGrid size={15} />
                    <span>Dạng Thẻ</span>
                  </button>
                </div>

              </div>

            </div>
          )}

          {/* LOADER */}
          {isLoading ? (
            <div className="py-24 flex flex-col items-center justify-center text-violet-600 dark:text-violet-400 gap-3">
              <Loader2 className="w-12 h-12 animate-spin" />
              <p className="text-sm font-black uppercase tracking-wider">Đang phân tích cấu trúc phòng Lab...</p>
            </div>
          ) : quizzes.length === 0 ? (
            
            /* GORGEOUS EMPTY STATE */
            <div className="py-20 px-8 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl text-center max-w-xl mx-auto shadow-sm transition-colors">
              <div className="w-20 h-20 bg-violet-50 dark:bg-violet-950/30 text-violet-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-violet-100 dark:border-violet-900 shadow-inner">
                <Beaker size={38} className="animate-bounce" />
              </div>
              <h3 className="text-xl font-black text-slate-800 dark:text-slate-155 mb-2">
                Phòng Lab đang trống!
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-8 font-bold">
                Bạn chưa chế tạo đề thi cá nhân nào. Hãy bắt đầu xây dựng bộ câu hỏi học thuật đầu tiên của bạn để chia sẻ hoặc luyện tập cá nhân!
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button 
                  onClick={() => navigate('/create-quiz')}
                  className="w-full sm:w-auto px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-violet-600/10 transition-all flex items-center justify-center gap-2"
                >
                  <Plus size={16} /> Tạo đề thủ công
                </button>
                <button 
                  onClick={() => navigate('/create-quiz', { state: { defaultTab: 'ai' } })}
                  className="w-full sm:w-auto px-6 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-black text-xs uppercase tracking-wider rounded-2xl transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles size={16} className="text-pink-500" /> Tạo nhanh bằng AI
                </button>
              </div>
            </div>

          ) : filteredQuizzes.length === 0 ? (
            
            /* FILTER EMPTY STATE */
            <div className="py-16 text-center bg-white dark:bg-slate-900 border rounded-3xl p-8">
              <AlertCircle className="w-12 h-12 text-slate-305 dark:text-slate-700 mx-auto mb-4" />
              <p className="text-slate-500 dark:text-slate-400 font-bold">Không tìm thấy đề thi cá nhân nào phù hợp với từ khóa tìm kiếm.</p>
            </div>

          ) : (
            
            /* MAIN DISPLAY DATA CONTAINER */
            <div className="space-y-6">
              
              {/* ────────────────── 1. COMPACT TABLE VIEW ────────────────── */}
              {viewMode === 'table' ? (
                <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl overflow-hidden shadow-sm transition-colors">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-850/50">
                          <th className="px-6 py-4.5 text-[10px] uppercase tracking-widest font-black text-slate-400 dark:text-slate-500">Mã Đề</th>
                          <th className="px-6 py-4.5 text-[10px] uppercase tracking-widest font-black text-slate-400 dark:text-slate-500">Tên Đề Thi & Danh Mục</th>
                          <th className="px-6 py-4.5 text-[10px] uppercase tracking-widest font-black text-slate-400 dark:text-slate-500 text-center">Độ Khó</th>
                          <th className="px-6 py-4.5 text-[10px] uppercase tracking-widest font-black text-slate-400 dark:text-slate-500 text-center">Chế Độ</th>
                          <th className="px-6 py-4.5 text-[10px] uppercase tracking-widest font-black text-slate-400 dark:text-slate-500 text-center">Số Câu</th>
                          <th className="px-6 py-4.5 text-[10px] uppercase tracking-widest font-black text-slate-400 dark:text-slate-500 text-center">Thống Kê Tương Tác</th>
                          <th className="px-6 py-4.5 text-[10px] uppercase tracking-widest font-black text-slate-400 dark:text-slate-500 text-right pr-8">Thao Tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-850/60">
                        {paginatedQuizzes.map((quiz) => (
                          <tr 
                            key={quiz.id} 
                            className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all group"
                          >
                            {/* Quiz ID */}
                            <td className="px-6 py-4 text-xs font-black text-slate-400 dark:text-slate-500">
                              #{quiz.id}
                            </td>

                            {/* Cover, Title, and Category */}
                            <td className="px-6 py-4 min-w-[280px]">
                              <div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-950 shrink-0 border border-slate-200/40 dark:border-slate-800/40">
                                  <img 
                                    src={quiz.image_url || 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&q=80&fit=crop'} 
                                    alt={quiz.title} 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&q=80&fit=crop'; }}
                                  />
                                </div>
                                <div className="overflow-hidden">
                                  <p className="font-bold text-sm text-slate-800 dark:text-slate-200 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors truncate">
                                    {quiz.title}
                                  </p>
                                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 block mt-0.5">
                                    {quiz.category_name || quiz.category || 'Chung'}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* Difficulty */}
                            <td className="px-6 py-4 text-center">
                              <span className={`inline-flex px-2.5 py-1 text-[10px] font-black rounded-full leading-none shadow-inner ${getDifficultyBadge(quiz.difficulty)}`}>
                                {quiz.difficulty}
                              </span>
                            </td>

                            {/* Privacy Mode */}
                            <td className="px-6 py-4 text-center">
                              <span className={`inline-flex px-2.5 py-1 text-[10px] font-black rounded-full leading-none border ${
                                quiz.is_public === 1 || quiz.is_public === true
                                  ? 'bg-indigo-50 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900/30 text-indigo-750 dark:text-indigo-400'
                                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'
                              }`}>
                                {quiz.is_public === 1 || quiz.is_public === true ? 'Công khai' : 'Riêng tư'}
                              </span>
                            </td>

                            {/* Question Count */}
                            <td className="px-6 py-4 text-center text-xs font-black text-slate-700 dark:text-slate-300">
                              {quiz.total_questions || 0} câu
                            </td>

                            {/* Aggregate interactive stats */}
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-center gap-4 text-xs font-bold text-slate-500 dark:text-slate-400">
                                <div className="flex items-center gap-1" title={`${quiz.total_attempts || 0} lượt hoàn thành`}>
                                  <PlayCircle size={15} className="text-emerald-500 shrink-0" />
                                  <span className="text-slate-800 dark:text-slate-250 font-black">{quiz.total_attempts || 0}</span>
                                </div>
                                <div className="flex items-center gap-1" title={`${quiz.total_likes || 0} lượt yêu thích`}>
                                  <Heart size={15} className="text-rose-500 shrink-0 fill-rose-500/10" />
                                  <span className="text-slate-800 dark:text-slate-250 font-black">{quiz.total_likes || 0}</span>
                                </div>
                                <div className="flex items-center gap-1" title={`${quiz.total_reviews || 0} đánh giá`}>
                                  <MessageSquare size={15} className="text-indigo-500 shrink-0" />
                                  <span className="text-slate-800 dark:text-slate-250 font-black">{quiz.total_reviews || 0}</span>
                                </div>
                                <div className="flex items-center gap-1" title={`${Number(quiz.average_rating || 0).toFixed(1)} điểm sao`}>
                                  <Star size={15} className="text-amber-500 shrink-0 fill-amber-500/10" />
                                  <span className="text-slate-800 dark:text-slate-250 font-black">{Number(quiz.average_rating || 0).toFixed(1)}</span>
                                </div>
                              </div>
                            </td>

                            {/* Table compact controls */}
                            <td className="px-6 py-4 text-right pr-8">
                              <div className="flex items-center justify-end gap-2.5">
                                <button
                                  onClick={() => {
                                    setSelectedQuiz(quiz);
                                    setShowDetailModal(true);
                                  }}
                                  className="p-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-lg border border-slate-200/60 dark:border-slate-700 transition-all cursor-pointer"
                                  title="Xem trước đề"
                                >
                                  <Eye size={14} />
                                </button>
                                <button
                                  onClick={() => navigate(`/edit-quiz/${quiz.id}`)}
                                  className="p-2 bg-amber-50 dark:bg-amber-950/20 hover:bg-amber-100 dark:hover:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-lg border border-amber-250/30 dark:border-amber-900/30 transition-all cursor-pointer"
                                  title="Sửa đề thi"
                                >
                                  <Edit size={14} />
                                </button>
                                <button
                                  onClick={() => handleDeleteQuiz(quiz.id, quiz.title)}
                                  className="p-2 bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-100 dark:hover:bg-rose-950/40 text-rose-500 dark:text-rose-400 rounded-lg border border-rose-250/30 dark:border-rose-900/30 transition-all cursor-pointer"
                                  title="Xóa đề thi"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>

                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                
                /* ────────────────── 2. CARD GRID VIEW ────────────────── */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedQuizzes.map((quiz) => (
                    <div 
                      key={quiz.id}
                      className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl shadow-sm hover:shadow-md hover:border-violet-500/30 dark:hover:border-violet-500/20 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden group"
                    >
                      <div>
                        {/* Image banner */}
                        <div className="relative h-44 overflow-hidden bg-slate-100 dark:bg-slate-950">
                          <img 
                            src={quiz.image_url || 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&q=80&fit=crop'} 
                            alt={quiz.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&q=80&fit=crop'; }}
                          />
                          <div className="absolute top-3 left-3 flex gap-2">
                            <span className="px-3 py-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/50 text-[10px] font-black rounded-full text-slate-600 dark:text-slate-350 shadow-sm leading-none flex items-center">
                              {quiz.category_name || quiz.category || 'Chung'}
                            </span>
                            <span className={`px-3 py-1 border text-[10px] font-black rounded-full leading-none flex items-center shadow-sm ${getDifficultyBadge(quiz.difficulty)}`}>
                              {quiz.difficulty}
                            </span>
                          </div>
                          
                          <div className="absolute top-3 right-3">
                            <span className={`px-3 py-1 border text-[10px] font-black rounded-full leading-none flex items-center shadow-sm ${
                              quiz.is_public === 1 || quiz.is_public === true
                                ? 'bg-indigo-50/90 dark:bg-indigo-950/70 border-indigo-200 dark:border-indigo-900/30 text-indigo-750 dark:text-indigo-400'
                                : 'bg-slate-50/90 dark:bg-slate-900/90 border-slate-200 dark:border-slate-850 text-slate-500 dark:text-slate-400'
                            }`}>
                              {quiz.is_public === 1 || quiz.is_public === true ? 'Công khai' : 'Riêng tư'}
                            </span>
                          </div>
                        </div>

                        {/* Content text */}
                        <div className="p-6 space-y-4">
                          <div className="space-y-1">
                            <h3 className="font-black text-slate-800 dark:text-slate-150 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors text-base line-clamp-1 leading-snug">
                              {quiz.title}
                            </h3>
                            <p className="text-xs text-slate-400 dark:text-slate-500 font-bold line-clamp-2 leading-relaxed">
                              {quiz.description || 'Chưa cấu hình mô tả chi tiết cho đề thi này.'}
                            </p>
                          </div>

                          {/* Stats details grid */}
                          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-650 dark:text-slate-400">
                              <PlayCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                              <span>Lượt làm: <strong className="text-slate-800 dark:text-slate-200">{quiz.total_attempts || 0}</strong></span>
                            </div>
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-650 dark:text-slate-400">
                              <Heart className="w-4 h-4 text-rose-500 shrink-0 fill-rose-500/20" />
                              <span>Lượt tim: <strong className="text-slate-800 dark:text-slate-200">{quiz.total_likes || 0}</strong></span>
                            </div>
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-650 dark:text-slate-400">
                              <MessageSquare className="w-4 h-4 text-indigo-500 shrink-0" />
                              <span>Đánh giá: <strong className="text-slate-800 dark:text-slate-200">{quiz.total_reviews || 0}</strong></span>
                            </div>
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-650 dark:text-slate-400">
                              <Star className="w-4 h-4 text-amber-500 shrink-0 fill-amber-500/20" />
                              <span>Điểm sao: <strong className="text-slate-800 dark:text-slate-200">{Number(quiz.average_rating || 0).toFixed(1)}</strong></span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Controls Footer */}
                      <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-850 flex items-center justify-between gap-3 shrink-0">
                        <button
                          onClick={() => {
                            setSelectedQuiz(quiz);
                            setShowDetailModal(true);
                          }}
                          className="p-2.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-550 dark:text-slate-450 rounded-xl border border-slate-200 dark:border-slate-750 transition-all cursor-pointer"
                          title="Xem trước đề"
                        >
                          <Eye size={16} />
                        </button>
                        <div className="flex items-center gap-2 flex-1 justify-end">
                          <button
                            onClick={() => navigate(`/edit-quiz/${quiz.id}`)}
                            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/20 dark:hover:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200/50 dark:border-amber-900/30 font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex-1"
                          >
                            <Edit size={13} /> Sửa
                          </button>
                          <button
                            onClick={() => handleDeleteQuiz(quiz.id, quiz.title)}
                            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 text-rose-500 dark:text-rose-455 border border-rose-200/50 dark:border-rose-900/30 font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex-1"
                          >
                            <Trash2 size={13} /> Xóa
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ────────────────── 3. CLIENT-SIDE PAGINATION CONTROLS ────────────────── */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl shadow-sm transition-colors mt-4">
                  <span className="text-xs font-bold text-slate-450 dark:text-slate-500">
                    Hiển thị từ <strong className="text-slate-700 dark:text-slate-350">{(currentPage - 1) * itemsPerPage + 1}</strong> đến <strong className="text-slate-700 dark:text-slate-350">{Math.min(currentPage * itemsPerPage, filteredQuizzes.length)}</strong> trong tổng số <strong className="text-slate-700 dark:text-slate-350">{filteredQuizzes.length}</strong> đề thi
                  </span>

                  <div className="flex items-center gap-1.5">
                    {/* Previous Button */}
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="p-2 bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl border border-slate-200/40 dark:border-slate-750/30 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
                    >
                      <ChevronLeft size={16} />
                    </button>

                    {/* Page Numbers */}
                    {Array.from({ length: totalPages }).map((_, idx) => {
                      const pageNum = idx + 1;
                      // Display logic: show current, first, last, and immediate neighbors
                      if (
                        pageNum === 1 || 
                        pageNum === totalPages || 
                        Math.abs(pageNum - currentPage) <= 1
                      ) {
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`w-9 h-9 flex items-center justify-center rounded-xl text-xs font-black transition-all cursor-pointer border ${
                              currentPage === pageNum
                                ? 'bg-violet-600 text-white border-violet-650 shadow-md shadow-violet-500/20'
                                : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200/40 dark:border-slate-750/30'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      } else if (
                        pageNum === 2 || 
                        pageNum === totalPages - 1
                      ) {
                        return (
                          <span key={pageNum} className="text-slate-400 dark:text-slate-600 px-1 font-bold text-xs">...</span>
                        );
                      }
                      return null;
                    })}

                    {/* Next Button */}
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="p-2 bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl border border-slate-200/40 dark:border-slate-750/30 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>
      </main>

      {/* RENDER DETAILED QUIZ MODAL */}
      {showDetailModal && selectedQuiz && (
        <QuizDetailModal 
          quiz={selectedQuiz} 
          onClose={() => {
            setShowDetailModal(false);
            setSelectedQuiz(null);
          }} 
        />
      )}
    </div>
  );
};

export default PersonalLab;
