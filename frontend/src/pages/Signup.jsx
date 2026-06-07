import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, User } from 'lucide-react';
import { apiClient } from '../api/client';
import './Auth.css'; // 공통 스타일 임포트

function Signup() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    setLoading(true);
    try {
      await apiClient.signup(username, password);
      alert('회원가입이 완료되었습니다. 로그인해 주세요.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data || '회원가입에 실패했습니다. (이미 존재하는 아이디일 수 있습니다)');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-body">
          <div className="auth-header">
            <h1 className="auth-title">회원가입</h1>
            <p className="auth-subtitle">새로운 계정을 생성하세요</p>
          </div>

          <form onSubmit={handleSignup} className="auth-form">
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
                  placeholder="사용할 아이디"
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
                  placeholder="비밀번호"
                  required
                />
              </div>
            </div>

            <div className="auth-form-group">
              <label className="auth-label">비밀번호 확인</label>
              <div className="auth-input-wrapper">
                <div className="auth-input-icon-box">
                  <Lock className="auth-input-icon" />
                </div>
                <input
                  type="password"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  className="auth-input"
                  placeholder="비밀번호 다시 입력"
                  required
                />
              </div>
            </div>

            {error && <p className="auth-error-msg">{error}</p>}

            <button type="submit" disabled={loading} className="auth-submit-btn">
              {loading ? '가입 중...' : '가입하기'}
            </button>
          </form>
        </div>
        <div className="auth-footer">
          <p className="auth-footer-text">
            이미 계정이 있으신가요?{' '}
            <Link to="/login" className="auth-link">
              로그인
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;
