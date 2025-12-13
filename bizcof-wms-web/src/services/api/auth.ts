import ky from 'ky';
import { api, ApiResponse, updateLastActivity } from './client';

export interface LoginRequest {
  loginId: string;
  password: string;
}

export interface User {
  userId: string;
  username: string;
  email?: string;
}

export interface LoginResponse {
  accessToken: string;
  username: string;
}

export const authApi = {
  /**
   * 로그인 - 새 인증 API 사용
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    // 새 인증 엔드포인트 사용 (Cookie 설정을 위해 credentials: include)
    const response = await ky.post('/api/auth/login', {
      json: credentials,
      credentials: 'include',
    }).json<ApiResponse<LoginResponse>>();

    if (response.statusCode === 'SUCCESS' && response.data.accessToken) {
      // Access Token은 localStorage에 저장
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('user_info', JSON.stringify({
        userId: credentials.loginId,
        username: response.data.username,
      }));
      // 로그인 시 활동 시간 초기화
      updateLastActivity();
    }

    return response.data;
  },

  /**
   * 로그아웃 - 새 인증 API 사용
   */
  async logout(): Promise<void> {
    try {
      await ky.post('/api/auth/logout', {
        credentials: 'include',
      });
    } finally {
      // 실패해도 로컬 스토리지는 지움
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user_info');
      localStorage.removeItem('lastActivity');
    }
  },

  /**
   * 토큰 갱신
   */
  async refresh(): Promise<string | null> {
    try {
      const response = await ky.post('/api/auth/refresh', {
        credentials: 'include',
      }).json<ApiResponse<{ accessToken: string }>>();

      if (response.statusCode === 'SUCCESS' && response.data.accessToken) {
        localStorage.setItem('accessToken', response.data.accessToken);
        return response.data.accessToken;
      }
      return null;
    } catch {
      return null;
    }
  },

  /**
   * 현재 사용자 정보 가져오기 (로컬 스토리지에서)
   */
  getCurrentUser(): User | null {
    const userInfo = localStorage.getItem('user_info');
    if (userInfo) {
      try {
        return JSON.parse(userInfo);
      } catch {
        return null;
      }
    }
    return null;
  },

  /**
   * 인증 여부 확인
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
  },

  /**
   * 서버에서 현재 사용자 정보 가져오기
   */
  async fetchCurrentUser(): Promise<User | null> {
    try {
      const response = await api.get<{ username: string; authorities: any[] }>('auth/me');
      return {
        userId: response.username,
        username: response.username,
      };
    } catch {
      return null;
    }
  },
};
