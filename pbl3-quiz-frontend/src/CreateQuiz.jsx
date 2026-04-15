import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Save, Plus, Trash2, BookOpen, ImageIcon 
} from 'lucide-react';
import axios from 'axios';
import Swal from 'sweetalert2'; 

const CreateQuiz = () => {
  const navigate = useNavigate();
  
  // State lưu thông tin Đề thi (Đã thêm is_public: true mặc định)
  const [quizInfo, setQuizInfo] = useState({ 
    title: '', 
    description: '', 
    time_limit: 30,
    is_public: true 
  });
  
  // State lưu danh sách Câu hỏi
  const [questions, setQuestions] = useState([
    { question_text: '', image_url: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_option: 'A', explanation: '' }
  ]);

  // LOGIC: Thêm câu hỏi
  const handleAddQuestion = () => {
    const lastQ = questions[questions.length - 1];
    
    if (!lastQ.question_text.trim() || !lastQ.option_a.trim() || !lastQ.option_b.trim()) {
      Swal.fire({
        title: 'Thông báo',
        text: 'Bạn vui lòng hoàn thiện nội dung và ít nhất 2 đáp án (A, B) cho câu hiện tại nhé.',
        icon: 'warning',
        confirmButtonColor: '#4f46e5'
      });
      return;
    }

    setQuestions([...questions, { 
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
        confirmButtonText: 'Xóa câu hỏi',
        cancelButtonText: 'Giữ lại'
      }).then((result) => {
        if (result.isConfirmed) {
          setQuestions(questions.filter((_, i) => i !== index));
        }
      });
    }
  };

  const handleSave = async () => {
    if (!quizInfo.title.trim()) {
      Swal.fire('Thiếu thông tin', 'Bạn vui lòng nhập tên đề thi trước khi lưu.', 'error');
      return;
    }

    const lastQ = questions[questions.length - 1];
    if (!lastQ.question_text.trim()) {
      Swal.fire('Câu hỏi trống', 'Bạn hãy điền nội dung hoặc xóa câu hỏi cuối bị thừa nhé.', 'error');
      return;
    }

    // Gói dữ liệu (is_public gửi đi dưới dạng 0 hoặc 1 cho SQL)
    const payload = { 
      title: quizInfo.title, 
      description: quizInfo.description, 
      time_limit: quizInfo.time_limit,
      is_public: quizInfo.is_public ? 1 : 0,
      category_id: 1, 
      questions: questions 
    };

    Swal.fire({
      title: 'Đang xử lý',
      text: 'Đang lưu trữ đề thi vào hệ thống...',
      allowOutsideClick: false,
      didOpen: () => { Swal.showLoading() }
    });

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:3000/api/v1/quizzes', payload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        Swal.fire({
          title: 'Thành công!',
          text: 'Đề thi đã được tạo và lưu trữ thành công.',
          icon: 'success',
          confirmButtonColor: '#4f46e5'
        }).then(() => {
          navigate('/dashboard'); 
        });
      }
    } catch (error) {
      console.error("Lỗi khi lưu:", error);
      Swal.fire('Lỗi hệ thống', error.response?.data?.message || 'Không thể kết nối đến máy chủ.', 'error');
    }
  };

  const handleGoBack = () => {
    if (questions[0].question_text.trim() !== "" || quizInfo.title !== "") {
      Swal.fire({
        title: 'Xác nhận thoát?',
        text: "Các nội dung bạn đang soạn thảo sẽ không được lưu lại.",
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#4f46e5',
        cancelButtonColor: '#64748b',
        confirmButtonText: 'Rời khỏi đây',
        cancelButtonText: 'Tiếp tục soạn'
      }).then((res) => {
        if (res.isConfirmed) navigate('/dashboard');
      });
    } else {
      navigate('/dashboard');
    }
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
          <button onClick={handleSave} className="flex items-center gap-2 bg-[#4f46e5] hover:bg-[#4338ca] text-white px-6 py-2.5 rounded-full font-bold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5">
            <Save size={20} /> Lưu Đề Thi
          </button>
        </div>

        {/* Thông tin chung */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 mb-8">
          <input 
            type="text" 
            placeholder="Tên đề thi (VD: Bài kiểm tra 15p Toán học)" 
            className="w-full text-2xl font-bold text-[#1e1b4b] placeholder-slate-300 border-b-2 border-slate-100 pb-3 mb-6 outline-none focus:border-[#4f46e5] transition-colors bg-transparent"
            value={quizInfo.title}
            onChange={e => setQuizInfo({...quizInfo, title: e.target.value})}
          />
          <div className="flex flex-col gap-6">
            <div className="flex gap-6">
                <div className="flex-1">
                <label className="block text-sm font-bold text-slate-600 mb-2 text-xs uppercase tracking-widest">Mô tả đề thi</label>
                <input type="text" placeholder="Nhập mô tả ngắn..." className="w-full p-3.5 bg-[#f8f9fc] border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#4f46e5]/20 focus:border-[#4f46e5] transition-all" value={quizInfo.description} onChange={e => setQuizInfo({...quizInfo, description: e.target.value})} />
                </div>
                <div className="w-48">
                <label className="block text-sm font-bold text-slate-600 mb-2 text-xs uppercase tracking-widest">Thời gian (Phút)</label>
                <input type="number" className="w-full p-3.5 bg-[#f8f9fc] border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#4f46e5]/20 focus:border-[#4f46e5] transition-all font-bold text-[#4f46e5]" value={quizInfo.time_limit} onChange={e => setQuizInfo({...quizInfo, time_limit: parseInt(e.target.value) || 30})} />
                </div>
            </div>

            {/* Toggle Công khai đề thi */}
            <div className="flex items-center gap-3 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 transition-all">
                <input 
                    type="checkbox" 
                    id="isPublic"
                    className="w-5 h-5 accent-[#4f46e5] cursor-pointer"
                    checked={quizInfo.is_public}
                    onChange={(e) => setQuizInfo({...quizInfo, is_public: e.target.checked})}
                />
                <label htmlFor="isPublic" className="font-bold text-indigo-900 cursor-pointer select-none">
                    Công khai đề thi <span className="font-normal text-indigo-700/70 ml-1 text-sm">(Mọi người đều có thể tìm thấy và tham gia thi)</span>
                </label>
            </div>
          </div>
        </div>

        {/* Danh sách câu hỏi */}
        <div className="space-y-6 mb-10">
          {questions.map((q, index) => (
            <div key={index} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 relative group animate-in zoom-in duration-300">
              {/* STT Câu hỏi */}
              <div className="absolute -left-4 top-8 bg-[#1e1b4b] text-white w-9 h-9 flex items-center justify-center rounded-full font-bold shadow-md border-2 border-[#f8f9fc]">
                {index + 1}
              </div>
              
              <button onClick={() => handleRemoveQuestion(index)} className="absolute top-8 right-8 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity bg-red-50 p-2 rounded-full" title="Xóa câu hỏi">
                <Trash2 size={18} />
              </button>

              {/* Nội dung câu hỏi */}
              <textarea 
                placeholder="Nhập nội dung câu hỏi..." 
                className="w-full p-4 bg-[#f8f9fc] border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-[#4f46e5]/20 focus:border-[#4f46e5] transition-all mb-4 resize-none h-28 font-medium text-slate-800"
                value={q.question_text}
                onChange={e => handleQuestionChange(index, 'question_text', e.target.value)}
              />

              {/* Ô nhập Link Hình Ảnh */}
              <div className="flex items-center gap-3 mb-6 bg-[#f8f9fc] border border-slate-200 rounded-xl p-2 focus-within:ring-2 focus-within:ring-[#4f46e5]/20 focus-within:border-[#4f46e5] transition-all">
                <ImageIcon className="text-slate-400 ml-2" size={20} />
                <input 
                  type="text" 
                  placeholder="Dán link hình ảnh minh họa (Google Image URL)..." 
                  className="flex-1 p-2 bg-transparent outline-none text-sm text-slate-700"
                  value={q.image_url}
                  onChange={e => handleQuestionChange(index, 'image_url', e.target.value)}
                />
              </div>

              {/* Hiển thị ảnh xem trước */}
              {q.image_url && (
                <div className="mb-6 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex justify-center p-4">
                  <img src={q.image_url} alt="Xem trước" className="max-h-48 object-contain rounded-lg shadow-sm" onError={(e) => e.target.style.display = 'none'} />
                </div>
              )}
              
              {/* Lưới đáp án */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {['A', 'B', 'C', 'D'].map(opt => (
                  <div key={opt} className="flex items-center gap-3">
                    <div className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold transition-colors ${q.correct_option === opt ? 'bg-[#4f46e5] text-white' : 'bg-slate-100 text-slate-500'}`}>
                      {opt}
                    </div>
                    <input 
                      type="text" 
                      placeholder={`Đáp án ${opt}...`} 
                      className="flex-1 p-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-[#4f46e5] transition-all"
                      value={q[`option_${opt.toLowerCase()}`]}
                      onChange={e => handleQuestionChange(index, `option_${opt.toLowerCase()}`, e.target.value)}
                    />
                  </div>
                ))}
              </div>

              {/* Giải thích & Chọn đáp án đúng */}
              <div className="flex flex-col md:flex-row gap-6 pt-6 border-t border-slate-100">
                <div className="md:w-1/3">
                  <label className="block text-sm font-bold text-slate-600 mb-2 text-xs uppercase">Đáp án đúng</label>
                  <select 
                    className="w-full p-3.5 border border-slate-200 rounded-xl outline-none focus:border-[#4f46e5] font-bold text-[#4f46e5] bg-[#f8f9fc] cursor-pointer"
                    value={q.correct_option}
                    onChange={e => handleQuestionChange(index, 'correct_option', e.target.value)}
                  >
                    <option value="A">Câu A đúng</option>
                    <option value="B">Câu B đúng</option>
                    <option value="C">Câu C đúng</option>
                    <option value="D">Câu D đúng</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-bold text-slate-600 mb-2 text-xs uppercase">Giải thích (Hiện sau khi nộp bài)</label>
                  <input 
                    type="text" 
                    placeholder="Tại sao đáp án này đúng?" 
                    className="w-full p-3.5 border border-slate-200 rounded-xl outline-none focus:border-[#10b981] bg-white transition-all"
                    value={q.explanation}
                    onChange={e => handleQuestionChange(index, 'explanation', e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Nút Thêm Câu Hỏi */}
        <button 
          onClick={handleAddQuestion} 
          className="w-full py-5 border-2 border-dashed border-[#4f46e5]/40 text-[#4f46e5] font-black rounded-3xl hover:bg-[#4f46e5] hover:text-white hover:border-[#4f46e5] transition-all flex items-center justify-center gap-2 bg-white shadow-sm hover:shadow-indigo-200"
        >
          <Plus size={24} /> THÊM CÂU HỎI MỚI
        </button>

      </div>
    </div>
  );
};

export default CreateQuiz;