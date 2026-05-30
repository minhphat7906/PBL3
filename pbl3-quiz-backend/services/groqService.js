const Groq = require("groq-sdk");

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

// Sử dụng model Llama 3 cực nhanh của Groq
const MODEL = "llama-3.3-70b-versatile"; 

// Lock để tránh spam hệ thống (nếu cần)
let isGenerating = false;
let isExplaining = false;

exports.generateQuizAI = async (topic, questionCount, difficulty, documentText = "") => {
    if (isGenerating) {
        throw new Error("Hệ thống AI đang tạo đề. Vui lòng đợi trong giây lát.");
    }

    try {
        isGenerating = true;

        let contextInstruction = `Hãy tạo chính xác ${questionCount} câu hỏi trắc nghiệm về chủ đề: "${topic}".`;
        
        if (documentText && documentText.trim() !== "") {
            // Groq LPU xử lý văn bản rất nhanh, có thể cho phép đọc nhiều hơn
            const truncatedText = documentText.length > 25000 
                ? documentText.substring(0, 25000) + "... [Dữ liệu đã được cắt bớt]" 
                : documentText;

            contextInstruction = `
            Dưới đây là tài liệu tham khảo:
            "${truncatedText}"
            YÊU CẦU: Tạo ra ${questionCount} câu hỏi trắc nghiệm BÁM SÁT tài liệu này.
            `;
        }

        const prompt = `
        Bạn là chuyên gia giáo dục. Độ khó: ${difficulty}.
        ${contextInstruction}
        
        QUY TẮC BẮT BUỘC:
        1. CHỈ trả về một JSON Array duy nhất chứa các object câu hỏi.
        2. Mọi giá trị chuỗi (text) PHẢI nằm trong dấu ngoặc kép đôi "". 
        3. KHÔNG được có văn bản giải thích ngoài khối JSON.
        4. Cấu trúc:
        [
            {
                "question_type": "single",
                "question_text": "Nội dung câu hỏi?",
                "option_a": "Đáp án A",
                "option_b": "Đáp án B",
                "option_c": "Đáp án C",
                "option_d": "Đáp án D",
                "correct_option": "A",
                "explanation": "Giải thích tại sao A đúng"
            }
        ]
        `;
        
        console.log(`[Groq] Đang gửi yêu cầu tới model ${MODEL}...`);
        const response = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: MODEL,
            temperature: 0.3,
            max_tokens: 3000,
        });

        let text = response.choices[0]?.message?.content || "";
        
        try {
            // Tìm kiếm khối JSON bắt đầu bằng [ và kết thúc bằng ] để loại bỏ văn bản thừa
            const jsonMatch = text.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                text = jsonMatch[0];
            }
            
            const result = JSON.parse(text);
            console.log(`[Groq Service] Thành công tạo ${result.length} câu hỏi.`);
            return result;
        } catch (parseError) {
            console.error("[Groq] Lỗi phân tách JSON. Nội dung thô từ AI:", text);
            throw new Error("AI trả về định dạng dữ liệu không hợp lệ. Vui lòng thử lại.");
        }
    } catch (error) {
        console.error("[Groq Service] Error:", error.message);
        throw new Error("Không thể kết nối với dịch vụ Groq. " + error.message);
    } finally {
        isGenerating = false;
    }
};

exports.explainQuestion = async (questionData) => {
    if (isExplaining) {
        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    try {
        isExplaining = true;
        const prompt = `
        Hãy đóng vai là một giáo viên tận tâm. Giải thích câu hỏi sau một cách chi tiết nhưng súc tích (khoảng 150 từ).
        
        Câu hỏi: ${questionData.question_text}
        Đáp án đúng: ${questionData.correct_option}
        Giải thích hiện có: ${questionData.explanation || 'Chưa có'}

        YÊU CẦU:
        1. Giải thích tại sao đáp án ${questionData.correct_option} là chính xác.
        2. Tại sao các phương án khác lại sai (nếu cần thiết).
        3. CHỈ trả về văn bản thuần túy (Plain text). KHÔNG sử dụng ký hiệu Markdown ngoài ngắt dòng.
        4. Ngôn ngữ: Tiếng Việt.
        `;

        const response = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: MODEL,
            temperature: 0.5,
        });

        return response.choices[0]?.message?.content || "Không có giải thích.";
    } catch (error) {
        console.error("[Groq Explain] Error:", error.message);
        throw new Error("AI Tutor đang bận, vui lòng thử lại sau.");
    } finally {
        isExplaining = false;
    }
};
