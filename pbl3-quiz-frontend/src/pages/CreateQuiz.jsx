import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Save, Plus, Trash2, BookOpen, ImageIcon, CheckSquare, Search, ChevronDown, Check 
} from 'lucide-react';
import axios from 'axios';
import Swal from 'sweetalert2'; 

// ─── Danh sách chủ đề mặc định (Seed) ────────────────────────────────
const DEFAULT_CATEGORIES = [
  { id: 'seed-1', name: 'Toán học' },
  { id: 'seed-2', name: 'Văn học' },
  { id: 'seed-3', name: 'Ngoại ngữ' },
  { id: 'seed-4', name: 'Công nghệ thông tin' },
  { id: 'seed-5', name: 'Lịch sử' },
  { id: 'seed-6', name: 'Vật lý' },
  { id: 'seed-7', name: 'Hóa học' },
  { id: 'seed-8', name: 'Sinh học' },
  { id: 'seed-9', name: 'Địa lý' },
  { id: 'seed-10', name: 'Giáo dục công dân' },
  { id: 'seed-11', name: 'Kinh tế' },
  { id: 'seed-12', name: 'Chung' },
];

const CreateQuiz = () => {
  const navigate = useNavigate();
  
  // State lưu thông tin Đề thi
  const [quizInfo, setQuizInfo] = useState({ 
    title: '', 
    description: '', 
    time_limit: 30,
    is_public: true,
    difficulty: 'Trung bình',
    category: ''
  });
  
  // State categories
  const [categories, setCategories] = useState([]);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [catSearch, setCatSearch] = useState("");

  // Logic: Fetch categories (merge seed + DB)
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:3000/api/v1/quizzes/categories', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success && res.data.categories.length > 0) {
          // Merge: Dùng DB đầu, rồi thêm seed nếu tỮn chưa có
          const dbNames = res.data.categories.map(c => c.name.toLowerCase());
          const seedExtra = DEFAULT_CATEGORIES.filter(s => !dbNames.includes(s.name.toLowerCase()));
          setCategories([...res.data.categories, ...seedExtra]);
        } else {
          // Nếu chưa có dữ liệu, dùng seed mặc định
          setCategories(DEFAULT_CATEGORIES);
        }
      } catch (err) {
        console.error(err);
        setCategories(DEFAULT_CATEGORIES); // Fallback to seed
      }
    };
    fetchCats();
  }, []);

  const filteredCategories = categories.filter(c =>
    c.name.toLowerCase().includes(catSearch.toLowerCase())
  );
  
  // State lưu danh sách Câu hỏi
  const [questions, setQuestions] = useState([
    { 
      question_type: 'single', 
      question_text: '', 
      image_url: '', 
      option_a: '', 
      option_b: '', 
      option_c: '', 
      option_d: '', 
      correct_option: 'A', 
      explanation: '' 
    }
  ]);

  const handleTypeChange = (index, newType) => {
    const updated = [...questions];
    updated[index].question_type = newType;
    if (newType === 'true_false') {
      updated[index].option_a = 'Đúng';
      updated[index].option_b = 'Sai';
      updated[index].option_c = '';
      updated[index].option_d = '';
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
    if (isChecked) {
      updated[index].correct_option = [...currentAns, optionValue];
    } else {
      updated[index].correct_option = currentAns.filter(val => val !== optionValue);
    }
    setQuestions(updated);
  };

  const handleAddQuestion = () => {
    setQuestions([...questions, { 
      question_type: 'single', 
      question_text: '', 
      image_url: '', 
      option_a: '', 
      option_b: '', 
      option_c: '', 
      option_d: '', 
      correct_option: 'A', 
      explanation: '' 
    }]);
  };

  const handleQuestionChange = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const handleRemoveQuestion = (index) => {
    if (questions.length > 1) {
      Swal.fire({
        title: 'Xác nhận xóa?',
        text: "Câu hỏi này sẽ bị loại bỏ khỏi danh sách soạn thảo.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#64748b',
        confirmButtonText: 'Xóa câu hỏi'
      }).then((result) => {
        if (result.isConfirmed) {
          setQuestions(questions.filter((_, i) => i !== index));
        }
      });
    }
  };

  const handleSave = async () => {
    if (!quizInfo.title.trim()) {
      Swal.fire({ icon: 'error', title: 'Thiếu thông tin', text: 'Bạn vui lòng nhập tên đề thi trước khi lưu.' });
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question_text.trim()) {
        Swal.fire({ icon: 'error', title: 'Câu hỏi trống', text: `Câu hỏi số ${i + 1} chưa có nội dung.` });
        return;
      }
      if (q.question_type !== 'true_false') {
        if (!q.option_a.trim() || !q.option_b.trim() || !q.option_c.trim() || !q.option_d.trim()) {
          Swal.fire({ icon: 'error', title: 'Thiếu đáp án', text: `Câu số ${i + 1} chưa điền đủ 4 đáp án.` });
          return;
        }
      }
      if (q.question_type === 'multiple' && (!Array.isArray(q.correct_option) || q.correct_option.length === 0)) {
        Swal.fire({ icon: 'error', title: 'Thiếu đáp án đúng', text: `Câu số ${i + 1} chưa tick chọn đáp án đúng nào.` });
        return;
      }
    }
    
    const payloadQuestions = questions.map(q => ({
      ...q,
      correct_option: Array.isArray(q.correct_option) ? q.correct_option.sort().join(',') : q.correct_option
    }));

    const payload = { 
      title: quizInfo.title, 
      description: quizInfo.description, 
      time_limit: quizInfo.time_limit,
      is_public: quizInfo.is_public ? 1 : 0,
      difficulty: quizInfo.difficulty,
      category: quizInfo.category, 
      questions: payloadQuestions 
    };

    Swal.fire({ title: 'Đang xử lý', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:3000/api/v1/quizzes', payload, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });

      if (response.data.success) {
        Swal.fire({ title: 'Thành công!', icon: 'success', timer: 2000, showConfirmButton: false }).then(() => {
          navigate('/dashboard'); 
        });
      }
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Lỗi hệ thống', text: 'Không thể lưu đề thi lúc này.' });
    }
  };

  const handleGoBack = () => {
    const isEdited = quizInfo.title.trim() !== "" || questions.some(q => q.question_text.trim() !== "");
    if (isEdited) {
      Swal.fire({
        title: 'Xác nhận thoát?',
        text: "Bạn đang soạn dở đề thi. Nếu thoát bây giờ, nội dung sẽ mất!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        confirmButtonText: 'Vẫn Thoát'
      }).then((res) => { if (res.isConfirmed) navigate('/dashboard'); });
    } else { navigate('/dashboard'); }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc] font-sans text-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button onClick={handleGoBack} className="p-2.5 bg-white rounded-full border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors text-slate-600">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-black text-[#1e1b4b] flex items-center gap-2">
                <BookOpen className="text-[#4f46e5]" size={24} /> Tạo Đề Thi Mới
              </h1>
              <p className="text-sm text-slate-500">Soạn thảo câu hỏi và đáp án chi tiết</p>
            </div>
          </div>
          <button onClick={handleSave} className="flex items-center gap-2 bg-[#4f46e5] hover:bg-[#4338ca] text-white px-6 py-2.5 rounded-full font-bold transition-all shadow-md">
            <Save size={20} /> Lưu Đề Thi
          </button>
        </div>

        {/* Thông tin chung */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 mb-8">
          <input 
            type="text" 
            placeholder="Tên đề thi (VD: Bài kiểm tra 15p Toán học)" 
            className="w-full text-2xl font-bold text-[#1e1b4b] border-b-2 border-slate-100 pb-3 mb-6 outline-none focus:border-[#4f46e5] transition-colors bg-transparent"
            value={quizInfo.title}
            onChange={e => setQuizInfo({...quizInfo, title: e.target.value})}
          />
          <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row gap-6">
                <div className="flex-1">
                  <label className="block text-xs font-black text-slate-400 mb-2 uppercase tracking-widest">Mô tả đề thi</label>
                  <textarea 
                    placeholder="Nhập mô tả cho đề thi của bạn..." 
                    className="w-full p-3.5 bg-[#f8f9fc] border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#4f46e5]/20 focus:border-[#4f46e5] transition-all resize-none h-32" 
                    value={quizInfo.description} 
                    onChange={e => setQuizInfo({...quizInfo, description: e.target.value})} 
                  />
                </div>
                <div className="w-full sm:w-56 flex flex-col gap-6">
                  <div>
                    <label className="block text-xs font-black text-slate-400 mb-2 uppercase tracking-widest">Thời gian (Phút)</label>
                    <input type="number" className="w-full p-3 bg-[#f8f9fc] border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#4f46e5]/20 focus:border-[#4f46e5] transition-all font-bold text-[#4f46e5]" value={quizInfo.time_limit} onChange={e => setQuizInfo({...quizInfo, time_limit: parseInt(e.target.value) || 30})} />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 mb-2 uppercase tracking-widest">Độ khó</label>
                    <select className="w-full p-3 bg-[#f8f9fc] border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#4f46e5]/20 focus:border-[#4f46e5] transition-all font-bold text-[#4f46e5] cursor-pointer" value={quizInfo.difficulty} onChange={e => setQuizInfo({...quizInfo, difficulty: e.target.value})}>
                      <option value="Dễ">Dễ</option>
                      <option value="Trung bình">Trung bình</option>
                      <option value="Khó">Khó</option>
                    </select>
                  </div>
                  <div className="relative">
                    <label className="block text-xs font-black text-slate-400 mb-2 uppercase tracking-widest">Chủ đề</label>
                    <div 
                      className="w-full p-3 bg-[#f8f9fc] border border-slate-200 rounded-xl outline-none focus-within:ring-2 focus-within:ring-[#4f46e5]/20 focus-within:border-[#4f46e5] transition-all font-bold text-[#4f46e5] cursor-pointer flex items-center justify-between"
                      onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                    >
                      <span className={quizInfo.category ? 'text-indigo-600' : 'text-slate-400 font-medium'}>
                        {quizInfo.category || "Chọn chủ đề..."}
                      </span>
                      <ChevronDown size={18} className={`transition-transform duration-300 ${isCategoryOpen ? 'rotate-180' : ''}`} />
                    </div>

                    {isCategoryOpen && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200 shadow-2xl z-50 overflow-hidden">
                        <div className="p-3 border-b border-slate-100 flex items-center gap-2 bg-slate-50">
                          <Search size={14} className="text-slate-400" />
                          <input 
                            type="text" 
                            autoFocus
                            placeholder="Tìm hoặc gõ mới..." 
                            className="bg-transparent outline-none text-sm w-full font-medium"
                            value={catSearch}
                            onChange={(e) => {
                              setCatSearch(e.target.value);
                              setQuizInfo({...quizInfo, category: e.target.value});
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                        <div className="max-h-60 overflow-y-auto">
                          {filteredCategories.map(cat => (
                            <div 
                              key={cat.id} 
                              className="px-4 py-3 hover:bg-indigo-50 cursor-pointer flex items-center justify-between transition-colors group"
                              onClick={(e) => {
                                e.stopPropagation();
                                setQuizInfo({...quizInfo, category: cat.name});
                                setIsCategoryOpen(false);
                              }}
                            >
                              <span className="text-sm font-bold text-slate-700 group-hover:text-indigo-600">{cat.name}</span>
                              {quizInfo.category === cat.name && <Check size={14} className="text-indigo-600" />}
                            </div>
                          ))}
                          {catSearch && !categories.some(c => c.name.toLowerCase() === catSearch.toLowerCase()) && (
                            <div 
                              className="px-4 py-3 hover:bg-emerald-50 cursor-pointer border-t border-slate-50 italic"
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsCategoryOpen(false);
                              }}
                            >
                              <span className="text-xs font-bold text-emerald-600">Thêm mới: "{catSearch}"</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 transition-all">
                <input 
                    type="checkbox" 
                    id="isPublic"
                    className="w-5 h-5 accent-[#4f46e5] cursor-pointer"
                    checked={quizInfo.is_public}
                    onChange={(e) => setQuizInfo({...quizInfo, is_public: e.target.checked})}
                />
                <label htmlFor="isPublic" className="font-bold text-indigo-900 cursor-pointer select-none">
                    Công khai đề thi <span className="font-normal text-indigo-700/70 ml-1 text-sm">(Mọi người đều có thể tham gia)</span>
                </label>
            </div>
          </div>
        </div>

        {/* Danh sách câu hỏi */}
        <div className="space-y-6 mb-10">
          {questions.map((q, index) => (
            <div key={index} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 relative group animate-in zoom-in duration-300">
              <div className="absolute -left-4 top-8 bg-[#1e1b4b] text-white w-9 h-9 flex items-center justify-center rounded-full font-bold shadow-md border-2 border-[#f8f9fc]">
                {index + 1}
              </div>
              <button onClick={() => handleRemoveQuestion(index)} className="absolute top-8 right-8 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity bg-red-50 p-2 rounded-full">
                <Trash2 size={18} />
              </button>

              <div className="mb-6 pt-2">
                <label className="font-bold text-slate-700 text-sm mr-3">Dạng câu hỏi:</label>
                <select 
                  className="p-2.5 border border-slate-200 rounded-xl outline-none font-bold text-[#4f46e5] bg-indigo-50/50 cursor-pointer"
                  value={q.question_type || 'single'} 
                  onChange={(e) => handleTypeChange(index, e.target.value)}
                >
                  <option value="single">Một đáp án</option>
                  <option value="multiple">Nhiều đáp án</option>
                  <option value="true_false">Đúng / Sai</option>
                </select>
              </div>

              <textarea 
                placeholder="Nhập nội dung câu hỏi..." 
                className="w-full p-4 bg-[#f8f9fc] border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-[#4f46e5]/20 focus:border-[#4f46e5] mb-4 resize-none h-28 font-medium"
                value={q.question_text}
                onChange={e => handleQuestionChange(index, 'question_text', e.target.value)}
              />

              <div className="flex items-center gap-3 mb-6 bg-[#f8f9fc] border border-slate-200 rounded-xl p-2">
                <ImageIcon className="text-slate-400 ml-2" size={20} />
                <input type="text" placeholder="URL hình ảnh..." className="flex-1 p-2 bg-transparent outline-none text-sm" value={q.image_url} onChange={e => handleQuestionChange(index, 'image_url', e.target.value)} />
              </div>

              {q.image_url && (
                <div className="mb-6 rounded-xl overflow-hidden border border-slate-200 p-4">
                  <img src={q.image_url} alt="Preview" className="max-h-48 object-contain rounded-lg shadow-sm" onError={(e) => e.target.style.display = 'none'} />
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {['A', 'B', 'C', 'D'].map(opt => {
                  if (q.question_type === 'true_false' && (opt === 'C' || opt === 'D')) return null;
                  const isCorrect = Array.isArray(q.correct_option) ? q.correct_option.includes(opt) : q.correct_option === opt;
                  return (
                    <div key={opt} className="flex items-center gap-3">
                      <div className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold ${isCorrect ? 'bg-[#4f46e5] text-white' : 'bg-slate-100 text-slate-500'}`}>
                        {opt}
                      </div>
                      <input 
                        type="text" 
                        placeholder={`Đáp án ${opt}...`} 
                        className={`flex-1 p-3.5 bg-white border rounded-xl outline-none ${isCorrect ? 'border-[#4f46e5] bg-indigo-50/10' : 'border-slate-200'}`}
                        value={q[`option_${opt.toLowerCase()}`]}
                        onChange={e => handleQuestionChange(index, `option_${opt.toLowerCase()}`, e.target.value)}
                        disabled={q.question_type === 'true_false'}
                      />
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-col md:flex-row gap-6 pt-6 border-t border-slate-100">
                <div className="md:w-1/2">
                  <label className="block text-sm font-bold text-[#1e1b4b] mb-3 uppercase flex items-center gap-2">
                    <CheckSquare size={16} className="text-[#4f46e5]"/> Đáp án đúng
                  </label>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center h-[54px]">
                    {q.question_type === 'multiple' ? (
                      <div className="flex gap-4 px-2">
                        {['A', 'B', 'C', 'D'].map(opt => (
                          <label key={opt} className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                            <input type="checkbox" className="w-4 h-4 accent-[#4f46e5]" checked={Array.isArray(q.correct_option) && q.correct_option.includes(opt)} onChange={(e) => handleCheckboxChange(index, opt, e.target.checked)} />
                            {opt}
                          </label>
                        ))}
                      </div>
                    ) : (
                      <select className="w-full bg-transparent outline-none font-bold text-[#4f46e5] cursor-pointer" value={q.correct_option} onChange={e => handleQuestionChange(index, 'correct_option', e.target.value)}>
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
                  <input type="text" placeholder="Tại sao đúng?" className="w-full p-3.5 border border-slate-200 rounded-xl outline-none" value={q.explanation} onChange={e => handleQuestionChange(index, 'explanation', e.target.value)} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <button 
          onClick={handleAddQuestion} 
          className="w-full py-5 border-2 border-dashed border-[#4f46e5]/40 text-[#4f46e5] font-black rounded-3xl hover:bg-[#4f46e5] hover:text-white transition-all flex items-center justify-center gap-2 bg-white"
        >
          <Plus size={24} /> THÊM CÂU HỎI MỚI
        </button>
      </div>
    </div>
  );
};

export default CreateQuiz;