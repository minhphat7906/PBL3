import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bell, ChevronDown, User, Settings, HelpCircle, LogOut, Quote } from 'lucide-react';
import axios from 'axios';
import Swal from 'sweetalert2';
import ThemeSwitcher from './ThemeSwitcher';
import NotificationDropdown from './NotificationDropdown';

const API_BASE = 'http://localhost:3000/api/v1';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const username = localStorage.getItem('username') || 'Người học';
  const email = JSON.parse(localStorage.getItem('user') || '{}')?.email || 'quizsmart@user.com';

  // ─── Quote State & Cycling ───
  const [quote, setQuote] = useState("Sự đầu tư vào kiến thức mang lại lợi nhuận cao nhất.");
  const quotes = [
    "Học, học nữa, học mãi. - V.I. Lenin",
    "Thành công là kết quả của sự kiên trì. - A. Einstein",
    "Sự đầu tư vào kiến thức mang lại lợi nhuận cao nhất.",
    "Trên bước đường thành công không có dấu chân của kẻ lười biếng.",
    "Ngày hôm nay là học trò của ngày hôm qua."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // ─── Notifications State ───
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotificationsCount = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await axios.get(`${API_BASE}/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        const unread = res.data.notifications.filter(n => !n.is_read).length;
        setUnreadCount(unread);
      }
    } catch (err) {
      console.error('Lỗi lấy số lượng thông báo:', err);
    }
  };

  useEffect(() => {
    fetchNotificationsCount();
    // Periodically fetch notification count every 30 seconds
    const interval = setInterval(fetchNotificationsCount, 30000);
    return () => clearInterval(interval);
  }, [location.pathname]);

  // ─── User Profile Menu Dropdown State ───
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ─── Handlers ───
  const handleLogout = () => {
    setShowUserMenu(false);
    Swal.fire({
      title: 'Đăng xuất?',
      text: 'Bạn có chắc chắn muốn đăng xuất khỏi tài khoản?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#4f46e5',
      confirmButtonText: 'Đăng xuất',
      cancelButtonText: 'Ở lại',
      background: document.documentElement.classList.contains('dark') ? '#171527' : '#ffffff',
      color: document.documentElement.classList.contains('dark') ? '#f1f5f9' : '#1e293b'
    }).then(r => {
      if (r.isConfirmed) {
        localStorage.clear();
        navigate('/login');
      }
    });
  };

  return (
    <header className="fixed top-0 left-64 right-0 h-20 z-40 flex items-center justify-between px-8 bg-white/80 dark:bg-slate-900/85 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/80 transition-all duration-300">
      
      {/* ── Left: Interactive Quote Banner ── */}
      <div className="flex-1 flex items-center min-w-0 pr-4">
        <div className="hidden md:flex items-center border border-[var(--theme-primary-light)]/40 dark:border-[var(--theme-primary-dark)]/30 rounded-full px-5 py-2 bg-[var(--theme-primary-light)]/30 dark:bg-[var(--theme-primary-dark)]/10 max-w-lg shadow-inner overflow-hidden">
          <Quote size={14} className="text-amber-500 mr-2 shrink-0 animate-bounce" />
          <p className="text-xs font-bold text-slate-600 dark:text-slate-400 italic truncate" key={quote}>
            {quote}
          </p>
        </div>
      </div>

      {/* ── Right: Controls Group ── */}
      <div className="flex items-center gap-4 shrink-0">
        
        {/* Theme Customizer Switcher */}
        <ThemeSwitcher mode="header" />

        {/* Notifications Icon and Panel */}
        <div className="relative">
          <button 
            onClick={() => {
              setShowNotifications(!showNotifications);
              if (!showNotifications) setUnreadCount(0); // Mark as temporarily viewed
            }}
            className="p-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm cursor-pointer transition-all duration-200 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 relative outline-none"
            title="Thông báo"
          >
            <Bell className={unreadCount > 0 ? "text-indigo-600 dark:text-indigo-400 animate-pulse" : ""} size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 rounded-full text-white text-[10px] font-black flex items-center justify-center border-2 border-white dark:border-slate-800 animate-bounce">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          {showNotifications && (
            <NotificationDropdown onClose={() => setShowNotifications(false)} />
          )}
        </div>

        {/* User Identity Premium Dropdown */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className={`flex items-center gap-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border shadow-sm hover:shadow transition-all pl-2 pr-3.5 py-1.5 rounded-full ${
              showUserMenu
                ? 'border-indigo-400 dark:border-indigo-500 ring-2 ring-indigo-400/20'
                : 'border-slate-200 dark:border-slate-700'
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--theme-primary)] to-violet-600 text-white flex items-center justify-center font-black text-sm ring-2 ring-white/20">
              {username.charAt(0).toUpperCase()}
            </div>
            <span className="font-bold text-xs text-slate-700 dark:text-slate-350 hidden sm:block">
              {username}
            </span>
            <ChevronDown size={14} className={`text-slate-400 transition-transform duration-300 ${showUserMenu ? 'rotate-180 text-indigo-500' : ''}`} />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2.5 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              
              {/* Dropdown User Info Header */}
              <div className="px-4 py-4 bg-gradient-to-br from-slate-50 to-indigo-50/20 dark:from-slate-850 dark:to-indigo-950/10 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center font-black text-base shrink-0 ring-2 ring-indigo-400/20">
                    {username.charAt(0).toUpperCase()}
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-bold text-slate-800 dark:text-slate-100 truncate text-sm leading-snug">{username}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5">{email}</p>
                  </div>
                </div>
              </div>

              {/* Navigation Options */}
              <div className="py-1">
                <button
                  onClick={() => { setShowUserMenu(false); navigate('/profile'); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-bold text-left"
                >
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center shrink-0">
                    <User size={14} className="text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-200">Trang cá nhân</p>
                    <p className="text-[9px] text-slate-400 dark:text-slate-500 font-medium">Xem & sửa hồ sơ</p>
                  </div>
                </button>
              </div>

              <div className="py-1 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => { setShowUserMenu(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-bold text-left"
                >
                  <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                    <Settings size={14} className="text-slate-500 dark:text-slate-400" />
                  </div>
                  <span className="text-slate-800 dark:text-slate-200">Cài đặt hệ thống</span>
                </button>
                <button
                  onClick={() => { setShowUserMenu(false); navigate('/help'); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-bold text-left"
                >
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center shrink-0">
                    <HelpCircle size={14} className="text-emerald-500 dark:text-emerald-400" />
                  </div>
                  <span className="text-slate-800 dark:text-slate-200">Trợ giúp & Hỗ trợ</span>
                </button>
              </div>

              {/* Logout Option */}
              <div className="py-1 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors font-black text-left"
                >
                  <div className="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-950/30 flex items-center justify-center shrink-0">
                    <LogOut size={14} className="text-red-500" />
                  </div>
                  <span>Đăng xuất</span>
                </button>
              </div>

            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
