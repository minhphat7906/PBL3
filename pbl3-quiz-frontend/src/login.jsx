import React, { useState } from 'react';
import axios from 'axios';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Login = ( ) => {
  const navigate = useNavigate();

  // 1. Quản lý trạng thái
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 2. Hàm xử lý Đăng nhập
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Nhớ kiểm tra port backend của em (thường là 3000)
      const response = await axios.post('http://localhost:3000/api/v1/auth/login', {
        email,
        password,
      });

      // Lưu Token vào LocalStorage
      localStorage.setItem('token', response.data.token);
      alert("🔓 Đăng nhập thành công! Chào mừng " + response.data.user.username);
      // Lưu Token và Username vào máy
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('username', response.data.user.username);

      // Lệnh "bay" sang trang Dashboard
      alert("Đăng nhập thành công!");
      navigate('/dashboard');    
      
    } catch (err) {
      setError(err.response?.data?.message || "Không thể kết nối đến máy chủ");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#f8f9fc] min-h-screen flex flex-col font-sans">
      {/* Top Bar */}
      <nav className="w-full px-6 py-4 flex items-center bg-transparent">
        <div className="flex items-center gap-2 text-[#4f46e5]">
          <div className="w-8 h-8 flex items-center justify-center bg-[#4f46e5] rounded-lg text-white font-bold">Q</div>
          <h1 className="text-slate-900 text-xl font-bold tracking-tight">QuizSmart</h1>
        </div>
      </nav>

      {/* Login Card */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-[450px] bg-white shadow-xl border border-slate-200 rounded-2xl overflow-hidden">
          
          <div className="p-8 pb-4 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#4f46e5]/10 text-[#4f46e5] rounded-full mb-4">
              <Lock size={32} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Chào mừng trở lại!</h2>
            <p className="text-slate-500 mt-2 text-sm">Vui lòng nhập thông tin để tiếp tục học tập cùng QuizSmart.</p>
          </div>

          {/* Hiển thị thông báo lỗi */}
          {error && (
            <div className="px-8 mb-2">
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleLogin} className="p-8 pt-2 space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-slate-400" size={20} />
                <input
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#4f46e5] outline-none"
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
                  className="w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#4f46e5] outline-none"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              className="w-full py-3 bg-[#4f46e5] hover:bg-[#4338ca] text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-50"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Đang kiểm tra...' : 'Đăng nhập'}
            </button>
          </form>

          <div className="p-6 bg-slate-50 text-center border-t border-slate-100">
            <p className="text-sm text-slate-600">
              Bạn chưa có tài khoản? 
            <span onClick={() => navigate('/register')} // 4. Bấm là đi tới phòng Register
             className="font-bold text-[#4f46e5] cursor-pointer"
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