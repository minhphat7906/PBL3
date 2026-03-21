import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import Dashboard from './Dashboard';

function App() {
  return (
    <Router>
      <Routes>
        {/* Địa chỉ gốc '/' sẽ hiện trang Login */}
        <Route path="/" element={<Login />} />
        
        {/* Địa chỉ '/register' sẽ hiện trang Register */}
        <Route path="/register" element={<Register />} />
        
        {/* Địa chỉ '/dashboard' sẽ hiện trang Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;