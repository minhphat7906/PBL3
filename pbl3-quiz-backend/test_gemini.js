require('dotenv').config();
const geminiService = require('./services/geminiService');

async function test() {
  try {
    const data = await geminiService.generateQuizAI("Lịch sử Việt Nam", 2, "Dễ");
    console.log(JSON.stringify(data, null, 2));
  } catch (e) {
    console.error("TEST FAILED:", e);
  }
}

test();
