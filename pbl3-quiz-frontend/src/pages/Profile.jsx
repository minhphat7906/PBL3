import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  User, Mail, Calendar, Flame, BookOpen, ClipboardList,
  Lock, Camera, Edit3, Save, X, ChevronLeft, Shield,
  CheckCircle, AlertCircle, Eye, EyeOff, BarChart2, Star
} from 'lucide-react';

const API_BASE = 'http://localhost:3000/api/v1';

// ─── Toast Component ──────────────────────────────────────────────────────────
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl border transition-all duration-300 animate-slide-in
      ${type === 'success'
        ? 'bg-emerald-900/90 border-emerald-600/50 text-emerald-100'
        : 'bg-red-900/90 border-red-600/50 text-red-100'}`}>
      {type === 'success'
        ? <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
        : <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />}
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100 transition-opacity">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, iconColor }) => (
  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 flex flex-col items-center text-center gap-2 hover:border-indigo-200 dark:hover:border-indigo-800 transition-all shadow-sm group">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-slate-50 dark:bg-slate-800 group-hover:scale-110 transition-transform ${iconColor}`}>
      <Icon className="w-6 h-6" />
    </div>
    <p className="text-2xl font-black text-slate-900 dark:text-white">{value ?? '—'}</p>
    <p className="text-xs text-slate-500 dark:text-slate-400 font-bold leading-tight uppercase tracking-widest">{label}</p>
  </div>
);

// ─── Avatar Component ─────────────────────────────────────────────────────────
const AvatarDisplay = ({ avatarUrl, username, size = 'lg' }) => {
  const sizeClass = size === 'lg' ? 'w-32 h-32 text-5xl' : 'w-16 h-16 text-xl';
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={username}
        className={`${sizeClass} rounded-3xl object-cover border-4 border-white dark:border-slate-800 ring-4 ring-indigo-500/10 shadow-xl`}
      />
    );
  }
  const initials = (username || '?').slice(0, 2).toUpperCase();
  return (
    <div className={`${sizeClass} rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center border-4 border-white dark:border-slate-800 ring-4 ring-indigo-500/10 shadow-xl font-black text-white`}>
      {initials}
    </div>
  );
};

