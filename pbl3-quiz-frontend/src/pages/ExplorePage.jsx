import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Flame, BookOpen, Home, BarChart3, Clock, Heart, User, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import QuizDetailModal from '../components/QuizDetailModal';
import QuizCard from '../components/QuizCard';

const ExplorePage = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('public');
  const [searchTerm, setSearchTerm] = useState("");

  const tabs = [
    { id: 'public', label: 'Cộng đồng', icon: <Search size={18} /> },
    { id: 'mine', label: 'Cá nhân', icon: <User size={18} /> },
    { id: 'favorites', label: 'Yêu thích', icon: <Heart size={18} /> },
    { id: 'trending', label: 'Trending', icon: <Flame size={18} /> }
  ];

  const fetchQuizzes = async (tab) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:3000/api/v1/quizzes/explore?tab=${tab}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQuizzes(res.data.quizzes);
    } catch (err) {
      console.error("Lỗi:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchQuizzes(activeTab); }, [activeTab]);

  const handleFavoriteUpdate = (quizId, newStatus) => {
    setQuizzes(prev => prev.map(q => q.id === quizId ? { ...q, is_favorite: newStatus ? 1 : 0 } : q));
  };

  const filteredQuizzes = quizzes.filter(quiz => 
    quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (quiz.author_name && quiz.author_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="flex min-h-screen bg-[#f8f9fc] font-sans text-slate-900">
      
      {/* SIDEBAR TƯƠNG TỰ DASHBOARD */}
      <aside className="w-64 bg-[#1e1b4b] text-white/70 p-6 flex flex-col fixed h-full z-20">
        <div className="flex items-center gap-2 text-white font-black text-2xl mb-12 cursor-pointer" onClick={() => navigate('/dashboard')}>
          <BookOpen className="text-[#4f46e5]" /> QuizSmart
        </div>
        <nav className="flex-1 space-y-2">
          <button onClick={() => navigate('/dashboard')} className="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-white/10 hover:text-white transition-all"><Home size={20} /> Trang chủ</button>
          <button className="w-full flex items-center gap-4 px-4 py-3 rounded-xl bg-[#4f46e5] text-white font-semibold"><BookOpen size={20} /> Kho đề thi</button>
          <button onClick={() => navigate('/history')} className="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-white/10 hover:text-white transition-all"><Clock size={20} /> Lịch sử thi</button>
          <button className="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-white/10 hover:text-white transition-all"><BarChart3 size={20} /> Bảng xếp hạng</button>
        </nav>
      </aside>

      <main className="flex-1 ml-64 p-8">
        <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-slate-900 mb-3">Thư viện Đề thi 📚</h1>
            <p className="text-slate-500 text-lg mb-8">Khám phá những thử thách mới từ cộng đồng QuizSmart.</p>
            
            <div className="flex bg-white p-2 rounded-2xl shadow-sm border border-slate-100 max-w-max gap-2">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              className="w-full pl-12 pr-4 py-3 bg-white rounded-2xl border border-slate-200 outline-none focus:ring-2 focus:ring-[#4f46e5]/20 focus:border-[#4f46e5] transition-all shadow-sm font-medium" 
              type="text" 
              placeholder="Tìm kiếm theo tiêu đề hoặc tác giả..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
             {Array(8).fill(0).map((_, i) => (
                <div key={i} className="bg-white rounded-[24px] border border-slate-100 h-[320px] animate-pulse overflow-hidden flex flex-col">
                  <div className="h-[160px] w-full bg-slate-200 shrink-0"></div>
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="w-3/4 h-6 bg-slate-100 rounded-lg mb-3"></div>
                      <div className="w-1/2 h-6 bg-slate-100 rounded-lg"></div>
                    </div>
                    <div className="flex justify-between mt-4">
                      <div className="w-20 h-6 bg-slate-100 rounded-full"></div>
                      <div className="w-16 h-6 bg-slate-100 rounded-full"></div>
                    </div>
                  </div>
                </div>
             ))}
          </div>
        ) : filteredQuizzes.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-slate-300">
            <div className="text-6xl mb-4">🕵️‍♂️ 🐕</div>
            <h3 className="text-xl font-black text-slate-700 mb-2">Oops! Cún cưng tìm quá mệt rồi...</h3>
            <p className="text-slate-500 font-medium">Chúng tôi không tìm thấy tài liệu phù hợp trong hạng mục này, hãy thử tìm tên tác giả hoặc từ khoá khác nhé.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredQuizzes.map(quiz => (
              <QuizCard 
                key={quiz.id} 
                quiz={quiz} 
                onClick={() => setSelectedQuiz(quiz)} 
                onPlayClick={(q) => navigate(`/play/${q.id}`)}
              />
            ))}
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
    </div>
  );
};

export default ExplorePage;