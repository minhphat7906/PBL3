import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Zap, BookOpen, Settings, Users, Award, ArrowRight } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();

  // Dữ liệu mẫu cho các môn học
  const subjects = [
    { id: 1, name: "Toán học", bg: "bg-gradient-to-br from-slate-800 to-slate-900", badge: "bg-emerald-200 text-emerald-800" },
    { id: 2, name: "Công nghệ thông tin", bg: "bg-gradient-to-br from-slate-900 to-black", badge: "bg-emerald-200 text-emerald-800" },
    { id: 3, name: "Vật lý", bg: "bg-gradient-to-br from-indigo-900 to-slate-900", badge: "bg-emerald-200 text-emerald-800" },
    { id: 4, name: "Tiếng Anh", bg: "bg-gradient-to-br from-emerald-900 to-slate-800", badge: "bg-emerald-200 text-emerald-800" },
  ];

  // Dữ liệu mẫu cho tính năng
  const features = [
    { icon: <Sparkles className="text-purple-500" />, title: "Tạo đề bằng AI", desc: "Tạo đề bằng AI đã đạt mức hoàn thiện.", borderColor: "border-purple-200", bgColor: "bg-purple-50" },
    { icon: <Zap className="text-amber-500" />, title: "Kết quả tức thì", desc: "Đọc trọn bộ kết quả tức thì trong vài giây.", borderColor: "border-amber-200", bgColor: "bg-amber-50" },
    { icon: <BookOpen className="text-emerald-500" />, title: "Đa dạng chủ đề", desc: "Cộng đồng học tập với hàng ngàn chủ đề.", borderColor: "border-emerald-200", bgColor: "bg-emerald-50" },
    { icon: <Settings className="text-blue-500" />, title: "Tùy chỉnh độ khó", desc: "Điều chỉnh độ khó để có bài kiểm tra phù hợp.", borderColor: "border-blue-200", bgColor: "bg-blue-50" },
    { icon: <Users className="text-indigo-500" />, title: "Phù hợp mọi người", desc: "Lý tưởng cho giáo viên, học sinh, sinh viên.", borderColor: "border-indigo-200", bgColor: "bg-indigo-50" },
    { icon: <Award className="text-rose-500" />, title: "Câu hỏi chất lượng", desc: "Mỗi câu hỏi đều được chắt lọc kỹ càng.", borderColor: "border-rose-200", bgColor: "bg-rose-50" },
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      {/* 1. HEADER (Thanh điều hướng) */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2 text-[#4f46e5] font-bold text-2xl cursor-pointer" onClick={() => navigate('/')}>
          QuizSmart
        </div>
        
        <div className="hidden md:flex items-center gap-8 font-medium text-slate-600">
          <a href="#kho-de-thi" className="hover:text-[#4f46e5] transition-colors">Kho đề thi</a>
          <a href="#tinh-nang" className="hover:text-[#4f46e5] transition-colors">Tính năng</a>
          <a href="#bang-xep-hang" className="hover:text-[#4f46e5] transition-colors">Bảng xếp hạng</a>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/login')}
            className="px-5 py-2 rounded-full border border-slate-300 font-semibold text-slate-700 hover:bg-slate-50 transition-all"
          >
            Đăng nhập
          </button>
          <button 
            onClick={() => navigate('/register')}
            className="px-5 py-2 rounded-full bg-[#312e81] hover:bg-[#4338ca] text-white font-semibold transition-all shadow-lg"
          >
            Đăng ký
          </button>
        </div>
      </nav>

      {/* 2. HERO SECTION (Phần giới thiệu chính) */}
      <section className="text-center py-20 px-4">
        <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight">
          Nâng tầm kiến thức cùng AI QuizSmart
        </h1>
        <p className="text-slate-500 text-lg mb-10 max-w-2xl mx-auto">
          QuizSmart là nền tảng học và thi thông minh, nâng tầm kiến thức của bạn. 
          Hãy tiếp tục hành trình chinh phục tri thức ngay hôm nay.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={() => navigate('/register')}
            className="px-8 py-3.5 rounded-full bg-[#312e81] text-white font-bold hover:bg-[#4338ca] transition-all w-full sm:w-auto"
          >
            Bắt đầu ngay
          </button>
          <button 
            onClick={() => navigate('/login')}
            className="px-8 py-3.5 rounded-full bg-emerald-100 text-emerald-800 font-bold hover:bg-emerald-200 transition-all w-full sm:w-auto"
          >
            Khám phá đề thi
          </button>
        </div>
      </section>

      {/* 3. KHO ĐỀ THI (Cards không bị cắt) */}
      <section id="kho-de-thi" className="max-w-7xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold mb-8">Khám phá đề thi</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {subjects.map((sub) => (
            <div key={sub.id} className={`${sub.bg} rounded-2xl p-6 h-64 flex flex-col justify-between relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300 shadow-xl`}>
              {/* Badge */}
              <div className="self-start">
                <span className={`${sub.badge} px-3 py-1 rounded-full text-xs font-bold`}>
                  {sub.name}
                </span>
              </div>
              
              {/* Content overlay */}
              <div className="text-center z-10">
                <p className="text-white font-medium mb-4">Đăng nhập để làm bài</p>
                <button 
                  onClick={() => navigate('/login')}
                  className="px-6 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 font-medium backdrop-blur-sm transition-all"
                >
                  Xem chi tiết
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. TÍNH NĂNG (Tại sao chọn QuizSmart?) */}
      <section id="tinh-nang" className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold mb-8">Tại sao chọn QuizSmart?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => (
            <div key={idx} className={`p-6 rounded-2xl border ${feat.borderColor} bg-white shadow-sm hover:shadow-md transition-shadow flex gap-4 items-start`}>
              <div className={`p-3 rounded-xl ${feat.bgColor}`}>
                {feat.icon}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 mb-1">{feat.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{feat.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. BOTTOM CTA (Phần kêu gọi hành động cuối trang) */}
      <section className="bg-[#1e1b4b] text-white text-center py-16 px-4 mt-10">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Bắt đầu tạo các bài kiểm tra tuyệt vời ngay hôm nay</h2>
        <p className="text-indigo-200 mb-8">Cùng tham gia và chia sẻ kiến thức</p>
        <button 
          onClick={() => navigate('/register')}
          className="px-8 py-3.5 rounded-full bg-white text-slate-900 font-bold hover:bg-slate-100 transition-all inline-flex items-center gap-2"
        >
          Tạo bài kiểm tra đầu tiên của bạn
          <ArrowRight size={20} className="text-emerald-500" />
        </button>
      </section>
    </div>
  );
};

export default Home;