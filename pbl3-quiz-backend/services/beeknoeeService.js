const OpenAI = require("openai");

// Cấu hình Client Beeknoee (Dùng chuẩn OpenAI)
const client = new OpenAI({
    apiKey: process.env.BEEKNOEE_API_KEY,
    baseURL: "https://platform.beeknoee.com/api/v1"
});

const MODEL = "glm-4.5-flash";

let isProcessing = false;

/**
 * Tạo đề thi bằng Beeknoee (GLM-4.5-flash)
 */
exports.generateQuizAI = async (topic, questionCount, difficulty, documentText = "") => {
    if (isProcessing) {
        throw new Error("Hệ thống AI đang xử lý một yêu cầu khác. Vui lòng đợi trong giây lát.");
    }

    try {
        isProcessing = true;

        let contextInstruction = `Hãy tạo chính xác ${questionCount} câu hỏi trắc nghiệm về chủ đề: "${topic}".`;
        
        if (documentText && documentText.trim() !== "") {
            contextInstruction = `
            Dưới đây là tài liệu tham khảo:
            "${documentText}"
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
                    temperature: 0.3, // Giảm temperature để AI trả về kết quả chính xác hơn, ít sáng tạo linh tinh
                    stream: false,
                }, { timeout: 120000 }); 
                
                break; 
            } catch (err) {
                if (err.status === 429 && i < MAX_RETRIES - 1) {
                    console.warn(`[Beeknoee] Server bận, đang kiên trì đợi 10 giây để thử lại... (Lần ${i + 1})`);
                    await new Promise(resolve => setTimeout(resolve, 10000));
                    continue;
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
        isProcessing = false;
    }
};

/**
 * Giải thích câu hỏi bằng Beeknoee (Có cơ chế Lock & Retry)
 */
exports.explainQuestion = async (questionData) => {
    if (isProcessing) {
        // Nếu AI đang bận (ví dụ đang tạo đề), ta đợi một chút rồi thử lại thay vì báo lỗi luôn
        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    try {
        isProcessing = true;
        const prompt = `
        Hãy đóng vai là một giáo viên tận tâm. Giải thích câu hỏi sau một cách chi tiết nhưng súc tích (khoảng 150 từ).
        
        Câu hỏi: ${questionData.question_text}
        Đáp án đúng: ${questionData.correct_option}
        Giải thích hiện có: ${questionData.explanation || 'Chưa có'}

        YÊU CẦU:
        1. Giải thích tại sao đáp án ${questionData.correct_option} là chính xác.
        2. Tại sao các phương án khác lại sai (nếu cần thiết).
        3. Định dạng bằng Markdown (Sử dụng Bold, List để dễ đọc).
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
        isProcessing = false;
    }
};
