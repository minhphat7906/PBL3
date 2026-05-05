const { GoogleGenerativeAI } = require("@google/generative-ai");

// Lấy key từ môi trường
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Danh sách các model từ mới đến cũ để fallback nếu model chính lỗi
const FALLBACK_MODELS = [
    "gemini-2.5-flash", 
    "gemini-2.0-flash", 
    "gemini-flash-latest"
];

// Hàm hỗ trợ delay (miliseconds)
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

exports.generateQuizAI = async (topic, questionCount, difficulty, documentText = "") => {
    let lastError = null;
    
    // Thử lần lượt các model trong danh sách fallback
    for (const modelName of FALLBACK_MODELS) {
        let attempts = 0;
        const maxRetries = 2; // Thử tối đa 3 lần cho mỗi model (gốc + 2 lần retry)

        while (attempts <= maxRetries) {
            try {
                if (attempts > 0) {
                    console.log(`[Gemini Service] Thử lại lần ${attempts} với model ${modelName}...`);
                    // Exponential backoff: 1s, 2s...
                    await sleep(attempts * 1000);
                }

                const model = genAI.getGenerativeModel({ model: modelName });

                // Phân nhánh Prompt
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

                // --- BỘ LỌC CHỐNG ĐẠN ---
                text = text.replace(/```json/g, "").replace(/```/g, "").trim();
                const startIndex = text.indexOf('[');
                const endIndex = text.lastIndexOf(']');
                
                if (startIndex !== -1 && endIndex !== -1) {
                    text = text.substring(startIndex, endIndex + 1);
                } else {
                    throw new Error("AI không nhả ra định dạng JSON chuẩn.");
                }

                const quizData = JSON.parse(text);
                console.log(`[Gemini Service] Thành công với model: ${modelName}`);
                return quizData;

            } catch (error) {
                lastError = error;
                const status = error.status || (error.response && error.response.status);
                
                console.error(`[Gemini Service] Lỗi khi dùng model ${modelName} (Attempt ${attempts + 1}):`, error.message);

                // Nếu lỗi là 503 (Service Unavailable) hoặc 429 (Rate Limit) hoặc 500 (Internal System Error), thì mới retry
                if (status === 503 || status === 429 || status === 500) {
                    attempts++;
                    continue; // Thử lại với model hiện tại
                } else {
                    // Lỗi khác (vd: prompt quá dài, lỗi API key) thì không retry model này nữa, chuyển model fallback hoặc báo lỗi luôn
                    break; 
                }
            }
        }
        console.log(`[Gemini Service] Model ${modelName} thất bại hoàn toàn. Thử model fallback tiếp theo...`);
    }

    // Nếu đã đi hết danh sách model mà vẫn lỗi
    console.error("=== LỖI TẤT CẢ MODEL GEMINI ===");
    console.error(lastError);
    throw new Error("Dịch vụ AI đang bận hoặc gặp lỗi tạm thời. Vui lòng thử lại sau giây lát.");
};