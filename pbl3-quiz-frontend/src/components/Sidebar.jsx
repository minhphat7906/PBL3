import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, BookOpen, Clock, BarChart3, Flame, HelpCircle } from 'lucide-react';

const API_BASE = 'http://localhost:3000/api/v1';

/**
 * Shared Sidebar – tự fetch streak, dùng cho tất cả các trang.
 * Không cần truyền prop streakInfo từ ngoài.
 */
const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const username = localStorage.getItem('username') || 'Người học';

  // ── Self-managed streak state ──
  const [streakInfo, setStreakInfo] = useState({ streak: 0, isActiveToday: false });

  useEffect(() => {
    const fetchStreak = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const res = await fetch(`${API_BASE}/quizzes/streak`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setStreakInfo({ streak: data.streak, isActiveToday: data.isActiveToday });
        }
      } catch (err) {
        // Silent fail – streak badge hiện 0 cũng không ảnh hưởng UX chính
      }
    };
    fetchStreak();
  }, [location.pathname]); // Re-fetch mỗi khi chuyển trang

  // ── Role từ JWT ──
  const getUserRole = () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return 'student';
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload?.role || 'student';
    } catch { return 'student'; }
  };
  const userRole = getUserRole();

  const NAV_ITEMS = [
    { icon: Home,       label: 'Trang chủ',     path: '/dashboard' },
    { icon: BookOpen,   label: 'Kho đề thi',    path: '/explore' },
    { icon: Clock,      label: 'Lịch sử thi',   path: '/history' },
    { icon: BarChart3,  label: 'Bảng xếp hạng', path: '/leaderboard' },
    { icon: HelpCircle, label: 'Trợ giúp',      path: '/help' },
  ];

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <aside className="w-64 bg-[#1e1b4b] text-white/70 p-6 flex flex-col fixed h-full z-30 shadow-2xl">

      {/* ── Logo ── */}
      <div
        className="flex items-center gap-2 text-white font-black text-2xl mb-10 cursor-pointer select-none"
        onClick={() => navigate('/dashboard')}
      >
        <BookOpen className="text-indigo-400" size={26} />
        QuizSmart
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map(({ icon: Icon, label, path }) => (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-sm font-semibold
              ${isActive(path)
                ? 'bg-indigo-600/30 text-white border border-indigo-500/40'
                : 'hover:bg-white/8 hover:text-white text-white/60'
              }`}
          >
            <Icon size={18} />
            {label}
          </button>
        ))}

        {/* ── Admin link (chỉ hiện khi role = admin) ── */}
        {userRole === 'admin' && (
          <button
            onClick={() => navigate('/admin')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-sm font-semibold mt-2
              ${isActive('/admin')
                ? 'bg-rose-600/30 text-rose-300 border border-rose-500/40'
                : 'hover:bg-rose-500/10 hover:text-rose-300 text-white/40'
              }`}
          >
            <span className="text-base">🛡️</span>
            Quản trị hệ thống
          </button>
        )}
      </nav>

      {/* ── Streak Badge ── */}
      <div className={`my-4 px-4 py-4 rounded-2xl border transition-all ${
        streakInfo.isActiveToday
          ? 'bg-gradient-to-r from-orange-500/25 to-red-500/10 border-orange-500/40'
          : 'bg-white/5 border-white/10'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
            streakInfo.isActiveToday ? 'bg-orange-500/30' : 'bg-white/5'
          }`}>
            <Flame
              size={24}
              className={streakInfo.isActiveToday ? 'text-orange-400' : 'text-slate-500'}
              fill={streakInfo.isActiveToday ? 'currentColor' : 'none'}
            />
          </div>
          <div>
            <p className="text-white font-black text-2xl leading-none">
              {streakInfo.streak}
              <span className="text-sm font-bold text-white/50 ml-1">ngày</span>
            </p>
            <p className={`text-[10px] font-bold uppercase tracking-widest mt-0.5 ${
              streakInfo.isActiveToday ? 'text-orange-400' : 'text-slate-500'
            }`}>
              {streakInfo.isActiveToday ? '🔥 Đang cháy!' : 'Chưa học hôm nay'}
            </p>
          </div>
        </div>
      </div>

      {/* ── Identity Card ── */}
      <div className="pt-4 border-t border-white/10">
        <div
          onClick={() => navigate('/profile')}
          className="flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer hover:bg-white/5 transition-all group"
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center font-black text-sm shrink-0 ring-2 ring-white/20 group-hover:ring-indigo-400/50 transition-all">
            {username.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden flex-1">
            <p className="text-white font-bold text-sm truncate leading-snug">{username}</p>
            {userRole === 'admin' ? (
              <span className="inline-flex items-center gap-1 bg-rose-500/20 text-rose-400 text-[10px] font-black px-1.5 py-0.5 rounded-full mt-0.5">
                🛡️ Admin
              </span>
            ) : (
              <span className="text-[10px] font-bold text-white/40 mt-0.5 uppercase tracking-wider">
                Thành viên
              </span>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
