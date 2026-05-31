import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import GNB from './components/GNB';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import { apiClient } from './api/client';

function App() {
  const [username, setUsername] = useState('official_user');

  useEffect(() => {
    const fetchUser = async () => {
      const name = await apiClient.getConnectedAccount();
      if (name) {
        setUsername(name);
      }
    };
    fetchUser();
  }, []);

  return (
    <Router>
      <div className="flex min-h-screen flex-col bg-brand-light text-brand-dark">
        {/* 공통 헤더 네비게이션 */}
        <GNB username={username} />
        
        {/* 페이지별 라우팅 */}
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/history" element={<History />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
