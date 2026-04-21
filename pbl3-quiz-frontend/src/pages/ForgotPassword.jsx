import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { Mail, ShieldCheck, Lock, ArrowLeft, RefreshCw, CheckCircle2, KeyRound } from 'lucide-react';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const otpRefs = useRef([]);

  // Timer logic
  useEffect(() => {
    let interval;
    if (isOtpStep && timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [isOtpStep, timer]);

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await axios.post('http://localhost:3000/api/v1/auth/forgot-password-request', { email });
      setIsOtpStep(true);
      setTimer(60);
      setCanResend(false);
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Mã OTP đã được gửi!', showConfirmButton: false, timer: 3000 });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Lỗi', text: err.response?.data?.message || 'Không thể gửi yêu cầu.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      Swal.fire({ icon: 'warning', title: 'Mật khẩu không khớp', text: 'Vui lòng kiểm tra lại mật khẩu xác nhận.' });
      return;
    }
    const otpCode = otp.join('');
    if (otpCode.length < 6) {
      Swal.fire({ icon: 'warning', title: 'Thiếu mã OTP', text: 'Vui lòng nhập đủ 6 chữ số.' });
      return;
    }

    setIsLoading(true);
    try {
      await axios.post('http://localhost:3000/api/v1/auth/reset-password', {
        email,
        otp: otpCode,
        newPassword
      });
      Swal.fire({ icon: 'success', title: 'Thành công!', text: 'Mật khẩu của bạn đã được thay đổi. Hãy đăng nhập lại nhé!', confirmButtonColor: '#4f46e5' })
        .then(() => navigate('/login'));
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Thất bại', text: err.response?.data?.message || 'Mã OTP sai hoặc đã hết hạn.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) otpRefs.current[index + 1].focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) otpRefs.current[index - 1].focus();
  };

  return (
    <div className="font-sans bg-[#f8f9fc] dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen flex items-center justify-center p-4 relative overflow-hidden transition-colors">
      <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-indigo-500/10 blur-[120px] rounded-full -z-10 animate-pulse"></div>
      
      <div className="w-full max-w-[480px] bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-all">
        <div className="p-10 pb-4 text-center">
          <div className="mx-auto mb-6 flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400">
            <KeyRound size={36} />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-2">
            {isOtpStep ? 'Đặt lại mật khẩu' : 'Quên mật khẩu?'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
            {isOtpStep ? `Nhập mã OTP vừa được gửi đến ${email}` : 'Đừng lo lắng, chúng tôi sẽ giúp bạn lấy lại quyền truy cập.'}
          </p>
        </div>

        <div className="p-10 pt-4">
          {!isOtpStep ? (
            <form onSubmit={handleRequestOtp} className="space-y-6">
              <div className="group space-y-1.5">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 group-focus-within:text-indigo-500 transition-colors">Email tài khoản</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  <input 
                    className="block w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border-2 border-transparent rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-700 dark:text-slate-200 placeholder-slate-400" 
                    placeholder="Nhập email bạn đã đăng ký" 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full h-[54px] bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-xl shadow-indigo-200 dark:shadow-none transition-all active:scale-[0.97] flex items-center justify-center gap-2"
              >
                {isLoading ? <RefreshCw className="animate-spin" size={20} /> : 'Gửi mã xác thực'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex justify-center gap-2">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (otpRefs.current[idx] = el)}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className="w-11 h-14 text-center text-xl font-black bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-xl focus:border-indigo-500 outline-none transition-all text-indigo-600 dark:text-indigo-400"
                  />
                ))}
              </div>

              <div className="space-y-4">
                <div className="group space-y-1.5">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Mật khẩu mới</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      className="block w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-transparent rounded-2xl focus:border-indigo-500 transition-all font-bold text-slate-700 dark:text-slate-200" 
                      type="password"
                      placeholder="Tối thiểu 6 ký tự"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="group space-y-1.5">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Xác nhận mật khẩu</label>
                  <div className="relative">
                    <ShieldCheck size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      className="block w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-transparent rounded-2xl focus:border-indigo-500 transition-all font-bold text-slate-700 dark:text-slate-200" 
                      type="password"
                      placeholder="Nhập lại mật khẩu mới"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="text-center space-y-1">
                <p className="text-xs font-bold text-slate-500">Mã hết hạn sau: <span className="text-indigo-600 font-black">{timer}s</span></p>
                <button 
                  type="button"
                  onClick={() => handleRequestOtp({ preventDefault: () => {} })}
                  disabled={!canResend || isLoading}
                  className={`text-xs font-black uppercase tracking-widest ${canResend ? 'text-indigo-600 hover:underline' : 'text-slate-300'}`}
                >
                  Gửi lại mã OTP
                </button>
              </div>

              <div className="flex flex-col gap-3">
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-[54px] bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-xl transition-all active:scale-[0.97] flex items-center justify-center gap-2"
                >
                  {isLoading ? <RefreshCw className="animate-spin" size={20} /> : <><CheckCircle2 size={20} /> Đổi mật khẩu</>}
                </button>
                <button type="button" onClick={() => setIsOtpStep(false)} className="py-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-bold text-xs uppercase tracking-wider">
                  Quay lại bước trước
                </button>
              </div>
            </form>
          )}

          <div className="mt-10 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
            <button onClick={() => navigate('/login')} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-100 font-bold text-sm flex items-center justify-center gap-2 mx-auto transition-colors">
              <ArrowLeft size={16} /> Quay về đăng nhập
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
