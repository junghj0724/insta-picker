import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import GNB from './components/GNB';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import Login from './pages/Login';
import Signup from './pages/Signup';

// 보호된 라우트 컴포넌트
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('jwt_token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  const [username, setUsername] = useState('');

  useEffect(() => {
    // JWT에서 사용자 이름 읽기
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  return (
    <Router>
      <div className="flex min-h-screen flex-col bg-brand-light text-brand-dark">
        {/* 공통 헤더 네비게이션 */}
        <GNB username={username} />
        
        {/* 페이지별 라우팅 */}
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/history" 
            element={
              <ProtectedRoute>
                <History />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
