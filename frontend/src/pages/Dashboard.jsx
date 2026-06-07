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
import './Dashboard.css'; // 새로 생성한 스타일 시트 임포트

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
  const [winnerCount, setWinnerCount] = useState(1);
  const [testMode, setTestMode] = useState(true); // 개발자 샌드박스 우회 토글

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
      winnerCount: Number(winnerCount),
      testMode
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
    
    const BOM = '\uFEFF';
    const headers = 'Username,CommentText\n';
    const rows = winners.map(w => `"${w.username}","${w.text.replace(/"/g, '""')}"`).join('\n');
    const blob = new Blob([BOM + headers + rows], { type: 'text/csv;charset=utf-8;' });
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
    <main className="dashboard-main">
      
      {/* STEP 1: 메인 대시보드 화면 */}
      {step === 'main' && (
        <div className="space-y-12 animate-fade-in-up">
          {/* Header Section */}
          <div className="page-header">
            <h1 className="page-title">메인 대시보드</h1>
            <p className="page-subtitle">
              인스타그램 댓글 추첨 현황과 새로운 이벤트 추첨을 시작해 보세요.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="stats-grid">
            {/* Stat Card 2 */}
            <div className="stat-card stat-card-draws">
              <div className="stat-card-header">
                <span className="stat-card-title">전체 추첨 횟수</span>
                <div className="stat-card-icon-box">
                  <RefreshCw size={22} />
                </div>
              </div>
              <div className="stat-card-value-container">
                <span className="stat-card-value">{stats.totalDraws}</span>
                <span className="stat-card-unit">회</span>
              </div>
              <div className="stat-card-bottom-bar-draws"></div>
            </div>

            {/* Stat Card 3 */}
            <div className="stat-card stat-card-winners">
              <div className="stat-card-header">
                <span className="stat-card-title">누적 당첨자</span>
                <div className="stat-card-icon-box">
                  <Trophy size={22} />
                </div>
              </div>
              <div className="stat-card-value-container">
                <span className="stat-card-value">{stats.totalWinners}</span>
                <span className="stat-card-unit">명</span>
              </div>
              <div className="stat-card-bottom-bar-winners"></div>
            </div>
          </div>

          {/* Interactive Core Trigger Card */}
          <div className="trigger-card">
            <div className="trigger-card-content">
              <div className="trigger-icon-box">
                <Plus size={32} className="stroke-[1.5]" />
              </div>
              <button
                onClick={handleStartNewDraw}
                disabled={loading}
                className="brand-btn"
              >
                {loading ? '게시물 목록 불러오는 중...' : '새로운 추첨 시작하기'}
              </button>
              <p className="trigger-info-text">
                게시물을 불러오려면 위 버튼을 클릭하세요
              </p>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: 추첨 대상 게시물 선택 */}
      {step === 'select_post' && (
        <div className="space-y-8 animate-fade-in-up">
          <div className="header-actions">
            <div className="page-header">
              <h1 className="page-title">1. 추첨 대상 게시물 선택</h1>
            </div>
            <button onClick={() => setStep('main')} className="back-btn">
              <ArrowLeft size={14} /> 돌아가기
            </button>
          </div>

          {/* Posts Cards Grid */}
          <div className="posts-grid">
            {posts.map((post) => {
              const isSelected = selectedPost?.id === post.id;
              return (
                <div
                  key={post.id}
                  onClick={() => setSelectedPost(post)}
                  className={`post-card ${isSelected ? 'selected' : ''}`}
                >
                  <div className="post-card-image-box">
                    <div className="post-card-fallback-bg">
                      <span className="post-card-fallback-text">[Post Image]</span>
                    </div>
                    <img 
                      src={post.imageUrl} 
                      alt={post.title}
                      className="post-card-img"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  </div>

                  <div className="post-card-body">
                    <div>
                      <h3 className="post-card-title">{post.title}</h3>
                      <div className="post-card-meta">
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
                      className={`post-card-btn ${isSelected ? 'selected' : 'unselected'}`}
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

      {/* STEP 3: 데이터 필터링 및 추첨 설정 */}
      {step === 'settings_filter' && (
        <div className="space-y-8 animate-fade-in-up">
          <div className="header-actions">
            <div className="page-header">
              <h1 className="page-title">2. 데이터 필터링 및 추첨 설정</h1>
            </div>
            <button onClick={() => setStep('select_post')} className="back-btn">
              <ArrowLeft size={14} /> 돌아가기
            </button>
          </div>

          {/* Filtering and Pick Settings Forms */}
          <div className="filter-container">
            {/* Left Card: Filter Options */}
            <div className="filter-box-card">
              <h2 className="filter-title">필터 옵션</h2>

              {/* 개발용 테스트 모드 토글 */}
              <div className="toggle-panel">
                <div className="toggle-info">
                  <span className="toggle-label">💡 개발용 테스트 모드</span>
                  <span className="toggle-desc">
                    ON: 가상 데모 데이터로 시연 / OFF: 실제 인스타 API 호출
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setTestMode(!testMode)}
                  className={`toggle-btn ${testMode ? 'active' : 'inactive'}`}
                >
                  <span className="toggle-thumb" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Exclude Duplicates */}
                <label className="checkbox-group">
                  <div className="custom-checkbox-wrapper">
                    <input
                      type="checkbox"
                      checked={excludeDuplicates}
                      onChange={(e) => setExcludeDuplicates(e.target.checked)}
                      className="custom-checkbox"
                    />
                    <Check size={12} className="custom-checkbox-icon stroke-[3]" />
                  </div>
                  <span className="checkbox-text">중복 댓글 제외 (ID당 1회)</span>
                </label>

                {/* Include Keyword */}
                <div className="space-y-2">
                  <label className="checkbox-group">
                    <div className="custom-checkbox-wrapper">
                      <input
                        type="checkbox"
                        checked={useKeyword}
                        onChange={(e) => setUseKeyword(e.target.checked)}
                        className="custom-checkbox"
                      />
                      <Check size={12} className="custom-checkbox-icon stroke-[3]" />
                    </div>
                    <span className="checkbox-text">특정 키워드 포함</span>
                  </label>
                  
                  <input
                    type="text"
                    disabled={!useKeyword}
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    className="text-input-field"
                    placeholder="#참여완료"
                  />
                </div>

                {/* Minimum Tag Count */}
                <div className="space-y-2">
                  <label className="checkbox-group">
                    <div className="custom-checkbox-wrapper">
                      <input
                        type="checkbox"
                        checked={useMinTags}
                        onChange={(e) => setUseMinTags(e.target.checked)}
                        className="custom-checkbox"
                      />
                      <Check size={12} className="custom-checkbox-icon stroke-[3]" />
                    </div>
                    <span className="checkbox-text">최소 태그 인원수</span>
                  </label>

                  <select
                    disabled={!useMinTags}
                    value={minTags}
                    onChange={(e) => setMinTags(Number(e.target.value))}
                    className="select-field"
                  >
                    <option value={1}>1명</option>
                    <option value={2}>2명</option>
                    <option value={3}>3명</option>
                    <option value={4}>4명</option>
                    <option value={5}>5명</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Right Card: Winner Pick Settings */}
            <div className="winner-setup-card">
              <div className="w-full space-y-6">
                <div className="setup-icon-box">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="stroke-current stroke-[2]">
                    <path d="M3 3V21H21" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M19 9L14 14L10 10L6 14" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="6" cy="14" r="1.5" fill="currentColor"/>
                    <circle cx="10" cy="10" r="1.5" fill="currentColor"/>
                    <circle cx="14" cy="14" r="1.5" fill="currentColor"/>
                  </svg>
                </div>

                <div className="space-y-4">
                  <h3 className="setup-title">추첨 인원 설정</h3>
                  <div className="flex justify-center">
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={winnerCount}
                      onChange={(e) => setWinnerCount(Math.max(1, Number(e.target.value)))}
                      className="setup-number-input"
                    />
                  </div>
                </div>
              </div>

              <div className="execute-draw-btn-box">
                <button onClick={handleExecuteDraw} className="brand-btn w-full justify-center">
                  댓글 수집 및 추첨 시작
                </button>
                <p className="execute-draw-btn-desc">
                  * Meta API를 통해 댓글을 실시간 수집합니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: 당첨 결과 페이지 */}
      {step === 'winner' && (
        <div className="winner-screen-layout">
          <div className="winner-screen-header-actions">
            <button onClick={handleBackToDashboard} className="back-btn">
              <ArrowLeft size={14} /> 대시보드로
            </button>
          </div>

          <div className="space-y-4">
            <div className="winner-trophy-badge">
              <Trophy size={48} className="text-brand-primary stroke-[1.5]" />
            </div>
            <div>
              <h1 className="congrats-title">CONGRATULATIONS!</h1>
              <p className="congrats-desc">당첨자가 선정되었습니다.</p>
            </div>
          </div>

          <div className="winner-cards-container">
            {winners.map((winner, index) => (
              <div key={index} className="winner-result-card">
                <div className="winner-avatar">
                  <div className="winner-avatar-head"></div>
                  <div className="winner-avatar-body"></div>
                </div>
                <h3 className="winner-name">@{winner.username}</h3>
                <p className="winner-comment">"{winner.text}"</p>
              </div>
            ))}
          </div>

          <div className="winner-actions-box">
            <button
              onClick={() => alert('당첨 이미지를 클립보드에 복사했거나 공유 기능이 활성화되었습니다!')}
              className="winner-action-secondary-btn"
            >
              <Share2 size={15} /> 결과 이미지 공유
            </button>
            <button onClick={handleDownloadCSV} className="winner-action-secondary-btn">
              <Download size={15} /> 명단 다운로드(CSV)
            </button>
          </div>
        </div>
      )}

      {/* OVERLAY: 추첨 중 로딩 애니메이션 */}
      {isDrawing && (
        <div className="drawing-spinner-overlay">
          <div className="drawing-spinner-card">
            <h3 className="drawing-spinner-title">댓글 데이터 수집 중...</h3>
            <div className="spinner-animation-container">
              <div className="spinner-circle"></div>
            </div>
            <p className="drawing-spinner-desc">
              필터링 조건에 부합하는 댓글을 선별하고 있습니다.
            </p>
          </div>
        </div>
      )}

      {/* 플로팅 버튼 */}
      {step === 'select_post' && (
        <div className="floating-nav-container">
          <button
            onClick={() => selectedPost && setStep('settings_filter')}
            disabled={!selectedPost}
            className={`floating-next-btn ${selectedPost ? 'active' : 'inactive'}`}
          >
            필터 설정 단계로 이동 <ChevronRight size={16} className="stroke-[3]" />
          </button>
        </div>
      )}

    </main>
  );
};

export default Dashboard;
