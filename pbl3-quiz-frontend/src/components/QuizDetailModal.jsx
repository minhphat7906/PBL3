import React, { useState } from 'react';
import { Heart, Play, User, X, Star, ChevronRight, BarChart3, Clock } from 'lucide-react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

const QuizDetailModal = ({ quiz, onClose, onFavoriteUpdate }) => {
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(quiz.is_favorite === 1);

  const handleToggleFavorite = async (e) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`http://localhost:3000/api/v1/quizzes/${quiz.id}/favorite`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const newStatus = res.data.status === 'favorited';
      setIsFavorite(newStatus);
      
      // Báo về trang cha để cập nhật icon ngoài danh sách
      if (onFavoriteUpdate) onFavoriteUpdate(quiz.id, newStatus);

      Swal.fire({
        toast: true, position: 'top-end', showConfirmButton: false, timer: 1500,
        icon: 'success', title: newStatus ? 'Đã thêm vào yêu thích ❤️' : 'Đã xóa khỏi yêu thích 💔'
      });
    } catch (err) { console.error(err); }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border dark:border-slate-800 w-full max-w-xl rounded-[40px] overflow-hidden shadow-2xl relative transition-colors duration-300">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-full transition-all"><X /></button>
        
        <div className="p-10">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs mb-4">
             <Star size={16} fill="currentColor" /> <span>KHÁM PHÁ CHI TIẾT</span>
          </div>
          
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2 leading-tight">{quiz.title}</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium">{quiz.description || "Đề thi chất lượng từ cộng đồng."}</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            <div 
              onClick={() => quiz.author_id && navigate(`/profile/${quiz.author_id}`)}
              className="p-4 bg-slate-50 dark:bg-slate-850/40 rounded-3xl border border-slate-100 dark:border-slate-800/80 flex flex-col items-center justify-center text-center gap-2 cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all group"
            >
              <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-sm text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white dark:group-hover:bg-indigo-500 transition-all"><User size={20}/></div>
              <div><p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase">Tác giả</p><p className="font-bold text-slate-700 dark:text-slate-300 text-sm truncate w-24 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">{quiz.author_name}</p></div>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-850/40 rounded-3xl border border-slate-100 dark:border-slate-800/80 flex flex-col items-center justify-center text-center gap-2 transition-all">
              <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-sm text-emerald-600 dark:text-emerald-400"><Clock size={20}/></div>
              <div><p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase">Thời gian</p><p className="font-bold text-slate-700 dark:text-slate-300 text-sm">{quiz.time_limit} phút</p></div>
            </div>
            <button 
              onClick={() => navigate(`/quiz/${quiz.id}/reviews`)}
              className="p-4 bg-slate-50 dark:bg-slate-850/40 rounded-3xl border border-slate-100 dark:border-slate-800/80 flex flex-col items-center justify-center text-center gap-2 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:border-amber-200 dark:hover:border-amber-800 hover:scale-105 transition-all group active:scale-95 shadow-sm hover:shadow-md"
              title="Xem tất cả nhận xét"
            >
              <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-sm text-amber-500 dark:text-amber-400 group-hover:bg-amber-500 group-hover:text-white dark:group-hover:bg-amber-500 transition-all"><Star size={20}/></div>
              <div>
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase">Đánh giá</p>
                <p className="font-bold text-slate-700 dark:text-slate-300 text-sm group-hover:text-amber-600 dark:group-hover:text-amber-400">
                  {quiz.average_rating > 0 ? `${Number(quiz.average_rating).toFixed(1)} sao` : 'Chưa có'}
                </p>
              </div>
            </button>
            <div className="p-4 bg-slate-50 dark:bg-slate-850/40 rounded-3xl border border-slate-100 dark:border-slate-800/80 flex flex-col items-center justify-center text-center gap-2 transition-all">
              <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-sm text-rose-500 dark:text-rose-400"><BarChart3 size={20}/></div>
              <div><p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase">Lượt làm</p><p className="font-bold text-slate-700 dark:text-slate-300 text-sm">{quiz.total_attempts !== undefined ? quiz.total_attempts : '---'}</p></div>
            </div>
          </div>

          <div className="mb-6 p-6 bg-slate-50/50 dark:bg-slate-800/30 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[30px] transition-colors">
            <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2 text-center">Mô tả chi tiết</p>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed italic text-center">
              "{quiz.description || "Tác giả chưa để lại mô tả cho bộ đề này, nhưng chắc chắn nó rất thú vị!"}"
            </p>
          </div>

          <div className="flex gap-4">
            <button 
              onClick={() => navigate(`/play/${quiz.id}`)}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-black text-lg shadow-lg transition-all flex items-center justify-center gap-2"
            >
              LÀM BÀI NGAY <ChevronRight size={20}/>
            </button>
            <button 
              onClick={handleToggleFavorite}
              className={`p-4 rounded-2xl border-2 transition-all ${isFavorite ? 'bg-red-50 dark:bg-red-950/30 border-red-100 dark:border-red-900/50 text-red-500' : 'border-slate-100 dark:border-slate-800 text-slate-400 hover:border-red-100 dark:hover:border-red-900/50 hover:text-red-500'}`}
            >
              <Heart fill={isFavorite ? "currentColor" : "none"} size={28} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
              
export default QuizDetailModal;