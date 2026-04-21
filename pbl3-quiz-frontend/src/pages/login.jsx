import React, { useState } from 'react';
import axios from 'axios';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:3000/api/v1/auth/login', {
        email,
        password,
      });

      // Lưu thông tin vào máy
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('username', response.data.user.username);
      localStorage.setItem('user', JSON.stringify(response.data.user)); // Lưu full user object

      // Popup thông báo thành công chuyên nghiệp
      Swal.fire({
        title: 'Đăng nhập thành công',
        text: `Chào mừng ${response.data.user.username} đã quay trở lại!`,
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
        background: '#ffffff',
        iconColor: '#4f46e5',
      }).then(() => {
        navigate('/dashboard');
      });
      
    } catch (err) {
      // Popup thông báo lỗi lịch sự
      Swal.fire({
        title: 'Đăng nhập thất bại',
        text: err.response?.data?.message || "Thông tin tài khoản không chính xác, bạn vui lòng kiểm tra lại.",
        icon: 'error',
        confirmButtonColor: '#4f46e5',
        confirmButtonText: 'Đóng'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#f8f9fc] min-h-screen flex flex-col font-sans">
      <nav className="w-full px-6 py-4 flex items-center bg-transparent">
        <div className="flex items-center gap-2 text-[#4f46e5]">
          <div className="w-8 h-8 flex items-center justify-center bg-[#4f46e5] rounded-lg text-white font-bold">Q</div>
          <h1 className="text-slate-900 text-xl font-bold tracking-tight">QuizSmart</h1>
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-[450px] bg-white shadow-xl border border-slate-200 rounded-2xl overflow-hidden">
          <div className="p-8 pb-4 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#4f46e5]/10 text-[#4f46e5] rounded-full mb-4">
              <Lock size={32} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Chào mừng trở lại!</h2>
            <p className="text-slate-500 mt-2 text-sm">Vui lòng đăng nhập để tiếp tục học tập cùng QuizSmart.</p>
          </div>

          <form onSubmit={handleLogin} className="p-8 pt-2 space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-slate-400" size={20} />
                <input
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#4f46e5]/20 focus:border-[#4f46e5] outline-none transition-all"
                  type="email"
                  placeholder="example@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Mật khẩu</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-slate-400" size={20} />
                <input
                  className="w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#4f46e5]/20 focus:border-[#4f46e5] outline-none transition-all"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-[#4f46e5]"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              className="w-full py-3.5 bg-[#4f46e5] hover:bg-[#4338ca] text-white font-bold rounded-xl shadow-lg shadow-[#4f46e5]/20 transition-all disabled:opacity-50 active:scale-[0.98]"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Đang xác thực...' : 'Đăng nhập'}
            </button>
          </form>

          <div className="p-6 bg-slate-50 text-center border-t border-slate-100">
            <p className="text-sm text-slate-600">
              Bạn chưa có tài khoản?{' '}
              <span 
                onClick={() => navigate('/register')} 
                className="font-bold text-[#4f46e5] cursor-pointer hover:underline"
              >
                Đăng ký ngay
              </span>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;