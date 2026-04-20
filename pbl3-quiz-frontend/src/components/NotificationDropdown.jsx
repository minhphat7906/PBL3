import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, Clock, Info, AlertTriangle, CheckCircle2, Trash2 } from 'lucide-react';
import axios from 'axios';

const NotificationDropdown = ({ onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:3000/api/v1/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setNotifications(res.data.notifications);
      }
    } catch (err) {
      console.error('Lỗi lấy thông báo:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put('http://localhost:3000/api/v1/notifications/read-all', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('Lỗi cập nhật thông báo:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle2 size={16} className="text-emerald-500" />;
      case 'warning': return <AlertTriangle size={16} className="text-amber-500" />;
      default: return <Info size={16} className="text-indigo-500" />;
    }
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffInSecs = Math.floor((now - date) / 1000);
    
    if (diffInSecs < 60) return 'Vừa xong';
    if (diffInSecs < 3600) return `${Math.floor(diffInSecs / 60)} phút trước`;
    if (diffInSecs < 86400) return `${Math.floor(diffInSecs / 3600)} giờ trước`;
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <div 
      ref={dropdownRef}
      className="absolute right-0 top-full mt-3 w-80 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl z-[100] animate-in fade-in slide-in-from-top-2 duration-200"
    >
      <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
        <h3 className="font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Bell size={18} className="text-indigo-600" /> Thông báo
        </h3>
        {notifications.some(n => !n.is_read) && (
          <button 
            onClick={markAllAsRead}
            className="text-[10px] font-black uppercase tracking-wider text-indigo-600 hover:text-indigo-500 transition-colors"
          >
            Đánh dấu đã đọc
          </button>
        )}
      </div>

      <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
        {loading ? (
          <div className="p-10 text-center">
            <div className="w-8 h-8 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mx-auto" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-10 text-center">
            <div className="w-12 h-12 bg-slate-50 dark:bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-300">
                <Bell size={24} />
            </div>
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Không có thông báo nào</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50 dark:divide-slate-700/50">
            {notifications.map((n) => (
              <div 
                key={n.id} 
                className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors flex gap-3 relative ${!n.is_read ? 'bg-indigo-50/30 dark:bg-indigo-900/10' : ''}`}
              >
                {!n.is_read && <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-600 rounded-full" />}
                <div className="shrink-0 mt-0.5">
                  {getIcon(n.type)}
                </div>
                <div className="flex-1">
                  <p className={`text-sm leading-snug ${!n.is_read ? 'text-slate-900 dark:text-slate-100 font-bold' : 'text-slate-600 dark:text-slate-400 font-medium'}`}>
                    {n.content}
                  </p>
                  <div className="flex items-center gap-1 mt-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                    <Clock size={10} /> {formatTime(n.created_at)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-3 bg-slate-50 dark:bg-slate-700/30 border-t border-slate-100 dark:border-slate-700 text-center">
        <button className="text-xs font-black text-slate-400 hover:text-indigo-600 transition-colors">
          Xem tất cả thông báo
        </button>
      </div>
    </div>
  );
};

export default NotificationDropdown;
