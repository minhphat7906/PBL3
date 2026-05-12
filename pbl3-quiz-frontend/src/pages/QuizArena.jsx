import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Clock, ChevronLeft, ChevronRight, CheckCircle2, X, Lightbulb, Loader2, CheckSquare, RefreshCw, Search, Flag } from 'lucide-react';
import axios from 'axios';
import Swal from 'sweetalert2';
import RatingModal from '../components/RatingModal';
import { Star } from 'lucide-react';
import EpicResultScreen from '../components/EpicResultScreen';

const QuizArena = () => {
  const navigate = useNavigate();
  const { quizId } = useParams();

  const [quiz, setQuiz] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState(() => {
    try {
      const saved = localStorage.getItem(`quiz_${quizId}_answers`);
      return saved ? JSON.parse(saved) : {};
    } catch(e) { return {}; }
  });
  const [timeLeft, setTimeLeft] = useState(0);

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(null);

  useEffect(() => {
    if (!isLoading && !isSubmitted && quiz) {
      localStorage.setItem(`quiz_${quizId}_answers`, JSON.stringify(answers));
      localStorage.setItem(`quiz_${quizId}_time`, timeLeft.toString());
    }
  }, [answers, timeLeft, isSubmitted, isLoading, quiz, quizId]);
  const [flagged, setFlagged] = useState({});
  const [showRatingModal, setShowRatingModal] = useState(false);

  const toggleFlag = (index) => {
    setFlagged(prev => ({ ...prev, [index]: !prev[index] }));
  };

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

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        const token = localStorage.getItem('token');    
        const response = await axios.get(`http://localhost:3000/api/v1/quizzes/${quizId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const quizData = response.data.quiz;
        setQuiz(quizData);
        const savedTime = localStorage.getItem(`quiz_${quizId}_time`);
        if (savedTime && parseInt(savedTime) > 0) {
          setTimeLeft(parseInt(savedTime));
        } else {
          setTimeLeft(quizData.time_limit * 60);
        }
        setIsLoading(false);
      } catch (err) {
        setError("Không thể tải đề thi. Vui lòng kiểm tra lại ID hoặc đường truyền.");
        setIsLoading(false);
      }
    };
    if (quizId) fetchQuizData();
  }, [quizId]);

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

  useEffect(() => {
    if (timeLeft === 0 && !isSubmitted && quiz && !isLoading) {
      Swal.fire({
        title: 'Hết giờ!', text: 'Hệ thống đang tự động nộp bài...', icon: 'warning', timer: 2000, showConfirmButton: false
      }).then(() => handleSubmit(true));
    }
  }, [timeLeft]);

  // LOGIC ĐÃ SỬA: Xử lý chọn đáp án thông minh
  const handleSelectOption = (questionId, opt, type) => {
    if (isSubmitted) return;

    if (type === 'multiple') {
      // Logic cho phép tick nhiều ô (Checkboxes)
      const currentAns = Array.isArray(answers[questionId]) ? answers[questionId] : (answers[questionId] ? [answers[questionId]] : []);
      let newAns;
      if (currentAns.includes(opt)) {
        newAns = currentAns.filter(item => item !== opt); // Hủy tick
      } else {
        newAns = [...currentAns, opt]; // Tick thêm
      }
      setAnswers({ ...answers, [questionId]: newAns });
    } else {
      // Logic cũ cho Single và True/False (Radio)
      setAnswers({ ...answers, [questionId]: opt });
    }
  };

  const handleSubmit = async (force = false) => {
    if (isSubmitted) return;

    // Đếm số cờ đang cắm
    const flaggedCount = Object.values(flagged).filter(Boolean).length;

    if (!force) {
      if (flaggedCount > 0) {
        const result = await Swal.fire({
          title: 'Khoan đã Bạn ơi!',
          html: `Bạn vẫn còn <b>${flaggedCount} câu</b> đang đánh dấu chưa chốt đáp án.<br/>Bạn có chắc chắn muốn nộp bài không?`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#10b981',
          cancelButtonColor: '#f59e0b',
          confirmButtonText: 'Vẫn nộp bài',
          cancelButtonText: 'Quay lại làm tiếp'
        });
        if (!result.isConfirmed) return;
      } else {
        const result = await Swal.fire({
          title: 'Nộp bài thi?', 
          text: "Bạn đã sẵn sàng kết thúc bài làm chưa?", 
          icon: 'question', 
          showCancelButton: true, 
          confirmButtonColor: '#10b981', 
          confirmButtonText: 'Đồng ý nộp!', 
          cancelButtonText: 'Làm tiếp'
        });
        if (!result.isConfirmed) return;
      }
    }

    try {
      const token = localStorage.getItem('token');
      const payload = {
        quiz_id: quizId,
        time_spent: (quiz.time_limit * 60) - timeLeft,
        user_answers: answers // Mảng ['A', 'C'] hay chuỗi 'A' đều gửi lên tốt
      };

      const response = await axios.post(`http://localhost:3000/api/v1/quizzes/submit`, payload, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if(response.data.success) {
        localStorage.removeItem(`quiz_${quizId}_answers`);
        localStorage.removeItem(`quiz_${quizId}_time`);
        setScore(response.data.result);
        setIsSubmitted(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        Swal.fire('Hoàn thành!', 'Kết quả đã được ghi lại.', 'success');
      }
    } catch (err) {
      Swal.fire('Lỗi!', err.response?.data?.message || err.message, 'error');
    }
  };

  const handleExit = () => {
    if (!isSubmitted) {
      Swal.fire({
        title: 'Thoát phòng thi?', text: "Hành động này sẽ hủy bỏ bài làm!", icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444', confirmButtonText: 'Vẫn thoát', cancelButtonText: 'Ở lại'
      }).then((res) => { 
        if (res.isConfirmed) {
          localStorage.removeItem(`quiz_${quizId}_answers`);
          localStorage.removeItem(`quiz_${quizId}_time`);
          navigate('/dashboard'); 
        }
      });
    } else navigate('/dashboard');
  };

  if (isLoading) return <div className="min-h-screen bg-[#f8f9fc] dark:bg-slate-950 flex flex-col items-center justify-center text-[#4f46e5] dark:text-indigo-400"><Loader2 className="animate-spin mb-4" size={48} /><h2 className="text-xl font-bold italic dark:text-slate-300">Đang chuẩn bị đề thi...</h2></div>;
  if (error) return <div className="min-h-screen bg-[#f8f9fc] dark:bg-slate-950 flex items-center justify-center p-6 text-center"><div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-8 rounded-3xl max-w-md border border-red-100 dark:border-red-900/50"><h2 className="text-2xl font-black mb-2">Oops!</h2><p>{error}</p><button onClick={() => navigate('/dashboard')} className="mt-6 px-6 py-2 bg-red-600 text-white font-bold rounded-full">Về Dashboard</button></div></div>;
  
  const currentQ = quiz.questions && quiz.questions[currentIndex];

  if (!currentQ) {
    return (
      <div className="min-h-screen bg-[#f8f9fc] dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-slate-800 dark:text-slate-200">
        <h2 className="text-2xl font-black mb-4">Đề thi này chưa có câu hỏi nào!</h2>
        <button onClick={() => navigate('/dashboard')} className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-full hover:bg-indigo-500">
          Về Dashboard
        </button>
      </div>
    );
  }

  return (
    <>
    <div className="min-h-screen bg-[#f8f9fc] dark:bg-slate-950 font-sans flex flex-col text-slate-900 dark:text-slate-100 transition-colors duration-300">
      
      <header className="bg-white dark:bg-slate-900 h-16 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={handleExit} className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-500 dark:text-slate-400 transition-colors"><X size={20} /></button>
          <h1 className="font-bold text-lg text-[#1e1b4b] dark:text-slate-100 truncate max-w-[200px] md:max-w-md">{quiz.title}</h1>
        </div>
        <div className={`flex items-center gap-2 px-5 py-2 rounded-full font-black border shadow-inner ${timeLeft < 60 && !isSubmitted ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/50 animate-pulse' : 'bg-slate-50 dark:bg-slate-800 text-[#1e1b4b] dark:text-slate-200 border-slate-200 dark:border-slate-700 transition-colors'}`}>
          <Clock size={18} /><span className="tracking-widest text-xl">{isSubmitted ? "ĐÃ NỘP" : formatTime(timeLeft)}</span>
        </div>
      </header>
      {isSubmitted && score ? (
        <div className="w-full h-full overflow-y-auto py-8 px-4">
          <EpicResultScreen 
            score={score.correctCount} 
            totalQuestions={score.totalQuestions} 
            answers={answers} 
            quizData={quiz} 
            timeSpent={score.time_spent} 
          />
          <div className="max-w-6xl mx-auto mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
               <button onClick={() => setShowRatingModal(true)} className="w-full py-4 rounded-[20px] bg-amber-500 text-white font-black text-lg flex items-center justify-center gap-2 shadow-xl shadow-amber-200/40 hover:-translate-y-1 transition-all duration-300">
                  <Star size={20} fill="currentColor" /> ĐÁNH GIÁ QUIZ
               </button>
               <button onClick={() => window.location.reload()} className="w-full py-4 rounded-[20px] bg-indigo-600 dark:bg-indigo-500 text-white font-black text-lg flex items-center justify-center gap-2 shadow-xl shadow-indigo-300/40 hover:-translate-y-1 transition-all duration-300">
                  <RefreshCw size={20} /> LÀM LẠI BÀI THI
               </button>
               <button onClick={() => navigate('/explore')} className="w-full py-4 rounded-[20px] bg-white dark:bg-slate-800 border-[2px] border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-bold hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-100 dark:hover:border-indigo-900 text-lg flex items-center justify-center gap-2 shadow-sm transition-all duration-300">
                  <Search size={20} /> QUAY LẠI KHO ĐỀ
               </button>
          </div>
        </div>
      ) : (

      <div className="flex-1 max-w-7xl mx-auto w-full flex flex-col lg:flex-row gap-8 p-6 lg:p-8">
        
        <div className="flex-1 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-8 flex flex-col relative overflow-hidden h-fit transition-colors duration-300">
          <div className="absolute top-0 left-0 h-1.5 bg-[#4f46e5] transition-all duration-500" style={{ width: `${((currentIndex + 1) / quiz.questions.length) * 100}%` }}></div>

          <div className="mb-8 flex justify-between items-start gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="inline-block bg-[#4f46e5]/10 dark:bg-indigo-900/30 text-[#4f46e5] dark:text-indigo-400 font-black text-xs px-4 py-1.5 rounded-full uppercase tracking-wider transition-colors">
                  Câu hỏi {currentIndex + 1} / {quiz.questions.length}
                </div>
                {currentQ.question_type === 'multiple' && (
                  <div className="inline-block bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-bold text-xs px-3 py-1.5 rounded-full transition-colors">
                    Lựa chọn nhiều đáp án
                  </div>
                )}
              </div>
              <h2 className="text-2xl lg:text-3xl font-bold text-[#1e1b4b] dark:text-slate-100 leading-relaxed transition-colors">
                {currentQ.question_text}
              </h2>
            </div>
            
            {/* Card Action - Flag */}
            {!isSubmitted && (
              <button 
                onClick={() => toggleFlag(currentIndex)}
                title="Đánh dấu để xem lại"
                className={`p-3 shrink-0 rounded-2xl border-2 transition-all duration-300 md:mt-2
                  ${flagged[currentIndex] ? 'bg-amber-50 border-amber-200 transform hover:scale-110 shadow-sm' : 'bg-slate-50 border-slate-100 hover:border-amber-200 hover:bg-white group'}
                `}
              >
                 <Flag size={24} className={`transition-all duration-300 ${flagged[currentIndex] ? 'text-amber-500 fill-amber-500 scale-110 drop-shadow-md' : 'text-slate-300 group-hover:text-amber-400 group-hover:scale-110'}`} />
              </button>
            )}
          </div>

          {currentQ.image_url && (
            <div className="mb-8 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 p-4 transition-colors duration-300 flex justify-center">
              <img src={currentQ.image_url} alt="Minh họa" className="max-h-64 object-contain rounded-xl" />
            </div>
          )}

          <div className="space-y-4 flex-1">
            {['A', 'B', 'C', 'D'].map((opt) => {
              // LOGIC ĐÃ SỬA 1: Giấu ô bị trống
              if (!currentQ[`option_${opt.toLowerCase()}`]) return null;

              const qId = currentQ.question_id || currentQ.id;
              
              const userAnswer = answers[qId];
              const isSelected = currentQ.question_type === 'multiple'
                ? (Array.isArray(userAnswer) && userAnswer.includes(opt))
                : userAnswer === opt;

              const dbCorrectArr = currentQ.correct_option ? currentQ.correct_option.split(',') : [];
              const isCorrectOption = dbCorrectArr.includes(opt); 
              
              // Ô BẠN CHỌN nhưng BỊ SAI (Nền Đỏ Nhạt)
              const isWrongSelected = isSubmitted && isSelected && !isCorrectOption;
              // Ô ĐÁP ÁN ĐÚNG (Nền Xanh Mint - Hiển thị luôn khi nộp)
              const showAsCorrect = isSubmitted && isCorrectOption;
              // Ngược lại các ô không chọn và k đúng -> dìm mờ đi

              return (
                <button 
                  key={opt}
                  onClick={() => handleSelectOption(qId, opt, currentQ.question_type)}
                  disabled={isSubmitted}
                  className={`w-full text-left p-5 rounded-2xl border-2 transition-all flex items-center justify-between group ${
                    !isSubmitted && isSelected ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/30 dark:bg-indigo-900/40' : !isSubmitted ? 'border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-800' : ''
                  } ${showAsCorrect ? 'border-emerald-500 dark:border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 cursor-default' : ''} ${isWrongSelected ? 'border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/40 cursor-default' : ''} ${isSubmitted && !showAsCorrect && !isWrongSelected ? 'border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/10 opacity-50 cursor-default' : ''} transition-colors duration-300`}
                >
                  <div className="flex items-center gap-4 md:gap-5 flex-1">
                    <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center font-black text-lg transition-colors duration-300 ${
                      !isSubmitted && isSelected ? 'bg-indigo-600 dark:bg-indigo-500 text-white' : !isSubmitted ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900 group-hover:text-indigo-600 dark:group-hover:text-indigo-400' : ''
                    } ${showAsCorrect ? 'bg-emerald-500 text-white' : ''} ${isWrongSelected ? 'bg-red-500 text-white' : ''} ${isSubmitted && !showAsCorrect && !isWrongSelected ? 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500' : ''}`}>
                      {(!isSubmitted || (!showAsCorrect && !isWrongSelected)) && (currentQ.question_type === 'multiple' 
                        ? (isSelected ? <CheckSquare size={20} /> : <div className="w-4 h-4 border-2 border-current rounded-sm"></div>)
                        : opt)
                      }
                      {isSubmitted && showAsCorrect && <CheckCircle2 size={24} />}
                      {isSubmitted && isWrongSelected && <X size={24} />}
                    </div>
                    <span className={`font-medium text-lg leading-snug break-words transition-colors duration-300 ${(!isSubmitted && isSelected) ? 'text-[#1e1b4b] dark:text-slate-100 font-bold' : showAsCorrect ? 'text-emerald-900 dark:text-emerald-400 font-bold' : isWrongSelected ? 'text-red-900 dark:text-red-400 line-through opacity-80' : 'text-slate-600 dark:text-slate-400'}`}>
                      {currentQ[`option_${opt.toLowerCase()}`]}
                    </span>
                  </div>

                  {/* Nhãn Answer Status */}
                  <div className="shrink-0 hidden md:block">
                     {isSubmitted && showAsCorrect && <span className="text-emerald-600 dark:text-emerald-400 font-bold text-sm bg-emerald-100 dark:bg-emerald-900/30 px-3 py-1 rounded-lg">Correct Answer</span>}
                     {isSubmitted && isWrongSelected && <span className="text-red-600 dark:text-red-400 font-bold text-sm bg-red-100 dark:bg-red-900/30 px-3 py-1 rounded-lg">Your Answer</span>}
                  </div>
                </button>
              );
            })}
          </div>

          {isSubmitted && currentQ.explanation && (
            <div className="mt-8 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/60 p-6 rounded-2xl border-l-8 border-l-amber-400 transition-colors duration-300">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold mb-2 uppercase text-xs tracking-widest transition-colors duration-300"><Lightbulb size={16} /> Giải thích đáp án</div>
              <p className="text-amber-800 dark:text-amber-200 leading-relaxed font-medium transition-colors duration-300">{currentQ.explanation}</p>
            </div>
          )}

          {!isSubmitted && (
            <div className="flex items-center justify-between mt-10 pt-6 border-t border-slate-100 dark:border-slate-800 transition-colors duration-300">
              <button onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))} disabled={currentIndex === 0} className="flex items-center gap-2 px-6 py-3 rounded-full font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition-colors duration-300">
                <ChevronLeft size={20} /> Câu trước
              </button>
              <button onClick={() => setCurrentIndex(prev => Math.min(quiz.questions.length - 1, prev + 1))} disabled={currentIndex === quiz.questions.length - 1} className="flex items-center gap-2 px-6 py-3 rounded-full font-bold bg-[#1e1b4b] dark:bg-indigo-600 text-white hover:bg-[#312e81] dark:hover:bg-indigo-500 disabled:opacity-30 shadow-md transition-all duration-300">
                Câu tiếp <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>

        <div className="w-full lg:w-[340px] flex flex-col gap-6 shrink-0 h-fit lg:sticky lg:top-24">
          <div className="bg-white dark:bg-slate-900 rounded-[24px] shadow-sm border border-slate-200 dark:border-slate-800 p-6 transition-colors duration-300">
            <h3 className="font-black text-[#1e1b4b] dark:text-slate-100 text-lg mb-4 transition-colors duration-300">Danh sách biểu đồ câu</h3>
            
            {/* Chú thích màu sắc Grid chỉ hiện khi đã nộp bài */}
            {isSubmitted && (
                <div className="flex items-center gap-3 mb-6 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 justify-between pr-2 transition-colors duration-300">
                   <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div> Correct</div>
                   <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div> Wrong</div>
                   <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600"></div> Skipped</div>
                </div>
            )}

            <div className="grid grid-cols-5 gap-2 md:gap-3">
              {quiz.questions.map((q, idx) => {
                const qId = q.question_id || q.id;
                const isAnswered = q.question_type === 'multiple' 
                    ? Array.isArray(answers[qId]) && answers[qId].length > 0 
                    : answers[qId] !== undefined;
                
                const isFlagged = flagged[idx];
                
                let gridColorType = '';
                if (isSubmitted) {
                   const userAnswer = answers[qId];
                   const dbCorrectArr = q.correct_option ? q.correct_option.split(',') : [];
                   
                   if (!isAnswered) gridColorType = 'skipped';
                   else {
                       if (q.question_type === 'multiple') {
                           const userAnsArr = Array.isArray(userAnswer) ? userAnswer : [userAnswer];
                           const isPerfectMatch = dbCorrectArr.length === userAnsArr.length && userAnsArr.every(v => dbCorrectArr.includes(v));
                           gridColorType = isPerfectMatch ? 'correct' : 'wrong';
                       } else {
                           gridColorType = dbCorrectArr.includes(userAnswer) ? 'correct' : 'wrong';
                       }
                   }
                } else {
                   gridColorType = isAnswered ? 'answered' : 'unanswered';
                }

                const isCurrent = currentIndex === idx;

                const getGridClassName = () => {
                    const baseClass = "aspect-square rounded-xl font-bold flex items-center justify-center text-[13px] transition-all duration-300 focus:outline-none";
                    const currentHighlight = isCurrent ? "ring-4 ring-indigo-500/30 scale-110 z-10" : "";
                    
                    if (isSubmitted) {
                        if (gridColorType === 'correct') return `${baseClass} bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 shadow-inner ${currentHighlight}`;
                        if (gridColorType === 'wrong') return `${baseClass} bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-400 shadow-inner ${currentHighlight}`;
                        if (gridColorType === 'skipped') return `${baseClass} bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 opacity-60 ${currentHighlight}`;
                    } else {
                        if (gridColorType === 'answered') return `${baseClass} bg-indigo-50 dark:bg-indigo-900/40 border-2 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-400 shadow-sm ${currentHighlight}`;
                        return `${baseClass} bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:border-slate-300 dark:hover:border-slate-600 ${currentHighlight}`;
                    }
                };

                return (
                  <button key={idx} onClick={() => setCurrentIndex(idx)} className={`relative ${getGridClassName()}`}>
                    {idx + 1}
                    {/* Indicator Dot Cắm cờ */}
                    {!isSubmitted && isFlagged && (
                        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                           <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                           <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500 border-2 border-white dark:border-slate-900"></span>
                        </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {!isSubmitted ? (
            <button onClick={() => handleSubmit(false)} className="w-full py-4 rounded-[20px] bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-black text-lg flex items-center justify-center gap-2 shadow-xl shadow-indigo-300/40 hover:-translate-y-1 transition-transform duration-300">
              <CheckCircle2 size={24} /> NỘP BÀI THI
            </button>
          ) : (
            <div className="flex flex-col gap-3">
               <button onClick={() => setShowRatingModal(true)} className="w-full py-4 rounded-[20px] bg-amber-500 text-white font-black text-lg flex items-center justify-center gap-2 shadow-xl shadow-amber-200/40 hover:-translate-y-1 transition-all duration-300 mb-1">
                  <Star size={20} fill="currentColor" /> ĐÁNH GIÁ QUIZ
               </button>
               <button onClick={() => window.location.reload()} className="w-full py-4 rounded-[20px] bg-indigo-600 dark:bg-indigo-500 text-white font-black text-lg flex items-center justify-center gap-2 shadow-xl shadow-indigo-300/40 hover:-translate-y-1 transition-all duration-300">
                  <RefreshCw size={20} /> LÀM LẠI BÀI THI
               </button>
               <button onClick={() => navigate('/explore')} className="w-full py-4 rounded-[20px] bg-white dark:bg-slate-800 border-[2px] border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-bold hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-100 dark:hover:border-indigo-900 text-lg flex items-center justify-center gap-2 shadow-sm transition-all duration-300">
                  <Search size={20} /> Quay lại kho đề
               </button>
            </div>
          )}
        </div>
      </div>
      )}
    </div>
    
    {showRatingModal && (
        <RatingModal 
          quizId={quizId}
          quizTitle={quiz?.title}
          onClose={() => setShowRatingModal(false)}
        />
    )}
    </>
  );
};

export default QuizArena;