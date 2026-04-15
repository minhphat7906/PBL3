import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, BookOpen, Clock, BarChart3, Search, Bell, LogOut, Sparkles, Plus, ChevronRight, Trash2, PencilLine, Loader2 } from 'lucide-react';
import axios from 'axios';
import Swal from 'sweetalert2';

const Dashboard = () => {
  const navigate = useNavigate();
  const username = localStorage.getItem('username') || 'Người học';

  // --- 1. STATES ---
  const [quizzes, setQuizzes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all' hoặc 'mine'
  const [searchTerm, setSearchTerm] = useState("");

  // --- 2. FETCH DATA ---
  useEffect(() => {
    const fetchQuizzes = async () => {
      setIsLoading(true);
      try {
        const endpoint = activeTab === 'all' 
          ? 'http://localhost:3000/api/v1/quizzes' 
          : 'http://localhost:3000/api/v1/quizzes/my-quizzes';
        
        const token = localStorage.getItem('token');
        const response = await axios.get(endpoint, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.data.success) {
          setQuizzes(response.data.quizzes);
        }
      } catch (error) {
        console.error("Lỗi lấy đề thi:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuizzes();
  }, [activeTab]);

  // --- 3. LOGIC TÌM KIẾM (Sử dụng useMemo để tối ưu hiệu năng) ---
  const filteredQuizzes = useMemo(() => {
    return quizzes.filter(quiz => 
      quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (quiz.description && quiz.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [quizzes, searchTerm]);

  // --- 4. ACTIONS ---
  const handleLogout = () => {
    Swal.fire({
      title: 'Xác nhận đăng xuất',
      text: 'Hẹn gặp lại bạn sớm nhất!',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#4f46e5',
      confirmButtonText: 'Đăng xuất',
      cancelButtonText: 'Ở lại'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.clear(); // Xóa sạch token/username
        navigate('/login');
      }
    });
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: 'Xóa đề thi?',
      text: "Dữ liệu sẽ mất vĩnh viễn!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Xóa ngay'
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

  // --- 5. SUB-COMPONENTS (Dễ sửa, dễ nhìn) ---
  
  // Header Component
  const renderHeader = () => (
    <header className="flex items-center justify-between py-6 sticky top-0 bg-[#f8f9fc] z-10">
      <div className="relative w-[360px]">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          className="w-full pl-12 pr-4 py-3 bg-white rounded-full border border-slate-200 outline-none focus:ring-2 focus:ring-[#4f46e5]/20 focus:border-[#4f46e5] transition-all shadow-sm" 
          type="text" 
          placeholder="Tìm kiếm đề thi..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="flex items-center gap-4">
        <div className="relative cursor-pointer mr-2">
          <Bell className="text-slate-400 hover:text-[#4f46e5]" size={24} />
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center border-2 border-[#f8f9fc]">3</span>
        </div>
        <div className="flex items-center gap-3 bg-white p-1.5 pr-4 rounded-full border border-slate-200 shadow-sm">
          <div className="w-8 h-8 rounded-full bg-[#1e1b4b] text-white flex items-center justify-center font-bold">{username.charAt(0).toUpperCase()}</div>
          <span className="font-semibold text-sm text-slate-700">{username}</span>
          <button onClick={handleLogout} className="ml-2 text-slate-400 hover:text-red-500"><LogOut size={16} /></button>
        </div>
      </div>
    </header>
  );

  // Quiz Card Component
  const renderQuizCard = (quiz) => (
    <div key={quiz.id} className="group bg-white rounded-2xl p-6 border border-slate-200 shadow-sm h-[260px] flex flex-col hover:shadow-lg transition-all relative overflow-hidden">
      <div className="flex justify-between items-start mb-4">
        <span className="bg-[#4f46e5]/10 text-[#4f46e5] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
          🕒 {quiz.time_limit} Phút
        </span>
        {activeTab === 'mine' && (
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => navigate(`/edit-quiz/${quiz.id}`)} className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg"><PencilLine size={18}/></button>
            <button onClick={() => handleDelete(quiz.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={18}/></button>
          </div>
        )}
      </div>
      <div className="flex-1">
        <h3 className="font-bold text-slate-900 text-lg mb-2 line-clamp-2">{quiz.title}</h3>
        <p className="text-sm text-slate-500 line-clamp-2">{quiz.description || "Chưa có mô tả."}</p>
      </div>
      <button 
        onClick={() => navigate(`/play/${quiz.id}`)}
        className="w-full py-2.5 bg-[#f8f9fc] hover:bg-[#4f46e5] text-[#4f46e5] hover:text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 mt-4"
      >
        Vào Thi Ngay <ChevronRight size={16} />
      </button>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#f8f9fc] font-sans text-slate-900">
      
      {/* 1. SIDEBAR */}
      <aside className="w-64 bg-[#1e1b4b] text-white/70 p-6 flex flex-col fixed h-full">
        <div className="flex items-center gap-2 text-white font-black text-2xl mb-12 cursor-pointer" onClick={() => navigate('/dashboard')}>
          <BookOpen className="text-[#4f46e5]" /> QuizSmart
        </div>
        <nav className="flex-1 space-y-2">
          <button className="w-full flex items-center gap-4 px-4 py-3 rounded-xl bg-[#4f46e5] text-white font-semibold"><Home size={20} /> Trang chủ</button>
          <button className="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-white/10 hover:text-white transition-all"><BookOpen size={20} /> Kho đề thi</button>
          <button className="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-white/10 hover:text-white transition-all"><Clock size={20} /> Lịch sử thi</button>
          <button className="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-white/10 hover:text-white transition-all"><BarChart3 size={20} /> Bảng xếp hạng</button>
        </nav>
      </aside>

      {/* 2. MAIN CONTENT */}
      <main className="flex-1 ml-64 p-8 pt-0">
        {renderHeader()}

        <div className="space-y-10 pb-10">
          {/* Banner */}
          <section className="bg-gradient-to-r from-[#312e81] to-[#4f46e5] p-10 rounded-3xl text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
             <div className="relative z-10">
                <h1 className="text-3xl font-black mb-2">Chào mừng trở lại, {username}!</h1>
                <p className="text-indigo-100 text-lg opacity-80">Khám phá kho tri thức và chinh phục thử thách mới ngay.</p>
             </div>
             <div className="flex gap-4 z-10">
                <button onClick={() => navigate('/create-quiz')} className="bg-white/10 hover:bg-white/20 px-6 py-3 rounded-xl font-bold border border-white/20 transition-all flex items-center gap-2"><Plus size={20}/> Tạo đề</button>
                <button className="bg-gradient-to-r from-fuchsia-500 to-pink-500 px-6 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2"><Sparkles size={20}/> Tạo bằng AI</button>
             </div>
          </section>

          {/* Quiz Section */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Danh sách đề thi</h2>
              <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                <button 
                  onClick={() => setActiveTab('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'all' ? 'bg-[#4f46e5] text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                >Kho đề chung</button>
                <button 
                  onClick={() => setActiveTab('mine')}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'mine' ? 'bg-[#4f46e5] text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                >Đề của tôi</button>
              </div>
            </div>

            {/* Hiển thị số lượng kết quả tìm thấy */}
            {searchTerm && (
              <p className="mb-4 text-sm text-slate-500 font-medium">Tìm thấy {filteredQuizzes.length} kết quả cho "{searchTerm}"</p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {isLoading ? (
                Array(4).fill(0).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200 h-[250px] animate-pulse">
                    <div className="w-20 h-6 bg-slate-100 rounded-full mb-4"></div>
                    <div className="w-3/4 h-6 bg-slate-100 rounded mb-4"></div>
                    <div className="w-full h-10 bg-slate-50 rounded-xl mt-auto"></div>
                  </div>
                ))
              ) : filteredQuizzes.length === 0 ? (
                <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-slate-200">
                  <Search size={48} className="mx-auto text-slate-200 mb-4" />
                  <p className="text-slate-500 font-bold">Không tìm thấy đề thi nào phù hợp!</p>
                </div>
              ) : (
                filteredQuizzes.map(renderQuizCard)
              )}
            </div>
          </section>

          {/* Stats Section (Placeholders) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             <div className="bg-white p-10 rounded-3xl border border-slate-200 text-center">
                <Clock className="mx-auto text-slate-200 mb-4" size={48} />
                <h3 className="font-bold text-slate-700">Tiến độ học tập</h3>
                <p className="text-slate-400 text-sm">Chưa có dữ liệu thống kê.</p>
             </div>
             <div className="bg-white p-10 rounded-3xl border border-slate-200 text-center">
                <BarChart3 className="mx-auto text-slate-200 mb-4" size={48} />
                <h3 className="font-bold text-slate-700">Hoạt động tuần</h3>
                <p className="text-slate-400 text-sm">Hệ thống đang cập nhật.</p>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;