const { GoogleGenerativeAI } = require("@google/generative-ai");

// Lấy key từ môi trường
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Danh sách các model từ nhanh, ổn định nhất (Ưu tiên gemini-1.5-flash cho gói Free)
const FALLBACK_MODELS = [
    "gemini-1.5-flash", 
    "gemini-2.0-flash", 
    "gemini-1.5-pro"
];

// Hàm hỗ trợ delay (miliseconds)
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

exports.generateQuizAI = async (topic, questionCount, difficulty, documentText = "") => {
    let lastError = null;
    
    // Thử lần lượt các model trong danh sách fallback
    for (const modelName of FALLBACK_MODELS) {
        let attempts = 0;
        const maxRetries = 1; // Giảm xuống 1 lần retry để tránh spam API free

        while (attempts <= maxRetries) {
            try {
                if (attempts > 0) {
                    console.log(`[Gemini Service] Thử lại lần ${attempts} với model ${modelName}...`);
                    await sleep(3000); // Tăng delay lên 3s để API kịp reset rate limit
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

                // Tăng timeout lên 60s vì đọc file dài tốn rất nhiều thời gian suy nghĩ
                const result = await Promise.race([
                    model.generateContent(prompt),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('AI Request Timeout')), 60000))
                ]);
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

                // Nếu lỗi 429 (Quá tải), ném lỗi luôn để không spam API
                if (status === 429) {
                    throw new Error("Bạn đã vượt quá giới hạn lượt dùng API miễn phí của Google. Vui lòng chờ 1-2 phút rồi thử lại.");
                }

                // Nếu lỗi là 503 (Service Unavailable) hoặc 500 (Internal System Error), thì mới retry
                if (status === 503 || status === 500) {
                    attempts++;
                    continue; 
                } else {
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

exports.explainQuestion = async (questionData) => {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Sử dụng model rẻ/nhanh nhất

    const prompt = `
    Bạn là một trợ giảng AI thông minh. Hãy giải thích câu hỏi sau đây một cách súc tích, dễ hiểu và khoa học.
    
    Câu hỏi: ${questionData.question_text}
    Các lựa chọn:
    A. ${questionData.option_a}
    B. ${questionData.option_b}
    C. ${questionData.option_c}
    D. ${questionData.option_d}
    Đáp án đúng: ${questionData.correct_option}

    Yêu cầu:
    1. Giải thích tại sao đáp án ${questionData.correct_option} là đúng.
    2. Nếu có thể, hãy chỉ ra lỗi sai phổ biến mà học sinh hay mắc phải ở câu này.
    3. Trình bày bằng tiếng Việt, định dạng Markdown (có thể dùng in đậm, danh sách).
    4. KHÔNG chào hỏi, hãy đi thẳng vào vấn đề. Giới hạn trong khoảng 100-150 từ.
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("[Gemini Explain] Error:", error.message);
        throw new Error("Không thể kết nối với trí tuệ nhân tạo lúc này.");
    }
};