import ky from 'ky';

// API 클라이언트 생성
export const apiClient = ky.create({
  prefixUrl: '/api',
  timeout: 30000,
  hooks: {
    beforeRequest: [
      (request) => {
        // JWT 토큰을 로컬 스토리지에서 가져와서 헤더에 추가
        const token = localStorage.getItem('jwt_token');
        if (token) {
          request.headers.set('Authorization', `Bearer ${token}`);
        }
      },
    ],
    afterResponse: [
      async (_request, _options, response) => {
        // 401 Unauthorized 시 로그인 페이지로 리다이렉트
        if (response.status === 401) {
          localStorage.removeItem('jwt_token');
          localStorage.removeItem('user_info');
          window.location.href = '/login';
        }
        return response;
      },
    ],
  },
});

// API 응답 타입
export interface ApiResponse<T = unknown> {
  statusCode: 'SUCCESS' | 'FAIL';
  data: T;
  message: string | null;
}

// 타입 안전한 API 호출 헬퍼
export const api = {
  async get<T>(url: string, searchParams?: Record<string, string | number | boolean | any>) {
    const response = await apiClient.get(url, { searchParams }).json<ApiResponse<T>>();
    return response.data;
  },

  async post<T>(url: string, json?: unknown) {
    const response = await apiClient.post(url, { json }).json<ApiResponse<T>>();
    return response.data;
  },

  async put<T>(url: string, json?: unknown) {
    const response = await apiClient.put(url, { json }).json<ApiResponse<T>>();
    return response.data;
  },

  async delete<T>(url: string) {
    const response = await apiClient.delete(url).json<ApiResponse<T>>();
    return response.data;
  },
};
