import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, Save, Plus, Trash2, BookOpen, ImageIcon, CheckSquare, Search, ChevronDown, Check, Sparkles, Loader2 
} from 'lucide-react';
import axios from 'axios';
import Swal from 'sweetalert2'; 
import { UploadCloud, FileText } from 'lucide-react';

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
  const location = useLocation();
  
  // State lưu thông tin Đề thi
  const [quizInfo, setQuizInfo] = useState({ 
    title: '', 
    description: '', 
    time_limit: 30,
    is_public: true,
    difficulty: 'Trung bình',
    category: ''
  });

  // State chế độ tạo
  const [creationMode, setCreationMode] = useState(location.state?.defaultTab || 'manual');

  useEffect(() => {
    if (location.state?.defaultTab) {
      setCreationMode(location.state.defaultTab);
      // Xóa state trên history để refresh không bị dính lại tab AI nếu user đã chuyển về manual
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);
  
  // State AI
  const [aiPrompt, setAiPrompt] = useState("");
  const [useDoc, setUseDoc] = useState(false);
  const [aiQuestionCount, setAiQuestionCount] = useState(10);
  const [aiDifficulty, setAiDifficulty] = useState('Khó');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateAI = async () => {
    if (!aiPrompt.trim() && !useDoc) {
      Swal.fire({ icon: 'warning', title: 'Thiếu thông tin', text: 'Vui lòng nhập chủ đề hoặc đính kèm tài liệu!' });
      return;
    }

    setIsGenerating(true);
    try {
      const token = localStorage.getItem('token');
      const payload = {
        topic: aiPrompt,
        questionCount: aiQuestionCount,
        difficulty: aiDifficulty
      };

      const response = await axios.post('http://localhost:3000/api/v1/quizzes/generate-ai', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success && Array.isArray(response.data.data)) {
        // Đổ dữ liệu vào Trạm Kiểm Duyệt
        setQuestions(response.data.data);
        Swal.fire({ icon: 'success', title: 'Thành công', text: 'AI đã tạo xong, mời bạn kiểm duyệt!' });
        
        // Chuyển tab để Human-in-the-loop
        setCreationMode('manual');
      } else {
        throw new Error("Phản hồi không như mong đợi");
      }
    } catch (error) {
      console.error(error);
      Swal.fire({ icon: 'error', title: 'Lỗi', text: 'AI quá tải hoặc xảy ra sự cố, vui lòng thử lại!' });
    } finally {
      setIsGenerating(false);
    }
  };

  
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
    <div className="min-h-screen bg-[#f8f9fc] dark:bg-slate-900 font-sans text-slate-900 dark:text-slate-100 p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button onClick={handleGoBack} className="p-2.5 bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 mt-0 transition-colors text-slate-600 dark:text-slate-300">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-black text-[#1e1b4b] dark:text-white flex items-center gap-2">
                <BookOpen className="text-[#4f46e5]" size={24} /> Tạo Đề Thi Mới
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">Soạn thảo câu hỏi và đáp án chi tiết</p>
            </div>
          </div>
          <button onClick={handleSave} className="flex items-center gap-2 bg-[#4f46e5] hover:bg-[#4338ca] text-white px-6 py-2.5 rounded-full font-bold transition-all shadow-md">
            <Save size={20} /> Lưu Đề Thi
          </button>
        </div>

        {/* Thông tin chung */}
        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 mb-8">
          <input 
            type="text" 
            placeholder="Tên đề thi (VD: Bài kiểm tra 15p Toán học)" 
            className="w-full text-2xl font-bold text-[#1e1b4b] dark:text-white border-b-2 border-slate-100 dark:border-slate-700 pb-3 mb-6 outline-none focus:border-[#4f46e5] dark:focus:border-indigo-400 transition-colors bg-transparent placeholder-slate-400"
            value={quizInfo.title}
            onChange={e => setQuizInfo({...quizInfo, title: e.target.value})}
          />
          <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row gap-6">
                <div className="flex-1">
                  <label className="block text-xs font-black text-slate-400 mb-2 uppercase tracking-widest">Mô tả đề thi</label>
                  <textarea 
                    placeholder="Nhập mô tả cho đề thi của bạn..." 
                    className="w-full p-3.5 bg-[#f8f9fc] dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-[#4f46e5]/20 dark:focus:ring-indigo-500/30 focus:border-[#4f46e5] transition-all resize-none h-32 text-slate-900 dark:text-slate-100" 
                    value={quizInfo.description} 
                    onChange={e => setQuizInfo({...quizInfo, description: e.target.value})} 
                  />
                </div>
                <div className="w-full sm:w-56 flex flex-col gap-6">
                  <div>
                    <label className="block text-xs font-black text-slate-400 mb-2 uppercase tracking-widest">Thời gian (Phút)</label>
                    <input type="number" className="w-full p-3 bg-[#f8f9fc] dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-[#4f46e5]/20 dark:focus:ring-indigo-500/30 transition-all font-bold text-[#4f46e5] dark:text-indigo-400" value={quizInfo.time_limit} onChange={e => setQuizInfo({...quizInfo, time_limit: parseInt(e.target.value) || 30})} />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 mb-2 uppercase tracking-widest">Độ khó</label>
                    <select className="w-full p-3 bg-[#f8f9fc] dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-[#4f46e5]/20 dark:focus:ring-indigo-500/30 transition-all font-bold text-[#4f46e5] dark:text-indigo-400 cursor-pointer" value={quizInfo.difficulty} onChange={e => setQuizInfo({...quizInfo, difficulty: e.target.value})}>
                      <option value="Dễ">Dễ</option>
                      <option value="Trung bình">Trung bình</option>
                      <option value="Khó">Khó</option>
                    </select>
                  </div>
                  <div className="relative">
                    <label className="block text-xs font-black text-slate-400 mb-2 uppercase tracking-widest">Chủ đề</label>
                    <div 
                      className="w-full p-3 bg-[#f8f9fc] dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus-within:ring-2 focus-within:ring-[#4f46e5]/20 dark:focus-within:ring-indigo-500/30 transition-all font-bold text-[#4f46e5] dark:text-indigo-400 cursor-pointer flex items-center justify-between"
                      onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                    >
                      <span className={quizInfo.category ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 font-medium'}>
                        {quizInfo.category || "Chọn chủ đề..."}
                      </span>
                      <ChevronDown size={18} className={`transition-transform duration-300 ${isCategoryOpen ? 'rotate-180' : ''}`} />
                    </div>

                    {isCategoryOpen && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl z-50 overflow-hidden">
                        <div className="p-3 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2 bg-slate-50 dark:bg-slate-900">
                          <Search size={14} className="text-slate-400" />
                          <input 
                            type="text" 
                            autoFocus
                            placeholder="Tìm hoặc gõ mới..." 
                            className="bg-transparent outline-none text-sm w-full font-medium dark:text-slate-100 placeholder-slate-400"
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

            <div className="flex items-center gap-3 p-4 bg-indigo-50/50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-500/30 transition-all">
                <input 
                    type="checkbox" 
                    id="isPublic"
                    className="w-5 h-5 accent-[#4f46e5] cursor-pointer"
                    checked={quizInfo.is_public}
                    onChange={(e) => setQuizInfo({...quizInfo, is_public: e.target.checked})}
                />
                <label htmlFor="isPublic" className="font-bold text-indigo-900 dark:text-indigo-200 cursor-pointer select-none">
                    Công khai đề thi <span className="font-normal text-indigo-700/70 dark:text-indigo-400/80 ml-1 text-sm">(Mọi người đều có thể tham gia)</span>
                </label>
            </div>
          </div>
        </div>

        {/* Tabs chuyển đổi chế độ tạo đề */}
        <div className="flex justify-center mb-8">
          <div className="bg-slate-200/50 dark:bg-slate-800 p-1.5 rounded-full flex gap-1 shadow-inner">
            <button
              onClick={() => setCreationMode('manual')}
              className={`px-6 py-3 rounded-full font-bold text-sm transition-all duration-300 ${
                creationMode === 'manual'
                  ? 'bg-white dark:bg-indigo-600 text-indigo-700 dark:text-white shadow-md'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              ✍️ Tạo thủ công
            </button>
            <button
              onClick={() => setCreationMode('ai')}
              className={`px-6 py-3 rounded-full font-bold text-sm transition-all duration-300 flex items-center gap-2 ${
                creationMode === 'ai'
                  ? 'bg-white dark:bg-[#1e1b4b] text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500 shadow-md border border-indigo-100 dark:border-indigo-500/30'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              ✨ Tạo tự động bằng AI
            </button>
          </div>
        </div>

        {creationMode === 'ai' && (
          <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 mb-10 animate-in fade-in zoom-in-95 duration-300">
            <h2 className="text-xl font-bold dark:text-white text-slate-800 mb-2 flex items-center gap-2">
              <Sparkles className="text-purple-500" /> Trợ lý AI tạo đề
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
              Nhập chủ đề khoa học, bài văn, hoặc tải lên tài liệu học tập. AI sẽ tự động phân tích và sinh ra bài trắc nghiệm chất lượng.
            </p>

            <div className="space-y-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  <BookOpen size={16} className="text-slate-400" /> Chủ đề chi tiết (hoặc đoạn văn bản)
                </label>
                <textarea
                  rows={5}
                  disabled={isGenerating}
                  placeholder="VD: Lịch sử thế chiến 2 - Diễn biến chính... Hoặc copy & paste đoạn văn bản vào đây"
                  className="w-full bg-[#f8f9fc] dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none shadow-sm"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                />
              </div>

              <div className="bg-[#f8f9fc] dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
                <div className="p-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2">
                    <FileText size={18} className="text-indigo-500" />
                    <span className="font-semibold text-slate-700 dark:text-slate-300 text-sm">Sử dụng tài liệu đính kèm</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={useDoc} onChange={() => setUseDoc(!useDoc)} disabled={isGenerating}/>
                    <div className="w-11 h-6 bg-slate-200 dark:bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                  </label>
                </div>

                {useDoc && (
                  <div className="p-6">
                    <div className="border-2 border-dashed border-indigo-200 dark:border-indigo-500/30 bg-indigo-50/50 dark:bg-indigo-900/10 hover:border-indigo-400 dark:hover:border-indigo-400/60 rounded-xl p-8 flex flex-col items-center justify-center text-center transition-colors cursor-pointer group">
                      <div className="bg-indigo-100 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 p-3 rounded-full mb-3 group-hover:scale-110 transition-transform duration-300">
                        <UploadCloud size={28} />
                      </div>
                      <p className="font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Kéo thả PDF, Word, hoặc file Text vào đây
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Hỗ trợ tối đa 3 file, dung lượng &lt; 5MB</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Số lượng câu hỏi</label>
                  <select 
                    value={aiQuestionCount}
                    onChange={(e) => setAiQuestionCount(Number(e.target.value))}
                    className="w-full bg-[#f8f9fc] dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-700 dark:text-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                    disabled={isGenerating}
                  >
                    {[5, 10, 15, 20, 30].map(num => <option key={num} value={num}># {num} câu hỏi</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Độ khó</label>
                  <select
                    value={aiDifficulty}
                    onChange={(e) => setAiDifficulty(e.target.value)}
                    className="w-full bg-[#f8f9fc] dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-700 dark:text-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                    disabled={isGenerating}
                  >
                    <option value="Dễ">Dễ</option>
                    <option value="Trung bình">Trung bình</option>
                    <option value="Khó">Khó</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleGenerateAI}
                disabled={isGenerating || (!aiPrompt.trim() && !useDoc)}
                className="w-full mt-2 py-4 rounded-xl font-black text-lg flex items-center justify-center gap-2 text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-purple-500/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <><Loader2 className="animate-spin" size={24} /> Đang phân tích dữ liệu...</>
                ) : (
                  <><Sparkles size={24} /> ✨ Khởi tạo bằng AI (Generate)</>
                )}
              </button>
            </div>
          </div>
        )}

        <div style={{ display: creationMode === 'manual' ? 'block' : 'none' }}>
        {/* Danh sách câu hỏi */}
        <div className="space-y-6 mb-10">
          {questions.map((q, index) => (
            <div key={index} className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 relative group animate-in zoom-in duration-300">
              <div className="absolute -left-4 top-8 bg-[#1e1b4b] dark:bg-indigo-600 text-white w-9 h-9 flex items-center justify-center rounded-full font-bold shadow-md border-2 border-[#f8f9fc] dark:border-slate-900">
                {index + 1}
              </div>
              <button onClick={() => handleRemoveQuestion(index)} className="absolute top-8 right-8 text-slate-300 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity bg-red-50 dark:bg-red-900/20 p-2 rounded-full">
                <Trash2 size={18} />
              </button>

              <div className="mb-6 pt-2">
                <label className="font-bold text-slate-700 dark:text-slate-300 text-sm mr-3">Dạng câu hỏi:</label>
                <select 
                  className="p-2.5 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-bold text-[#4f46e5] dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/20 cursor-pointer"
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
                className="w-full p-4 bg-[#f8f9fc] dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-[#4f46e5]/20 dark:focus:ring-indigo-500/30 focus:border-[#4f46e5] dark:focus:border-indigo-500 mb-4 resize-none h-28 font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400"
                value={q.question_text}
                onChange={e => handleQuestionChange(index, 'question_text', e.target.value)}
              />

              <div className="flex items-center gap-3 mb-6 bg-[#f8f9fc] dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2">
                <ImageIcon className="text-slate-400 ml-2" size={20} />
                <input type="text" placeholder="URL hình ảnh..." className="flex-1 p-2 bg-transparent outline-none text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400" value={q.image_url} onChange={e => handleQuestionChange(index, 'image_url', e.target.value)} />
              </div>

              {q.image_url && (
                <div className="mb-6 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-900/50">
                  <img src={q.image_url} alt="Preview" className="max-h-48 object-contain rounded-lg shadow-sm" onError={(e) => e.target.style.display = 'none'} />
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {['A', 'B', 'C', 'D'].map(opt => {
                  if (q.question_type === 'true_false' && (opt === 'C' || opt === 'D')) return null;
                  const isCorrect = Array.isArray(q.correct_option) ? q.correct_option.includes(opt) : q.correct_option === opt;
                  return (
                    <div key={opt} className="flex items-center gap-3">
                      <div className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold ${isCorrect ? 'bg-[#4f46e5] text-white shadow-md' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>
                        {opt}
                      </div>
                      <input 
                        type="text" 
                        placeholder={`Đáp án ${opt}...`} 
                        className={`flex-1 p-3.5 bg-white dark:bg-slate-900 border rounded-xl outline-none text-slate-900 dark:text-slate-100 placeholder-slate-400 transition-colors ${isCorrect ? 'border-[#4f46e5] dark:border-indigo-500 bg-indigo-50/10 dark:bg-indigo-900/20' : 'border-slate-200 dark:border-slate-700'}`}
                        value={q[`option_${opt.toLowerCase()}`]}
                        onChange={e => handleQuestionChange(index, `option_${opt.toLowerCase()}`, e.target.value)}
                        disabled={q.question_type === 'true_false'}
                      />
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-col md:flex-row gap-6 pt-6 border-t border-slate-100 dark:border-slate-700">
                <div className="md:w-1/2">
                  <label className="block text-sm font-bold text-[#1e1b4b] dark:text-indigo-300 mb-3 uppercase flex items-center gap-2">
                    <CheckSquare size={16} className="text-[#4f46e5] dark:text-indigo-400"/> Đáp án đúng
                  </label>
                  <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center h-[54px]">
                    {q.question_type === 'multiple' ? (
                      <div className="flex gap-4 px-2">
                        {['A', 'B', 'C', 'D'].map(opt => (
                          <label key={opt} className="flex items-center gap-2 cursor-pointer font-bold text-slate-700 dark:text-slate-300">
                            <input type="checkbox" className="w-4 h-4 accent-[#4f46e5] dark:accent-indigo-500" checked={Array.isArray(q.correct_option) && q.correct_option.includes(opt)} onChange={(e) => handleCheckboxChange(index, opt, e.target.checked)} />
                            {opt}
                          </label>
                        ))}
                      </div>
                    ) : (
                      <select className="w-full bg-transparent outline-none font-bold text-[#4f46e5] dark:text-indigo-400 cursor-pointer" value={q.correct_option} onChange={e => handleQuestionChange(index, 'correct_option', e.target.value)}>
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
                  <input type="text" placeholder="Tại sao đúng?" className="w-full p-3.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 rounded-xl outline-none placeholder-slate-400" value={q.explanation} onChange={e => handleQuestionChange(index, 'explanation', e.target.value)} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <button 
          onClick={handleAddQuestion} 
          className="w-full py-5 border-2 border-dashed border-[#4f46e5]/40 dark:border-indigo-500/40 text-[#4f46e5] dark:text-indigo-400 font-black rounded-3xl hover:bg-[#4f46e5] dark:hover:bg-indigo-600 hover:border-[#4f46e5] dark:hover:border-indigo-600 hover:text-white transition-all flex items-center justify-center gap-2 bg-white dark:bg-slate-800"
        >
          <Plus size={24} /> THÊM CÂU HỎI MỚI
        </button>
        </div>
      </div>
    </div>
  );
};

export default CreateQuiz;