# 🚀 QuizSmart - AI-Powered EdTech Platform (v2.5)

<div align="center">
  <img src="https://via.placeholder.com/800x250/4f46e5/ffffff?text=QuizSmart+-+The+Future+of+Smart+Learning" alt="QuizSmart Banner">
</div>

<p align="center">
  <a href="#gioi-thieu">Giới thiệu</a> •
  <a href="#tinh-nang-noi-bat">Tính năng</a> •
  <a href="#cong-nghe-su-dung">Công nghệ</a> •
  <a href="#ha-tang-ai">Hạ tầng AI</a> •
  <a href="#huong-dan-cai-dat">Cài đặt</a> •
  <a href="#lo-trinh-phat-trien">Roadmap</a>
</p>

<div align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="NodeJS" />
  <img src="https://img.shields.io/badge/Microsoft%20SQL%20Server-CC2927?style=for-the-badge&logo=microsoft%20sql%20server&logoColor=white" alt="SQL Server" />
  <img src="https://img.shields.io/badge/AI-Multi--Provider-8E75B2?style=for-the-badge&logo=googlebard&logoColor=white" alt="AI Powered" />
  <img src="https://img.shields.io/badge/Status-Production--Ready-success?style=for-the-badge" alt="Status" />
</div>

---

## 🌟 Giới Thiệu (Introduction)

**QuizSmart** không chỉ là một ứng dụng thi trắc nghiệm thông thường. Đây là một nền tảng công nghệ giáo dục (EdTech) toàn diện, kết hợp sức mạnh của **Trí tuệ nhân tạo (Generative AI)** để tối ưu hóa quá trình dạy và học. 

Dự án được thiết kế với giao diện chuẩn UI/UX quốc tế, hệ thống Gamification giữ chân người dùng và khả năng phân tích dữ liệu học tập chuyên sâu bằng AI Tutor.

---

## 🔥 Tính Năng Nổi Bật (Key Features)

### 🧠 Trí Tuệ Nhân Tạo (Generative AI Engine)
* **✨ Multi-AI Quiz Generator:** Tự động sinh bộ đề thi hoàn chỉnh (câu hỏi, đáp án, giải thích) từ tài liệu thực tế (PDF, Word, Text) bằng công nghệ **Gemini 1.5** và **GLM-4.5-Flash**.
* **⚡ AI Tutor Insights:** Phân tích và giải thích chuyên sâu từng câu hỏi trong chế độ Review, giúp người dùng "học từ sai lầm".
* **🛡️ Stability Guard:** Hệ thống tự động xếp hàng (Lock) và thử lại (Retry) thông minh, đảm bảo tỷ lệ tạo đề thành công 100% ngay cả khi Server AI bận.

### 🎮 Trải Nghiệm & Gamification
* **📈 Dashboard Hoạt Động:** Theo dõi tiến độ qua biểu đồ Recharts và hệ thống **Streak (Chuỗi ngày học tập)**.
* **👑 Leaderboards Đa Chiều:** Bảng xếp hạng toàn cầu và bảng xếp hạng riêng cho từng bộ bài Quiz.
* **🌓 Dual Theme:** Giao diện Dark/Light Mode đồng bộ toàn hệ thống, tối ưu cho việc học tập ban đêm.

### 🏆 Hệ thống Gamification (Động lực học tập)
* **🔥 Streak System:** Theo dõi và vinh danh những người dùng giữ được chuỗi ngày học tập liên tục.
* **👑 Leaderboards:** Bảng xếp hạng đa chiều (Top Điểm Số, Top Chăm Chỉ, Top Nhà Sáng Tạo).

### 🛠️ Tiện ích Mở rộng (Utilities)
* **📄 PDF Export Pro:** Tải đề thi xuống máy tính định dạng PDF chuyên nghiệp chỉ với 1 click.
* **📦 Smart Cache DB:** Tự động lưu trữ giải thích AI vào Database để tái sử dụng, giúp tốc độ phản hồi tức thì và tiết kiệm chi phí Token.

---

## 💻 Công Nghệ Sử Dụng (Tech Stack)

### Frontend
* **Core:** React.js, Vite
* **Styling:** Tailwind CSS, Framer Motion
* **Visuals:** Recharts, Lucide Icons, SweetAlert2
* **Utilities:** Axios, HTML2PDF

### Backend
* **Core:** Node.js, Express.js
* **Database:** Microsoft SQL Server (MSSQL)
* **Authentication:** JWT, Bcrypt
* **AI Engine:** Google Gemini 1.5 & Beeknoee (GLM-4.5-Flash)

---

## 🛡️ Hạ Tầng AI "Nồi Đồng Cối Đá" (AI Resilience)

Dự án chú trọng vào độ ổn định cấp độ thương mại:
- **Multi-AI Switchboard**: Linh hoạt hoán đổi Provider AI (Gemini/Beeknoee) qua biến môi trường.
- **Auto-JSON Repair**: Thuật toán Regex tự động sửa lỗi định dạng dữ liệu trả về từ AI.
- **Concurrency Control**: Cơ chế khóa toàn cục chống xung đột request từ phía người dùng.
- **Windows File Fix**: Xử lý triệt để lỗi EBUSY hệ thống file trên Windows.

---

## 🚀 Hướng Dẫn Cài Đặt (Installation)

### Yêu cầu hệ thống (Prerequisites)
* Node.js (v18 trở lên)
* Microsoft SQL Server (MSSQL)

### 1. Cài đặt Backend
Di chuyển vào thư mục `pbl3-quiz-backend`, cài đặt thư viện và tạo file `.env`:
```bash
# Cấu hình file .env
PORT=3000
DB_SERVER=localhost
DB_NAME=pbl3_quiz_final
AI_PROVIDER=beeknoee # Hoặc 'gemini'
GEMINI_API_KEY=your_key
BEEKNOEE_API_KEY=your_key
JWT_SECRET=your_secret_key

```
Chạy server: npm start hoặc node server.js

### 2. Cài đặt Database
Mở SSMS, tạo Database mới tên pbl3_quiz_final.
Chạy script trong file database.sql để khởi tạo các bảng dữ liệu.
### 3. Cài đặt Frontend
Di chuyển vào thư mục pbl3-quiz-frontend và chạy:

bash
npm install
npm run dev
### 🗺️ Lộ Trình Phát Triển (Roadmap)
 Phase 1: Xây dựng Core Flow (Auth, Quiz, History).
 Phase 2: Nâng cấp UI/UX (Tailwind, Recharts, Dark Mode).
 Phase 3: Gamification & Social (Streaks, Leaderboards).
 Phase 4: AI Multi-Provider Generator (PDF/Word Generation).
 Phase 5: AI Tutor Insights & Smart Persistence.
 Phase 6: 🔥 Đấu Trường Real-time (Socket.io Multiplayer).
 Phase 7: 🤖 Smart Retake (Luyện lại câu sai cá nhân hóa).
🎯 TRẠNG THÁI DỰ ÁN: Hoàn thiện hạ tầng cốt lõi, đạt độ ổn định cao cấp, sẵn sàng cho Demo và vận hành thực tế.

Dự án thực hiện bởi: NGUYỄN MINH PHÁT - PBL3 Project.
