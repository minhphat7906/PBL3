# 🚀 QuizSmart - AI-Powered EdTech Platform

<div align="center">
  <img src="https://via.placeholder.com/800x200/312e81/ffffff?text=QuizSmart+-+Nang+Tam+Kien+Thuc" alt="QuizSmart Banner">
</div>

<p align="center">
  <a href="#gioi-thieu">Giới thiệu</a> •
  <a href="#tinh-nang-noi-bat">Tính năng</a> •
  <a href="#cong-nghe-su-dung">Công nghệ</a> •
  <a href="#huong-dan-cai-dat">Cài đặt</a> •
  <a href="#lo-trinh-phat-trien">Roadmap</a>
</p>

<div align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="NodeJS" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Microsoft%20SQL%20Server-CC2927?style=for-the-badge&logo=microsoft%20sql%20server&logoColor=white" alt="SQL Server" />
  <img src="https://img.shields.io/badge/AI-Gemini_Powered-8E75B2?style=for-the-badge&logo=googlebard&logoColor=white" alt="AI Powered" />
</div>

---

## 🌟 Giới Thiệu (Introduction)

**QuizSmart** không chỉ là một ứng dụng thi trắc nghiệm thông thường. Đây là một nền tảng công nghệ giáo dục (EdTech) toàn diện, kết hợp sức mạnh của **Trí tuệ nhân tạo (AI)** để tối ưu hóa quá trình dạy và học. 

Dự án được thiết kế với giao diện chuẩn UI/UX quốc tế, hệ thống Gamification giữ chân người dùng và khả năng phân tích dữ liệu học tập chuyên sâu.

## 🔥 Tính Năng Nổi Bật (Key Features)

### 🧠 Trí tuệ nhân tạo (AI Integration)
* **✨ AI Quiz Generator:** Tự động tạo bộ đề thi hoàn chỉnh (câu hỏi, đáp án, giải thích) từ một từ khóa chủ đề hoặc một đoạn văn bản/tài liệu được cung cấp.

### 🎮 Trải nghiệm Người dùng (User Experience)
* **🎯 Giao diện Thi Chuẩn Quốc Tế:** Đồng hồ đếm ngược, tính năng 🚩 "Cắm cờ" (Flag for review) để đánh dấu câu hỏi khó.
* **📊 Phân tích Kết quả Chuyên sâu:** Chấm điểm tức thì, biểu đồ trực quan, và giải thích chi tiết cho từng câu đúng/sai.
* **🗂️ Lịch sử Thông minh (Grouped History):** Gom nhóm các lần làm bài theo từng đề thi, theo dõi sự tiến bộ qua biểu đồ Timeline.

### 🏆 Hệ thống Gamification (Động lực học tập)
* **🔥 Chuỗi Học Tập (Streak System):** Theo dõi và vinh danh những người dùng giữ được chuỗi ngày học tập liên tục.
* **👑 Đa vũ trụ Leaderboards:** Bảng xếp hạng đa chiều (Top Điểm Số, Top Chăm Chỉ, Top Nhà Sáng Tạo, và Bảng xếp hạng riêng cho từng bài Quiz).

### 🛠️ Tiện ích Mở rộng (Utilities)
* **📥 Xuất file PDF:** Tải đề thi xuống máy tính định dạng PDF chuyên nghiệp chỉ với 1 click.
* **🔗 Chia sẻ nhanh:** Sao chép liên kết đề thi để thách đấu bạn bè.
* **🎨 Dynamic Cover Images:** Hệ thống tự động gán ảnh bìa chất lượng cao dựa trên chủ đề bài thi.

---

## 💻 Công Nghệ Sử Dụng (Tech Stack)

### Frontend
* **Core:** React.js, Vite
* **Styling:** Tailwind CSS
* **Icons & UI:** Lucide React, SweetAlert2
* **Data Visualization:** Recharts
* **Utilities:** Axios, HTML2PDF

### Backend
* **Core:** Node.js, Express.js
* **Database:** Microsoft SQL Server (MSSQL)
* **Authentication:** JSON Web Tokens (JWT), Bcrypt
* **AI Engine:** Google Gemini API (hoặc OpenAI API)

---



## 🚀 Hướng Dẫn Cài Đặt (Installation)

Thực hiện các bước sau để chạy dự án trên máy tính cá nhân (Localhost):

### Yêu cầu hệ thống (Prerequisites)
* Node.js (v18 trở lên)
* Microsoft SQL Server & SQL Server Management Studio (SSMS)

### 1. Cài đặt Backend
```bash
# Di chuyển vào thư mục backend
cd pbl3-quiz-backend

# Cài đặt các thư viện
npm install

# Cấu hình biến môi trường
# Tạo file .env và điền các thông tin:
# DB_SERVER=localhost
# DB_USER=your_username
# DB_PASSWORD=your_password
# DB_NAME=pbl3_quiz_final
# JWT_SECRET=your_secret_key
# AI_API_KEY=your_gemini_or_openai_key

# Chạy server
npm start (hoặc node server.js)

2. Cài đặt Database
Mở SSMS, tạo một Database mới tên pbl3_quiz_final.

Mở file database.sql (nếu có) và chạy (Execute) toàn bộ script để tạo các bảng (users, quizzes, questions, results,...).

3. Cài đặt Frontend
Bash
# Di chuyển vào thư mục frontend
cd pbl3-quiz-frontend

# Cài đặt các thư viện
npm install

# Chạy ứng dụng
npm run dev
