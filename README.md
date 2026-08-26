# 🎓 QuizSmart (PBL3) - Hệ Thống Ôn Tập & Thi Trắc Nghiệm Thông Minh

![QuizSmart Banner](https://img.shields.io/badge/Version-2.0.0-blue.svg) ![Node.js](https://img.shields.io/badge/Backend-Node.js%20v20+-green.svg) ![React](https://img.shields.io/badge/Frontend-React%2019%20%7C%20Vite-61dafb.svg) ![Database](https://img.shields.io/badge/Database-MS%20SQL%20Server-red.svg) ![AI Engine](https://img.shields.io/badge/AI-Gemini%20%7C%20GLM--4.5%20%7C%20Groq-purple.svg)

---

## 📌 1. Giới Thiệu Tổng Quan
**QuizSmart** là hệ thống hỗ trợ học tập, ôn luyện và tạo đề thi trắc nghiệm trực tuyến thông minh được phát triển cho đồ án **PBL3**. Hệ thống kết hợp giữa nền tảng Web hiện đại, thuật toán xử lý dữ liệu tối ưu và công nghệ **Trí tuệ nhân tạo (AI Engine)** giúp tự động hóa quá trình sinh đề thi từ tài liệu (PDF, Word, TXT), hỗ trợ gia sư AI giải thích câu hỏi chuyên sâu, đồng thời mang đến trải nghiệm học tập Gamification sống động với chuỗi ngày Streak, bảng xếp hạng và giao diện tối/sáng năng động.

---

## 🚀 2. Điểm Nổi Bật & Cập Nhật Mới Nhất (Version 2.0 - Multi-AI Switchboard)

### 🤖 2.1. Nâng Cấp Hạ Tầng Multi-AI Engine (Adapter Pattern)
- **Kiến trúc Multi-Provider Switchboard**: Tích hợp song song 3 nhà cung cấp AI hàng đầu:
  - 🔵 **Google Gemini**: Các dòng mô hình `gemini-2.5-flash`, `gemini-flash-latest`, `gemini-2.5-pro` kết hợp cơ chế thử lại tự động (Fallback Models) khi quá tải quota.
  - 🟢 **Beeknoee Platform**: Mô hình `glm-4.5-flash` qua OpenAI SDK tương thích.
  - ⚡ **Groq Cloud LPU**: Mô hình `llama-3.3-70b-versatile` tối ưu tốc độ phản hồi vượt trội.
- **Cơ chế Stability Guard (Độ ổn định cao)**:
  - **Concurrency Locking**: Chống xung đột request AI khi có nhiều tác vụ chạy đồng thời.
  - **Auto-Retry & Exponential Backoff**: Tự động thử lại thông minh lên đến 5 lượt khi API AI bận.
  - **Windows EBUSY File Cleanup Guard**: Xử lý triệt để lỗi khóa file đệm nhị phân trên Windows khi bóc tách tài liệu.
- **Tối ưu hóa phản hồi & Cache AI**:
  - **JSON Sanitizer & Strict Temperature (0.3)**: Ép chuẩn cấu hình JSON, loại bỏ hoàn toàn lỗi vỡ định dạng dữ liệu (Unexpected Token).
  - **AI Tutor 2.0**: Trình trợ giảng AI giải thích câu hỏi chuẩn Markdown với phong cách giáo viên tận tâm.
  - **Smart Database Cache (`ai_explanation`)**: Lưu vết kết quả giải thích vào MS SQL Server, giúp giảm thời gian phản hồi từ 5s xuống **< 0.1s** và tiết kiệm 100% Token cho các lần hỏi sau.

### 📄 2.2. Sinh Đề Tự Động Từ Tài Liệu Đa Định Dạng
- Upload trực tiếp các tệp **PDF** (`pdf-parse`), **Word** (`mammoth`) hoặc **Text (.txt)**.
- AI tự động đọc nội dung, bóc tách thông tin và khởi tạo bộ câu hỏi gồm 4 lựa chọn, đáp án đúng và giải thích chi tiết trong vài giây.

### 🛡️ 2.3. Bảo Mật & Xác Thực Nâng Cao (Zero Trust Architecture)
- **Đăng ký / Xác thực OTP qua Gmail**: Mã OTP 6 chữ số có hiệu lực 5 phút gửi trực tiếp về Email người dùng via Nodemailer (`pending_users`).
- **Khôi phục & Đổi mật khẩu an toàn**: Quy trình mã hóa mật khẩu với `bcryptjs` (Salt 10 rounds), quản lý phiên đăng nhập JWT phi tập trung.
- **Zero Trust Server-Side Grading**:
  - Giao diện Preview đề thi được cắt lát bảo mật (lọc sạch `correct_option` và `explanation` trước khi gửi về Client).
  - Chấm điểm 100% tại Server với thuật toán so khớp đáp án chuẩn hóa (hỗ trợ cả Single Choice & Multiple Choice).

### 🏆 2.4. Trải Nghiệm Gamification & Bảng Xếp Hạng Chống Farming
- **Thuật toán Chuỗi Học Tập (Streak Algorithm)**: Tự động tính toán và duy trì số ngày học liên tục (`current_streak`, `last_active_date`).
- **Bảng Xếp Hạng Chống Cày Lặp (Anti-Farming Leaderboard)**:
  - Gom nhóm mốc kỷ lục điểm số lớn nhất `MAX(score)` và thời gian ngắn nhất `MIN(time)` trên từng bộ đề thi (`GROUP BY user_id, quiz_id`), buộc người dùng phải chinh phục nhiều bộ đề khác nhau để tăng thứ hạng.
  - Phân loại xếp hạng: Top Streak, Top Sáng tác, Top Điểm tích lũy, Top Năng nổ.
  - Bảng xếp hạng riêng từng đề thi sử dụng SQL CTE & `RANK()` window function.
- **Dashboard Cá Nhân 📊**:
  - Biểu đồ theo dõi hoạt động 7 ngày gần nhất (Recharts) với thuật toán tự động lấp đầy mảng ngày trống.
  - Thống kê tổng đề đã tạo, tổng lượt thi, điểm trung bình, danh sách đề yêu thích.

### 🎨 2.5. Giao Diện Modern UX/UI & Đa Chế Độ
- **Theme Switcher**: Chuyển đổi linh hoạt giữa **Dark Mode** và **Light Mode**.
- **Hiệu ứng sống động**: Tích hợp `framer-motion`, `react-countup`, `sweetalert2`, `canvas-confetti` (bắn pháo hoa khi hoàn thành bài thi).
- **Xuất PDF**: Hỗ trợ in và tải đề thi/kết quả dạng PDF chuyên nghiệp (`html2pdf.js`).
- **Tự động chọn Ảnh bìa (Cover Image Pool)**: Tự chọn ảnh Unsplash chất lượng cao khớp với danh mục bài thi.

### 👑 2.6. Trang Quản Trị Hệ Thống (Admin Dashboard)
- Quản lý người dùng: Xem danh sách, phân trang window function (`COUNT(*) OVER()`), cập nhật vai trò (Student ↔ Admin), khóa/xóa tài khoản.
- Kiểm duyệt đề thi: Ẩn/Hiện đề thi công khai, xóa đề thi vi phạm nội dung và gửi thông báo tự động tới tác giả.
- Quản lý Yêu cầu hỗ trợ (Support Tickets): Tiếp nhận và cập nhật trạng thái xử lý khiếu nại.

---

## 🛠️ 3. Công Nghệ Sử Dụng (Tech Stack)

### 💻 Frontend
- **Core**: React 19, Vite 8, React Router DOM v7
- **Styling**: Tailwind CSS v4, Vanilla CSS Design System, Lucide React icons
- **State & UI Motion**: Framer Motion, Recharts, SweetAlert2, Canvas Confetti, React CountUp, Axios
- **Document Export**: HTML2PDF.js

### ⚙️ Backend
- **Core Engine**: Node.js, Express.js v5
- **Database**: Microsoft SQL Server (MS SQL) via `mssql` driver v12
- **Security & Mail**: JWT (`jsonwebtoken`), Bcryptjs, Nodemailer (SMTP Gmail)
- **File & Document Process**: Multer, PDF-Parse, Mammoth (.docx parser)
- **AI SDKs**: `@google/generative-ai`, `openai` SDK (Beeknoee compatibility), `groq-sdk`

---

## 📂 4. Cấu Trúc Dự Án (Project Structure)

```text
PBL3/
├── pbl3-quiz-backend/          # Nguồn Backend Node.js / Express API
│   ├── controllers/            # Điều khiển xử lý logic request/response
│   ├── database/               # File khởi tạo và kết nối MS SQL Server
│   ├── middleware/             # Middleware xác thực JWT, phân quyền Admin, Upload file
│   ├── repositories/           # Tầng truy vấn dữ liệu SQL (Repository Pattern)
│   ├── routes/                 # Định nghĩa hệ thống API endpoints
│   ├── services/               # Logic nghiệp vụ AI (Gemini/Beeknoee/Groq), Mail OTP...
│   ├── uploads/                # Thư mục chứa file đệm tạm thời
│   ├── .env.example            # Cấu hình mẫu biến môi trường
│   ├── server.js               # File khởi chạy server Express
│   └── package.json
│
├── pbl3-quiz-frontend/         # Nguồn Frontend React / Vite
│   ├── public/                 # Tài nguyên tĩnh
│   ├── src/
│   │   ├── assets/             # Hình ảnh, icons, styles
│   │   ├── components/         # Các UI component tái sử dụng (Header, ThemeSwitcher, Modals...)
│   │   ├── context/            # Management state (AuthContext, ThemeContext)
│   │   ├── pages/              # Màn hình chính (Dashboard, Explore, QuizArena, Admin, Profile...)
│   │   ├── services/           # Module gọi API backend (Axios instance)
│   │   ├── App.jsx             # Route chính ứng dụng
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   ├── README.md               # Frontend README
│   └── package.json
│
├── Phân-tích-code.md           # Tài liệu phân tích chuyên sâu thuật toán & DB
├── trang review chức năng.md   # Nhật ký nâng cấp & tính năng hệ thống
└── README.md                   # Tài liệu hướng dẫn chung dự án (Root README)
```

---

## ⚡ 5. Hướng Dẫn Cài Đặt & Khởi Chạy (Installation & Usage)

### 📋 Yêu Cầu Tiền Đề (Prerequisites)
- **Node.js**: Phiên bản 18.x hoặc 20.x trở lên
- **Microsoft SQL Server**: Đã cài đặt và đang chạy dịch vụ (mặc định localhost)
- **npm** hoặc **yarn**

---

### 1️⃣ Cấu Hình Cơ Sở Dữ Liệu (Database Setup)
1. Mở **SQL Server Management Studio (SSMS)**.
2. Tạo cơ sở dữ liệu mới với tên `PBL3_Quiz` (hoặc tên tùy chọn).
3. Khởi tạo các bảng chính: `users`, `pending_users`, `password_resets`, `categories`, `quizzes`, `questions`, `results`, `favorites`, `reviews`, `reports`, `notifications`, `support_requests`.

---

### 2️⃣ Khởi Chạy Backend (`pbl3-quiz-backend`)

1. Di chuyển vào thư mục backend:
   ```bash
   cd pbl3-quiz-backend
   ```
2. Cài đặt các gói phụ thuộc:
   ```bash
   npm install
   ```
3. Tạo file `.env` từ tệp `.env.example` và điền các thông tin cấu hình:
   ```env
   PORT=5000
   
   # MS SQL Server Configuration
   DB_USER=sa
   DB_PASSWORD=your_password
   DB_SERVER=localhost
   DB_DATABASE=PBL3_Quiz
   DB_PORT=1433

   # Security & Mail
   JWT_SECRET=your_super_secret_jwt_key
   EMAIL_USER=your_gmail@gmail.com
   EMAIL_PASS=your_app_password

   # AI Provider Configuration ('gemini' | 'beeknoee' | 'groq')
   AI_PROVIDER=gemini
   GEMINI_API_KEY=your_gemini_api_key
   BEEKNOEE_API_KEY=your_beeknoee_api_key
   GROQ_API_KEY=your_groq_api_key
   ```
4. Khởi chạy Server:
   ```bash
   node server.js
   ```
   *Server sẽ chạy tại địa chỉ:* `http://localhost:5000`

---

### 3️⃣ Khởi Chạy Frontend (`pbl3-quiz-frontend`)

1. Di chuyển vào thư mục frontend:
   ```bash
   cd pbl3-quiz-frontend
   ```
2. Cài đặt các gói phụ thuộc:
   ```bash
   npm install
   ```
3. Khởi chạy môi trường phát triển (Dev server):
   ```bash
   npm run dev
   ```
4. Mở trình duyệt và truy cập: `http://localhost:5173`

---

## 📝 6. Hướng Dẫn Sử Dụng Chi Tiết

| Chức năng | Thao tác | Mô tả |
| :--- | :--- | :--- |
| **Đăng ký & Xác thực** | Nhập email → Lấy mã OTP trong mail → Xác nhận | Tài khoản sẽ được chuyển từ `pending_users` sang `users`. |
| **Tạo Đề Thi Tự Động (AI)** | Click `Tạo bằng AI` → Upload PDF/Word/TXT → Nhấn `Sinh đề` | AI sẽ tự động phân tích văn bản và khởi tạo danh sách câu hỏi. |
| **Làm Bài Thi (Arena)** | Chọn đề thi trong `Khám phá` → Click `Làm bài` | Giao diện đếm ngược đếm giây, chọn đáp án và nộp bài để tính điểm ngay. |
| **Giải Thích AI (AI Tutor)** | Vào màn hình kết quả → Click `AI Giải thích` | Hiển thị lời giải thích chi tiết, được tự động cache vào Database. |
| **Đổi Giao Diện** | Click icon 🌙 / ☀️ trên Header | Chuyển đổi Dark / Light mode toàn ứng dụng. |
| **Quản Trị (Admin)** | Truy cập `/admin` bằng tài khoản role `admin` | Phân quyền người dùng, quản lý đề thi công khai và ticket hỗ trợ. |

---

## 📄 7. Giấy Phép & Bản Quyền (License)
Dự án được phát triển phục vụ cho **Đồ án Đồ án Cơ sở Ngành (PBL3)**.
Bản quyền thuộc về Nhóm phát triển **QuizSmart Team**.
er).
 * **Phase 7: 🤖 Smart Retake (Luyện lại câu sai cá nhân hóa).
 * **🎯 TRẠNG THÁI DỰ ÁN: Hoàn thiện hạ tầng cốt lõi, đạt độ ổn định cao cấp, sẵn sàng cho Demo và vận hành thực tế.

Dự án thực hiện bởi: NGUYỄN MINH PHÁT - PBL3 Project.
