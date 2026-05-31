import React from 'react';
import { NavLink } from 'react-router-dom';
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

const GNB = () => {
  return (
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
          <div className="hidden sm:flex items-center gap-2 border-l border-slate-200 pl-6">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-semibold text-slate-500">연동 계정</span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer">
              @official_user
            </span>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default GNB;
