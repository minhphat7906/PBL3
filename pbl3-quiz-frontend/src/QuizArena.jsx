import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Clock, ChevronLeft, ChevronRight, CheckCircle2, X, Lightbulb, Loader2 } from 'lucide-react';
import axios from 'axios';
import Swal from 'sweetalert2'; // Thư viện Popup xịn

const QuizArena = () => {
  const navigate = useNavigate();
  const { quizId } = useParams();

  // 1. STATES
  const [quiz, setQuiz] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(null);

  // 2. CHỐNG THOÁT TRANG (Dùng popup trình duyệt khi bấm nút Back/F5)
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!isSubmitted && Object.keys(answers).length > 0) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isSubmitted, answers]);

  // 3. FETCH DỮ LIỆU ĐỀ THI
  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        const token = localStorage.getItem('token');    
        const response = await axios.get(`http://localhost:3000/api/v1/quizzes/${quizId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const quizData = response.data.quiz;
        setQuiz(quizData);
        setTimeLeft(quizData.time_limit * 60);
        setIsLoading(false);
      } catch (err) {
        console.error("Lỗi lấy đề thi:", err);
        setError("Không thể tải đề thi. Vui lòng kiểm tra lại ID hoặc đường truyền.");
        setIsLoading(false);
      }
    };
    if (quizId) fetchQuizData();
  }, [quizId]);

  // 4. ĐẾM NGƯỢC
  useEffect(() => {
    if (timeLeft <= 0 || isSubmitted || !quiz) return;
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isSubmitted, quiz]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Tự động nộp bài khi hết giờ
  useEffect(() => {
    if (timeLeft === 0 && !isSubmitted && quiz && !isLoading) {
      Swal.fire({
        title: 'Hết giờ!',
        text: 'Hệ thống đang tự động nộp bài làm của sếp.',
        icon: 'warning',
        timer: 2000,
        showConfirmButton: false
      }).then(() => {
        handleSubmit(true); // Tham số true để bỏ qua bước confirm
      });
    }
  }, [timeLeft]);

  // 5. CHỌN ĐÁP ÁN
  const handleSelectOption = (questionId, opt) => {
    if (isSubmitted) return;
    setAnswers({ ...answers, [questionId]: opt });
  };

  // 6. THUẬT TOÁN NỘP BÀI
  const handleSubmit = async (force = false) => {
    if (isSubmitted) return;

    if (!force) {
      const result = await Swal.fire({
        title: 'Nộp bài thi?',
        text: "Sếp có chắc chắn muốn kết thúc bài thi ngay bây giờ?",
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#10b981',
        cancelButtonColor: '#1e1b4b',
        confirmButtonText: 'Đồng ý nộp!',
        cancelButtonText: 'Làm tiếp'
      });
      if (!result.isConfirmed) return;
    }

    try {
      const token = localStorage.getItem('token');
      const payload = {
        quiz_id: quizId,
        time_spent: (quiz.time_limit * 60) - timeLeft,
        user_answers: answers
      };

      const response = await axios.post(`http://localhost:3000/api/v1/quizzes/submit`, payload, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if(response.data.success) {
        setScore(response.data.result);
        setIsSubmitted(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        Swal.fire('Hoàn thành!', 'Kết quả đã được ghi lại.', 'success');
      }
    } catch (err) {
      Swal.fire('Lỗi!', err.response?.data?.message || err.message, 'error');
    }
  };

  // Nút thoát an toàn
  const handleExit = () => {
    if (!isSubmitted) {
      Swal.fire({
        title: 'Thoát phòng thi?',
        text: "Hành động này sẽ hủy bỏ bài làm hiện tại của sếp!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#64748b',
        confirmButtonText: 'Vẫn thoát',
        cancelButtonText: 'Ở lại'
      }).then((res) => {
        if (res.isConfirmed) navigate('/dashboard');
      });
    } else {
      navigate('/dashboard');
    }
  };

  if (isLoading) return (
    <div className="min-h-screen bg-[#f8f9fc] flex flex-col items-center justify-center text-[#4f46e5]">
      <Loader2 className="animate-spin mb-4" size={48} />
      <h2 className="text-xl font-bold italic">Đang chuẩn bị đề thi...</h2>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-[#f8f9fc] flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-red-50 text-red-600 p-8 rounded-3xl max-w-md border border-red-100 shadow-sm">
        <h2 className="text-2xl font-black mb-2">Oops!</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/dashboard')} className="mt-6 px-6 py-2 bg-red-600 text-white font-bold rounded-full hover:shadow-lg transition-all">Quay lại Dashboard</button>
      </div>
    </div>
  );

  const currentQ = quiz.questions[currentIndex];

  return (
    <div className="min-h-screen bg-[#f8f9fc] font-sans flex flex-col text-slate-900">
      
      {/* HEADER */}
      <header className="bg-white h-16 border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={handleExit} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition-all">
            <X size={20} />
          </button>
          <h1 className="font-bold text-lg text-[#1e1b4b] truncate max-w-[200px] md:max-w-md">{quiz.title}</h1>
        </div>
        
        <div className={`flex items-center gap-2 px-5 py-2 rounded-full font-black border shadow-inner transition-colors ${timeLeft < 60 && !isSubmitted ? 'bg-red-50 text-red-600 border-red-100 animate-pulse' : 'bg-slate-50 text-[#1e1b4b] border-slate-100'}`}>
          <Clock size={18} />
          <span className="tracking-widest text-xl">{isSubmitted ? "ĐÃ NỘP" : formatTime(timeLeft)}</span>
        </div>
      </header>
      
      {/* BÁO CÁO KẾT QUẢ */}
      {isSubmitted && score && (
        <div className="max-w-7xl mx-auto w-full px-6 lg:px-8 mt-8">
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-md flex flex-col md:flex-row items-center gap-8 bg-gradient-to-br from-white to-slate-50 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#4f46e5]/5 rounded-full -mr-16 -mt-16"></div>
            
            <div className="relative w-40 h-40 flex shrink-0 items-center justify-center rounded-full bg-slate-50 border-8 border-[#4f46e5]/10 shadow-inner">
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path className="text-[#4f46e5]" strokeDasharray={`${(score.correctCount / score.totalQuestions) * 100}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
              </svg>
              <div className="text-center">
                <span className="text-4xl font-black text-[#1e1b4b]">{score.score}</span>
                <span className="text-slate-400 font-bold"> / 10</span>
              </div>
            </div>

            <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm text-center">
                <div className="text-slate-500 font-bold mb-1 text-sm uppercase tracking-tighter">Số câu đúng</div>
                <div className="text-2xl font-black text-[#10b981]">{score.correctCount} <span className="text-lg text-slate-400">/ {score.totalQuestions}</span></div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm text-center">
                <div className="text-slate-500 font-bold mb-1 text-sm uppercase tracking-tighter">Thời gian làm</div>
                <div className="text-2xl font-black text-[#f59e0b]">{formatTime(score.time_spent)}</div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm text-center">
                <div className="text-slate-500 font-bold mb-1 text-sm uppercase tracking-tighter">Xếp loại</div>
                <div className={`text-xl mt-1 font-black ${score.score >= 8 ? 'text-[#4f46e5]' : score.score >= 5 ? 'text-amber-500' : 'text-red-500'}`}>
                  {score.score >= 8 ? '🥇 XUẤT SẮC' : score.score >= 5 ? '🥈 ĐẠT YÊU CẦU' : '🥉 CỐ GẮNG HƠN'}
                </div>
              </div>
            </div>
          </div>
          <p className="text-center mt-6 text-slate-500 font-bold animate-bounce text-sm">👇 Vuốt xuống để xem đáp án chi tiết</p>
        </div>
      )}

      {/* MAIN CONTENT */}
      <div className="flex-1 max-w-7xl mx-auto w-full flex flex-col lg:flex-row gap-8 p-6 lg:p-8">
        
        <div className="flex-1 bg-white rounded-3xl shadow-sm border border-slate-200 p-8 flex flex-col relative overflow-hidden h-fit">
          <div className="absolute top-0 left-0 h-1.5 bg-[#4f46e5] transition-all duration-500" style={{ width: `${((currentIndex + 1) / quiz.questions.length) * 100}%` }}></div>

          <div className="mb-8">
            <div className="inline-block bg-[#4f46e5]/10 text-[#4f46e5] font-black text-xs px-4 py-1.5 rounded-full mb-4 uppercase tracking-wider">
              Câu hỏi {currentIndex + 1} / {quiz.questions.length}
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold text-[#1e1b4b] leading-relaxed">
              {currentQ.question_text}
            </h2>
          </div>

          {currentQ.image_url && (
            <div className="mb-8 rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 flex justify-center p-4 shadow-inner">
              <img src={currentQ.image_url} alt="Minh họa" className="max-h-64 md:max-h-80 object-contain rounded-xl transition-transform hover:scale-105 cursor-zoom-in" />
            </div>
          )}

          <div className="space-y-4 flex-1">
            {['A', 'B', 'C', 'D'].map((opt) => {
              const qId = currentQ.question_id || currentQ.id;
              const isSelected = answers[qId] === opt; 
              const isCorrect = isSubmitted && currentQ.correct_option === opt;
              const isWrong = isSubmitted && isSelected && currentQ.correct_option !== opt;

              return (
                <button 
                  key={opt}
                  onClick={() => handleSelectOption(qId, opt)}
                  className={`w-full text-left p-5 rounded-2xl border-2 transition-all flex items-center gap-5 group ${
                    isSelected ? 'border-[#4f46e5] bg-[#4f46e5]/5 shadow-sm' : 'border-slate-100 hover:border-[#4f46e5]/40 hover:bg-slate-50'
                  } ${isCorrect ? 'border-emerald-500 bg-emerald-50' : ''} ${isWrong ? 'border-red-500 bg-red-50' : ''}`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg transition-colors ${
                    isSelected ? 'bg-[#4f46e5] text-white' : 'bg-slate-100 text-slate-500'
                  } ${isCorrect ? 'bg-emerald-500 text-white' : ''} ${isWrong ? 'bg-red-500 text-white' : ''}`}>
                    {opt}
                  </div>
                  <span className={`font-medium text-lg ${isSelected ? 'text-[#1e1b4b] font-bold' : 'text-slate-700'}`}>
                    {currentQ[`option_${opt.toLowerCase()}`]}
                  </span>
                </button>
              );
            })}
          </div>

          {isSubmitted && currentQ.explanation && (
            <div className="mt-8 bg-amber-50 border border-amber-100 p-6 rounded-2xl border-l-8 border-l-amber-400">
              <div className="flex items-center gap-2 text-amber-700 font-bold mb-2 uppercase text-xs tracking-widest">
                <Lightbulb size={16} /> Giải thích đáp án
              </div>
              <p className="text-amber-800 leading-relaxed font-medium">{currentQ.explanation}</p>
            </div>
          )}

          {/* CHỈ HIỆN ĐIỀU HƯỚNG KHI ĐANG THI */}
          {!isSubmitted && (
            <div className="flex items-center justify-between mt-10 pt-6 border-t border-slate-100">
              <button onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))} disabled={currentIndex === 0} className="flex items-center gap-2 px-6 py-3 rounded-full font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-30 transition-all">
                <ChevronLeft size={20} /> Câu trước
              </button>
              <button onClick={() => setCurrentIndex(prev => Math.min(quiz.questions.length - 1, prev + 1))} disabled={currentIndex === quiz.questions.length - 1} className="flex items-center gap-2 px-6 py-3 rounded-full font-bold bg-[#1e1b4b] text-white hover:bg-[#312e81] disabled:opacity-30 transition-all shadow-md">
                Câu tiếp <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>

        {/* SIDEBAR */}
        <div className="w-full lg:w-80 flex flex-col gap-6 shrink-0 h-fit">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-bold text-[#1e1b4b] text-lg mb-5 border-b border-slate-100 pb-3">Câu hỏi bài thi</h3>
            <div className="grid grid-cols-5 gap-3">
              {quiz.questions.map((q, idx) => {
                const isAnswered = answers[q.question_id || q.id] !== undefined;
                const isCurrent = currentIndex === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`aspect-square rounded-xl font-bold flex items-center justify-center text-sm transition-all ${
                      isCurrent ? 'ring-4 ring-[#4f46e5]/30 ring-offset-2 scale-110 z-10' : ''
                    } ${isAnswered ? 'bg-[#10b981] text-white border-transparent' : 'bg-[#f8f9fc] text-slate-400 border border-slate-200 hover:bg-slate-200'}`}
                  >
                    {idx + 1}
                  </button>
                )
              })}
            </div>
          </div>

          {!isSubmitted ? (
            <button onClick={() => handleSubmit(false)} className="w-full py-4 rounded-3xl bg-gradient-to-r from-[#10b981] to-emerald-500 hover:from-emerald-600 hover:to-emerald-600 text-white font-black text-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 transition-all hover:-translate-y-1">
              <CheckCircle2 size={24} /> NỘP BÀI THI
            </button>
          ) : (
            <button onClick={() => navigate('/dashboard')} className="w-full py-4 rounded-3xl bg-[#1e1b4b] text-white font-black text-xl flex items-center justify-center gap-2 shadow-lg transition-all hover:-translate-y-1">
              VỀ TRANG CHỦ
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizArena;