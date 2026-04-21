import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Search, ChevronRight, Trophy, Flame, Medal, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const CustomDropdown = ({ value, onChange, options, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value) || options[0];

  return (
    <div className="relative w-full sm:w-auto" ref={containerRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full sm:w-auto flex items-center justify-between gap-2 bg-slate-50 border border-slate-200 text-slate-600 text-sm rounded-xl pl-4 pr-3 py-2.5 font-medium outline-none hover:bg-slate-100 transition-colors"
      >
        <span>{selectedOption ? selectedOption.label : placeholder}</span>
        <svg className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
      </button>

      {isOpen && (
        <div className="absolute top-[calc(100%+8px)] left-0 w-full sm:min-w-[160px] bg-white border border-slate-100 rounded-xl shadow-lg z-30 py-2 animate-in fade-in zoom-in-95 duration-200">
          {options.map((opt) => (
            <div 
              key={opt.value}
              onClick={() => { onChange(opt.value); setIsOpen(false); }}
              className={`px-4 py-2.5 text-sm font-medium cursor-pointer transition-colors ${value === opt.value ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 active:bg-slate-100'}`}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const LeaderboardPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState([]);
  
  const [activeTab, setActiveTab] = useState('points');
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const [categoryList, setCategoryList] = useState([]);

  const DEFAULT_CATEGORIES = [
    'Toán học', 'Văn học', 'Ngoại ngữ', 'Công nghệ thông tin', 
    'Lịch sử', 'Vật lý', 'Hóa học', 'Sinh học', 'Địa lý', 'Giáo dục công dân', 'Kinh tế', 'Chung'
  ];

  const tabs = [
    { id: 'points', label: 'Top Điểm Số', icon: <Trophy size={18} className="text-amber-500" /> },
    { id: 'streak', label: 'Top Chăm Chỉ', icon: <Flame size={18} className="text-rose-500" /> },
    { id: 'creators', label: 'Top Sáng Tạo', icon: <Sparkles size={18} className="text-emerald-500" /> }
  ];

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:3000/api/v1/quizzes/categories', { headers: { Authorization: `Bearer ${token}` } });
        if (res.data.success) {
          const dbCatNames = res.data.categories.map(c => c.name);
          const merged = [...new Set([...dbCatNames, ...DEFAULT_CATEGORIES])];
          setCategoryList(merged.map(name => ({ value: name, label: name })));
        } else {
          setCategoryList(DEFAULT_CATEGORIES.map(name => ({ value: name, label: name })));
        }
      } catch (err) { 
        setCategoryList(DEFAULT_CATEGORIES.map(name => ({ value: name, label: name })));
      }
    };
    fetchCategories();
  }, []);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams({
        type: activeTab,
        limit: 50,
        search: searchTerm,
        category: category,
        difficulty: difficulty
      }).toString();
      
      const res = await axios.get(`http://localhost:3000/api/v1/quizzes/leaderboard?${queryParams}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
          setLeaderboard(res.data.data || []);
      }
    } catch (err) {
      console.error("Lỗi lấy BXH:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    const delayDebounceFn = setTimeout(() => {
      fetchLeaderboard();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [activeTab, searchTerm, category, difficulty]);

  return (
    <div className="flex min-h-screen bg-[#f8f9fc] font-sans text-slate-900">
      {/* SIDEBAR */}
      <Sidebar />

      <main className="flex-1 ml-64 p-8">
        <div className="max-w-5xl mx-auto">
          {/* HEADER */}
          <div className="mb-8">
            <h1 className="text-4xl font-black text-slate-900 mb-3">Bảng xếp hạng toàn sever 🌐</h1>
            <p className="text-slate-500 text-lg">Khám phá vị trí của bạn so với cộng đồng dựa trên điểm số, sự chăm chỉ và đóng góp.</p>
          </div>

          {/* ADVANCED FILTER BAR */}
          <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 mb-8 flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex gap-1.5 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 px-1 [&::-webkit-scrollbar]:hidden">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex shrink-0 items-center gap-2 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-[#1e1b4b] text-white shadow-xl shadow-indigo-500/20 scale-105' : 'text-slate-500 hover:bg-slate-50 border border-transparent hover:text-indigo-600'}`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            <div className="flex flex-1 items-center gap-3 w-full lg:w-auto mt-4 lg:mt-0">
              <div className="relative flex-1 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                <input 
                  type="text" 
                  placeholder="Tìm người dùng..." 
                  className="w-full pl-12 pr-4 py-3 bg-[#f8f9fc] border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {activeTab !== 'streak' && (
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
                </div>
              )}
            </div>
          </div>

          {/* LEADERBOARD TABLE */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 uppercase text-[10px] sm:text-xs font-black text-slate-400 tracking-wider">
                    <th className="py-4 px-6 text-center w-24">Hạng</th>
                    <th className="py-4 px-6">Người dùng</th>
                    <th className="py-4 px-6 text-right w-40">
                      {activeTab === 'points' ? 'Điểm số' : activeTab === 'streak' ? '🔥 Chuỗi ngày' : 'Đề đã tạo'}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    [...Array(5)].map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="py-5 px-6 text-center"><div className="w-8 h-8 bg-slate-100 rounded-full mx-auto"></div></td>
                        <td className="py-5 px-6 flex items-center gap-4"><div className="w-10 h-10 bg-slate-100 rounded-full"></div><div className="w-32 h-5 bg-slate-100 rounded-md"></div></td>
                        <td className="py-5 px-6 text-right"><div className="w-20 h-6 bg-slate-100 rounded-md ml-auto"></div></td>
                      </tr>
                    ))
                  ) : leaderboard.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-20 text-center">
                        <p className="text-slate-400 font-bold mb-2">Chưa tìm thấy dữ liệu phù hợp</p>
                        <p className="text-slate-300 text-sm">Hệ thống đang tích luỹ dữ liệu hoặc bạn đã đổi sai bộ lọc.</p>
                      </td>
                    </tr>
                  ) : (
                    leaderboard.map((user, index) => {
                      const isTop3 = index < 3;
                      const scoreValue = activeTab === 'points' ? (user.score/10).toFixed(1) : user.score;
                      
                      return (
                        <tr key={user.id} className={`transition-colors hover:bg-slate-50 ${isTop3 ? 'bg-gradient-to-r from-transparent via-amber-50/10 to-transparent' : ''}`}>
                          <td className="py-5 px-6 text-center">
                            <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center font-black text-sm
                               ${index === 0 ? 'bg-amber-400 text-white shadow-lg shadow-amber-500/30' : 
                                 index === 1 ? 'bg-slate-300 text-slate-700 shadow-lg shadow-slate-400/20' : 
                                 index === 2 ? 'bg-orange-300 text-orange-900 shadow-lg shadow-orange-500/20' : 
                                 'bg-slate-100 text-slate-500'}
                            `}>
                              {index === 0 ? <Medal size={16} fill="currentColor" /> : index + 1}
                            </div>
                          </td>
                          <td className="py-5 px-6">
                            <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black text-white bg-gradient-to-br ${isTop3 ? 'from-indigo-500 to-purple-600' : 'from-slate-400 to-slate-500'} shadow-md`}>
                                {user.username.charAt(0).toUpperCase()}
                              </div>
                              <span className={`font-bold ${isTop3 ? 'text-indigo-900 text-base' : 'text-slate-700 text-sm'}`}>{user.username}</span>
                            </div>
                          </td>
                          <td className="py-5 px-6 text-right">
                            <span className={`font-black text-lg ${activeTab === 'points' ? 'text-indigo-600' : activeTab === 'streak' ? 'text-rose-500' : 'text-emerald-600'}`}>
                              {scoreValue}
                            </span>
                            {activeTab === 'points' && <span className="text-slate-400 text-[10px] uppercase font-bold ml-1">pts</span>}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LeaderboardPage;
