import React from 'react';
import { Play, User, PlayCircle, PencilLine, Trash2 } from 'lucide-react';

const gradients = [
  'from-violet-500 to-purple-600',
  'from-blue-500 to-cyan-500',
  'from-emerald-400 to-teal-500',
  'from-rose-400 to-red-500',
  'from-amber-400 to-orange-500'
];

const QuizCard = ({ quiz, onClick, onPlayClick, showActions, onEdit, onDelete }) => {
  // Chọn màu gradient dựa trên ID để cố định mẫu cho mỗi đề
  const gradientClass = gradients[(quiz.id || 0) % gradients.length];
  
  return (
    <div 
      onClick={() => onClick && onClick(quiz)}
      className="group bg-white rounded-[24px] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 w-full overflow-hidden cursor-pointer flex flex-col h-[320px] relative"
    >
      {/* Top Half: Cover Image / Gradient */}
      <div className={`h-[160px] w-full bg-gradient-to-br ${gradientClass} relative overflow-hidden shrink-0`}>
        {/* Badge: Time/Questions */}
        <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md border border-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-full z-10 shadow-sm">
          {quiz.time_limit} Phút
        </div>

        {/* Hover Overlay with Play Button */}
        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              if (onPlayClick) onPlayClick(quiz);
            }}
            className="flex items-center gap-2 bg-white/20 backdrop-blur-md text-white px-6 py-3 rounded-2xl font-bold shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all border border-white/30 hover:bg-white hover:text-slate-900"
          >
            <Play fill="currentColor" size={20} /> Play
          </button>
        </div>
      </div>

      {/* Hành động (Cho phần Dashboard - Mine tab) */}
      {showActions && (
        <div className="absolute top-4 left-4 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button 
            onClick={(e) => { e.stopPropagation(); onEdit && onEdit(quiz.id); }} 
            className="p-2 bg-amber-400/90 hover:bg-amber-400 text-white rounded-xl shadow-md backdrop-blur-sm"
          >
            <PencilLine size={16}/>
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete && onDelete(quiz.id); }} 
            className="p-2 bg-red-500/90 hover:bg-red-500 text-white rounded-xl shadow-md backdrop-blur-sm"
          >
            <Trash2 size={16}/>
          </button>
        </div>
      )}

      {/* Bottom Half: Info */}
      <div className="p-6 flex flex-col flex-1 bg-white">
        <h3 className="font-extrabold text-slate-900 text-xl leading-tight mb-auto line-clamp-2 hover:text-[#4f46e5] transition-colors">
          {quiz.title}
        </h3>
        
        <div className="flex items-center justify-between mt-4 flex-wrap gap-2">
          {quiz.author_name && (
            <div className="flex items-center gap-2 text-slate-500 text-sm font-medium bg-slate-50 px-3 py-1.5 rounded-full">
              <User size={14} className="text-slate-400" />
              <span className="truncate max-w-[100px]">by {quiz.author_name}</span>
            </div>
          )}
          
          <div className="flex items-center gap-3">
            {quiz.avg_rating > 0 && (
              <div className="flex items-center text-amber-500 text-sm font-bold bg-amber-50 px-2 py-1 rounded-lg">
                ★ {quiz.avg_rating.toFixed(1)}
              </div>
            )}
            {quiz.total_attempts !== undefined && (
              <div className="flex items-center gap-1.5 text-slate-500 text-sm font-semibold">
                <PlayCircle size={16} className="text-slate-400" /> {quiz.total_attempts}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizCard;
