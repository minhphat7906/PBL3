import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, BookOpen, MessageSquare, Trash2, Shield, TrendingUp,
  Search, RefreshCw, Eye, EyeOff, ChevronRight, ChevronLeft,
  CheckCircle, Clock, AlertCircle, Crown, User, X
} from 'lucide-react';
import Swal from 'sweetalert2';

const API = 'http://localhost:3000/api/v1/admin';
const token = () => localStorage.getItem('token');
const authFetch = (url, opts = {}) => fetch(url, {
  ...opts,
  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}`, ...(opts.headers || {}) }
});

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon: Icon, color, sub }) => (
  <div className={`bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all`}>
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 ${color}`}>
      <Icon size={20} />
    </div>
    <p className="text-3xl font-black text-slate-800">{value ?? '—'}</p>
    <p className="text-sm font-semibold text-slate-500 mt-0.5">{label}</p>
    {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
  </div>
);

// ─── Badge ────────────────────────────────────────────────────────────────────
const RoleBadge = ({ role }) => role === 'admin'
  ? <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-600 text-[11px] font-black px-2 py-0.5 rounded-full">🛡️ Admin</span>
  : <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-600 text-[11px] font-black px-2 py-0.5 rounded-full"><User size={10}/> Học viên</span>;

const StatusBadge = ({ status }) => {
  const map = {
    pending:     { cls: 'bg-amber-100 text-amber-700',  label: '⏳ Chờ xử lý', Icon: Clock },
    in_progress: { cls: 'bg-blue-100 text-blue-700',    label: '🔄 Đang xử lý', Icon: RefreshCw },
    resolved:    { cls: 'bg-emerald-100 text-emerald-700', label: '✅ Đã giải quyết', Icon: CheckCircle },
  };
  const s = map[status] || map.pending;
  return <span className={`text-[11px] font-black px-2.5 py-1 rounded-full ${s.cls}`}>{s.label}</span>;
};

