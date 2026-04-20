import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HelpCircle, BookOpen, MessageSquare, ChevronDown, ChevronRight,
  Search, Mail, Phone, CheckCircle, Send, Clock, Zap, Shield, LifeBuoy
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import axios from 'axios';

// ─── FAQ Data ─────────────────────────────────────────────────────────────────
const FAQ_DATA = [
  {
    category: 'Tài khoản & Bảo mật',
    icon: Shield,
    color: 'indigo',
    items: [
      {
        q: 'Làm thế nào để đổi mật khẩu?',
        a: 'Vào mục Trang cá nhân → kéo xuống phần "Đổi mật khẩu" → nhập mật khẩu hiện tại và mật khẩu mới (tối thiểu 6 ký tự) → nhấn Lưu.'
      },
      {
        q: 'Tôi quên mật khẩu, phải làm gì?',
        a: 'Hiện tại hệ thống chưa hỗ trợ tự khôi phục mật khẩu qua email. Vui lòng liên hệ quản trị viên qua form hỗ trợ bên dưới để được hỗ trợ đặt lại mật khẩu.'
      },
      {
        q: 'Làm sao để cập nhật thông tin cá nhân?',
        a: 'Vào Trang cá nhân → nhấn nút "Chỉnh sửa" → cập nhật Tên, Bio và Avatar URL → nhấn Lưu.'
      },
    ]
  },
  {
    category: 'Tạo & Quản lý đề thi',
    icon: BookOpen,
    color: 'emerald',
    items: [
      {
        q: 'Làm sao để tạo đề thi mới?',
        a: 'Nhấn nút "+ Tạo đề" ở Dashboard hoặc truy cập /create-quiz. Bạn có thể tạo thủ công từng câu hỏi hoặc dùng tính năng "Tạo bằng AI" từ văn bản/file PDF.'
      },
      {
        q: 'Tôi có thể tạo đề từ file PDF không?',
        a: 'Có! Chọn tab "Tạo bằng AI" khi tạo đề. Upload file PDF hoặc Word và AI sẽ tự động phân tích nội dung để tạo các câu hỏi phù hợp cho bạn.'
      },
      {
        q: 'Đề của tôi có thể chia sẻ công khai không?',
        a: 'Khi tạo đề, bạn có thể chọn trạng thái "Công khai" để mọi người trong cộng đồng đều thấy, hoặc "Cá nhân" để chỉ mình bạn truy cập.'
      },
      {
        q: 'Xóa đề thi thì có khôi phục được không?',
        a: 'Không. Khi xóa đề thi, toàn bộ câu hỏi và lịch sử làm bài liên quan sẽ bị xóa vĩnh viễn và không thể phục hồi. Hãy cân nhắc trước khi xóa.'
      },
    ]
  },
  {
    category: 'Làm bài & Kết quả',
    icon: CheckCircle,
    color: 'amber',
    items: [
      {
        q: 'Điểm số được tính như thế nào?',
        a: 'Mỗi câu trả lời đúng được 10 điểm. Điểm phần trăm = (số câu đúng / tổng số câu) × 100. Điểm cao nhất sẽ được lưu làm "Best Score" trong lịch sử.'
      },
      {
        q: 'Tôi có thể làm lại đề thi nhiều lần không?',
        a: 'Có! Bạn có thể làm lại đề thi bao nhiêu lần tùy thích. Tất cả các lần làm đều được lưu vào lịch sử và hiển thị theo dạng timeline.'
      },
      {
        q: 'Streak là gì và tính như thế nào?',
        a: 'Streak là số ngày liên tiếp bạn đã làm bài. Mỗi ngày bạn hoàn thành ít nhất 1 bài thi, streak tăng thêm 1. Nếu bỏ lỡ 1 ngày, streak sẽ reset về 0.'
      },
    ]
  },
];

