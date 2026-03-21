import React from 'react';
import { LogOut, BookOpen, Clock, Award, Play } from 'lucide-react';

const Dashboard = () => {
  // Lấy tên user từ localStorage (mình sẽ lưu lúc đăng nhập)
  const username = localStorage.getItem('username') || 'Người học';

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/'; // Quay về trang login
  };

  const quizzes = [
    { id: 1, title: "Toán học giải tích", questions: 15, time: "20 phút", color: "bg-blue-500" },
    { id: 2, title: "Tiếng Anh chuyên ngành", questions: 20, time: "15 phút", color: "bg-purple-500" },
    { id: 3, title: "Lập trình React cơ bản", questions: 10, time: "30 phút", color: "bg-emerald-500" },
  ];

  return (
    <div className="min-h-screen bg-[#f8f9fc]">
      {/* Header */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-2 text-[#4f46e5]">
          <div className="w-8 h-8 flex items-center justify-center bg-[#4f46e5] rounded-lg text-white font-bold">Q</div>
          <h1 className="text-slate-900 text-xl font-bold tracking-tight">QuizSmart</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-slate-600 font-medium">Chào, <span className="text-[#4f46e5]">{username}</span></span>
          <button 
            onClick={handleLogout}
            className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full transition-colors"
          >
            <LogOut size={20} />
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-6 md:p-10">
        <header className="mb-10">
          <h2 className="text-3xl font-bold text-slate-900">Khám phá kho bài tập</h2>
          <p className="text-slate-500 mt-2">Chọn một chủ đề để bắt đầu thử thách kiến thức của bạn.</p>
        </header>

        {/* Quiz Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <div key={quiz.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
              <div className={`w-12 h-12 ${quiz.color} rounded-xl mb-4 flex items-center justify-center text-white`}>
                <BookOpen size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{quiz.title}</h3>
              
              <div className="flex items-center gap-4 text-sm text-slate-500 mb-6">
                <div className="flex items-center gap-1">
                  <Clock size={16} />
                  <span>{quiz.time}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Award size={16} />
                  <span>{quiz.questions} câu</span>
                </div>
              </div>

              <button className="w-full py-3 bg-slate-100 group-hover:bg-[#4f46e5] group-hover:text-white text-slate-600 font-bold rounded-xl transition-all flex items-center justify-center gap-2">
                <Play size={18} />
                Bắt đầu làm bài
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;