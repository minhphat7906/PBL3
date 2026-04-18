import React, { useState, useEffect } from 'react';
import { X, PlayCircle, Clock, BookOpen, AlertCircle } from 'lucide-react';
import axios from 'axios';

const PreviewModal = ({ quizId, onClose, onPlay }) => {
  const [quizPreview, setQuizPreview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPreview = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`http://localhost:3000/api/v1/quizzes/${quizId}/preview`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) {
          setQuizPreview(res.data.quiz);
        }
      } catch (err) {
        console.error("Lỗi lấy preview:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPreview();
  }, [quizId]);

  if (!quizId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-[#f8f9fc] rounded-[32px] shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-8 flex justify-between items-center shrink-0 border-b border-slate-200 bg-white shadow-sm z-10 pt-6 pb-6">
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
            <BookOpen className="text-indigo-600" size={28} /> Xem trước Đề thi
          </h2>
          <button 
            onClick={onClose} 
            className="p-3 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-full transition-colors"
          >
            <X size={24} strokeWidth={2.5} />
          </button>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto w-full p-8 custom-scrollbar">
          {loading ? (
             <div className="flex flex-col items-center justify-center py-20">
               <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
               <p className="text-slate-500 font-medium">Đang tải nội dung đề thi...</p>
             </div>
          ) : !quizPreview ? (
             <div className="text-center py-20 text-rose-500 font-medium font-sans">
               Không thể tải đề thi. Vui lòng thử lại.
             </div>
          ) : (
            <div className="space-y-8">
              {/* Thông tin chung */}
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 z-0"></div>
                <div className="w-20 h-20 rounded-2xl bg-indigo-100 text-indigo-600 flex justify-center items-center shrink-0 font-black text-2xl z-10">
                  {quizPreview.category_name?.[0] || quizPreview.category?.[0] || 'Q'}
                </div>
                <div className="flex-1 z-10">
                  <h3 className="text-2xl font-extrabold text-slate-900 mb-2">{quizPreview.title}</h3>
                  {quizPreview.description && (
                    <p className="text-slate-500 mb-4 font-medium">{quizPreview.description}</p>
                  )}
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-2">
                    <span className="bg-slate-50 text-slate-600 border border-slate-200 px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-1.5">
                      <Clock size={16}/> {quizPreview.time_limit} Phút
                    </span>
                    <span className="bg-indigo-50 text-indigo-700 font-bold px-4 py-1.5 rounded-full text-sm">
                      {quizPreview.questions?.length || 0} Câu hỏi
                    </span>
                    {quizPreview.difficulty && (
                      <span className="bg-amber-50 text-amber-600 px-4 py-1.5 rounded-full font-bold text-sm">
                        {quizPreview.difficulty}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Thông báo chống gian lận */}
              <div className="bg-rose-50 rounded-2xl p-4 flex gap-3 text-rose-700 border border-rose-100 items-start">
                <AlertCircle className="shrink-0 mt-0.5" size={20} />
                <div className="text-sm font-medium leading-relaxed">
                  <span className="font-bold">Lưu ý bảo mật:</span> Chế độ xem trước chỉ hiển thị nội dung câu hỏi để bạn biết tổng quan đề thi. Toàn bộ các lựa chọn đáp án (A, B, C, D) đã bị ẩn đi nhằm mục đích chống gian lận.
                </div>
              </div>

              {/* Danh sách câu hỏi */}
              <div>
                <h4 className="text-xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200 flex items-center justify-between">
                  <span>Nội dung Câu hỏi</span>
                </h4>
                
                <div className="space-y-4">
                  {quizPreview.questions?.map((q, i) => (
                    <div key={q.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4 hover:border-indigo-200 hover:shadow-md transition-all">
                      <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 font-black flex items-center justify-center shrink-0 pt-0.5 text-sm">
                        {i + 1}
                      </div>
                      <div className="flex-1 pt-1">
                        <p className="font-bold text-slate-800 leading-relaxed break-words">{q.question_text}</p>
                        {q.image_url && (
                          <div className="mt-4 rounded-xl overflow-hidden border border-slate-100 max-w-sm">
                            <img src={q.image_url} alt="Question image" className="w-full h-auto object-cover" />
                          </div>
                        )}
                        <div className="mt-3 flex gap-2 w-max">
                          <span className="bg-slate-50 text-slate-400 px-2 py-1 rounded text-[10px] font-bold tracking-wider uppercase">
                            THÔNG TIN ẨN
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {(!quizPreview.questions || quizPreview.questions.length === 0) && (
                    <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500 font-medium">
                      Đề thi này chưa có câu hỏi nào.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-slate-200 bg-white flex justify-end gap-3 shrink-0">
          <button 
            onClick={onClose} 
            className="px-6 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            Đóng
          </button>
          <button 
            onClick={() => onPlay()}
            className="px-8 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all flex items-center gap-2"
          >
            <PlayCircle size={20} /> Bắt đầu làm bài
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;