// ─── FAQ Item ──────────────────────────────────────────────────────────────────
const FAQItem = ({ item }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className={`border rounded-2xl overflow-hidden transition-all duration-200 ${open ? 'border-indigo-300 dark:border-indigo-600 shadow-md shadow-indigo-500/5' : 'border-slate-200 dark:border-slate-700'}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors"
      >
        <span className="font-semibold text-slate-800 dark:text-slate-100 text-sm pr-4">{item.q}</span>
        <ChevronDown size={18} className={`text-slate-400 shrink-0 transition-transform duration-300 ${open ? 'rotate-180 text-indigo-500' : ''}`} />
      </button>
      {open && (
        <div className="px-5 pb-5 pt-1">
          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{item.a}</p>
        </div>
      )}
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────
const HelpPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [submitStatus, setSubmitStatus] = useState(null); // null | 'loading' | 'success' | 'error'
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const colorMap = {
    indigo: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400',
    emerald: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
    amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
  };

  // ── Filter FAQ by search ──
  const filteredFAQ = FAQ_DATA.map(cat => ({
    ...cat,
    items: cat.items.filter(item =>
      item.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.a.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(cat => cat.items.length > 0);

  // ── Submit support form → gọi API thật ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus('loading');
    try {
      const res = await fetch('http://localhost:3000/api/v1/users/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.success) {
        setSubmitStatus('success');
        setForm({ name: '', email: '', subject: '', message: '' });
        setTimeout(() => setSubmitStatus(null), 5000);
      } else {
        setSubmitStatus(null);
        alert('Gửi thất bại: ' + data.message);
      }
    } catch {
      setSubmitStatus(null);
      alert('Lỗi kết nối. Vui lòng thử lại.');
    }
  };


  return (
    <div className="flex min-h-screen bg-[#f3f4f8] dark:bg-slate-900 font-sans text-slate-900 dark:text-slate-200 transition-colors duration-300">

      {/* ── Sidebar ── */}
      <Sidebar />

      {/* ── Main Content ── */}
      <main className="flex-1 ml-64 p-8 overflow-x-hidden">
        <div className="max-w-5xl mx-auto">

          {/* ── Header ── */}
          <div className="mb-10">
            <div className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-4">
              <LifeBuoy size={13} /> Trung tâm Trợ giúp
            </div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-slate-100 mb-3">
              Chúng tôi có thể giúp gì cho bạn? 🤝
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-lg">
              Tìm câu trả lời nhanh trong FAQ, hoặc gửi yêu cầu hỗ trợ tới đội ngũ của chúng tôi.
            </p>
          </div>

          {/* ── Quick Action Cards ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            {[
              { icon: BookOpen, label: 'Hướng dẫn sử dụng', desc: 'Tài liệu chi tiết từng tính năng', color: 'from-indigo-500 to-violet-600' },
              { icon: MessageSquare, label: 'Gửi yêu cầu hỗ trợ', desc: 'Liên hệ đội ngũ kỹ thuật', color: 'from-emerald-400 to-teal-500', action: () => document.getElementById('support-form').scrollIntoView({ behavior: 'smooth' }) },
              { icon: Clock, label: 'Thời gian phản hồi', desc: 'Trong vòng 24 giờ làm việc', color: 'from-amber-400 to-orange-500' },
            ].map((card, i) => (
              <button
                key={i}
                onClick={card.action}
                className={`bg-gradient-to-br ${card.color} text-white p-5 rounded-2xl text-left shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 ${card.action ? 'cursor-pointer' : 'cursor-default'}`}
              >
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-3">
                  <card.icon size={20} />
                </div>
                <p className="font-black text-sm">{card.label}</p>
                <p className="text-white/75 text-xs mt-0.5">{card.desc}</p>
              </button>
            ))}
          </div>

          {/* ── FAQ Section ── */}
          <div className="mb-12">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100">Câu hỏi thường gặp</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Tìm kiếm câu trả lời nhanh nhất</p>
              </div>
              {/* Search */}
              <div className="relative w-full md:w-72">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                <input
                  type="text"
                  placeholder="Tìm trong FAQ..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium placeholder-slate-400"
                />
              </div>
            </div>

            {filteredFAQ.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                <div className="text-5xl mb-3">🔍</div>
                <p className="font-bold text-slate-600 dark:text-slate-300">Không tìm thấy kết quả cho "{searchTerm}"</p>
                <p className="text-slate-400 text-sm mt-1">Hãy thử từ khóa khác hoặc gửi yêu cầu hỗ trợ.</p>
              </div>
            ) : (
              <div className="space-y-8">
                {filteredFAQ.map((cat) => (
                  <div key={cat.category}>
                    <div className="flex items-center gap-2.5 mb-4">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${colorMap[cat.color]}`}>
                        <cat.icon size={16} />
                      </div>
                      <h3 className="font-black text-slate-700 dark:text-slate-300 text-sm uppercase tracking-wider">{cat.category}</h3>
                    </div>
                    <div className="space-y-2.5">
                      {cat.items.map((item, i) => <FAQItem key={i} item={item} />)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Support Request Form ── */}
          <div id="support-form" className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
                <Send size={18} className="text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-800 dark:text-slate-100">Gửi yêu cầu hỗ trợ</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Đội ngũ kỹ thuật sẽ phản hồi trong vòng 24 giờ</p>
              </div>
            </div>

            {submitStatus === 'success' ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle size={32} className="text-emerald-500" />
                </div>
                <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 mb-2">Đã gửi thành công! ✉️</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm">
                  Chúng tôi đã nhận được yêu cầu của bạn và sẽ liên hệ qua email trong thời gian sớm nhất.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Họ và tên</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Nguyễn Văn A"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder-slate-400"
                  />
                </div>
                {/* Email */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Email liên hệ</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="example@gmail.com"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder-slate-400"
                  />
                </div>
                {/* Subject */}
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Chủ đề</label>
                  <input
                    type="text"
                    required
                    value={form.subject}
                    onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                    placeholder="VD: Không thể đăng nhập / Lỗi hiển thị kết quả..."
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder-slate-400"
                  />
                </div>
                {/* Message */}
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Mô tả chi tiết</label>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    placeholder="Mô tả vấn đề bạn đang gặp phải một cách chi tiết nhất có thể..."
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder-slate-400 resize-none"
                  />
                </div>
                {/* Submit */}
                <div className="md:col-span-2">
                  <button
                    type="submit"
                    disabled={submitStatus === 'loading'}
                    className="flex items-center gap-2.5 px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed text-white font-black rounded-xl shadow-lg shadow-indigo-500/25 transition-all hover:shadow-indigo-500/40 hover:-translate-y-0.5"
                  >
                    {submitStatus === 'loading' ? (
                      <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Đang gửi...</>
                    ) : (
                      <><Send size={16} /> Gửi yêu cầu hỗ trợ</>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* ── Contact Info ── */}
          <div className="mt-8 flex flex-col md:flex-row items-center justify-center gap-6 text-sm text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <Mail size={15} className="text-indigo-400" />
              <span>support@quizsmart.vn</span>
            </div>
            <div className="hidden md:block w-px h-4 bg-slate-300 dark:bg-slate-600" />
            <div className="flex items-center gap-2">
              <Clock size={15} className="text-indigo-400" />
              <span>Hỗ trợ: 8:00 - 17:00, Thứ 2 - Thứ 6</span>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default HelpPage;
