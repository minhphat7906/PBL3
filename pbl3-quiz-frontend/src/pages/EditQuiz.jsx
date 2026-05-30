import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2, Edit3, ImageIcon, CheckSquare, Loader2 } from 'lucide-react';
import axios from 'axios';
import Swal from 'sweetalert2'; 

const EditQuiz = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Lấy ID đề thi từ URL (VD: /edit-quiz/5)
  
  const [isLoading, setIsLoading] = useState(true);
  const [quizInfo, setQuizInfo] = useState({ title: '', description: '', time_limit: 30, is_public: true });
  const [questions, setQuestions] = useState([]);

  // 1. TẢI DỮ LIỆU ĐỀ THI CŨ LÊN FORM
  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:3000/api/v1/quizzes/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.data.success) {
          const quizData = response.data.quiz;
          
          // Gắn thông tin chung
          setQuizInfo({
            title: quizData.title,
            description: quizData.description || '',
            time_limit: quizData.time_limit,
            is_public: quizData.is_public === 1 || quizData.is_public === true
          });

          // Gắn câu hỏi & Xử lý đáp án Multiple ('A,C' -> ['A', 'C'])
          const formattedQuestions = quizData.questions.map(q => ({
            ...q,
            question_type: q.question_type || 'single',
            correct_option: q.question_type === 'multiple' 
              ? (q.correct_option ? q.correct_option.split(',') : []) 
              : q.correct_option
          }));
          
          setQuestions(formattedQuestions);
          setIsLoading(false);
        }
      } catch (error) {
        Swal.fire({ icon: 'error', title: 'Lỗi', text: 'Không thể tải dữ liệu đề thi!' }).then(() => navigate('/dashboard'));
      }
    };
    fetchQuizData();
  }, [id, navigate]);

  // LOGIC ĐỔI LOẠI CÂU HỎI
  const handleTypeChange = (index, newType) => {
    const updated = [...questions];
    updated[index].question_type = newType;
    if (newType === 'true_false') {
      updated[index].option_a = 'Đúng'; updated[index].option_b = 'Sai';
      updated[index].option_c = ''; updated[index].option_d = '';
      updated[index].correct_option = 'A';
    } else if (newType === 'multiple') {
      updated[index].correct_option = ['A']; 
    } else {
      updated[index].correct_option = 'A';
    }
    setQuestions(updated);
  };

  const handleCheckboxChange = (index, optionValue, isChecked) => {
    const updated = [...questions];
    let currentAns = updated[index].correct_option;
    if (!Array.isArray(currentAns)) currentAns = [];

    if (isChecked) updated[index].correct_option = [...currentAns, optionValue];
    else updated[index].correct_option = currentAns.filter(val => val !== optionValue);
    setQuestions(updated);
  };

  const handleAddQuestion = () => {
    setQuestions([...questions, { question_type: 'single', question_text: '', image_url: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_option: 'A', explanation: '' }]);
  };

  const handleQuestionChange = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const handleRemoveQuestion = (index) => {
    if (questions.length > 1) {
      Swal.fire({ title: 'Xác nhận xóa?', text: "Câu hỏi này sẽ bị loại bỏ khỏi đề thi.", icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444', confirmButtonText: 'Xóa ngay', cancelButtonText: 'Giữ lại' })
      .then((res) => { if (res.isConfirmed) setQuestions(questions.filter((_, i) => i !== index)); });
    }
  };

  // 2. LƯU CẬP NHẬT (Sử dụng PUT thay vì POST)
  const handleSave = async () => {
    if (!quizInfo.title.trim()) return Swal.fire({ icon: 'error', title: 'Thiếu tên đề thi', text: 'Vui lòng nhập tên đề thi!' });

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question_text.trim()) return Swal.fire({ icon: 'error', title: 'Lỗi', text: `Câu ${i + 1} chưa có nội dung.` });
      if (q.question_type !== 'true_false' && (!q.option_a.trim() || !q.option_b.trim() || !q.option_c.trim() || !q.option_d.trim())) return Swal.fire({ icon: 'error', title: 'Thiếu đáp án', text: `Câu ${i + 1} thiếu đáp án.` });
      if (q.question_type === 'multiple' && (!Array.isArray(q.correct_option) || q.correct_option.length === 0)) return Swal.fire({ icon: 'error', title: 'Lỗi', text: `Câu ${i + 1} chưa chọn đáp án đúng.` });
    }
    
    const payloadQuestions = questions.map(q => ({
      ...q, correct_option: Array.isArray(q.correct_option) ? q.correct_option.sort().join(',') : q.correct_option
    }));

    const payload = { 
      title: quizInfo.title, description: quizInfo.description, time_limit: quizInfo.time_limit, is_public: quizInfo.is_public ? 1 : 0, category_id: 1, 
      questions: payloadQuestions 
    };

    Swal.fire({ title: 'Đang lưu cập nhật...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

    try {
      const token = localStorage.getItem('token');
      // CHÚ Ý: GỌI PUT VÀ TRUYỀN ID
      const response = await axios.put(`http://localhost:3000/api/v1/quizzes/${id}`, payload, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.data.success) {
        Swal.fire({ title: 'Cập nhật thành công!', icon: 'success', timer: 1500, showConfirmButton: false }).then(() => navigate(-1));
      }
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Lỗi hệ thống', text: 'Không thể cập nhật đề thi.' });
    }
  };

  const handleGoBack = () => {
    Swal.fire({ title: 'Xác nhận thoát?', text: "Các thay đổi sẽ không được lưu.", icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444', confirmButtonText: 'Thoát', cancelButtonText: 'Ở lại' })
    .then((res) => { if (res.isConfirmed) navigate(-1); });
  };

  if (isLoading) return <div className="min-h-screen bg-[#f8f9fc] dark:bg-slate-950 flex flex-col items-center justify-center text-amber-500 transition-colors duration-300"><Loader2 className="animate-spin mb-4" size={48} /><h2 className="text-xl font-bold dark:text-slate-300 italic">Đang tải đề thi...</h2></div>;

  return (
    <div className="min-h-screen bg-[#f8f9fc] dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 p-8 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button onClick={handleGoBack} className="p-2.5 bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-slate-655 dark:text-slate-300">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-black text-[#1e1b4b] dark:text-white flex items-center gap-2">
                <Edit3 className="inline text-amber-500 mr-2 animate-bounce" size={24} /> Chỉnh Sửa Đề Thi
              </h1>
            </div>
          </div>
          <button onClick={handleSave} className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-6 py-2.5 rounded-full font-bold shadow-md hover:shadow-lg hover:scale-[1.02] transition-all">
            <Save size={20} /> Lưu Cập Nhật
          </button>
        </div>

        {/* Thông tin chung */}
        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 mb-8 transition-colors">
          <input 
            type="text" 
            placeholder="Tên đề thi..." 
            className="w-full text-2xl font-bold border-b-2 border-slate-100 dark:border-slate-700 pb-3 mb-6 outline-none focus:border-amber-500 dark:focus:border-amber-400 bg-transparent text-[#1e1b4b] dark:text-white placeholder-slate-400" 
            value={quizInfo.title} 
            onChange={e => setQuizInfo({...quizInfo, title: e.target.value})} 
          />
          <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex-1">
                <label className="block text-xs font-black text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-widest">Mô tả</label>
                <input 
                  type="text" 
                  className="w-full p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 dark:text-slate-100 transition-all font-medium" 
                  value={quizInfo.description} 
                  onChange={e => setQuizInfo({...quizInfo, description: e.target.value})} 
                />
              </div>
              <div className="w-full sm:w-48">
                <label className="block text-xs font-black text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-widest">Thời gian (Phút)</label>
                <input 
                  type="number" 
                  className="w-full p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-bold text-amber-600 dark:text-amber-400 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all" 
                  value={quizInfo.time_limit} 
                  onChange={e => setQuizInfo({...quizInfo, time_limit: parseInt(e.target.value) || 30})} 
                />
              </div>
            </div>
            <label className="flex items-center gap-3 font-bold text-amber-900 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/20 p-4 rounded-2xl border border-amber-100 dark:border-amber-900/30 cursor-pointer select-none">
              <input type="checkbox" className="w-5 h-5 accent-amber-500 cursor-pointer" checked={quizInfo.is_public} onChange={(e) => setQuizInfo({...quizInfo, is_public: e.target.checked})} /> 
              Công khai đề thi <span className="font-normal text-amber-700/75 dark:text-amber-400/80 ml-1 text-sm">(Mọi người đều có thể tham gia)</span>
            </label>
          </div>
        </div>

        {/* Danh sách câu hỏi */}
        <div className="space-y-6 mb-10">
          {questions.map((q, index) => (
            <div key={index} className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-750 relative group transition-colors">
              <div className="absolute -left-4 top-8 bg-[#1e1b4b] dark:bg-amber-600 text-white w-9 h-9 flex items-center justify-center rounded-full font-bold border-2 border-[#f8f9fc] dark:border-slate-900 shadow-md">
                {index + 1}
              </div>
              <button 
                onClick={() => handleRemoveQuestion(index)} 
                className="absolute top-8 right-8 text-slate-300 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity bg-red-50 dark:bg-red-900/20 p-2 rounded-full"
                title="Xóa câu hỏi"
              >
                <Trash2 size={18} />
              </button>

              <div className="mb-6 pt-2">
                <label className="font-bold text-slate-700 dark:text-slate-300 text-sm mr-3">Dạng câu hỏi:</label>
                <select 
                  className="p-2.5 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-bold text-amber-600 dark:text-amber-450 bg-amber-50/50 dark:bg-amber-950/20 cursor-pointer" 
                  value={q.question_type || 'single'} 
                  onChange={(e) => handleTypeChange(index, e.target.value)}
                >
                  <option value="single">Một đáp án</option>
                  <option value="multiple">Nhiều đáp án</option>
                  <option value="true_false">Đúng / Sai</option>
                </select>
              </div>

              <textarea 
                placeholder="Nội dung câu hỏi..." 
                className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 mb-4 h-24 font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 resize-none" 
                value={q.question_text} 
                onChange={e => handleQuestionChange(index, 'question_text', e.target.value)} 
              />
              
              <div className="flex items-center gap-3 mb-6 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2 focus-within:ring-2 focus-within:ring-amber-500/20 focus-within:border-amber-500">
                <ImageIcon className="text-slate-400 ml-2" size={20} />
                <input 
                  type="text" 
                  placeholder="Link hình ảnh minh họa..." 
                  className="flex-1 p-2 bg-transparent outline-none text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400" 
                  value={q.image_url || ''} 
                  onChange={e => handleQuestionChange(index, 'image_url', e.target.value)} 
                />
              </div>
              
              {q.image_url && (
                <div className="mb-6 rounded-xl overflow-hidden flex justify-center p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700">
                  <img src={q.image_url} alt="Xem trước" className="max-h-48 rounded-lg shadow-sm" onError={(e) => e.target.style.display = 'none'} />
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {['A', 'B', 'C', 'D'].map(opt => {
                  if (q.question_type === 'true_false' && (opt === 'C' || opt === 'D')) return null;
                  const isCorrect = Array.isArray(q.correct_option) ? q.correct_option.includes(opt) : q.correct_option === opt;
                  return (
                    <div key={opt} className="flex items-center gap-3">
                      <div className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold ${isCorrect ? 'bg-amber-500 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>
                        {opt}
                      </div>
                      <input 
                        type="text" 
                        placeholder={`Đáp án ${opt}...`} 
                        className={`flex-1 p-3.5 bg-white dark:bg-slate-900 border rounded-xl outline-none text-slate-900 dark:text-slate-100 placeholder-slate-400 transition-colors ${isCorrect ? 'border-amber-500 dark:border-amber-400 bg-amber-50/10 dark:bg-amber-900/20' : 'border-slate-200 dark:border-slate-700 focus:border-amber-500'}`} 
                        value={q[`option_${opt.toLowerCase()}`] || ''} 
                        onChange={e => handleQuestionChange(index, `option_${opt.toLowerCase()}`, e.target.value)} 
                        disabled={q.question_type === 'true_false'} 
                      />
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-col md:flex-row gap-6 pt-6 border-t border-slate-100 dark:border-slate-700">
                <div className="md:w-1/2">
                  <label className="block text-sm font-bold text-[#1e1b4b] dark:text-amber-300 mb-3 uppercase flex items-center gap-2">
                    <CheckSquare size={16} className="text-amber-500"/> Chọn đáp án đúng
                  </label>
                  <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700 h-[54px] flex items-center">
                    {q.question_type === 'multiple' ? (
                      <div className="flex gap-4 px-2">
                        {['A', 'B', 'C', 'D'].map(opt => (
                          <label key={opt} className="flex items-center gap-2 cursor-pointer font-bold text-slate-700 dark:text-slate-300 hover:text-amber-550 transition-colors">
                            <input type="checkbox" className="w-4 h-4 accent-amber-500" checked={Array.isArray(q.correct_option) && q.correct_option.includes(opt)} onChange={(e) => handleCheckboxChange(index, opt, e.target.checked)} />
                            {opt}
                          </label>
                        ))}
                      </div>
                    ) : (
                      <select className="w-full bg-transparent outline-none font-bold text-amber-600 dark:text-amber-400 cursor-pointer" value={q.correct_option} onChange={e => handleQuestionChange(index, 'correct_option', e.target.value)}>
                        <option value="A">Câu A đúng</option>
                        <option value="B">Câu B đúng</option>
                        {q.question_type !== 'true_false' && <option value="C">Câu C đúng</option>}
                        {q.question_type !== 'true_false' && <option value="D">Câu D đúng</option>}
                      </select>
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-black text-slate-400 mb-2 uppercase">Giải thích</label>
                  <input 
                    type="text" 
                    placeholder="Tại sao đáp án này đúng?" 
                    className="w-full p-3.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-xl outline-none focus:border-amber-500 dark:focus:border-amber-400 transition-all placeholder-slate-400" 
                    value={q.explanation || ''} 
                    onChange={e => handleQuestionChange(index, 'explanation', e.target.value)} 
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <button 
          onClick={handleAddQuestion} 
          className="w-full py-5 border-2 border-dashed border-amber-400 dark:border-amber-500/40 text-amber-650 dark:text-amber-400 font-black rounded-3xl hover:bg-amber-500 hover:text-white dark:hover:bg-amber-600 transition-all flex items-center justify-center gap-2 bg-white dark:bg-slate-800 shadow-sm"
        >
          <Plus size={24} /> THÊM CÂU HỎI MỚI
        </button>
      </div>
    </div>
  );
};

export default EditQuiz;