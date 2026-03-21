import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = ( ) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:3000/api/v1/auth/register', {
        username,
        email,
        password,
      });
      alert("🎉 Đăng ký thành công!");
      onSwitchToLogin();
    } catch (err) {
      setError(err.response?.data?.message || "Email đã tồn tại hoặc lỗi hệ thống");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="font-display bg-[#f8f9fc] text-slate-900 min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-[#4f46e5]/10 blur-[120px] rounded-full -z-10"></div>
      <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-indigo-400/10 blur-[120px] rounded-full -z-10"></div>

      <div className="w-full max-w-[450px] bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-8 pb-0 flex flex-col items-center text-center">
          <div className="mb-6 flex items-center justify-center w-14 h-14 rounded-xl bg-[#4f46e5]/10 text-[#4f46e5]">
            <span className="material-symbols-outlined text-4xl">school</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Tham gia QuizSmart</h1>
          <p className="mt-2 text-slate-500 text-sm">Khám phá kho tàng kiến thức vô tận ngay hôm nay</p>
        </div>

        <div className="p-8 pt-6">
          {/* Error Message */}
          {error && (
            <div className="mb-6 flex items-center gap-3 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm font-medium">
              <span className="material-symbols-outlined text-lg">error</span>
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleRegister}>
            {/* Username */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1">Tên đăng nhập</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 group-focus-within:text-[#4f46e5]">
                  <span className="material-symbols-outlined text-xl">person</span>
                </div>
                <input 
                  className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/20 focus:border-[#4f46e5] transition-all" 
                  placeholder="Nhập tên đăng nhập" 
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1">Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 group-focus-within:text-[#4f46e5]">
                  <span className="material-symbols-outlined text-xl">mail</span>
                </div>
                <input 
                  className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/20 focus:border-[#4f46e5] transition-all" 
                  placeholder="example@gmail.com" 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1">Mật khẩu</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 group-focus-within:text-[#4f46e5]">
                  <span className="material-symbols-outlined text-xl">lock</span>
                </div>
                <input 
                  className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/20 focus:border-[#4f46e5] transition-all" 
                  placeholder="••••••••" 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Register Button */}
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#4f46e5] hover:bg-[#4f46e5]/90 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-[#4f46e5]/20 transition-all active:scale-[0.98] mt-2 disabled:opacity-50"
            >
              {isLoading ? 'Đang xử lý...' : 'Đăng ký'}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-10 text-center">
            <p className="text-sm text-slate-600">
              Đã có tài khoản? 
             <button onClick={() => navigate('/')} // Bấm là quay về phòng Login (địa chỉ '/')
              className="text-[#4f46e5] font-bold"
             >
              Đăng nhập ngay
             </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;