// ─── Main Profile Component ──────────────────────────────────────────────────
export default function Profile() {
  const { userId } = useParams();
  const navigate = useNavigate();

  // Lấy thông tin user đang đăng nhập từ localStorage
  const token = localStorage.getItem('token');

  // Decode JWT payload để lấy user id (fallback an toàn)
  const getLoggedInUserId = () => {
    // Ưu tiên lấy từ 'user' object
    try {
      const stored = JSON.parse(localStorage.getItem('user') || 'null');
      if (stored?.id) return stored.id;
    } catch {}
    // Fallback: decode JWT payload (base64 phần thứ 2)
    try {
      if (!token) return null;
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload?.id || null;
    } catch {}
    return null;
  };

  const loggedInUserId = getLoggedInUserId();

  // isOwnProfile: true nếu không có userId param, hoặc userId === loggedInUserId
  const isOwnProfile = !userId || parseInt(userId) === loggedInUserId;

  // ─── State ────────────────────────────────────────────────────────────────
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  // Edit Bio/Name state
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [editUsername, setEditUsername] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editAvatarUrl, setEditAvatarUrl] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Change Password state
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });

  // ─── Fetch Profile ────────────────────────────────────────────────────────
  const fetchProfile = useCallback(async () => {
    if (!token) { navigate('/login'); return; }
    setLoading(true);
    setError(null);
    try {
      const url = userId
        ? `${API_BASE}/users/profile/${userId}`
        : `${API_BASE}/users/profile`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Lỗi API');
      setProfile(data.user);
      setStats(data.stats);
      setEditUsername(data.user.username || '');
      setEditBio(data.user.bio || '');
      setEditAvatarUrl(data.user.avatar_url || '');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId, token, navigate]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const showToast = (message, type = 'success') => setToast({ message, type });

  // ─── Save Profile (Bio / Name / Avatar) ──────────────────────────────────
  const handleSaveProfile = async () => {
    if (!editUsername.trim()) {
      showToast('Tên người dùng không được để trống', 'error');
      return;
    }
    setSavingProfile(true);
    try {
      const res = await fetch(`${API_BASE}/users/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ username: editUsername, bio: editBio, avatar_url: editAvatarUrl })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      showToast('Cập nhật profile thành công! ✨');
      // Cập nhật localStorage user
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...currentUser, username: editUsername }));
      setIsEditingBio(false);
      fetchProfile();
    } catch (err) {
      showToast(err.message || 'Lỗi cập nhật profile', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  // ─── Change Password ──────────────────────────────────────────────────────
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      showToast('Mật khẩu mới và xác nhận không khớp', 'error');
      return;
    }
    if (pwForm.newPassword.length < 6) {
      showToast('Mật khẩu mới phải có ít nhất 6 ký tự', 'error');
      return;
    }
    setPwLoading(true);
    try {
      const res = await fetch(`${API_BASE}/users/change-password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(pwForm)
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      showToast('Đổi mật khẩu thành công! 🔒');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      showToast(err.message || 'Lỗi đổi mật khẩu', 'error');
    } finally {
      setPwLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Chưa rõ';
    return new Date(dateStr).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // ─── Loading State ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 border-4 border-slate-700 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  // ─── Error State ──────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 border border-red-800/50 rounded-2xl p-8 text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Không thể tải profile</h2>
          <p className="text-slate-400 text-sm mb-6">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-colors text-sm font-medium"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fc] dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Inject animation keyframe */}
      <style>{`
        @keyframes slide-in { from { transform: translateX(120%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        .animate-slide-in { animation: slide-in 0.35s cubic-bezier(.21,1.02,.73,1) forwards; }
      `}</style>

      {/* ── Toast ── */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* ── Top Nav Bar ── */}
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-sm font-bold"
          >
            <ChevronLeft className="w-4 h-4" />
            Quay lại
          </button>
          <span className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-tight">
            {isOwnProfile ? 'Hồ sơ của tôi' : `Hồ sơ: ${profile?.username}`}
          </span>
          {isOwnProfile ? (
            <div className="flex items-center gap-1.5 text-indigo-400 text-xs font-medium">
              <Shield className="w-3.5 h-3.5" />
              Chủ sở hữu
            </div>
          ) : (
            <div className="text-xs text-slate-500">Chỉ xem</div>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">

        {/* ══ HERO SECTION ══════════════════════════════════════════════════════ */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm transition-colors">
          {/* Banner gradient */}
          <div className="h-32 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-900 relative">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(99,102,241,0.25),transparent_60%)]" />
          </div>

          <div className="px-6 pb-6">
            {/* Avatar + Name row */}
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-14 mb-4">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <AvatarDisplay avatarUrl={profile?.avatar_url} username={profile?.username} size="lg" />
                {/* Camera icon – chỉ hiện khi isOwnProfile VÀ đang edit */}
                {isOwnProfile && isEditingBio && (
                  <label
                    htmlFor="avatar-url-input"
                    className="absolute -bottom-1 -right-1 w-8 h-8 bg-indigo-600 hover:bg-indigo-500 rounded-full flex items-center justify-center cursor-pointer transition-colors shadow-lg"
                    title="Nhập URL ảnh đại diện"
                  >
                    <Camera className="w-4 h-4 text-white" />
                  </label>
                )}
              </div>

              {/* Name + join date */}
              <div className="flex-1 pt-2 sm:pt-0 sm:pb-1">
                {isOwnProfile && isEditingBio ? (
                  <input
                    id="profile-username-input"
                    value={editUsername}
                    onChange={e => setEditUsername(e.target.value)}
                    className="text-xl font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full max-w-xs transition-colors"
                    placeholder="Tên hiển thị"
                  />
                ) : (
                  <h1 className="text-3xl font-black text-slate-900 dark:text-white">{profile?.username}</h1>
                )}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5">
                  {isOwnProfile && profile?.email && (
                    <span className="flex items-center gap-1.5 text-slate-400 text-sm">
                      <Mail className="w-3.5 h-3.5" />
                      {profile.email}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5 text-slate-400 text-sm">
                    <Calendar className="w-3.5 h-3.5" />
                    Tham gia từ {formatDate(profile?.created_at)}
                  </span>
                </div>
              </div>

              {/* Edit Profile Button – chỉ hiện khi isOwnProfile */}
              {isOwnProfile && (
                <div className="flex gap-2 pb-1 flex-shrink-0">
                  {isEditingBio ? (
                    <>
                      <button
                        onClick={() => { setIsEditingBio(false); setEditUsername(profile?.username || ''); setEditBio(profile?.bio || ''); setEditAvatarUrl(profile?.avatar_url || ''); }}
                        className="flex items-center gap-1.5 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl text-sm font-medium transition-colors"
                      >
                        <X className="w-4 h-4" /> Hủy
                      </button>
                      <button
                        onClick={handleSaveProfile}
                        disabled={savingProfile}
                        className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white rounded-xl text-sm font-medium transition-colors"
                      >
                        {savingProfile ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                        Lưu
                      </button>
                    </>
                  ) : (
                    <button
                      id="edit-profile-btn"
                      onClick={() => setIsEditingBio(true)}
                      className="flex items-center gap-1.5 px-6 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-black transition-all shadow-sm"
                    >
                      <Edit3 className="w-4 h-4" /> Chỉnh sửa hồ sơ
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Avatar URL Input – chỉ hiện khi đang edit */}
            {isOwnProfile && isEditingBio && (
              <div className="mb-3">
                <label className="block text-xs text-slate-400 mb-1.5 font-medium">URL Ảnh đại diện</label>
                <input
                  id="avatar-url-input"
                  value={editAvatarUrl}
                  onChange={e => setEditAvatarUrl(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-500"
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>
            )}
          </div>
        </div>

        {/* ══ STATS GRID ════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={BookOpen}     label="Đề đã tạo"          value={stats?.quizzes_created}   iconColor="text-indigo-400" />
          <StatCard icon={ClipboardList} label="Đề đã làm"         value={stats?.quizzes_attempted}  iconColor="text-violet-400" />
          <StatCard icon={Flame}        label="Streak dài nhất"    value={`${stats?.max_streak ?? 0} 🔥`} iconColor="text-orange-400" />
          <StatCard icon={Calendar}     label="Ngày tham gia"      value={formatDate(profile?.created_at)} iconColor="text-sky-400" />
        </div>

        {/* ══ MAIN LAYOUT: 2 cột ═══════════════════════════════════════════════ */}
        <div className={`grid gap-6 ${isOwnProfile ? 'lg:grid-cols-2' : 'grid-cols-1'}`}>

          {/* ── CỘT TRÁI: Bio Card ── */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 flex flex-col gap-6 shadow-sm transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
                  <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h2 className="font-black text-slate-900 dark:text-white text-lg">Giới thiệu bản thân</h2>
              </div>
              {!isOwnProfile && (
                <span className="text-xs bg-slate-700 text-slate-400 px-2.5 py-1 rounded-full border border-slate-600">
                  Chỉ xem
                </span>
              )}
            </div>

            {isOwnProfile && isEditingBio ? (
              <textarea
                id="bio-textarea"
                value={editBio}
                onChange={e => setEditBio(e.target.value)}
                rows={5}
                maxLength={500}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-4 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none leading-relaxed transition-colors"
                placeholder="Chia sẻ một chút về bản thân bạn... Bạn thích môn gì? Mục tiêu học tập?"
              />
            ) : (
              <div className="flex-1">
                {profile?.bio ? (
                  <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                    {profile.bio}
                  </p>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 gap-2 text-center">
                    <Star className="w-8 h-8 text-slate-600" />
                    <p className="text-slate-500 text-sm">
                      {isOwnProfile
                        ? 'Bạn chưa có giới thiệu. Nhấn "Chỉnh sửa" để thêm!'
                        : 'Người dùng này chưa có giới thiệu.'}
                    </p>
                  </div>
                )}
              </div>
            )}

            {isOwnProfile && isEditingBio && (
              <p className="text-xs text-slate-500 text-right">{editBio.length}/500 ký tự</p>
            )}
          </div>

          {/* ── CỘT PHẢI: Đổi mật khẩu (CHỈ HIỆN KHI isOwnProfile) ── */}
          {isOwnProfile && (
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 flex flex-col gap-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center">
                  <Lock className="w-4 h-4 text-indigo-400" />
                </div>
                <h2 className="font-semibold text-white">Đổi mật khẩu</h2>
              </div>

              <form onSubmit={handleChangePassword} className="flex flex-col gap-4">

                {/* Current Password */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-slate-400">Mật khẩu hiện tại</label>
                  <div className="relative">
                    <input
                      id="current-password-input"
                      type={showPw.current ? 'text' : 'password'}
                      value={pwForm.currentPassword}
                      onChange={e => setPwForm(p => ({ ...p, currentPassword: e.target.value }))}
                      required
                      className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 pr-10 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="••••••••"
                    />
                    <button type="button" onClick={() => setShowPw(s => ({ ...s, current: !s.current }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                      {showPw.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-slate-400">Mật khẩu mới</label>
                  <div className="relative">
                    <input
                      id="new-password-input"
                      type={showPw.new ? 'text' : 'password'}
                      value={pwForm.newPassword}
                      onChange={e => setPwForm(p => ({ ...p, newPassword: e.target.value }))}
                      required
                      minLength={6}
                      className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 pr-10 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Tối thiểu 6 ký tự"
                    />
                    <button type="button" onClick={() => setShowPw(s => ({ ...s, new: !s.new }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                      {showPw.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {/* Strength indicator */}
                  {pwForm.newPassword && (
                    <div className="flex gap-1 mt-0.5">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${
                          pwForm.newPassword.length >= i * 3
                            ? i <= 2 ? 'bg-orange-500' : 'bg-emerald-500'
                            : 'bg-slate-600'
                        }`} />
                      ))}
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-slate-400">Xác nhận mật khẩu mới</label>
                  <div className="relative">
                    <input
                      id="confirm-password-input"
                      type={showPw.confirm ? 'text' : 'password'}
                      value={pwForm.confirmPassword}
                      onChange={e => setPwForm(p => ({ ...p, confirmPassword: e.target.value }))}
                      required
                      className={`w-full bg-slate-700 border rounded-xl px-4 py-2.5 pr-10 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                        pwForm.confirmPassword && pwForm.newPassword !== pwForm.confirmPassword
                          ? 'border-red-600'
                          : pwForm.confirmPassword && pwForm.newPassword === pwForm.confirmPassword
                          ? 'border-emerald-600'
                          : 'border-slate-600'
                      }`}
                      placeholder="Nhập lại mật khẩu mới"
                    />
                    <button type="button" onClick={() => setShowPw(s => ({ ...s, confirm: !s.confirm }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                      {showPw.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {pwForm.confirmPassword && pwForm.newPassword !== pwForm.confirmPassword && (
                    <p className="text-xs text-red-400">Mật khẩu không khớp</p>
                  )}
                </div>

                <button
                  id="change-password-submit"
                  type="submit"
                  disabled={pwLoading}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors text-sm mt-1"
                >
                  {pwLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Lock className="w-4 h-4" />
                  )}
                  {pwLoading ? 'Đang xử lý...' : 'Lưu mật khẩu mới'}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* ══ VIEW-ONLY NOTICE (chỉ hiện khi xem người khác) ══════════════════ */}
        {!isOwnProfile && (
          <div className="flex items-center gap-3 bg-slate-800/50 border border-slate-700/50 rounded-2xl px-5 py-4 text-slate-500 text-sm">
            <BarChart2 className="w-4 h-4 text-slate-600 flex-shrink-0" />
            Bạn đang xem hồ sơ công khai của <span className="font-semibold text-slate-400 mx-1">{profile?.username}</span>.
            Thông tin cá nhân và các tùy chọn chỉnh sửa không được hiển thị.
          </div>
        )}

      </div>
    </div>
  );
}
