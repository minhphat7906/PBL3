const OpenAI = require("openai");

// Cấu hình Client Beeknoee (Dùng chuẩn OpenAI)
const client = new OpenAI({
    apiKey: process.env.BEEKNOEE_API_KEY,
    baseURL: "https://platform.beeknoee.com/api/v1"
});

const MODEL = "glm-4.5-flash";

// ✅ Tách riêng 2 lock để tránh xung đột
let isGenerating = false;
let isExplaining = false;

/**
 * Tạo đề thi bằng Beeknoee (GLM-4.5-flash)
 */
exports.generateQuizAI = async (topic, questionCount, difficulty, documentText = "") => {
    if (isGenerating) {
        throw new Error("Hệ thống AI đang tạo đề. Vui lòng đợi trong giây lát.");
    }

    try {
        isGenerating = true;

        let contextInstruction = `Hãy tạo chính xác ${questionCount} câu hỏi trắc nghiệm về chủ đề: "${topic}".`;
        
        if (documentText && documentText.trim() !== "") {
            // TỐI ƯU TỐC ĐỘ: Cắt gọn xuống 5,000 ký tự (Đủ cho 10-15 câu mà AI đọc lướt cực nhanh)
            const truncatedText = documentText.length > 10000 
                ? documentText.substring(0, 10000) + "... [Dữ liệu đã được cắt bớt để tối ưu tốc độ]" 
                : documentText;

            contextInstruction = `
            Dưới đây là tài liệu tham khảo (đã được tối ưu độ dài):
            "${truncatedText}"
            YÊU CẦU: Tạo ra ${questionCount} câu hỏi trắc nghiệm BÁM SÁT tài liệu này.
            `;
        }

        const prompt = `
        Bạn là chuyên gia giáo dục. Độ khó: ${difficulty}.
        ${contextInstruction}
        
        QUY TẮC BẮT BUỘC:
        1. CHỈ trả về một JSON Array duy nhất.
        2. Mọi giá trị chuỗi (text) PHẢI nằm trong dấu ngoặc kép đôi "". 
        3. KHÔNG được có văn bản giải thích ngoài khối JSON.
        4. Cấu trúc:
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
        `;
        
        // Cơ chế Retry "Kiên trì" (Thử lại tối đa 5 lần)
        let response;
        const MAX_RETRIES = 5;
        for (let i = 0; i < MAX_RETRIES; i++) {
            try {
                console.log(`[Beeknoee] Đang gửi yêu cầu tới model ${MODEL}... (Lần thử ${i + 1}/${MAX_RETRIES})`);
                response = await client.chat.completions.create({
                    model: MODEL,
                    messages: [{ role: "user", content: prompt }],
                    temperature: 0.3,
                    stream: false,
                    max_tokens: 2500, // TỐI ƯU TỐC ĐỘ: Ép AI chốt kết quả sớm, không nói dài dòng
                }, { timeout: 180000 }); // Đợi tối đa 3 phút (180s) để tránh kẹt mạng và tạo request ảo (zombie request) trên server Beeknoee
                
                break; 
            } catch (err) {
                if (err.status === 429) {
                    if (i < MAX_RETRIES - 1) {
                        console.warn(`[Beeknoee] Server bận (hoặc đang xử lý request trước đó), đang đợi 15 giây để thử lại... (Lần ${i + 1})`);
                        await new Promise(resolve => setTimeout(resolve, 15000));
                        continue;
                    } else {
                        throw new Error("Tài khoản Beeknoee của bạn đang có một tiến trình tạo đề thi khác chưa hoàn tất, hoặc server quá tải. Vui lòng đợi 2-3 phút rồi thử lại.");
                    }
                }
                throw err;
            }
        }

        let text = response.choices[0].message.content;
        
        try {
            // Tìm kiếm khối JSON bắt đầu bằng [ và kết thúc bằng ] để loại bỏ văn bản thừa
            const jsonMatch = text.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                text = jsonMatch[0];
            }
            
            return JSON.parse(text);
        } catch (parseError) {
            console.error("[Beeknoee] Lỗi phân tách JSON. Nội dung thô từ AI:");
            console.log("------------------- START RAW -------------------");
            console.log(text);
            console.log("-------------------- END RAW --------------------");
            throw new Error("AI trả về định dạng dữ liệu không hợp lệ. Vui lòng thử lại.");
        }
    } catch (error) {
        console.error("[Beeknoee Service] Error:", error.message);
        throw error;
    } finally {
        isGenerating = false;
    }
};

/**
 * Giải thích câu hỏi bằng Beeknoee (Có cơ chế Lock & Retry)
 */
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
        3. CHỈ trả về văn bản thuần túy (Plain text). KHÔNG sử dụng bất kỳ ký hiệu Markdown nào như ** (in đậm), # (tiêu đề), hoặc - (danh sách). Chỉ dùng ngắt dòng bình thường.
        4. Ngôn ngữ: Tiếng Việt.
        `;

        let response;
        const MAX_RETRIES = 3;
        for (let i = 0; i < MAX_RETRIES; i++) {
            try {
                response = await client.chat.completions.create({
                    model: MODEL,
                    messages: [{ role: "user", content: prompt }],
                    temperature: 0.5,
                }, { timeout: 60000 });
                break;
            } catch (err) {
                if (err.status === 429 && i < MAX_RETRIES - 1) {
                    await new Promise(resolve => setTimeout(resolve, 5000));
                    continue;
                }
                throw err;
            }
        }

        return response.choices[0].message.content;
    } catch (error) {
        console.error("[Beeknoee Explain] Error:", error.message);
        throw error;
    } finally {
        isExplaining = false;
    }
};
