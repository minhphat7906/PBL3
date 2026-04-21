import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from "./pages/login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import CreateQuiz from "./pages/CreateQuiz";
import EditQuiz from "./pages/EditQuiz";
import QuizArena from "./pages/QuizArena";

import ExplorePage from "./pages/ExplorePage";
import HistoryPage from "./pages/HistoryPage";
import ResultDetail from "./pages/ResultDetail";
import LeaderboardPage from "./pages/LeaderboardPage";
import Profile from "./pages/Profile";
import HelpPage from "./pages/HelpPage";
import AdminPage from "./pages/AdminPage";
import ReviewsPage from "./pages/ReviewsPage";
import ForgotPassword from "./pages/ForgotPassword";

// Hàm bảo vệ cho Dashboard (chỉ user đã login mới được vào)
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" />; // Nếu chưa có token, đá về trang /login
  }
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Địa chỉ gốc '/' giờ sẽ là trang Home (Landing Page) */}
        <Route path="/" element={<Home />} />
        
        {/* Trang Login dời sang địa chỉ '/login' */}
        <Route path="/login" element={<Login />} />
        
        {/* Trang Register dời sang địa chỉ '/register' */}
        <Route path="/register" element={<Register />} />
        
        {/* Trang Quên mật khẩu */}
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        {/* Dashboard vẫn được bảo mật */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>}
        />
        {/* Kho đề thi */}
        <Route 
          path="/explore" 
          element={
            <ProtectedRoute>
              <ExplorePage />
            </ProtectedRoute>
          } 
        />
        {/* Lịch sử thi */}
        <Route 
          path="/history" 
          element={
            <ProtectedRoute>
              <HistoryPage />
            </ProtectedRoute>
          } 
        />
        {/* Bảng xếp hạng */}
        <Route 
          path="/leaderboard" 
          element={
            <ProtectedRoute>
              <LeaderboardPage />
            </ProtectedRoute>
          } 
        />
        {/* Trang tạo đề thi */}
        <Route 
          path="/create-quiz" 
          element={
            <ProtectedRoute>
              <CreateQuiz />
            </ProtectedRoute>
          } 
        />  
        <Route 
  path="/play/:quizId" 
  element={
    <ProtectedRoute>
      <QuizArena />
    </ProtectedRoute>
  } 
/>
<Route path="/edit-quiz/:id" element={<EditQuiz />} />
        {/* Profile - of own */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        {/* Profile - of another user */}
        <Route
          path="/profile/:userId"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/result/:resultId" 
          element={
            <ProtectedRoute>
              <ResultDetail />
            </ProtectedRoute>
          } 
        />
        {/* Help & Support */}
        <Route
          path="/help"
          element={
            <ProtectedRoute>
              <HelpPage />
            </ProtectedRoute>
          }
        />
        {/* Admin Panel – self-guarded (checks role inside component) */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quiz/:quizId/reviews"
          element={
            <ProtectedRoute>
              <ReviewsPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;