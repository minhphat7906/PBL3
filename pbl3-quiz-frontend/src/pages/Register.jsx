import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { School, User, Mail, Lock, ShieldCheck, ArrowLeft, RefreshCw, CheckCircle2 } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  
  // Form states
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // OTP states
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const otpRefs = useRef([]);

  // Countdown timer logic
  useEffect(() => {
    let interval;
    if (isOtpStep && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isOtpStep, timer]);

  // Handle Step 1: Register Request
  const handleRegisterRequest = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:3000/api/v1/auth/register-request', {
        username,
        email,
        password,
      });

      if (response.data) {
        setIsOtpStep(true);
        setTimer(60);
        setCanResend(false);
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'info',
          title: 'Mã OTP đã được gửi!',
          text: 'Vui lòng kiểm tra email của bạn.',
          showConfirmButton: false,
          timer: 3000
        });
      }
    } catch (err) {
      Swal.fire({
        title: 'Lỗi đăng ký',
        text: err.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại.",
        icon: 'error',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP Input Change
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto focus next
    if (value && index < 5) {
      otpRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1].focus();
    }
  };

  // Handle Step 2: Verify OTP
  const handleVerifyOTP = async () => {
    const otpCode = otp.join('');
    if (otpCode.length < 6) {
      Swal.fire({ icon: 'warning', title: 'Thiếu mã OTP', text: 'Vui lòng nhập đủ 6 chữ số.' });
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:3000/api/v1/auth/verify-otp', {
        email,
        otp: otpCode
      });

      if (response.data.success) {
        Swal.fire({
          title: 'Đăng ký thành công! 🎉',
          text: 'Tài khoản của bạn đã được xác thực. Hãy đăng nhập để bắt đầu học nhé!',
          icon: 'success',
          confirmButtonColor: '#4f46e5',
          confirmButtonText: 'Đăng nhập ngay',
          allowOutsideClick: false
        }).then(() => {
          navigate('/login');
        });
      }
    } catch (err) {
      Swal.fire({
        title: 'Xác thực thất bại',
        text: err.response?.data?.message || "Mã OTP không đúng hoặc đã hết hạn.",
        icon: 'error',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resendOTP = async () => {
    if (!canResend) return;
    setCanResend(false);
    setTimer(60);
    setOtp(['', '', '', '', '', '']);
    await handleRegisterRequest({ preventDefault: () => {} });
  };

  return (
    <div className="font-sans bg-[#f8f9fc] dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen flex items-center justify-center p-4 relative overflow-hidden transition-colors">
      {/* Dynamic Background */}
      <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-[#4f46e5]/10 dark:bg-indigo-500/5 blur-[120px] rounded-full -z-10 animate-pulse"></div>
      <div className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-indigo-400/10 dark:bg-sky-500/5 blur-[120px] rounded-full -z-10 animate-pulse" style={{ animationDelay: '1s' }}></div>

      <div className="w-full max-w-[480px] bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-all duration-500 transform">
        
        {/* Header Section */}
        <div className="p-10 pb-4 text-center">
          <div className="mx-auto mb-6 flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 shadow-inner">
            {isOtpStep ? <ShieldCheck size={36} className="animate-bounce" /> : <School size={36} />}
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-2">
            {isOtpStep ? 'Xác thực Email' : 'Gia nhập QuizSmart'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
            {isOtpStep 
              ? `Chúng tôi vừa gửi mã OTP đến ${email}` 
              : 'Nền tảng học thuật bứt phá cho sinh viên chuyên nghiệp'
            }
          </p>
        </div>

        <div className="p-10 pt-4">
          {!isOtpStep ? (
            /* PHASE 1: FORM ĐĂNG KÝ */
            <form className="space-y-6" onSubmit={handleRegisterRequest}>
              <div className="space-y-4">
                <div className="group space-y-1.5">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 group-focus-within:text-indigo-500 transition-colors">Tên đăng nhập</label>
                  <div className="relative">
                    <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input 
                      className="block w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border-2 border-transparent rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 dark:focus:border-indigo-500 transition-all font-bold text-slate-700 dark:text-slate-200 placeholder-slate-400" 
                      placeholder="User name" 
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="group space-y-1.5">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 group-focus-within:text-indigo-500 transition-colors">Địa chỉ Email</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input 
                      className="block w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border-2 border-transparent rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 dark:focus:border-indigo-500 transition-all font-bold text-slate-700 dark:text-slate-200 placeholder-slate-400" 
                      placeholder="hello@example.com" 
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="group space-y-1.5">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 group-focus-within:text-indigo-500 transition-colors">Mật khẩu bảo mật</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input 
                      className="block w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border-2 border-transparent rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 dark:focus:border-indigo-500 transition-all font-bold text-slate-700 dark:text-slate-200 placeholder-slate-400" 
                      placeholder="••••••••" 
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                  {password.length > 0 && password.length < 6 && (
                    <p className="text-xs text-rose-500 font-bold mt-1 ml-1 animate-pulse">
                      Mật khẩu phải có ít nhất 6 ký tự
                    </p>
                  )}
                </div>
              </div>

              <button 
                type="submit"
                disabled={isLoading || (password.length > 0 && password.length < 6)}
                className="w-full h-[54px] bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400 text-white font-black rounded-2xl shadow-xl shadow-indigo-200 dark:shadow-none transition-all active:scale-[0.97] flex items-center justify-center gap-2 group disabled:opacity-50"
              >
                {isLoading ? (
                  <RefreshCw className="animate-spin" size={20} />
                ) : (
                  <>Tiếp theo <ArrowLeft className="rotate-180 group-hover:translate-x-1 transition-transform" size={20} /></>
                )}
              </button>
            </form>
          ) : (
            /* PHASE 2: NHẬP OTP */
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex justify-center gap-2.5">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (otpRefs.current[idx] = el)}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className="w-12 h-16 text-center text-2xl font-black bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-indigo-600 dark:text-indigo-400"
                  />
                ))}
              </div>

              <div className="text-center space-y-1">
                <p className="text-sm font-bold text-slate-500">Mã hết hạn sau: <span className="text-indigo-600 font-black">{timer}s</span></p>
                <button 
                  onClick={resendOTP}
                  disabled={!canResend || isLoading}
                  className={`text-xs font-black uppercase tracking-widest ${canResend ? 'text-indigo-600 hover:underline cursor-pointer' : 'text-slate-300 cursor-not-allowed'}`}
                >
                  Gửi lại mã OTP
                </button>
              </div>

              <div className="flex flex-col gap-3">
                <button 
                  onClick={handleVerifyOTP}
                  disabled={isLoading}
                  className="w-full h-[54px] bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-xl shadow-indigo-200 transition-all active:scale-[0.97] flex items-center justify-center gap-2"
                >
                  {isLoading ? <RefreshCw className="animate-spin" size={20} /> : <><CheckCircle2 size={20} /> Xác nhận đăng ký</>}
                </button>
                <button 
                  onClick={() => setIsOtpStep(false)}
                  className="w-full py-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-bold text-sm transition-colors"
                >
                  Thay đổi thông tin?
                </button>
              </div>
            </div>
          )}

          <div className="mt-10 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-sm text-slate-500 font-medium">
              Đã có tài khoản?{' '}
              <button 
                onClick={() => navigate('/login')} 
                className="text-indigo-600 dark:text-indigo-400 font-black hover:underline"
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