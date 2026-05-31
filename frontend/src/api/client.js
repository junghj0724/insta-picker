import axios from 'axios';

// Vite Proxy 설정에 의해 '/api'로 보낸 요청은 'http://localhost:8080'으로 전달됩니다.
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000,
});

// 백엔드가 구현되기 전 또는 에러 발생 시 프론트엔드가 독립적으로 동작하도록 지원하는 가상(Mock) 데이터 풀입니다.
const MOCK_STATS = {
  connectedAccounts: 1,
  totalDraws: 24,
  totalWinners: 108
};

const MOCK_POSTS = [
  {
    id: "post_1",
    title: "이벤트 게시물 A",
    commentCount: 120,
    postDate: "2024.05.10",
    imageUrl: "/assets/post1.png"
  },
  {
    id: "post_2",
    title: "신제품 런칭 이벤트",
    commentCount: 450,
    postDate: "2024.05.15",
    imageUrl: "/assets/post2.png"
  },
  {
    id: "post_3",
    title: "팔로워 1만 기념",
    commentCount: 890,
    postDate: "2024.05.18",
    imageUrl: "/assets/post3.png"
  }
];

const MOCK_COMMENTS_POOL = [
  { username: "lucky_winner_id", text: "이벤트 참여합니다! 꼭 뽑아주세요 ❤️" },
  { username: "insta_lover", text: "신제품 런칭 축하드립니다! 꼭 당첨되었으면 좋겠어요! #참여완료" },
  { username: "react_developer", text: "댓글 추첨 프로그램 너무 멋지네요. 응원합니다." },
  { username: "j_hyun_jin_99", text: "과제 제출 완료! 꼭 당첨되길 바랍니다!" },
  { username: "comment_king", text: "인스타 댓글 당첨되고 싶어요~! 좋은 하루 되세요." },
  { username: "coffee_holic", text: "아메리카노 쿠폰 가즈아~!! 대박나세요." },
  { username: "happy_today", text: "이벤트 열어주셔서 감사합니다. 참여 완료합니다!" },
  { username: "winner_winner", text: "내가 바로 오늘의 주인공! 뽑아주세요!" },
  { username: "pick_me_up", text: "이벤트 피드 공유도 완료했습니다. 뽑아주세요!!" },
  { username: "gold_hand", text: "제 손이 똥손이 아니길 바라며 참여합니다!! #이벤트" }
];

let MOCK_HISTORY = [
  {
    id: 1,
    drawDate: "2024-05-20",
    postTitle: "신제품 런칭...",
    commentCount: 450,
    winnerUsername: "@winner_1...",
    status: "완료"
  },
  {
    id: 2,
    drawDate: "2024-05-15",
    postTitle: "게시물 A",
    commentCount: 120,
    winnerUsername: "@hello_user",
    status: "완료"
  }
];

export const apiClient = {
  // 1. 대시보드 통계 조회
  getDashboardStats: async () => {
    try {
      const response = await api.get('/dashboard/stats');
      return response.data;
    } catch (error) {
      console.warn("백엔드 API 미연결 또는 에러 발생: Mock 데이터를 사용합니다.", error);
      return MOCK_STATS;
    }
  },

  // 2. 인스타그램 게시물 목록 조회
  getInstagramPosts: async () => {
    try {
      const response = await api.get('/instagram/posts');
      return response.data;
    } catch (error) {
      console.warn("백엔드 API 미연결 또는 에러 발생: Mock 데이터를 사용합니다.", error);
      return MOCK_POSTS;
    }
  },

  // 3. 댓글 수집 및 추첨 실행
  drawWinners: async (params) => {
    try {
      // params: { postId, excludeDuplicates, keyword, minTags, checkFollow, winnerCount }
      const response = await api.post('/instagram/draw', params);
      return response.data;
    } catch (error) {
      console.warn("백엔드 API 미연결 또는 에러 발생: Mock 추첨 알고리즘을 사용합니다.", error);
      
      // 가상 필터링 및 추첨 구현
      let pool = [...MOCK_COMMENTS_POOL];
      
      // 키워드 필터가 켜져 있으면 해당 키워드 포함 댓글만 필터링
      if (params.keyword && params.keyword.trim() !== '') {
        const kw = params.keyword.trim();
        pool = pool.filter(c => c.text.includes(kw));
      }
      
      // 만약 필터링 결과가 없으면 임시 생성
      if (pool.length === 0) {
        pool = [{ username: "fallback_user", text: `댓글에 키워드 '${params.keyword}'가 포함되어 있습니다.` }];
      }
      
      // 랜덤 셔플
      const shuffled = pool.sort(() => 0.5 - Math.random());
      // 요청한 당첨자 수(winnerCount)만큼 슬라이싱
      const winners = shuffled.slice(0, Math.min(params.winnerCount, pool.length));
      
      // 만약 요청한 당첨자 수가 풀보다 크다면 더미 데이터 추가
      while (winners.length < params.winnerCount) {
        const randId = Math.floor(Math.random() * 1000);
        winners.push({
          username: `lucky_user_${randId}`,
          text: "이벤트 참여 대환영입니다! 대박 기원합니다 🌟"
        });
      }
      
      return winners;
    }
  },

  // 4. 추첨 이력 목록 조회
  getHistory: async () => {
    try {
      const response = await api.get('/history');
      return response.data;
    } catch (error) {
      console.warn("백엔드 API 미연결 또는 에러 발생: Mock 이력을 사용합니다.", error);
      return MOCK_HISTORY;
    }
  },

  // 5. 추첨 이력 추가 (추첨 완료 시 이력을 로컬 상태 또는 백엔드 DB에 보관)
  saveHistory: async (newHistoryItem) => {
    try {
      const response = await api.post('/history', newHistoryItem);
      return response.data;
    } catch (error) {
      console.warn("백엔드 API 미연결 또는 에러 발생: 임시 메모리에 저장합니다.", error);
      
      const newId = MOCK_HISTORY.length > 0 ? Math.max(...MOCK_HISTORY.map(h => h.id)) + 1 : 1;
      const historyRecord = {
        id: newId,
        drawDate: newHistoryItem.drawDate,
        postTitle: newHistoryItem.postTitle,
        commentCount: newHistoryItem.commentCount,
        winnerUsername: newHistoryItem.winnerUsername,
        status: "완료"
      };
      MOCK_HISTORY = [historyRecord, ...MOCK_HISTORY];
      return historyRecord;
    }
  }
};
