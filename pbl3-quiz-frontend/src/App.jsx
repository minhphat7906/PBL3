import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import Dashboard from './Dashboard';
import Home from './Home'; // <-- 1. Import trang Home mới tạo
import CreateQuiz from './CreateQuiz';
import QuizArena from './QuizArena';

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
        
        {/* Dashboard vẫn được bảo mật */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
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
      </Routes>
    </Router>
  );
}

export default App;