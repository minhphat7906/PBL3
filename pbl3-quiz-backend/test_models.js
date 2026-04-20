require('dotenv').config();
const axios = require('axios');

async function listModels() {
  try {
    const res = await axios.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
    console.log(res.data.models.map(m => m.name));
  } catch (e) {
    console.error(e.response ? e.response.data : e.message);
  }
}
listModels();
