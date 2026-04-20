const { GoogleGenerativeAI } = require("@google/generative-ai");

// Lấy key từ môi trường
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Nâng cấp: Thêm tham số documentText (chứa nội dung file)
exports.generateQuizAI = async (topic, questionCount, difficulty, documentText = "") => {
    try {
        // Model gemini-2.5-flash chạy cực mượt, Sếp cứ giữ nguyên
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        // Phân nhánh Prompt: Nếu có file đính kèm thì ép nó đọc file, nếu không thì tự do
        let contextInstruction = `Hãy tạo chính xác ${questionCount} câu hỏi trắc nghiệm về chủ đề: "${topic}".`;
        
        if (documentText && documentText.trim() !== "") {
            contextInstruction = `
            Dưới đây là tài liệu tham khảo (Knowledge Base). 
            YÊU CẦU TỐI THƯỢNG: BẠN PHẢI ĐỌC TÀI LIỆU NÀY VÀ TẠO RA ${questionCount} CÂU HỎI TRẮC NGHIỆM.
            TUYỆT ĐỐI BÁM SÁT nội dung trong tài liệu, KHÔNG được tự bịa ra thông tin hay sử dụng kiến thức bên ngoài.
            
            [BẮT ĐẦU TÀI LIỆU]
            ${documentText}
            [KẾT THÚC TÀI LIỆU]
            `;
        }

        // PROMPT THẦN THÁNH: Ép kiểu JSON và bọc giáp chống lỗi
        const prompt = `
        Bạn là một chuyên gia giáo dục tạo đề thi trắc nghiệm.
        Độ khó yêu cầu của câu hỏi: ${difficulty}.

        ${contextInstruction}

        QUY TẮC BẮT BUỘC VỀ ĐỊNH DẠNG:
        1. CHỈ trả về dữ liệu dưới định dạng Mảng JSON (JSON Array). Bắt đầu bằng [ và kết thúc bằng ].
        2. TUYỆT ĐỐI KHÔNG sử dụng markdown (không có \`\`\`json ở đầu và \`\`\` ở cuối).
        3. KHÔNG thêm bất kỳ văn bản chào hỏi hay giải thích nào bên ngoài chuỗi JSON.

        Cấu trúc một object trong mảng phải chính xác như sau:
        [
            {
                "question_type": "single",
                "question_text": "Nội dung câu hỏi ở đây?",
                "option_a": "Đáp án A",
                "option_b": "Đáp án B",
                "option_c": "Đáp án C",
                "option_d": "Đáp án D",
                "correct_option": "A", 
                "explanation": "Giải thích ngắn gọn tại sao đúng dựa theo tài liệu."
            }
        ]
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        // --- BỘ LỌC CHỐNG ĐẠN (Trị bọn AI hay lèm bèm) ---
        text = text.replace(/```json/g, "").replace(/```/g, "").trim();
        const startIndex = text.indexOf('[');
        const endIndex = text.lastIndexOf(']');
        
        if (startIndex !== -1 && endIndex !== -1) {
            text = text.substring(startIndex, endIndex + 1);
        } else {
            throw new Error("AI không nhả ra định dạng JSON chuẩn.");
        }

        // Chuyển chuỗi thành mảng Object
        const quizData = JSON.parse(text);
        return quizData;

    } catch (error) {
        console.error("=== LỖI TỪ GEMINI SERVICE ===");
        console.error(error);
        throw new Error("Không thể bóc tách tài liệu và tạo câu hỏi lúc này. Vui lòng thử lại.");
    }
};