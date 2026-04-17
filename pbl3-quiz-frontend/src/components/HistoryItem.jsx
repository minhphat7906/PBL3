import React from 'react';
import { Calendar, Clock, BookOpen, ChevronRight } from 'lucide-react';

const HistoryItem = ({ item, onClick }) => {
  const date = new Date(item.completed_at);
  const total = item.total_questions || (item.correct_answers + item.wrong_answers) || 1; 
  
  // Màu sắc điểm số
  const isHigh = item.total_points >= 80;
  const isMedium = item.total_points >= 50 && item.total_points < 80;
  
  const scoreBoxClass = isHigh 
    ? 'bg-indigo-50 border-indigo-100 text-indigo-600' 
    : isMedium 
      ? 'bg-indigo-50/50 border-indigo-100/50 text-indigo-400' 
      : 'bg-slate-50 border-slate-100 text-slate-400';

  // Tính phần trăm cho thanh progress
  const correctPercent = Math.round((item.correct_answers / total) * 100) || 0;
  
  return (
    <div 
      onClick={() => onClick && onClick(item)}
      className="flex flex-col md:flex-row items-center justify-between p-4 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all cursor-pointer group mb-4 gap-4 md:gap-6"
    >
      {/* Box Điểm Trái */}
      <div className={`w-20 h-24 shrink-0 rounded-2xl flex flex-col items-center justify-center border ${scoreBoxClass} transition-colors group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600`}>
        <span className="text-2xl font-black leading-none mb-1">{item.total_points}</span>
        <span className="text-[10px] font-bold opacity-60 uppercase">/ 100</span>
      </div>

      {/* Thông tin Giữa */}
      <div className="flex-1 min-w-0 w-full pl-2">
        <h3 className="font-bold text-slate-800 text-lg mb-2 truncate group-hover:text-indigo-600 transition-colors">
          {item.quiz_title}
        </h3>
        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-400">
          <span className="flex items-center gap-1.5"><Calendar size={14} /> {date.toLocaleDateString('vi-VN')}</span>
          {/* Default time limit in history if not full */}
          <span className="flex items-center gap-1.5"><Clock size={14} /> {item.time_limit || 30} phút</span>
          <span className="flex items-center gap-1.5"><BookOpen size={14} /> {item.total_questions} câu hỏi</span>
        </div>
      </div>

      {/* Thanh Progress Cạnh Phải */}
      <div className="w-full md:w-64 pt-2 md:pt-0 pl-2">
        <div className="flex justify-between items-end mb-2 text-xs font-black">
          <span className="text-emerald-500">{item.correct_answers} ĐÚNG</span>
          <span className="text-rose-500">{item.wrong_answers} SAI</span>
        </div>
        <div className="h-2 w-full bg-rose-500 rounded-full overflow-hidden flex">
          <div 
            className="h-full bg-emerald-500 rounded-r-full transition-all duration-1000"
            style={{ width: `${correctPercent}%` }}
          />
        </div>
      </div>

      {/* Icon Chevron Mũi Tên Nhấn vào */}
      <div className="hidden md:flex pl-4 pr-2 text-indigo-200 group-hover:text-indigo-600 transition-colors transform group-hover:translate-x-1">
        <ChevronRight size={24} />
      </div>
    </div>
  );
};

export default HistoryItem;
