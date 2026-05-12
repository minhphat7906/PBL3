const geminiService = require('./geminiService');
const beeknoeeService = require('./beeknoeeService');

/**
 * AI Service Manager
 * Cho phép hoán đổi giữa các nhà cung cấp AI linh hoạt
 */
const AI_PROVIDER = process.env.AI_PROVIDER || 'gemini'; // 'gemini' hoặc 'beeknoee'

console.log(`[AI System] Đang sử dụng Provider: ${AI_PROVIDER.toUpperCase()}`);

exports.generateQuizAI = async (topic, questionCount, difficulty, documentText) => {
    if (AI_PROVIDER === 'beeknoee') {
        return await beeknoeeService.generateQuizAI(topic, questionCount, difficulty, documentText);
    }
    // Mặc định dùng Gemini
    return await geminiService.generateQuizAI(topic, questionCount, difficulty, documentText);
};

exports.explainQuestion = async (questionData) => {
    if (AI_PROVIDER === 'beeknoee') {
        return await beeknoeeService.explainQuestion(questionData);
    }
    // Mặc định dùng Gemini
    return await geminiService.explainQuestion(questionData);
};
