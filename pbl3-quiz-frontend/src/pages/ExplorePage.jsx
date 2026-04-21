import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { BookOpen, Search, Heart, User, Database, Users, List, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import QuizDetailModal from '../components/QuizDetailModal';
import PreviewModal from '../components/PreviewModal';
import LightQuizCard from '../components/LightQuizCard';
import Sidebar from '../components/Sidebar';

const CustomDropdown = ({ value, onChange, options, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value) || options[0];

  return (
    <div className="relative w-full sm:w-auto" ref={containerRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full sm:w-auto flex items-center justify-between gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm rounded-xl pl-4 pr-3 py-2.5 font-bold outline-none hover:border-indigo-400 dark:hover:border-indigo-500 transition-all shadow-sm"
      >
        <span>{selectedOption ? selectedOption.label : placeholder}</span>
        <svg className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
      </button>

      {isOpen && (
        <div className="absolute top-[calc(100%+8px)] left-0 w-full sm:min-w-[180px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-xl z-30 py-2 animate-in fade-in zoom-in-95 duration-200">
          {options.map((opt) => (
            <div 
              key={opt.value}
              onClick={() => { onChange(opt.value); setIsOpen(false); }}
              className={`px-4 py-2.5 text-sm font-bold cursor-pointer transition-colors ${value === opt.value ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ExplorePage = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [stats, setStats] = useState({ totalQuizzes: 0, totalCategories: 0, totalAuthors: 0 });
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [previewQuizId, setPreviewQuizId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [categoryList, setCategoryList] = useState([]);

  const DEFAULT_CATEGORIES = [
    'Toán học', 'Văn học', 'Ngoại ngữ', 'Công nghệ thông tin', 
    'Lịch sử', 'Vật lý', 'Hóa học', 'Sinh học', 'Địa lý', 'Giáo dục công dân', 'Kinh tế', 'Chung'
  ];

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:3000/api/v1/quizzes/categories', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        const dbCatNames = res.data.categories.map(c => c.name);
        const merged = [...new Set([...dbCatNames, ...DEFAULT_CATEGORIES])];
        setCategoryList(merged.map(name => ({ value: name, label: name })));
      } else {
        setCategoryList(DEFAULT_CATEGORIES.map(name => ({ value: name, label: name })));
      }
    } catch (err) { 
      console.error(err); 
      setCategoryList(DEFAULT_CATEGORIES.map(name => ({ value: name, label: name })));
    }
  };
  
  const [activeTab, setActiveTab] = useState('public');
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const [sortBy, setSortBy] = useState("latest");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const tabs = [
    { id: 'public', label: 'Cộng đồng', icon: <Search size={18} /> },
    { id: 'mine', label: 'Cá nhân', icon: <User size={18} /> },
    { id: 'favorites', label: 'Yêu thích', icon: <Heart size={18} /> }
  ];

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:3000/api/v1/quizzes/explore/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error("Lỗi lấy stats:", err);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams({
        tab: activeTab,
        search: searchTerm,
        category: category,
        difficulty: difficulty,
        sortBy: sortBy,
        page: page,
        limit: 12
      }).toString();
      
      const res = await axios.get(`http://localhost:3000/api/v1/quizzes/explore?${queryParams}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQuizzes(res.data.quizzes || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error("Lỗi:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchStats(); 
    fetchCategories();
  }, []);

  useEffect(() => { 
    // Reset về trang 1 khi đổi bộ lọc
    setPage(1);
  }, [activeTab, searchTerm, category, difficulty, sortBy]);

  useEffect(() => { 
    const delayDebounceFn = setTimeout(() => {
      fetchQuizzes();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [activeTab, searchTerm, category, difficulty, sortBy, page]);

  const handleFavoriteUpdate = (quizId, newStatus) => {
    setQuizzes(prev => prev.map(q => q.id === quizId ? { ...q, is_favorite: newStatus ? 1 : 0 } : q));
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: 'Xóa đề thi?',
      text: "Dữ liệu sẽ mất vĩnh viễn!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Xóa ngay',
      cancelButtonText: 'Hủy'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem('token');
          await axios.delete(`http://localhost:3000/api/v1/quizzes/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          setQuizzes(prev => prev.filter(q => q.id !== id));
          Swal.fire('Thành công', 'Đề thi đã bị xóa', 'success');
        } catch (error) {
          Swal.fire('Lỗi', 'Không thể xóa đề lúc này', 'error');
        }
      }
    });
  };

  return (
    <div className="flex min-h-screen bg-[#f8f9fc] dark:bg-slate-950 font-sans text-slate-900 transition-colors duration-300">
      
      {/* SIDEBAR */}
      <Sidebar />

      <main className="flex-1 ml-64 p-8">
        <div className="max-w-7xl mx-auto">
          
          {/* HERO STATS */}
          <div className="mb-10">
            <h1 className="text-4xl font-black text-slate-900 dark:text-slate-100 mb-3">Khám phá Kho dữ liệu khổng lồ 🚀</h1>
            <p className="text-slate-500 dark:text-slate-400 text-lg mb-8">Tìm kiếm, luyện tập và chia sẻ những bộ đề chất lượng nhất cùng cộng đồng.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 text-white shadow-lg shadow-indigo-500/30 flex items-center gap-4">
                <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-md">
                  <Database size={32} className="text-white" />
                </div>
                <div>
                  <p className="text-white/80 font-medium">Tổng số Đề thi</p>
                  <h3 className="text-3xl font-black">{statsLoading ? "..." : stats.totalQuizzes}</h3>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-emerald-400 to-teal-500 rounded-3xl p-6 text-white shadow-lg shadow-teal-500/30 flex items-center gap-4">
                <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-md">
                  <List size={32} className="text-white" />
                </div>
                <div>
                  <p className="text-white/80 font-medium">Tổng Chủ đề</p>
                  <h3 className="text-3xl font-black">{statsLoading ? "..." : stats.totalCategories}</h3>
                </div>
              </div>

              <div className="bg-gradient-to-br from-rose-400 to-orange-500 rounded-3xl p-6 text-white shadow-lg shadow-orange-500/30 flex items-center gap-4">
                <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-md">
                  <Users size={32} className="text-white" />
                </div>
                <div>
                  <p className="text-white/80 font-medium">Số lượng Tác giả</p>
                  <h3 className="text-3xl font-black">{statsLoading ? "..." : stats.totalAuthors}</h3>
                </div>
              </div>
            </div>
          </div>

          {/* ADVANCED FILTER BAR - Sticky */}
          <div className="sticky top-0 z-20 bg-[#f8f9fc]/80 dark:bg-slate-950/80 backdrop-blur-md pb-4 pt-2 -mx-2 px-2">
            <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col lg:flex-row gap-4 items-center justify-between transition-colors">
            <div className="flex gap-1.5 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 px-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex shrink-0 items-center gap-2 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-[#1e1b4b] dark:bg-indigo-600 text-white shadow-xl shadow-indigo-500/20 scale-105' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent hover:text-indigo-600 dark:hover:text-indigo-400'}`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            <div className="flex flex-1 items-center gap-3 w-full lg:w-auto mt-4 lg:mt-0">
              <div className="relative flex-1 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors" size={18} />
                <input 
                  type="text" 
                  placeholder="Tìm tên đề, tác giả..." 
                  className="w-full pl-12 pr-4 py-3 bg-[#f8f9fc] dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-sm text-slate-900 dark:text-slate-100"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <CustomDropdown 
                  value={category} 
                  onChange={setCategory} 
                  placeholder="Chọn chủ đề"
                  options={[{ value: 'all', label: 'Tất cả chủ đề' }, ...categoryList]} 
                />
                <CustomDropdown 
                  value={difficulty} 
                  onChange={setDifficulty} 
                  placeholder="Độ khó"
                  options={[
                    { value: 'all', label: 'Tất cả độ khó' },
                    { value: 'Dễ', label: 'Dễ' },
                    { value: 'Trung bình', label: 'Trung bình' },
                    { value: 'Khó', label: 'Khó' }
                  ]} 
                />
                <CustomDropdown 
                  value={sortBy} 
                  onChange={setSortBy} 
                  placeholder="Sắp xếp"
                  options={[
                    { value: 'latest', label: 'Mới nhất' },
                    { value: 'popular', label: 'Phổ biến' }
                  ]} 
                />
              </div>
            </div>
          </div>
        </div>

        {/* QUIZ LIST */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
               {Array(8).fill(0).map((_, i) => (
                  <div key={i} className="bg-white rounded-[24px] border border-slate-100 h-[380px] animate-pulse overflow-hidden flex flex-col">
                    <div className="h-[160px] w-full bg-slate-200 shrink-0"></div>
                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="w-3/4 h-6 bg-slate-100 rounded-lg mb-3"></div>
                        <div className="w-1/2 h-6 bg-slate-100 rounded-lg"></div>
                      </div>
                      <div className="flex justify-between mt-4">
                        <div className="w-full h-10 bg-slate-100 rounded-xl"></div>
                      </div>
                    </div>
                  </div>
               ))}
            </div>
          ) : quizzes.length === 0 ? (
            <div className="col-span-full py-20 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 transition-colors">
              <div className="text-6xl mb-4">🕵️‍♂️</div>
              <h3 className="text-xl font-black text-slate-700 dark:text-slate-300 mb-2">Không tìm thấy kết quả phù hợp</h3>
              <p className="text-slate-500 dark:text-slate-500 font-medium">Bạn hãy thử điều chỉnh lại bộ lọc hoặc từ khoá tìm kiếm xem sao.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {quizzes.map(quiz => (
                <LightQuizCard 
                  key={quiz.id} 
                  quiz={quiz} 
                  onClick={() => setSelectedQuiz(quiz)} 
                  onPlayClick={(q) => navigate(`/play/${q.id}`)}
                  onPreviewClick={(q) => setPreviewQuizId(q.id)}
                  showActions={activeTab === 'mine'}
                  onEdit={(id) => navigate(`/edit-quiz/${id}`)}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}

          {/* PAGINATION BAR */}
          {!loading && totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-2">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 dark:hover:border-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                <ChevronRight size={20} className="rotate-180" />
              </button>
              
              <div className="flex items-center gap-1.5">
                {[...Array(totalPages)].map((_, i) => {
                  const pNum = i + 1;
                  return (
                    <button 
                      key={pNum}
                      onClick={() => setPage(pNum)}
                      className={`w-10 h-10 rounded-xl font-bold text-sm transition-all shadow-sm ${page === pNum ? 'bg-indigo-600 text-white shadow-indigo-200 scale-110' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-indigo-200 dark:hover:border-indigo-700'}`}
                    >
                      {pNum}
                    </button>
                  );
                })}
              </div>

              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 dark:hover:border-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
      </main>
      
      {selectedQuiz && (
        <QuizDetailModal 
          quiz={selectedQuiz} 
          onClose={() => setSelectedQuiz(null)} 
          onFavoriteUpdate={handleFavoriteUpdate}
        />
      )}

      {previewQuizId && (
        <PreviewModal 
          quizId={previewQuizId}
          onClose={() => setPreviewQuizId(null)}
          onPlay={() => navigate(`/play/${previewQuizId}`)}
        />
      )}

      {/* TẠO ĐỀ THI FLOATING BUTTON */}
      <button 
        onClick={() => navigate('/create-quiz')}
        className="fixed bottom-8 right-8 z-40 flex items-center gap-3 bg-gradient-to-r from-[#4f46e5] to-purple-500 text-white px-6 py-3.5 rounded-full font-black shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-1 transition-all group animate-bounce hover:animate-none"
      >
        <span className="bg-white/20 p-1.5 rounded-full group-hover:rotate-90 transition-transform">
          <BookOpen size={18} className="text-white" />
        </span>
        Tạo đề thi mới
      </button>

    </div>
  );
};

export default ExplorePage;