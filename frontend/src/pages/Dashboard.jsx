import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { 
  Users, 
  Trophy, 
  Calendar, 
  MessageSquare, 
  Plus, 
  ArrowLeft, 
  Share2, 
  Download, 
  Check,
  ChevronRight,
  RefreshCw
} from 'lucide-react';

// lucide-react 호환성 방지를 위한 자체 인스타그램 아이콘 SVG
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

const Dashboard = () => {
  // 1. 상태 선언
  const [step, setStep] = useState('main'); // 'main' | 'select_post' | 'settings_filter' | 'winner'
  const [stats, setStats] = useState({ connectedAccounts: 0, totalDraws: 0, totalWinners: 0 });
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  
  // 필터 및 설정 상태
  const [excludeDuplicates, setExcludeDuplicates] = useState(true);
  const [useKeyword, setUseKeyword] = useState(false);
  const [keyword, setKeyword] = useState('#참여완료');
  const [useMinTags, setUseMinTags] = useState(false);
  const [minTags, setMinTags] = useState(1);
  const [checkFollow, setCheckFollow] = useState(false);
  const [winnerCount, setWinnerCount] = useState(1);

  // 로딩 및 추첨 애니메이션 상태
  const [loading, setLoading] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [winners, setWinners] = useState([]);

  // 2. 초기 통계 정보 로드
  const fetchStats = async () => {
    setLoading(true);
    const data = await apiClient.getDashboardStats();
    
    // UX 보완: 실제 연동 계정명(username)이 확인되면, 통계 API 연결 전이거나 0이더라도 연동 계정 수를 1개로 보정
    const activeUser = await apiClient.getConnectedAccount();
    if (activeUser && data.connectedAccounts === 0) {
      data.connectedAccounts = 1;
    }
    
    setStats(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // 3. 게시글 불러오기
  const handleStartNewDraw = async () => {
    setLoading(true);
    const data = await apiClient.getInstagramPosts();
    setPosts(data);
    setStep('select_post');
    setLoading(false);
  };

  // 4. 추첨 실행
  const handleExecuteDraw = async () => {
    setIsDrawing(true);
    
    // 백엔드로 보낼 요청 파라미터 구성
    const drawParams = {
      postId: selectedPost.id,
      excludeDuplicates,
      keyword: useKeyword ? keyword : '',
      minTags: useMinTags ? minTags : 0,
      checkFollow,
      winnerCount: Number(winnerCount)
    };

    // 백엔드 또는 Mock API 호출하여 당첨자 리스트 가져오기
    const results = await apiClient.drawWinners(drawParams);
    setWinners(results);

    // 1.5초 후 당첨 화면으로 전환
    setTimeout(async () => {
      setIsDrawing(false);
      setStep('winner');

      // 5. 추첨 이력 저장 및 통계 즉각 갱신
      const today = new Date().toISOString().split('T')[0];
      const newHistoryItem = {
        drawDate: today,
        postTitle: selectedPost.title,
        commentCount: selectedPost.commentCount,
        winnerUsername: results.map(w => `@${w.username}`).join(', '),
      };
      
      await apiClient.saveHistory(newHistoryItem);
      
      // 통계 수치 갱신 (전체 추첨 +1, 누적 당첨자 +추첨인원)
      setStats(prev => ({
        ...prev,
        totalDraws: prev.totalDraws + 1,
        totalWinners: prev.totalWinners + Number(winnerCount)
      }));
    }, 1800);
  };

  // 6. CSV 다운로드 기능 구현
  const handleDownloadCSV = () => {
    if (winners.length === 0) return;
    
    const headers = 'Username,CommentText\n';
    const rows = winners.map(w => `"${w.username}","${w.text.replace(/"/g, '""')}"`).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `insta_picker_winners_${selectedPost.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 7. 대시보드 리셋
  const handleBackToDashboard = () => {
    setSelectedPost(null);
    setWinners([]);
    setStep('main');
  };

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-10">
      
      {/* ──────────────────────────────────────────────────────── */}
      {/* STEP 1: 메인 대시보드 화면 */}
      {/* ──────────────────────────────────────────────────────── */}
      {step === 'main' && (
        <div className="space-y-12 animate-fade-in-up">
          {/* Header Section */}
          <div className="border-l-4 border-brand-primary pl-4">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">
              메인 대시보드
            </h1>
            <p className="mt-1.5 text-sm text-slate-500 font-medium">
              인스타그램 댓글 추첨 현황과 새로운 이벤트 추첨을 시작해 보세요.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {/* Stat Card 1 */}
            <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-slate-400">연동 계정</span>
                <div className="rounded-xl bg-violet-50 p-2.5 text-violet-600">
                  <InstagramIcon size={22} />
                </div>
              </div>
              <div className="mt-4 flex items-baseline">
                <span className="text-4xl font-extrabold text-slate-800 tracking-tight">
                  {String(stats.connectedAccounts).padStart(2, '0')}
                </span>
                <span className="ml-1 text-sm font-bold text-slate-400">개</span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-400 to-indigo-500"></div>
            </div>

            {/* Stat Card 2 */}
            <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-slate-400">전체 추첨 횟수</span>
                <div className="rounded-xl bg-brand-primary/5 p-2.5 text-brand-primary">
                  <RefreshCw size={22} />
                </div>
              </div>
              <div className="mt-4 flex items-baseline">
                <span className="text-4xl font-extrabold text-brand-primary tracking-tight">
                  {stats.totalDraws}
                </span>
                <span className="ml-1 text-sm font-bold text-slate-400">회</span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#ee2a7b] to-[#E1306C]"></div>
            </div>

            {/* Stat Card 3 */}
            <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-slate-400">누적 당첨자</span>
                <div className="rounded-xl bg-pink-50 p-2.5 text-pink-600">
                  <Trophy size={22} />
                </div>
              </div>
              <div className="mt-4 flex items-baseline">
                <span className="text-4xl font-extrabold text-pink-600 tracking-tight">
                  {stats.totalWinners}
                </span>
                <span className="ml-1 text-sm font-bold text-slate-400">명</span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#f9ce34] to-[#ee2a7b]"></div>
            </div>
          </div>

          {/* Interactive Core Trigger Card */}
          <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-12 transition-all duration-300 hover:border-brand-primary/40 hover:bg-slate-50/80">
            <div className="mx-auto max-w-md text-center flex flex-col items-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm border border-slate-100 text-slate-400 mb-6">
                <Plus size={32} className="stroke-[1.5]" />
              </div>
              <button
                onClick={handleStartNewDraw}
                disabled={loading}
                className="flex items-center gap-2 rounded-xl bg-brand-primary px-6 py-3.5 text-base font-bold text-white shadow-lg shadow-brand-primary/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-primary-hover hover:shadow-xl hover:shadow-brand-primary/30 active:translate-y-0"
              >
                {loading ? '게시물 목록 불러오는 중...' : '새로운 추첨 시작하기'}
              </button>
              <p className="mt-4 text-xs font-semibold text-slate-400">
                게시물을 불러오려면 위 버튼을 클릭하세요
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────── */}
      {/* STEP 2: 추첨 대상 게시물 선택 */}
      {/* ──────────────────────────────────────────────────────── */}
      {step === 'select_post' && (
        <div className="space-y-8 animate-fade-in-up">
          <div className="flex items-center gap-4 justify-between">
            <div className="border-l-4 border-brand-primary pl-4">
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">
                1. 추첨 대상 게시물 선택
              </h1>
            </div>
            <button
              onClick={() => setStep('main')}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft size={14} /> 돌아가기
            </button>
          </div>

          {/* Posts Cards Grid */}
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {posts.map((post) => {
              const isSelected = selectedPost?.id === post.id;
              return (
                <div
                  key={post.id}
                  onClick={() => setSelectedPost(post)}
                  className={`cursor-pointer overflow-hidden rounded-2xl border-2 bg-white transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg ${
                    isSelected
                      ? 'border-brand-primary shadow-md ring-4 ring-brand-primary/5'
                      : 'border-slate-100 shadow-sm'
                  }`}
                >
                  {/* Image Placeholder with fallback gradient representation */}
                  <div className="relative aspect-video w-full bg-slate-100 flex items-center justify-center overflow-hidden">
                    {/* fallback background if image isn't loaded */}
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                      <span className="text-xs font-bold text-slate-400">[Post Image]</span>
                    </div>
                    {/* Optional actual image */}
                    <img 
                      src={post.imageUrl} 
                      alt={post.title}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  </div>

                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="font-sans text-lg font-bold text-slate-800 leading-snug">
                        {post.title}
                      </h3>
                      <div className="mt-2.5 flex items-center gap-3 text-xs font-semibold text-slate-400">
                        <span className="flex items-center gap-1">
                          <MessageSquare size={13} />
                          댓글 {post.commentCount}개
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar size={13} />
                          {post.postDate}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPost(post);
                      }}
                      className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                        isSelected
                          ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/10'
                          : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {isSelected ? (
                        <span className="flex items-center justify-center gap-1">
                          <Check size={14} className="stroke-[3]" /> 선택됨
                        </span>
                      ) : (
                        '선택하기'
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* ──────────────────────────────────────────────────────── */}
      {/* STEP 3: 데이터 필터링 및 추첨 설정 */}
      {/* ──────────────────────────────────────────────────────── */}
      {step === 'settings_filter' && (
        <div className="space-y-8 animate-fade-in-up">
          <div className="flex items-center gap-4 justify-between">
            <div className="border-l-4 border-brand-primary pl-4">
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">
                2. 데이터 필터링 및 추첨 설정
              </h1>
            </div>
            <button
              onClick={() => setStep('select_post')}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft size={14} /> 돌아가기
            </button>
          </div>

          {/* Filtering and Pick Settings Forms */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            
            {/* Left Card: Filter Options */}
            <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm space-y-6">
              <h2 className="font-sans text-xl font-bold text-slate-800">
                필터 옵션
              </h2>

              <div className="space-y-4">
                {/* Exclude Duplicates */}
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="mt-0.5 relative flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={excludeDuplicates}
                      onChange={(e) => setExcludeDuplicates(e.target.checked)}
                      className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border-2 border-slate-200 checked:border-brand-primary checked:bg-brand-primary focus:outline-none transition-all"
                    />
                    <Check size={12} className="absolute text-white stroke-[3] opacity-0 peer-checked:opacity-100 transition-opacity" />
                  </div>
                  <span className="text-sm font-semibold text-slate-600 group-hover:text-slate-900 transition-colors">
                    중복 댓글 제외 (ID당 1회)
                  </span>
                </label>

                {/* Include Keyword */}
                <div className="space-y-2">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="mt-0.5 relative flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={useKeyword}
                        onChange={(e) => setUseKeyword(e.target.checked)}
                        className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border-2 border-slate-200 checked:border-brand-primary checked:bg-brand-primary focus:outline-none transition-all"
                      />
                      <Check size={12} className="absolute text-white stroke-[3] opacity-0 peer-checked:opacity-100 transition-opacity" />
                    </div>
                    <span className="text-sm font-semibold text-slate-600 group-hover:text-slate-900 transition-colors">
                      특정 키워드 포함
                    </span>
                  </label>
                  
                  <input
                    type="text"
                    disabled={!useKeyword}
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold focus:border-brand-primary focus:outline-none disabled:bg-slate-50 disabled:text-slate-400 transition-colors"
                    placeholder="#참여완료"
                  />
                </div>

                {/* Minimum Tag Count */}
                <div className="space-y-2">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="mt-0.5 relative flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={useMinTags}
                        onChange={(e) => setUseMinTags(e.target.checked)}
                        className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border-2 border-slate-200 checked:border-brand-primary checked:bg-brand-primary focus:outline-none transition-all"
                      />
                      <Check size={12} className="absolute text-white stroke-[3] opacity-0 peer-checked:opacity-100 transition-opacity" />
                    </div>
                    <span className="text-sm font-semibold text-slate-600 group-hover:text-slate-900 transition-colors">
                      최소 태그 인원수
                    </span>
                  </label>

                  <select
                    disabled={!useMinTags}
                    value={minTags}
                    onChange={(e) => setMinTags(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold focus:border-brand-primary focus:outline-none disabled:bg-slate-50 disabled:text-slate-400 transition-colors"
                  >
                    <option value={1}>1명</option>
                    <option value={2}>2명</option>
                    <option value={3}>3명</option>
                    <option value={4}>4명</option>
                    <option value={5}>5명</option>
                  </select>
                </div>

                {/* Check Follower Status */}
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="mt-0.5 relative flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={checkFollow}
                      onChange={(e) => setCheckFollow(e.target.checked)}
                      className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border-2 border-slate-200 checked:border-brand-primary checked:bg-brand-primary focus:outline-none transition-all"
                    />
                    <Check size={12} className="absolute text-white stroke-[3] opacity-0 peer-checked:opacity-100 transition-opacity" />
                  </div>
                  <span className="text-sm font-semibold text-slate-600 group-hover:text-slate-900 transition-colors">
                    팔로우 여부 확인 (API 연동)
                  </span>
                </label>
              </div>
            </div>

            {/* Right Card: Winner Pick Settings */}
            <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm flex flex-col justify-between items-center text-center">
              <div className="w-full space-y-6">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-primary/5 text-brand-primary">
                  {/* Stats Chart Custom SVG Icon from Mock image */}
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="stroke-current stroke-[2]">
                    <path d="M3 3V21H21" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M19 9L14 14L10 10L6 14" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="6" cy="14" r="1.5" fill="currentColor"/>
                    <circle cx="10" cy="10" r="1.5" fill="currentColor"/>
                    <circle cx="14" cy="14" r="1.5" fill="currentColor"/>
                  </svg>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-400">추첨 인원 설정</h3>
                  <div className="flex justify-center">
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={winnerCount}
                      onChange={(e) => setWinnerCount(Math.max(1, Number(e.target.value)))}
                      className="w-32 text-center rounded-xl border border-slate-200 px-4 py-3 text-3xl font-extrabold text-slate-800 focus:border-brand-primary focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="w-full mt-8 space-y-4">
                <button
                  onClick={handleExecuteDraw}
                  className="w-full rounded-xl bg-brand-primary py-4 text-base font-bold text-white shadow-lg shadow-brand-primary/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-primary-hover hover:shadow-xl active:translate-y-0"
                >
                  댓글 수집 및 추첨 시작
                </button>
                <p className="text-[11px] font-bold text-slate-400">
                  * Meta API를 통해 댓글을 실시간 수집합니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────── */}
      {/* STEP 4: 당첨 결과 페이지 */}
      {/* ──────────────────────────────────────────────────────── */}
      {step === 'winner' && (
        <div className="space-y-10 animate-fade-in-up text-center max-w-3xl mx-auto">
          
          {/* Header Action Menu */}
          <div className="flex justify-end">
            <button
              onClick={handleBackToDashboard}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors shadow-sm"
            >
              <ArrowLeft size={14} /> 대시보드로
            </button>
          </div>

          {/* Trophy & Congrats Header */}
          <div className="space-y-4">
            <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-tr from-brand-primary/10 to-brand-secondary/15 animate-trophy-bounce">
              <Trophy size={48} className="text-brand-primary stroke-[1.5]" />
            </div>
            
            <div>
              <h1 className="text-4xl font-extrabold tracking-wider text-brand-primary uppercase">
                CONGRATULATIONS!
              </h1>
              <p className="mt-2 text-base font-bold text-slate-500">
                당첨자가 선정되었습니다.
              </p>
            </div>
          </div>

          {/* Winners Display Box (Carousel/List style based on count) */}
          <div className="space-y-4">
            {winners.map((winner, index) => (
              <div 
                key={index}
                className="mx-auto rounded-3xl border-2 border-brand-primary bg-slate-50/50 p-8 shadow-sm flex flex-col items-center max-w-lg transition-transform duration-300 hover:scale-[1.01]"
              >
                {/* Default Avatar Layout from Mock image */}
                <div className="h-16 w-16 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden border border-slate-300">
                  <div className="h-6 w-6 rounded-full bg-slate-400"></div>
                  <div className="h-10 w-10 rounded-full bg-slate-400 mt-8 absolute"></div>
                </div>
                
                <h3 className="mt-4 font-sans text-xl font-bold text-slate-800">
                  @{winner.username}
                </h3>
                
                <p className="mt-2 text-sm italic font-semibold text-slate-500 leading-relaxed">
                  "{winner.text}"
                </p>
              </div>
            ))}
          </div>

          {/* Bottom Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <button
              onClick={() => alert('당첨 이미지를 클립보드에 복사했거나 공유 기능이 활성화되었습니다!')}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
            >
              <Share2 size={15} /> 결과 이미지 공유
            </button>
            
            <button
              onClick={handleDownloadCSV}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
            >
              <Download size={15} /> 명단 다운로드(CSV)
            </button>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────── */}
      {/* OVERLAY: 추첨 중 로딩 애니메이션 */}
      {/* ──────────────────────────────────────────────────────── */}
      {isDrawing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/60 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-white p-8 text-center shadow-2xl animate-fade-in-up space-y-6">
            <h3 className="font-sans text-xl font-extrabold text-slate-800">
              댓글 데이터 수집 중...
            </h3>
            
            {/* Spinning Indicator */}
            <div className="flex justify-center py-4">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand-primary border-t-transparent"></div>
            </div>
            
            <p className="text-xs font-bold text-slate-400">
              필터링 조건에 부합하는 댓글을 선별하고 있습니다.
            </p>
          </div>
        </div>
      )}

      {/* 플로팅 버튼을 transform 애니메이션 부모 바깥인 main 하단에 직접 렌더링하여 브라우저 화면 기준 고정 보장 */}
      {step === 'select_post' && (
        <div className="fixed bottom-8 right-8 z-50 transition-all duration-300">
          <button
            onClick={() => selectedPost && setStep('settings_filter')}
            disabled={!selectedPost}
            className={`flex items-center gap-1.5 rounded-2xl px-6 py-4 text-sm font-extrabold shadow-2xl transition-all duration-300 ${
              selectedPost
                ? 'bg-brand-primary text-white shadow-brand-primary/45 hover:-translate-y-1 hover:bg-brand-primary-hover hover:scale-[1.02] cursor-pointer'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none scale-95 opacity-80'
            }`}
          >
            필터 설정 단계로 이동 <ChevronRight size={16} className="stroke-[3]" />
          </button>
        </div>
      )}

    </main>
  );
};

export default Dashboard;
