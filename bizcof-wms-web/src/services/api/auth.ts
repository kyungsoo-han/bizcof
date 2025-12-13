import { api, apiClient } from './client';

export interface LoginRequest {
  loginId: string;
  password: string;
}

export interface User {
  userId: string;
  username: string;
  email?: string;
  // 추가 사용자 정보 필드
}

export interface LoginResponse {
  token: string;
  userName: string;
}

export const authApi = {
  /**
   * 로그인
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<{ token: string; userName: string }>(
      'system/user/login',
      credentials
    );

    // 토큰과 사용자 정보 저장
    if (response.token) {
      localStorage.setItem('jwt_token', response.token);
      localStorage.setItem('user_info', JSON.stringify({
        userId: credentials.loginId,
        username: response.userName,
      }));
    }

    return response;
  },

  /**
   * 로그아웃
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('system/user/logout');
    } finally {
      // 실패해도 로컬 스토리지는 지움
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('user_info');
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
    return !!localStorage.getItem('jwt_token');
  },
};
