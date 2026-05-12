import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Zap, BookOpen, Settings, Users, Award, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import ThemeSwitcher from '../components/ThemeSwitcher.jsx';

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

  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username') || 'A';

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 transition-colors">
      {/* 1. HEADER (Thanh điều hướng) */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2 text-[var(--theme-primary)] font-bold text-2xl cursor-pointer" onClick={() => navigate('/')}>
          QuizSmart
        </div>
        
        <div className="hidden md:flex items-center gap-8 font-medium text-slate-600 dark:text-slate-300">
          <a href="#kho-de-thi" className="hover:text-[var(--theme-primary)] transition-colors">Kho đề thi</a>
          <a href="#tinh-nang" className="hover:text-[var(--theme-primary)] transition-colors">Tính năng</a>
          <a href="#bang-xep-hang" className="hover:text-[var(--theme-primary)] transition-colors">Bảng xếp hạng</a>
        </div>

        <div className="flex items-center gap-4">
          <ThemeSwitcher mode="header" />
          {token ? (
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-full bg-[var(--theme-primary-light)] text-[var(--theme-primary-dark)] flex items-center justify-center font-black shadow-sm"
              >
                {username.charAt(0).toUpperCase()}
              </div>
              <button 
                onClick={() => navigate('/dashboard')}
                className="px-5 py-2 rounded-full bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-dark)] text-white font-semibold transition-all shadow-lg hidden sm:block"
              >
                Dashboard
              </button>
            </div>
          ) : (
            <>
              <button 
                onClick={() => navigate('/login')}
                className="px-5 py-2 rounded-full border border-slate-300 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
              >
                Đăng nhập
              </button>
              <button 
                onClick={() => navigate('/register')}
                className="px-5 py-2 rounded-full bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-dark)] text-white font-semibold transition-all shadow-lg"
              >
                Đăng ký
              </button>
            </>
          )}
        </div>
      </nav>

      {/* 2. HERO SECTION (Phần giới thiệu chính) */}
      <section className="relative overflow-hidden hero-dark-bg text-center py-24 px-4 text-white">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-12"
        >
          <div className="flex-1 text-left">
            <div className="inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white font-medium text-sm mb-6 shadow-[0_0_15px_rgba(255,255,255,0.2)]">
              ✨ Nền tảng học tập thế hệ mới
            </div>
            <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight leading-tight drop-shadow-lg">
              Nâng tầm kiến thức cùng <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-cyan-300">AI QuizSmart</span>
            </h1>
            <p className="text-indigo-100 text-lg mb-10 max-w-xl leading-relaxed">
              QuizSmart là nền tảng học và thi thông minh, nâng tầm kiến thức của bạn. 
              Sử dụng sức mạnh của AI để tạo bộ đề chỉ trong vài giây.
            </p>
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <button 
                onClick={() => navigate('/register')}
                className="px-8 py-4 rounded-full bg-white text-[var(--theme-primary-dark)] font-black hover:bg-slate-100 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-105 active:scale-95"
              >
                Bắt đầu miễn phí
              </button>
              <button 
                onClick={() => navigate('/explore')}
                className="px-8 py-4 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/30 font-bold backdrop-blur-md transition-all hover:scale-105 active:scale-95"
              >
                Khám phá kho đề
              </button>
            </div>
          </div>

          <div className="flex-1 relative w-full perspective-1000">
            <motion.div 
              animate={{ y: [-10, 10, -10], rotateX: [5, -5, 5], rotateY: [-5, 5, -5] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl border border-white/20 bg-slate-900/50 backdrop-blur-sm"
            >
              <div className="absolute top-0 w-full h-8 bg-slate-800/80 flex items-center px-4 gap-2">
                 <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                 <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                 <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              </div>
              <div className="mt-8 p-6 grid grid-cols-3 gap-4 h-full opacity-80">
                 <div className="col-span-2 space-y-4">
                    <div className="h-24 rounded-xl bg-gradient-to-r from-[var(--theme-primary)]/40 to-purple-500/40"></div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="h-32 rounded-xl bg-slate-700/50"></div>
                       <div className="h-32 rounded-xl bg-slate-700/50"></div>
                    </div>
                 </div>
                 <div className="col-span-1 space-y-4">
                    <div className="h-16 rounded-xl bg-emerald-500/40"></div>
                    <div className="h-40 rounded-xl bg-amber-500/40"></div>
                 </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* 3. KHO ĐỀ THI */}
      <section id="kho-de-thi" className="max-w-7xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold mb-8 dark:text-white">Khám phá đề thi</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {subjects.map((sub) => (
            <div key={sub.id} className={`${sub.bg} rounded-2xl p-6 h-64 flex flex-col justify-between relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300 shadow-xl`}>
              <div className="self-start">
                <span className={`${sub.badge} px-3 py-1 rounded-full text-xs font-bold`}>
                  {sub.name}
                </span>
              </div>
              
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

      {/* 4. TÍNH NĂNG */}
      <section id="tinh-nang" className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-slate-100 mb-4">Tại sao chọn QuizSmart?</h2>
          <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto">Trải nghiệm nền tảng giáo dục thông minh với hàng loạt công cụ mạnh mẽ được thiết kế để tối ưu hóa việc học của bạn.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feat, idx) => (
            <motion.div 
              key={idx} 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className={`p-8 rounded-[24px] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col items-start group relative overflow-hidden`}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[var(--theme-primary)]/5 to-purple-500/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700"></div>
              <div className={`p-4 rounded-2xl ${feat.bgColor} mb-6 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-sm`}>
                {feat.icon}
              </div>
              <h3 className="font-black text-xl text-slate-900 dark:text-slate-100 mb-3">{feat.title}</h3>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 5. BOTTOM CTA */}
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