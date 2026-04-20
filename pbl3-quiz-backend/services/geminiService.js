const { GoogleGenerativeAI } = require("@google/generative-ai");

// Lấy key từ môi trường
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.generateQuizAI = async (topic, questionCount, difficulty) => {
    try {
        // Sử dụng model gemini-2.5-flash (Nhanh và tối ưu cho text)
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        // PROMPT THẦN THÁNH: Ép kiểu JSON
        const prompt = `
        Bạn là một chuyên gia giáo dục tạo đề thi trắc nghiệm.
        Hãy tạo chính xác ${questionCount} câu hỏi trắc nghiệm về chủ đề: "${topic}".
        Độ khó yêu cầu: ${difficulty}.

        QUY TẮC BẮT BUỘC:
        1. CHỈ trả về dữ liệu dưới định dạng Mảng JSON (JSON Array).
        2. TUYỆT ĐỐI KHÔNG sử dụng markdown (không có \`\`\`json ở đầu và \`\`\` ở cuối).
        3. KHÔNG thêm bất kỳ văn bản chào hỏi hay giải thích nào bên ngoài chuỗi JSON.

        Cấu trúc một object trong mảng phải chính xác như sau:
        {
            "question_type": "single",
            "question_text": "Nội dung câu hỏi ở đây?",
            "option_a": "Đáp án A",
            "option_b": "Đáp án B",
            "option_c": "Đáp án C",
            "option_d": "Đáp án D",
            "correct_option": "A", // Chỉ nhận 1 ký tự A, B, C hoặc D
            "explanation": "Giải thích ngắn gọn tại sao đúng."
        }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        // Xử lý dọn dẹp phòng trường hợp AI vẫn cố tình nhét markdown
        text = text.replace(/```json/g, "").replace(/```/g, "").trim();

        // Chuyển chuỗi thành mảng Object
        const quizData = JSON.parse(text);
        return quizData;

    } catch (error) {
        console.error("Lỗi từ Gemini Service:", error);
        throw new Error("Không thể tạo câu hỏi từ AI lúc này. Vui lòng thử lại.");
    }
};