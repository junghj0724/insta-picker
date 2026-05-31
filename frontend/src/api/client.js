import axios from 'axios';

// Vite Proxy 설정에 의해 '/api'로 보낸 요청은 'http://localhost:8080'으로 전달됩니다.
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000,
});

// 백엔드 API 실패 또는 미구현 시 사용할 빈 안전 기본값 정의
const EMPTY_STATS = {
  connectedAccounts: 0,
  totalDraws: 0,
  totalWinners: 0
};

export const apiClient = {
  // 0. 연동된 인스타그램 계정 정보 조회 (실제 백엔드 연동)
  getConnectedAccount: async () => {
    try {
      const response = await api.get('/instagram/user');
      if (response.data && typeof response.data === 'object') {
        return response.data.username || '';
      }
      return response.data;
    } catch (error) {
      console.warn("연동 계정 정보 조회 실패 (백엔드 /api/instagram/user 확인 요망): ", error);
      return '';
    }
  },

  // 1. 대시보드 통계 조회 (실제 백엔드 연동)
  getDashboardStats: async () => {
    try {
      const response = await api.get('/dashboard/stats');
      return response.data;
    } catch (error) {
      console.error("대시보드 통계 조회 실패 (백엔드 /api/dashboard/stats 확인 요망): ", error);
      return EMPTY_STATS;
    }
  },

  // 2. 인스타그램 게시물 목록 조회 (실제 백엔드 연동)
  getInstagramPosts: async () => {
    try {
      const response = await api.get('/instagram/posts');
      return response.data;
    } catch (error) {
      console.error("인스타그램 게시물 로드 실패: ", error);
      return [];
    }
  },

  // 3. 댓글 수집 및 추첨 실행 (실제 백엔드 연동)
  drawWinners: async (params) => {
    try {
      const response = await api.post('/instagram/draw', params);
      return response.data;
    } catch (error) {
      console.error("댓글 수집 및 추첨 실행 실패 (백엔드 /api/instagram/draw 확인 요망): ", error);
      return [];
    }
  },

  // 4. 추첨 이력 목록 조회 (실제 백엔드 연동)
  getHistory: async () => {
    try {
      const response = await api.get('/history');
      return response.data;
    } catch (error) {
      console.error("추첨 이력 목록 조회 실패 (백엔드 /api/history 확인 요망): ", error);
      return [];
    }
  },

  // 5. 추첨 이력 추가 (실제 백엔드 연동)
  saveHistory: async (newHistoryItem) => {
    try {
      const response = await api.post('/history', newHistoryItem);
      return response.data;
    } catch (error) {
      console.error("추첨 이력 저장 실패 (백엔드 /api/history 확인 요망): ", error);
      return null;
    }
  }
};
