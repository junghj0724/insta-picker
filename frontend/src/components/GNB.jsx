import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, History } from 'lucide-react';

// lucide-react 버전 호환성을 보장하기 위한 순수 SVG 인스타그램 아이콘 컴포넌트
const InstagramIcon = ({ size = 20, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    stroke="currentColor"
    strokeWidth="2.5"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const GNB = ({ username }) => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('username');
    window.location.href = '/login';
  };

  const isLoggedIn = !!localStorage.getItem('jwt_token');

  const handleProtectedLinkClick = (e) => {
    if (!isLoggedIn) {
      e.preventDefault();
      setShowLoginModal(true);
    }
  };

  const closeModalAndGoLogin = () => {
    setShowLoginModal(false);
    navigate('/login');
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          
          {/* Left Side: Logo & Instagram Brand Icon */}
          <NavLink 
            to="/" 
            className="flex items-center gap-2 group"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white shadow-sm transition-all duration-300 group-hover:scale-105">
              <InstagramIcon size={20} className="stroke-[2.5]" />
            </div>
            <span className="font-sans text-xl font-extrabold tracking-tight bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent transition-all duration-300 group-hover:opacity-90">
              InstaPicker
            </span>
          </NavLink>

          {/* Right Side: Navigation Links & User Profile */}
          <nav className="flex items-center gap-8">
            <ul className="flex items-center gap-1">
              <li>
                <NavLink
                  to="/"
                  onClick={handleProtectedLinkClick}
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? 'bg-brand-primary/10 text-brand-primary'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`
                  }
                >
                  <LayoutDashboard size={16} />
                  대시보드
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/history"
                  onClick={handleProtectedLinkClick}
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? 'bg-brand-primary/10 text-brand-primary'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`
                  }
                >
                  <History size={16} />
                  추첨이력
                </NavLink>
              </li>
            </ul>

            {/* User Account Info */}
            <div className="hidden sm:flex items-center gap-4 border-l border-slate-200 pl-6">
              {isLoggedIn ? (
                <>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-xs font-semibold text-slate-500">계정</span>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors">
                      @{username || localStorage.getItem('username')}
                    </span>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="text-sm font-semibold text-gray-500 hover:text-red-500 transition-colors"
                  >
                    로그아웃
                  </button>
                </>
              ) : (
                <NavLink 
                  to="/login"
                  className="text-sm font-bold text-brand-primary hover:text-brand-secondary transition-colors"
                >
                  로그인
                </NavLink>
              )}
            </div>
          </nav>
        </div>
      </header>

      {/* Login Required Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl animate-fade-in-up">
            <h3 className="text-xl font-bold text-slate-800 mb-2">로그인이 필요합니다</h3>
            <p className="text-slate-600 mb-6 text-sm">해당 메뉴를 이용하시려면 먼저 로그인해 주세요.</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowLoginModal(false)}
                className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                닫기
              </button>
              <button
                onClick={closeModalAndGoLogin}
                className="px-4 py-2 text-sm font-bold text-white bg-brand-primary hover:bg-brand-secondary rounded-xl shadow-md transition-colors"
              >
                이동하기
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GNB;
