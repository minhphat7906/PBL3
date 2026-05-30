import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Zap, 
  Search,
  MessageSquare,
  Loader2,
  AlertCircle
} from 'lucide-react';
import axios from 'axios';

const ReviewModal = ({ isOpen, onClose, questions, userAnswers }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [filter, setFilter] = useState('all'); // all, wrong, correct
  const [aiExplanations, setAiExplanations] = useState({});
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  if (!isOpen) return null;

  // Xử lý filter
  const filteredQuestions = questions.filter((q, idx) => {
    const dbAns = (q.correct_answer || q.correct_option || "").split(',').sort().join(',');
    const rawAns = userAnswers[q.id] || "";
    const myAns = Array.isArray(rawAns) ? rawAns.sort().join(',') : String(rawAns).split(',').sort().join(',');
    const isCorrect = myAns === dbAns && myAns !== "";

    if (filter === 'wrong') return !isCorrect && myAns !== "";
    if (filter === 'correct') return isCorrect;
    return true;
  });

  const currentQuestion = filteredQuestions[currentIndex];

  const handleNext = () => {
    if (currentIndex < filteredQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const getAiExplanation = async (questionId) => {
    if (aiExplanations[questionId]) return;
    
    setIsLoadingAi(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:3000/api/v1/quizzes/ai/explain', 
        { questionId },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        setAiExplanations(prev => ({
          ...prev,
          [questionId]: response.data.explanation
        }));
      }
    } catch (error) {
      console.error("Lỗi AI:", error);
    } finally {
      setIsLoadingAi(false);
    }
  };

  const dbAns = currentQuestion ? (currentQuestion.correct_answer || currentQuestion.correct_option || "") : "";
  const rawAns = currentQuestion ? (userAnswers[currentQuestion.id] || "") : "";
  const myAns = Array.isArray(rawAns) ? rawAns.sort().join(',') : String(rawAns).split(',').sort().join(',');
  const isCorrect = myAns === dbAns && myAns !== "";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 dark:shadow-none">
                <Search size={24} />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-800 dark:text-white">Xem lại bài giải</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Phân tích chi tiết từng câu hỏi</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Filters */}
          <div className="px-8 py-4 bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800 flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'Tất cả', activeClass: 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none border-transparent', inactiveClass: 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-indigo-400' },
              { id: 'wrong', label: 'Câu sai', activeClass: 'bg-rose-600 text-white shadow-lg shadow-rose-200 dark:shadow-none border-transparent', inactiveClass: 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-rose-400' },
              { id: 'correct', label: 'Câu đúng', activeClass: 'bg-emerald-600 text-white shadow-lg shadow-emerald-200 dark:shadow-none border-transparent', inactiveClass: 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-emerald-400' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => { setFilter(f.id); setCurrentIndex(0); }}
                className={`px-6 py-2 rounded-xl text-sm font-bold border transition-all ${
                  filter === f.id ? f.activeClass : f.inactiveClass
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-8 space-y-8">
            {filteredQuestions.length > 0 && currentQuestion ? (
              <div className="max-w-3xl mx-auto space-y-8">
                {/* Question Header */}
                <div className="flex items-center justify-between">
                  <span className="px-4 py-1 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-black uppercase tracking-wider">
                    Câu hỏi {currentIndex + 1} / {filteredQuestions.length}
                  </span>
                  <div className={`flex items-center gap-2 font-bold ${isCorrect ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {isCorrect ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
                    {isCorrect ? 'Chính xác' : 'Chưa đúng'}
                  </div>
                </div>

                {/* Question Text */}
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white leading-relaxed">
                  {currentQuestion.question_text}
                </h3>

                {/* Options */}
                <div className="grid grid-cols-1 gap-4">
                  {['a', 'b', 'c', 'd'].map((opt) => {
                    const label = opt.toUpperCase();
                    // Deep search: Kiểm tra mọi tổ hợp tên thuộc tính có thể có
                    const text = currentQuestion[`option_${opt}`] || 
                                 currentQuestion[`option_${label}`] || 
                                 currentQuestion[`Option${label}`] ||
                                 currentQuestion[`choice_${opt}`] ||
                                 currentQuestion[`Choice${label}`] ||
                                 currentQuestion[opt] || 
                                 currentQuestion[label];
                    
                    if (!text) return null;

                    const isSelected = String(myAns).toLowerCase() === opt || String(myAns).toUpperCase() === label;
                    const isCorrectOpt = String(dbAns).toLowerCase() === opt || String(dbAns).toUpperCase() === label;

                    let stateClasses = "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50";
                    if (isSelected && isCorrectOpt) stateClasses = "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20";
                    if (isSelected && !isCorrectOpt) stateClasses = "border-rose-500 bg-rose-50 dark:bg-rose-900/20";
                    if (!isSelected && isCorrectOpt) stateClasses = "border-emerald-500 dark:border-emerald-500 bg-emerald-50/30 dark:bg-emerald-900/10";

                    return (
                      <div 
                        key={opt}
                        className={`p-5 rounded-2xl border-2 transition-all flex items-center justify-between ${stateClasses}`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${
                            isCorrectOpt ? 'bg-emerald-500 text-white' : isSelected ? 'bg-rose-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                          }`}>
                            {label}
                          </div>
                          <span className="font-semibold text-slate-700 dark:text-slate-200">{text}</span>
                        </div>
                        {isCorrectOpt && <CheckCircle2 className="text-emerald-500" size={24} />}
                        {isSelected && !isCorrectOpt && <XCircle className="text-rose-500" size={24} />}
                      </div>
                    );
                  })}
                </div>

                {/* Explanations */}
                <div className="space-y-4 pt-4">
                  {/* Basic Explanation */}
                  {(currentQuestion.explanation || currentQuestion.correct_explanation) && (
                    <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-700">
                      <div className="flex items-center gap-2 text-slate-800 dark:text-white font-bold mb-3">
                        <AlertCircle className="text-indigo-500" size={20} />
                        Giải thích từ tác giả
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed italic">
                        {currentQuestion.explanation || currentQuestion.correct_explanation}
                      </p>
                    </div>
                  )}

                  {/* AI Explanation Area */}
                  <div className="relative">
                    {!aiExplanations[currentQuestion.id] ? (
                      <button 
                        onClick={() => getAiExplanation(currentQuestion.id)}
                        disabled={isLoadingAi}
                        className="w-full group relative p-6 rounded-3xl bg-gradient-to-r from-indigo-600 to-violet-700 text-white shadow-xl shadow-indigo-200 dark:shadow-none hover:shadow-2xl hover:-translate-y-1 transition-all overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
                        <div className="relative flex items-center justify-center gap-3">
                          {isLoadingAi ? (
                            <Loader2 className="animate-spin" size={24} />
                          ) : (
                            <Zap className="text-amber-300" fill="currentColor" size={24} />
                          )}
                          <div className="text-left">
                            <span className="block font-black text-lg">Hỏi AI Tutor giải thích</span>
                            <span className="block text-indigo-100 text-xs font-medium">Sử dụng AI để phân tích sâu hơn</span>
                          </div>
                        </div>
                      </button>
                    ) : (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-8 bg-indigo-50 dark:bg-indigo-900/20 rounded-[32px] border-2 border-indigo-100 dark:border-indigo-800/50"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3 text-indigo-600 dark:text-indigo-400 font-black uppercase text-xs tracking-widest">
                            <Zap fill="currentColor" size={16} /> AI Tutor Insights
                          </div>
                          <span className="px-3 py-1 bg-white dark:bg-slate-800 rounded-full text-[10px] font-bold text-indigo-500 border border-indigo-100 dark:border-indigo-800">
                            Hệ thống tối ưu
                          </span>
                        </div>
                        <div className="text-slate-700 dark:text-slate-200 leading-loose whitespace-pre-wrap font-medium">
                          {aiExplanations[currentQuestion.id]}
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400 italic">
                <HelpCircle size={64} className="mb-4 opacity-20" />
                Không có câu hỏi nào phù hợp với bộ lọc này.
              </div>
            )}
          </div>

          {/* Footer Controls */}
          <div className="px-8 py-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between sticky bottom-0">
            <button 
              onClick={handlePrev}
              disabled={currentIndex === 0 || filteredQuestions.length === 0}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition-all"
            >
              <ChevronLeft size={20} /> Câu trước
            </button>
            
            <div className="flex gap-1.5">
              {filteredQuestions.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1.5 rounded-full transition-all ${
                    i === currentIndex ? 'w-8 bg-indigo-600' : 'w-1.5 bg-slate-200 dark:bg-slate-700'
                  }`} 
                />
              ))}
            </div>

            <button 
              onClick={handleNext}
              disabled={currentIndex === filteredQuestions.length - 1 || filteredQuestions.length === 0}
              className="flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold hover:scale-105 disabled:opacity-30 transition-all shadow-xl shadow-slate-200 dark:shadow-none"
            >
              Câu tiếp <ChevronRight size={20} />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ReviewModal;
