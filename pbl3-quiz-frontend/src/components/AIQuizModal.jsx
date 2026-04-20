import React, { useState } from 'react';
import { Sparkles, X, UploadCloud, FileText, Loader2, BookOpen, Settings } from 'lucide-react';

const AIQuizModal = ({ isOpen, onClose }) => {
  const [topic, setTopic] = useState('');
  const [useDoc, setUseDoc] = useState(false);
  const [questionCount, setQuestionCount] = useState(10);
  const [difficulty, setDifficulty] = useState('Khó');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = () => {
    setIsLoading(true);
    // Giả lập API call
    setTimeout(() => {
      setIsLoading(false);
      onClose(); // Flow: Đóng modal sau khi tạo thành công (sau này sẽ redirect)
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Box */}
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1.5 rounded-full transition-colors"
        >
          <X size={20} />
        </button>

        {/* 2. Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 mb-2">
            <Sparkles className="text-purple-500 w-8 h-8" />
            <h2 className="text-2xl font-bold text-slate-900">Khởi tạo Đề thi bằng AI</h2>
          </div>
          <p className="text-slate-500 text-sm">
            Nhập chủ đề hoặc tải lên tài liệu học tập, AI sẽ lo phần còn lại.
          </p>
        </div>

        {/* 3. Khu vực 1: Nhập Chủ Đề */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
              <BookOpen size={16} className="text-slate-400" />
              Chủ đề chi tiết (hoặc đoạn văn bản)
            </label>
            <textarea
              rows={4}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="VD: Lịch sử thế chiến 2 - Diễn biến chính..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none shadow-sm"
              disabled={isLoading}
            />
          </div>

          {/* 4. Khu vực 2: Kho Kiến Thức */}
          <div className="bg-slate-50 border border-slate-100 rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 flex items-center justify-between border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-indigo-500" />
                <span className="font-semibold text-slate-700 text-sm">Sử dụng tài liệu đính kèm</span>
              </div>
              {/* Toggle Switch */}
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={useDoc}
                  onChange={() => setUseDoc(!useDoc)}
                  disabled={isLoading}
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
              </label>
            </div>

            {useDoc && (
              <div className="p-4">
                <div className="border-2 border-dashed border-indigo-200 bg-indigo-50/50 hover:border-indigo-400 rounded-xl p-6 flex flex-col items-center justify-center text-center transition-colors cursor-pointer group">
                  <div className="bg-indigo-100 text-indigo-600 p-3 rounded-full mb-3 group-hover:scale-110 transition-transform duration-300">
                    <UploadCloud size={24} />
                  </div>
                  <p className="font-semibold text-slate-700 text-sm mb-1">
                    Kéo thả PDF, Word, hoặc file Text vào đây
                  </p>
                  <p className="text-xs text-slate-500 font-medium">Hỗ trợ tối đa 3 file, dung lượng &lt; 5MB</p>
                </div>
              </div>
            )}
          </div>

          {/* 5. Khu vực 3: Cấu hình (Grid 2 cột) */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Số lượng câu hỏi</label>
              <select 
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm cursor-pointer"
                disabled={isLoading}
              >
                {[5, 10, 15, 20, 30].map(num => (
                  <option key={num} value={num}># {num} câu hỏi</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Độ khó</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm cursor-pointer"
                disabled={isLoading}
              >
                <option value="Dễ">🟢 Dễ</option>
                <option value="Trung bình">🟡 Trung bình</option>
                <option value="Khó">🔴 Khó</option>
              </select>
            </div>
          </div>
        </div>

        {/* 6. Nút Hành động */}
        <button
          onClick={handleGenerate}
          disabled={isLoading || (!topic.trim() && !useDoc)}
          className={`w-full mt-8 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 text-white shadow-lg transition-all
            ${isLoading 
              ? 'bg-indigo-400 opacity-80 cursor-not-allowed' 
              : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover:shadow-indigo-500/30 shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-indigo-600 disabled:hover:to-purple-600'
            }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Đang phân tích dữ liệu...
            </>
          ) : (
            <>
              <Sparkles size={20} />
              ✨ Khởi tạo bằng AI
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default AIQuizModal;
