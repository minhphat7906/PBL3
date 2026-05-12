import React from 'react';
import { Play, User, BookOpen, Tag, Clock, PlayCircle, Heart, Share2, Download, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import axios from 'axios';
import html2pdf from 'html2pdf.js';

// ─── Màu Tag theo chủ đề ─────────────────────────────────────────────
const getTagColor = (categoryName) => {
  const cat = (categoryName || '').toLowerCase();
  if (cat.includes('toán')) return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300';
  if (cat.includes('văn')) return 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300';
  if (cat.includes('anh') || cat.includes('ngoại ngữ')) return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300';
  if (cat.includes('it') || cat.includes('công nghệ')) return 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300';
  if (cat.includes('lịch sử')) return 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300';
  return 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300';
};

const LightQuizCard = ({ quiz, onClick, onPlayClick, onPreviewClick, showActions, onEdit, onDelete }) => {
  const navigate = useNavigate();
  const isChung = quiz.category_name === 'Chung';
  const category = (isChung && quiz.category) ? quiz.category : (quiz.category || quiz.category_name || 'Chung');
  const coverUrl = quiz?.image_url || 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&q=80&fit=crop';
  const tagColor = getTagColor(category);

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
      className="group bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-lg dark:hover:bg-slate-700/50 hover:-translate-y-1 transition-all duration-200 cursor-pointer flex flex-col"
    >
      {/* ── Cover Image ── */}
      <div className="relative h-36 overflow-hidden">
        <img
          src={coverUrl}
          alt={category}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.parentElement.classList.add('bg-gradient-to-br', 'from-indigo-400', 'to-purple-500');
          }}
        />
        {/* Overlay with Difficulty Badge */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
        {quiz.difficulty && (
          <div className={`absolute top-3 right-3 text-[10px] font-black uppercase px-2.5 py-1 rounded-full border backdrop-blur-sm
            ${quiz.difficulty === 'Khó' ? 'bg-rose-500/80 text-white border-rose-400/30' :
              quiz.difficulty === 'Dễ' ? 'bg-emerald-500/80 text-white border-emerald-400/30' :
              'bg-amber-500/80 text-white border-amber-400/30'}`}>
            {quiz.difficulty}
          </div>
        )}
        {/* Time badge */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/40 text-white text-[10px] font-bold px-2 py-1 rounded-full backdrop-blur-sm">
          <Clock size={10} /> {quiz.time_limit} phút
        </div>

        {/* Actions for mine tab */}
        {showActions && (
          <div className="absolute top-3 left-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={(e) => { e.stopPropagation(); onEdit && onEdit(quiz.id); }} className="p-1.5 bg-amber-400 text-white rounded-lg shadow-md text-xs font-bold">✏️</button>
            <button onClick={(e) => { e.stopPropagation(); onDelete && onDelete(quiz.id); }} className="p-1.5 bg-rose-500 text-white rounded-lg shadow-md text-xs font-bold">🗑</button>
          </div>
        )}
      </div>

      {/* ── Card Body ── */}
      <div className="p-4 flex flex-col flex-1">
        {/* Category Tag */}
        <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full w-fit mb-2 ${tagColor}`}>
          <Tag size={9} /> {category}
        </span>

        {/* Title */}
        <h3 className="font-extrabold text-slate-800 dark:text-slate-200 text-sm leading-snug line-clamp-2 min-h-[36px] group-hover:text-[var(--theme-primary)] dark:group-hover:text-[var(--theme-primary-light)] transition-colors mb-auto">
          {quiz.title}
        </h3>

        {/* Meta row */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500 text-[10px] font-bold">
              <BookOpen size={11} /> {quiz.total_questions || '?'} câu
            </div>
            <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500 text-[10px] font-bold">
              <PlayCircle size={11} /> {quiz.total_attempts || 0}
            </div>
            {quiz.total_likes > 0 && (
              <div className={`flex items-center gap-1 text-[10px] font-bold ${quiz.is_favorite ? 'text-rose-500' : 'text-slate-400 dark:text-slate-500'}`}>
                <Heart size={11} fill={quiz.is_favorite ? 'currentColor' : 'none'} /> {quiz.total_likes}
              </div>
            )}
          </div>
          {quiz.author_name && (
            <div className="flex items-center gap-2">
              {quiz.average_rating !== undefined && (
                <button 
                  onClick={(e) => { e.stopPropagation(); navigate(`/quiz/${quiz.id}/reviews`); }}
                  className="group/rating flex items-center gap-1.5 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 px-2 sm:px-2.5 py-1 rounded-xl border border-amber-200 dark:border-amber-800/50 hover:bg-amber-100 dark:hover:bg-amber-900/50 hover:scale-105 transition-all font-black text-[10px] shadow-sm active:scale-95"
                  title={`${quiz.total_reviews || 0} lượt đánh giá - Bấm để xem chi tiết`}
                >
                  <Star size={12} className="group-hover/rating:fill-amber-500 transition-colors shrink-0" fill={quiz.average_rating > 0 ? "currentColor" : "none"} /> 
                  <span>{Number(quiz.average_rating || 0).toFixed(1)}</span>
                </button>
              )}
              <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500 text-[10px] font-medium" title={`Tác giả: ${quiz.author_name}`}>
                {quiz.author_avatar ? (
                  <img 
                    src={quiz.author_avatar} 
                    alt={quiz.author_name} 
                    className="w-4 h-4 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700" 
                  />
                ) : (
                  <div className="w-4 h-4 rounded-full bg-[var(--theme-primary-light)] dark:bg-[var(--theme-primary-dark)]/50 text-[var(--theme-primary)] dark:text-[var(--theme-primary-light)] flex items-center justify-center text-[8px] font-black">
                    {quiz.author_name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Play Button */}
        {onPlayClick ? (
          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); onPlayClick(quiz); }}
              className="flex-1 py-2.5 bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-dark)] text-white font-bold rounded-xl text-xs uppercase tracking-widest transition-colors duration-200 shadow-sm shadow-[var(--theme-glow)] flex items-center justify-center gap-2"
            >
              <Play size={13} fill="currentColor" /> Làm bài ngay
            </button>
            
            {onPreviewClick && (
              <div className="flex gap-1.5 shrink-0">
                <button onClick={(e) => { e.stopPropagation(); onPreviewClick(quiz); }} className="p-2.5 bg-slate-50 dark:bg-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl transition-all border border-slate-100 dark:border-slate-600" title="Xem trước"><BookOpen size={16}/></button>
                <button onClick={handleShare} className="p-2.5 bg-slate-50 dark:bg-slate-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-xl transition-all border border-slate-100 dark:border-slate-600" title="Chia sẻ"><Share2 size={16}/></button>
                <button onClick={handleDownloadPDF} className="p-2.5 bg-slate-50 dark:bg-slate-700 hover:bg-rose-50 dark:hover:bg-rose-900/30 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl transition-all border border-slate-100 dark:border-slate-600" title="Tải PDF"><Download size={16}/></button>
              </div>
            )}
          </div>
        ) : (
          <button className="mt-3 w-full py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 font-bold rounded-xl text-xs uppercase tracking-widest cursor-default">
            Chưa có Link
          </button>
        )}
      </div>
    </div>
  );
};

export default LightQuizCard;