// ─── Pagination ───────────────────────────────────────────────────────────────
const Paginator = ({ page, total, limit, onPage }) => {
  const totalPages = Math.ceil(total / limit);
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
      <p className="text-xs text-slate-500">{total} bản ghi · Trang {page}/{totalPages}</p>
      <div className="flex gap-1.5">
        <button onClick={() => onPage(page - 1)} disabled={page === 1}
          className="p-2 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-300 disabled:opacity-40 transition-all">
          <ChevronLeft size={16} />
        </button>
        <button onClick={() => onPage(page + 1)} disabled={page >= totalPages}
          className="p-2 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-300 disabled:opacity-40 transition-all">
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// TABS
// ═══════════════════════════════════════════════════════════════════════════════

// ── Tab: Users ────────────────────────────────────────────────────────────────
const UsersTab = () => {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [page, setPage] = useState(1);
  const LIMIT = 15;

  const fetch_ = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ search, role: roleFilter, page, limit: LIMIT });
    const r = await authFetch(`${API}/users?${params}`);
    const d = await r.json();
    if (d.success) { setUsers(d.users); setTotal(d.total); }
    setLoading(false);
  }, [search, roleFilter, page]);

  useEffect(() => { fetch_(); }, [fetch_]);

  const handleDelete = async (u) => {
    const res = await Swal.fire({
      title: `Xóa tài khoản ${u.username}?`,
      text: 'Toàn bộ dữ liệu liên quan sẽ bị mất!',
      icon: 'warning', showCancelButton: true,
      confirmButtonColor: '#ef4444', confirmButtonText: 'Xóa ngay', cancelButtonText: 'Hủy'
    });
    if (!res.isConfirmed) return;
    const r = await authFetch(`${API}/users/${u.id}`, { method: 'DELETE' });
    const d = await r.json();
    if (d.success) { Swal.fire({ icon: 'success', title: 'Đã xóa!', timer: 1500, showConfirmButton: false }); fetch_(); }
    else Swal.fire('Lỗi', d.message, 'error');
  };

  const handleToggleRole = async (u) => {
    const newRole = u.role === 'admin' ? 'student' : 'admin';
    const res = await Swal.fire({
      title: `Đổi role thành "${newRole}"?`,
      text: `Tài khoản: ${u.username}`,
      icon: 'question', showCancelButton: true,
      confirmButtonColor: '#4f46e5', confirmButtonText: 'Xác nhận'
    });
    if (!res.isConfirmed) return;
    const r = await authFetch(`${API}/users/${u.id}/role`, { method: 'PUT', body: JSON.stringify({ role: newRole }) });
    const d = await r.json();
    if (d.success) { Swal.fire({ icon: 'success', title: d.message, timer: 1500, showConfirmButton: false }); fetch_(); }
    else Swal.fire('Lỗi', d.message, 'error');
  };

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Tìm theo tên, email..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" />
        </div>
        <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1); }}
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-indigo-500 transition-all">
          <option value="all">Tất cả Role</option>
          <option value="student">Học viên</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
                <th className="px-5 py-3.5">Người dùng</th>
                <th className="px-5 py-3.5">Email</th>
                <th className="px-5 py-3.5">Role</th>
                <th className="px-5 py-3.5 text-center">Đề / Lượt</th>
                <th className="px-5 py-3.5">Ngày tạo</th>
                <th className="px-5 py-3.5 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array(6).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-5 py-4"><div className="h-4 bg-slate-100 rounded w-32" /></td>
                    <td className="px-5 py-4"><div className="h-4 bg-slate-100 rounded w-44" /></td>
                    <td className="px-5 py-4"><div className="h-6 bg-slate-100 rounded-full w-20" /></td>
                    <td className="px-5 py-4"><div className="h-4 bg-slate-100 rounded w-16 mx-auto" /></td>
                    <td className="px-5 py-4"><div className="h-4 bg-slate-100 rounded w-24" /></td>
                    <td className="px-5 py-4"><div className="h-8 bg-slate-100 rounded-xl w-24 mx-auto" /></td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr><td colSpan={6} className="py-12 text-center text-slate-400 font-medium">Không có kết quả</td></tr>
              ) : users.map(u => (
                <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center font-black text-sm shrink-0">
                        {u.username.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-semibold text-slate-800 text-sm">{u.username}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 text-sm">{u.email}</td>
                  <td className="px-5 py-3.5"><RoleBadge role={u.role} /></td>
                  <td className="px-5 py-3.5 text-center text-sm text-slate-600 font-medium">
                    {u.quiz_count} đề / {u.attempt_count} lượt
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-400">
                    {new Date(u.created_at).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => handleToggleRole(u)} title="Đổi Role"
                        className="p-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 transition-colors">
                        <Crown size={14} />
                      </button>
                      <button onClick={() => handleDelete(u)} title="Xóa tài khoản"
                        className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3">
          <Paginator page={page} total={total} limit={LIMIT} onPage={setPage} />
        </div>
      </div>
    </div>
  );
};

// ── Tab: Quizzes ──────────────────────────────────────────────────────────────
const QuizzesTab = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const LIMIT = 15;

  const fetch_ = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ search, status: statusFilter, page, limit: LIMIT });
    const r = await authFetch(`${API}/quizzes?${params}`);
    const d = await r.json();
    if (d.success) { setQuizzes(d.quizzes); setTotal(d.total); }
    setLoading(false);
  }, [search, statusFilter, page]);

  useEffect(() => { fetch_(); }, [fetch_]);

  const handleDelete = async (q) => {
    const res = await Swal.fire({
      title: 'Xóa bài quiz?',
      html: `<b>${q.title}</b><br/><span style="color:#94a3b8">của ${q.creator_name}</span>`,
      icon: 'warning', showCancelButton: true,
      confirmButtonColor: '#ef4444', confirmButtonText: 'Xóa'
    });
    if (!res.isConfirmed) return;
    const r = await authFetch(`${API}/quizzes/${q.id}`, { method: 'DELETE' });
    const d = await r.json();
    if (d.success) { Swal.fire({ icon: 'success', title: 'Đã xóa!', timer: 1500, showConfirmButton: false }); fetch_(); }
    else Swal.fire('Lỗi', d.message, 'error');
  };

  const handleTogglePublic = async (q) => {
    const r = await authFetch(`${API}/quizzes/${q.id}/toggle-public`, {
      method: 'PUT', body: JSON.stringify({ is_public: !q.is_public })
    });
    const d = await r.json();
    if (d.success) fetch_();
    else Swal.fire('Lỗi', d.message, 'error');
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Tìm tên quiz hoặc tác giả..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" />
        </div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-indigo-500 transition-all">
          <option value="all">Tất cả</option>
          <option value="public">Công khai</option>
          <option value="private">Riêng tư</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
                <th className="px-5 py-3.5">Bài quiz</th>
                <th className="px-5 py-3.5">Tác giả</th>
                <th className="px-5 py-3.5">Chủ đề</th>
                <th className="px-5 py-3.5 text-center">Câu / Lượt</th>
                <th className="px-5 py-3.5 text-center">Trạng thái</th>
                <th className="px-5 py-3.5 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array(6).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array(6).fill(0).map((_, j) => (
                      <td key={j} className="px-5 py-4"><div className="h-4 bg-slate-100 rounded" /></td>
                    ))}
                  </tr>
                ))
              ) : quizzes.length === 0 ? (
                <tr><td colSpan={6} className="py-12 text-center text-slate-400 font-medium">Không có kết quả</td></tr>
              ) : quizzes.map(q => (
                <tr key={q.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                        {q.image_url
                          ? <img src={q.image_url} alt="" className="w-full h-full object-cover" onError={e => e.target.style.display='none'} />
                          : <div className="w-full h-full flex items-center justify-center text-slate-400"><BookOpen size={16}/></div>
                        }
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 text-sm line-clamp-1 max-w-[200px]">{q.title}</p>
                        <p className="text-xs text-slate-400">{new Date(q.created_at).toLocaleDateString('vi-VN')}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-600 font-medium">{q.creator_name}</td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold">{q.category}</span>
                  </td>
                  <td className="px-5 py-3.5 text-center text-sm text-slate-600 font-medium">
                    {q.question_count} câu / {q.play_count} lượt
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    {q.is_public
                      ? <span className="text-xs bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full font-bold">🌐 Công khai</span>
                      : <span className="text-xs bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full font-bold">🔒 Riêng tư</span>
                    }
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => handleTogglePublic(q)} title={q.is_public ? 'Ẩn quiz' : 'Hiện quiz'}
                        className={`p-2 rounded-lg transition-colors ${q.is_public ? 'bg-amber-50 hover:bg-amber-100 text-amber-600' : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600'}`}>
                        {q.is_public ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                      <button onClick={() => handleDelete(q)} title="Xóa quiz"
                        className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3">
          <Paginator page={page} total={total} limit={LIMIT} onPage={setPage} />
        </div>
      </div>
    </div>
  );
};

// ── Tab: Tickets ──────────────────────────────────────────────────────────────
const TicketsTab = () => {
  const [tickets, setTickets] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState(null);
  const LIMIT = 20;

  const fetch_ = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ status: statusFilter, page, limit: LIMIT });
    const r = await authFetch(`${API}/tickets?${params}`);
    const d = await r.json();
    if (d.success) { setTickets(d.tickets); setTotal(d.total); }
    setLoading(false);
  }, [statusFilter, page]);

  useEffect(() => { fetch_(); }, [fetch_]);

  const handleStatus = async (id, status) => {
    const r = await authFetch(`${API}/tickets/${id}/status`, {
      method: 'PUT', body: JSON.stringify({ status })
    });
    const d = await r.json();
    if (d.success) fetch_();
    else Swal.fire('Lỗi', d.message, 'error');
  };

  const STATUS_OPTIONS = [
    { value: 'pending',     label: '⏳ Chờ xử lý' },
    { value: 'in_progress', label: '🔄 Đang xử lý' },
    { value: 'resolved',    label: '✅ Đã giải quyết' },
  ];

  return (
    <div>
      <div className="flex gap-3 mb-5">
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-indigo-500 transition-all">
          <option value="all">Tất cả trạng thái</option>
          <option value="pending">⏳ Chờ xử lý</option>
          <option value="in_progress">🔄 Đang xử lý</option>
          <option value="resolved">✅ Đã giải quyết</option>
        </select>
      </div>

      <div className="space-y-3">
        {loading ? (
          Array(5).fill(0).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse">
              <div className="flex gap-4">
                <div className="h-4 bg-slate-100 rounded w-40" />
                <div className="h-4 bg-slate-100 rounded w-60" />
                <div className="h-6 bg-slate-100 rounded-full w-24 ml-auto" />
              </div>
            </div>
          ))
        ) : tickets.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-2xl border-2 border-dashed border-slate-200">
            <div className="text-5xl mb-3">📭</div>
            <p className="font-bold text-slate-500">Không có yêu cầu hỗ trợ nào</p>
          </div>
        ) : tickets.map(t => (
          <div key={t.id} className={`bg-white rounded-2xl border transition-all ${expanded === t.id ? 'border-indigo-300 shadow-md shadow-indigo-500/5' : 'border-slate-200'}`}>
            {/* Header row */}
            <div
              className="flex items-center gap-4 px-5 py-4 cursor-pointer"
              onClick={() => setExpanded(expanded === t.id ? null : t.id)}
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 text-white flex items-center justify-center font-black text-sm shrink-0">
                {t.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-800 text-sm truncate">{t.subject}</p>
                <p className="text-xs text-slate-400 mt-0.5">{t.name} · {t.email} · {new Date(t.created_at).toLocaleDateString('vi-VN')}</p>
              </div>
              <StatusBadge status={t.status} />
              <ChevronRight size={16} className={`text-slate-400 transition-transform shrink-0 ${expanded === t.id ? 'rotate-90' : ''}`} />
            </div>

            {/* Expanded content */}
            {expanded === t.id && (
              <div className="px-5 pb-5 border-t border-slate-100">
                <p className="text-sm text-slate-600 leading-relaxed mt-4 bg-slate-50 rounded-xl p-4">{t.message}</p>
                <div className="flex items-center gap-2 mt-4 flex-wrap">
                  <span className="text-xs font-bold text-slate-400">Đổi trạng thái:</span>
                  {STATUS_OPTIONS.map(opt => (
                    <button key={opt.value} onClick={() => handleStatus(t.id, opt.value)}
                      className={`text-xs px-3 py-1.5 rounded-full font-bold transition-all border ${
                        t.status === opt.value
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-400 hover:text-indigo-600'
                      }`}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-4">
        <Paginator page={page} total={total} limit={LIMIT} onPage={setPage} />
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN ADMIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════
const AdminPage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('users');

  // Guard: chỉ admin mới được vào
  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      if (!token) { navigate('/login'); return; }
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload?.role !== 'admin') { navigate('/dashboard'); return; }
    } catch { navigate('/dashboard'); }
  }, [navigate]);

  useEffect(() => {
    authFetch(`${API}/stats`).then(r => r.json()).then(d => {
      if (d.success) setStats(d.stats);
    }).catch(() => {});
  }, []);

  const TABS = [
    { id: 'users',   label: 'Người dùng', icon: Users    },
    { id: 'quizzes', label: 'Ki\u1ec3m duyệt Quiz', icon: BookOpen },
    { id: 'tickets', label: 'Yêu cầu hỗ trợ', icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-[#f3f4f8] font-sans">
      {/* ── Top Bar ── */}
      <header className="bg-[#1e1b4b] text-white px-8 py-4 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-rose-500/20 border border-rose-500/40 rounded-xl flex items-center justify-center">
            <Shield size={18} className="text-rose-300" />
          </div>
          <div>
            <h1 className="font-black text-lg leading-none">Quản trị hệ thống</h1>
            <p className="text-white/40 text-xs mt-0.5">QuizSmart Admin Panel</p>
          </div>
        </div>
        <button onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/15 border border-white/20 rounded-xl text-sm font-semibold transition-all">
          <ChevronLeft size={16} /> Về Dashboard
        </button>
      </header>

      <div className="max-w-7xl mx-auto px-8 py-8">

        {/* ── Stats Grid ── */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
            <StatCard label="Tổng người dùng" value={stats.total_users}   icon={Users}          color="bg-indigo-50 text-indigo-600" />
            <StatCard label="Quản trị viên"   value={stats.total_admins}  icon={Shield}         color="bg-rose-50 text-rose-500" />
            <StatCard label="Tổng bài quiz"   value={stats.total_quizzes} icon={BookOpen}        color="bg-violet-50 text-violet-600" />
            <StatCard label="Quiz công khai"  value={stats.public_quizzes} icon={Eye}            color="bg-emerald-50 text-emerald-600" />
            <StatCard label="Tổng lượt làm"  value={stats.total_attempts} icon={TrendingUp}     color="bg-amber-50 text-amber-600" />
            <StatCard label="Ticket chờ xử lý" value={stats.pending_tickets} icon={AlertCircle} color="bg-orange-50 text-orange-500"
              sub={stats.pending_tickets > 0 ? '⚠️ Cần xem xét' : '✅ Cập nhật'} />
          </div>
        )}

        {/* ── Tabs ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Tab Header */}
          <div className="flex border-b border-slate-200 bg-slate-50">
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2.5 px-6 py-4 text-sm font-bold transition-all border-b-2 -mb-px
                  ${activeTab === tab.id
                    ? 'border-indigo-600 text-indigo-700 bg-white'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-white/60'
                  }`}>
                <tab.icon size={16} />
                {tab.label}
                {tab.id === 'tickets' && stats?.pending_tickets > 0 && (
                  <span className="w-5 h-5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center">
                    {stats.pending_tickets > 9 ? '9+' : stats.pending_tickets}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'users'   && <UsersTab />}
            {activeTab === 'quizzes' && <QuizzesTab />}
            {activeTab === 'tickets' && <TicketsTab />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
