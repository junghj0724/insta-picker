import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, User } from 'lucide-react';
import { apiClient } from '../api/client';
import './Auth.css'; // 공통 스타일 임포트

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const token = await apiClient.login(username, password);
      // 토큰과 정보 저장
      localStorage.setItem('jwt_token', token);
      
      // JWT 디코딩 (간단한 파싱)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        localStorage.setItem('user_role', payload.role);
        localStorage.setItem('username', payload.username);
      } catch (e) {
        console.error('토큰 디코딩 실패', e);
      }
      
      navigate('/');
      // 리로드하여 GNB 및 상태 업데이트 반영
      window.location.reload();
    } catch (err) {
      setError('아이디 또는 비밀번호가 올바르지 않습니다.');
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-body">
          <div className="auth-header">
            <h1 className="auth-title">환영합니다</h1>
            <p className="auth-subtitle">인스타 피커에 로그인하세요</p>
          </div>

          <form onSubmit={handleLogin} className="auth-form">
            <div className="auth-form-group">
              <label className="auth-label">아이디</label>
              <div className="auth-input-wrapper">
                <div className="auth-input-icon-box">
                  <User className="auth-input-icon" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="auth-input"
                  placeholder="아이디를 입력하세요"
                  required
                />
              </div>
            </div>

            <div className="auth-form-group">
              <label className="auth-label">비밀번호</label>
              <div className="auth-input-wrapper">
                <div className="auth-input-icon-box">
                  <Lock className="auth-input-icon" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="auth-input"
                  placeholder="비밀번호를 입력하세요"
                  required
                />
              </div>
            </div>

            {error && <p className="auth-error-msg">{error}</p>}

            <button type="submit" className="auth-submit-btn">
              로그인
            </button>
          </form>
        </div>
        <div className="auth-footer">
          <p className="auth-footer-text">
            계정이 없으신가요?{' '}
            <Link to="/signup" className="auth-link">
              회원가입
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
