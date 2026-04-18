import React from 'react';
import { Play, User, PlayCircle, BookOpen, Share2, Download, Tag, Navigation, Clock, Heart, PencilLine, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';
import html2pdf from 'html2pdf.js';

const gradients = [
  'from-violet-500 to-purple-600',
  'from-blue-500 to-cyan-500',
  'from-emerald-400 to-teal-500',
  'from-rose-400 to-red-500',
  'from-amber-400 to-orange-500'
];

const ExploreQuizCard = ({ quiz, onClick, onPlayClick, onPreviewClick, showActions, onEdit, onDelete }) => {
  const gradientColors = [
    'from-indigo-500 to-purple-600',
    'from-blue-600 to-cyan-400',
    'from-emerald-500 to-teal-400',
    'from-rose-500 to-red-400',
    'from-amber-500 to-orange-400'
  ];
  const gradientClass = gradientColors[(quiz.id || 0) % gradientColors.length];
  
  const handleShare = async (e) => {
    e.stopPropagation();
    const url = `${window.location.origin}/play/${quiz.id}`;
    try {
      await navigator.clipboard.writeText(url);
      Swal.fire({
        toast: true, position: 'top-end', showConfirmButton: false, timer: 2000,
        icon: 'success', title: 'Đã copy liên kết!'
      });
    } catch (err) { console.error(err); }
  };

  const handleDownloadPDF = async (e) => {
    e.stopPropagation();
    Swal.fire({ title: "Đang tạo PDF...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:3000/api/v1/quizzes/${quiz.id}/preview`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.data.success) throw new Error();
      const quizData = res.data.quiz;
      const element = document.createElement('div');
      element.innerHTML = `
        <div style="font-family: Arial, sans-serif; padding: 40px; color: #333;">
          <h1 style="text-align: center; color: #4f46e5;">${quizData.title}</h1>
          <p style="text-align: center; color: #666;">Thời gian: ${quizData.time_limit} phút</p>
          <div style="margin-top: 30px;">
            ${quizData.questions.map((q, i) => `<div style="margin-bottom: 20px;"><p><b>Câu ${i+1}:</b> ${q.question_text}</p></div>`).join('')}
          </div>
        </div>
      `;
      const opt = { margin: 10, filename: `${quizData.title}.pdf`, html2canvas: { scale: 2 }, jsPDF: { unit: 'mm', format: 'a4' } };
      await html2pdf().set(opt).from(element).save();
      Swal.close();
    } catch (err) { Swal.fire({ icon: 'error', title: 'Lỗi tạo PDF' }); }
  };

  return (
    <div 
      onClick={() => onClick && onClick(quiz)}
      className="group relative bg-[#1e1b4b] rounded-[32px] overflow-hidden border border-white/5 hover:border-indigo-500/50 transition-all duration-500 cursor-pointer shadow-2xl flex flex-col h-[420px] isolate"
    >
      {/* Glow Effect on Hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0"></div>
      
      {/* Card Header (Gradient & Image Area) */}
      <div className="h-[140px] w-full relative shrink-0 p-4 z-10">
        <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} opacity-80 group-hover:scale-110 transition-transform duration-700`}></div>
        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500"></div>
        
        {/* Floating Badges */}
        <div className="flex justify-between items-start relative z-10 w-full">
          {(quiz.category_name || quiz.category) && (
            <div className="bg-black/30 backdrop-blur-md border border-white/20 text-white text-[10px] font-black tracking-widest px-3 py-1 rounded-full uppercase flex items-center gap-1.5">
              <Tag size={10} /> {quiz.category_name || quiz.category}
            </div>
          )}
          {quiz.difficulty && (
            <div className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border backdrop-blur-md 
              ${quiz.difficulty === 'Khó' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' : 
                quiz.difficulty === 'Dễ' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 
                'bg-amber-500/20 text-amber-300 border-amber-500/30'}`}>
              {quiz.difficulty}
            </div>
          )}
        </div>

        {/* Dash Actions (Edit/Delete) */}
        {showActions && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100">
            <button onClick={(e) => { e.stopPropagation(); onEdit && onEdit(quiz.id); }} className="p-3 bg-white/10 hover:bg-amber-400 text-white rounded-2xl backdrop-blur-md border border-white/20 transition-all shadow-xl"><PencilLine size={18}/></button>
            <button onClick={(e) => { e.stopPropagation(); onDelete && onDelete(quiz.id); }} className="p-3 bg-white/10 hover:bg-rose-500 text-white rounded-2xl backdrop-blur-md border border-white/20 transition-all shadow-xl"><Trash2 size={18}/></button>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 p-6 flex flex-col relative z-10">
        {/* Title & Description */}
        <div className="mb-4">
          <h3 className="text-white font-black text-xl leading-snug line-clamp-2 min-h-[56px] group-hover:text-indigo-300 transition-colors">
            {quiz.title}
          </h3>
          <p className="text-white/40 text-xs font-medium mt-2 line-clamp-2 leading-relaxed">
            {quiz.description || "Hãy cùng tham gia thử thách kiến thức và chinh phục điểm số cao nhất ngay hôm nay!"}
          </p>
        </div>

        {/* Author & Meta */}
        <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white bg-gradient-to-br ${gradientClass} ring-2 ring-[#1e1b4b]`}>
              {quiz.author_name ? quiz.author_name.charAt(0).toUpperCase() : 'Q'}
            </div>
            <div>
              <p className="text-[10px] text-white/30 font-bold uppercase tracking-tighter">Tác giả</p>
              <p className="text-xs text-white/70 font-bold truncate max-w-[100px]">{quiz.author_name || 'Anonymous'}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="text-center">
                <p className="text-[10px] text-white/30 font-bold uppercase tracking-tighter flex items-center gap-1"><BookOpen size={10} /> Câu hỏi</p>
                <p className="text-xs text-indigo-400 font-black">{quiz.total_questions || '??'}</p>
             </div>
             <div className="text-center">
                <p className="text-[10px] text-white/30 font-bold uppercase tracking-tighter flex items-center gap-1"><PlayCircle size={10} /> Lượt làm</p>
                <p className="text-xs text-emerald-400 font-black">{quiz.total_attempts || 0}</p>
             </div>
          </div>
        </div>
      </div>

      {/* Interaction Bar */}
      <div className="px-6 pb-6 pt-2 z-10">
        <div className="flex items-center gap-2">
           <button 
            onClick={(e) => { e.stopPropagation(); onPlayClick && onPlayClick(quiz); }}
            className="flex-1 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-[0_8px_20px_-5px_rgba(79,70,229,0.4)] hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
           >
             <Navigation size={16} fill="currentColor" /> Làm bài
           </button>
           
           <div className="flex gap-1.5">
             <button onClick={(e) => { e.stopPropagation(); onPreviewClick && onPreviewClick(quiz); }} className="p-3 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-2xl transition-all border border-white/5" title="Xem trước"><BookOpen size={18}/></button>
             <button onClick={handleShare} className="p-3 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-2xl transition-all border border-white/5" title="Chia sẻ"><Share2 size={18}/></button>
             <button onClick={handleDownloadPDF} className="p-3 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-2xl transition-all border border-white/5" title="Tải PDF"><Download size={18}/></button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ExploreQuizCard;
