import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, BookOpen, Clock, BarChart3, Search, Bell, LogOut, Sparkles, Plus, ChevronRight, Trash2, PencilLine } from 'lucide-react';
import axios from 'axios';
import Swal from 'sweetalert2';


const Dashboard = () => {
  const navigate = useNavigate();
  const username = localStorage.getItem('username') || 'Người học';

  const [quizzes, setQuizzes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all' là chung, 'mine' là của mình

useEffect(() => {
  const fetchQuizzes = async () => {
    setIsLoading(true);
    try {
      // Nếu là tab 'mine', gọi API lấy đề của riêng user, nếu 'all' thì gọi API chung
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

  const navItems = [
    { id: 1, name: "Trang chủ", icon: <Home size={20} />, active: true },
    { id: 2, name: "Kho đề thi", icon: <BookOpen size={20} /> },
    { id: 3, name: "Lịch sử thi", icon: <Clock size={20} /> },
    { id: 4, name: "Bảng xếp hạng", icon: <BarChart3 size={20} /> },
  ];

  const handleLogout = () => {
    Swal.fire({
      title: 'Xác nhận đăng xuất',
      text: 'Bạn có chắc chắn muốn đăng xuất không?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#4f46e5',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Xác nhận thoát',
      cancelButtonText: 'Ở lại',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        Swal.fire({
          title: 'Đã đăng xuất',
          text: 'Hẹn gặp lại bạn sớm nhất!',
          icon: 'success',
          timer: 1200,
          showConfirmButton: false
        }).then(() => {
          navigate('/login');
        });
      }
    });
  };
  const handleDelete = (id) => {
  // Bấm phát là phải nổ Popup ngay
  Swal.fire({
    title: 'Xác nhận xóa đề?',
    text: "Dữ liệu sẽ mất vĩnh viễn, bạn vẫn tiếp tục muốn xoá?",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444', // Màu đỏ cho máu
    cancelButtonColor: '#64748b',
    confirmButtonText: 'Xóa',
    cancelButtonText: 'Giữ lại',
    reverseButtons: true
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.delete(`http://localhost:3000/api/v1/quizzes/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.data.success) {
          Swal.fire('Đã xóa!', 'Đề thi đã biến mất.', 'success');
          // Cập nhật lại giao diện ngay lập tức mà không cần F5
          setQuizzes(prev => prev.filter(quiz => quiz.id !== id));
        }
      } catch (error) {
        Swal.fire('Lỗi', 'Bạn Không thể xóa đề lúc này .', 'error');
      }
    }
  });
};
  return (
    <div className="flex min-h-screen bg-[#f8f9fc] font-sans text-slate-900">
      {/* SIDEBAR */}
      <aside className="w-64 bg-[#1e1b4b] text-white/70 p-6 flex flex-col fixed h-full z-10">
        <div className="flex items-center gap-2 text-white font-black text-2xl mb-12">
          <BookOpen className="text-[#4f46e5]" />
          QuizSmart
        </div>
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <div key={item.id} className={`flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer transition-colors ${item.active ? 'bg-[#4f46e5] text-white font-semibold' : 'hover:bg-white/10 hover:text-white'}`}>
              {item.icon}
              {item.name}
            </div>
          ))}
        </nav>
      </aside>

      {/* KHU VỰC CHÍNH */}
      <main className="flex-1 ml-64 p-8 pt-0">
        <header className="flex items-center justify-between py-6 sticky top-0 bg-[#f8f9fc] z-10">
          <div className="relative w-[360px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input className="w-full pl-12 pr-4 py-3 bg-white rounded-full border border-slate-200 outline-none focus:ring-2 focus:ring-[#4f46e5]/20 focus:border-[#4f46e5] transition-all shadow-sm" type="text" placeholder="Tìm kiếm đề thi..." />
          </div>
          <div className="flex items-center gap-4">
            <div className="relative cursor-pointer mr-2">
              <Bell className="text-slate-400 hover:text-[#4f46e5] transition-colors" size={24} />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-[11px] font-bold flex items-center justify-center border-2 border-[#f8f9fc]">3</span>
            </div>
            <div className="flex items-center gap-3 bg-white p-2 rounded-full border border-slate-200 shadow-sm pr-4">
              <div className="w-9 h-9 rounded-full bg-[#1e1b4b] text-white flex items-center justify-center font-bold text-lg">
                {username.charAt(0).toUpperCase()}
              </div>
              <span className="font-semibold text-slate-700">{username}</span>
              <button onClick={handleLogout} className="ml-2 p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full transition-colors" title="Đăng xuất">
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </header>

        <div className="space-y-10 pb-10">
          <section className="bg-gradient-to-r from-[#312e81] to-[#4f46e5] p-10 rounded-3xl text-white shadow-lg relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="relative z-10">
              <h1 className="text-3xl font-black mb-3">Chào mừng trở lại, {username}!</h1>
              <p className="text-indigo-100 max-w-xl text-lg">Hôm nay bạn muốn tạo đề thi mới hay tiếp tục học tập?</p>
            </div>
            <div className="relative z-10 flex flex-wrap gap-4">
              <button onClick={() => navigate('/create-quiz')} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-5 py-3.5 rounded-xl font-bold transition-all backdrop-blur-sm">
                <Plus size={20} /> Tạo thủ công
              </button>
              <button className="flex items-center gap-2 bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white px-6 py-3.5 rounded-xl font-bold hover:opacity-90 transition-all shadow-[0_0_20px_rgba(217,70,239,0.4)]">
                <Sparkles size={20} className="animate-pulse" /> Tạo bằng AI
              </button>
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Đề thi nổi bật</h2>
              <span className="text-sm text-[#4f46e5] font-semibold bg-[#4f46e5]/10 px-4 py-1.5 rounded-full flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#4f46e5] animate-ping"></span>
                {isLoading ? 'Đang tải dữ liệu...' : 'Dữ liệu trực tuyến'}
              </span>
            </div>
            <div className="flex gap-8 mb-6 border-b border-slate-200">
  <button 
    onClick={() => setActiveTab('all')}
    className={`pb-4 text-sm font-bold transition-all relative ${
      activeTab === 'all' ? 'text-[#4f46e5]' : 'text-slate-400 hover:text-slate-600'
    }`}
  >
    Kho đề thi chung
    {activeTab === 'all' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#4f46e5]"></div>}
  </button>

  <button 
    onClick={() => setActiveTab('mine')}
    className={`pb-4 text-sm font-bold transition-all relative ${
      activeTab === 'mine' ? 'text-[#4f46e5]' : 'text-slate-400 hover:text-slate-600'
    }`}
  >
    Đề thi của tôi
    {activeTab === 'mine' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#4f46e5]"></div>}
  </button>
</div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {isLoading ? (
                [1, 2, 3, 4].map((item) => (
                  <div key={item} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm h-[220px] flex flex-col animate-pulse">
                    <div className="w-24 h-7 bg-slate-200 rounded-full mb-4"></div>
                    <div className="w-3/4 h-6 bg-slate-200 rounded-md mb-3"></div>
                    <div className="w-full h-11 bg-slate-100 rounded-xl mt-auto"></div>
                  </div>
                ))
              ) : quizzes.length === 0 ? (
                <div className="col-span-full text-center text-slate-500 py-10 bg-white rounded-2xl border border-slate-200 shadow-sm">Chưa có đề thi nào.</div>
              ) : (
                quizzes.map((quiz) => (
<div key={quiz.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm h-[250px] flex flex-col hover:shadow-md transition-all hover:-translate-y-1 relative group overflow-hidden">
  
  {/* Badge thời gian */}
  <div className="bg-[#4f46e5]/10 text-[#4f46e5] w-max px-3 py-1 rounded-full text-[10px] font-black mb-4">
    🕒 {quiz.time_limit} PHÚT
  </div> 

  {/* NÚT QUẢN LÝ (Chỉ hiện khi Hover ở Tab "Của tôi") */}
  {activeTab === 'mine' && (
    <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20">
      {/* NÚT SỬA - HÌNH BÚT CHÌ */}
      <button 
        onClick={(e) => { e.stopPropagation(); navigate(`/edit-quiz/${quiz.id}`); }}
        className="bg-white p-2 text-amber-500 rounded-lg shadow-sm border border-amber-100 hover:bg-amber-500 hover:text-white transition-all scale-90 group-hover:scale-100"
        title="Chỉnh sửa đề thi"
      >
        <PencilLine size={18} />
      </button>
      
      {/* NÚT XÓA - HÌNH THÙNG RÁC */}
      <button 
        onClick={(e) => { e.stopPropagation(); handleDelete(quiz.id); }}
        className="bg-white p-2 text-red-500 rounded-lg shadow-sm border border-red-100 hover:bg-red-500 hover:text-white transition-all scale-90 group-hover:scale-100"
        title="Xóa đề thi"
      >
        <Trash2 size={18} />
      </button>
    </div>
  )}

  {/* Nội dung đề thi */}
  <div className="flex-1">
    <h3 className="font-bold text-slate-900 text-lg mb-2 line-clamp-2 leading-tight">
      {quiz.title}
    </h3> 
    <p className="text-sm text-slate-500 line-clamp-2 font-medium leading-relaxed">
      {quiz.description || "Đề thi này hiện chưa có nội dung mô tả chi tiết."}
    </p> 
  </div>

  {/* Nút Vào thi - Luôn hiện để sếp tự ôn tập */}
  <button 
    onClick={() => navigate(`/play/${quiz.id}`)}
    className="w-full py-2.5 bg-[#f8f9fc] hover:bg-[#4f46e5] text-[#4f46e5] hover:text-white rounded-xl mt-4 font-bold transition-all flex items-center justify-center gap-2 relative z-10"
  >
    Vào Thi Ngay <ChevronRight size={16} />
  </button> 
</div>
                  
                ))
              )}
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-6">Tiến độ học tập</h2>
              <div className="bg-white rounded-3xl p-10 border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center h-[280px]">
                <Clock className="text-slate-200 mb-5" size={48} />
                <h3 className="text-xl font-bold text-slate-700 mb-2">Chưa có dữ liệu</h3>
                <p className="text-slate-500">Hoàn thành bài thi để xem thống kê tại đây.</p>
              </div>
            </section>
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-6">Hoạt động tuần</h2>
              <div className="bg-white rounded-3xl p-10 border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center h-[280px]">
                <BarChart3 className="text-slate-200 mb-5" size={48} />
                <h3 className="text-xl font-bold text-slate-700 mb-2">Đang cập nhật</h3>
                <p className="text-slate-500">Tính năng này sẽ sớm xuất hiện.</p>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;