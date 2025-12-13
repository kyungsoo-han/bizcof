import ky, { type KyRequest, type KyResponse, type Options } from 'ky';

// 세션 타임아웃 설정 (밀리초) - 30분
export const SESSION_TIMEOUT = 30 * 60 * 1000;
const LAST_ACTIVITY_KEY = 'lastActivity';

// 세션 만료 이벤트
export const SESSION_EXPIRED_EVENT = 'session-expired';

// 마지막 활동 시간 업데이트
export const updateLastActivity = () => {
  localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
};

// 세션 타임아웃 체크 (마지막 활동으로부터 15분 초과 여부)
const isSessionExpired = (): boolean => {
  const lastActivity = localStorage.getItem(LAST_ACTIVITY_KEY);
  if (!lastActivity) return false; // 활동 기록 없으면 만료 아님 (첫 로그인)

  const elapsed = Date.now() - parseInt(lastActivity, 10);
  return elapsed > SESSION_TIMEOUT;
};

// 로그아웃 처리
const forceLogout = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('user_info');
  localStorage.removeItem(LAST_ACTIVITY_KEY);

  // 세션 만료 모달 표시를 위한 커스텀 이벤트 발생
  window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT));
};

// 토큰 갱신 중복 방지를 위한 플래그
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

// 토큰 갱신 대기 중인 요청들에게 새 토큰 전달
const onRefreshed = (token: string) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

// 토큰 갱신 대기열에 추가
const addRefreshSubscriber = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

// 토큰 갱신 함수
const refreshToken = async (): Promise<string | null> => {
  try {
    const response = await ky.post('/api/auth/refresh', {
      credentials: 'include', // Cookie 포함
    }).json<ApiResponse<{ accessToken: string }>>();

    if (response.statusCode === 'SUCCESS' && response.data.accessToken) {
      const newToken = response.data.accessToken;
      localStorage.setItem('accessToken', newToken);
      return newToken;
    }
    return null;
  } catch {
    return null;
  }
};

// API 클라이언트 생성
export const apiClient = ky.create({
  prefixUrl: '/api',
  timeout: 30000,
  credentials: 'include', // Cookie 포함 (Refresh Token용)
  hooks: {
    beforeRequest: [
      (request) => {
        // JWT 토큰을 로컬 스토리지에서 가져와서 헤더에 추가
        const token = localStorage.getItem('accessToken');
        if (token) {
          request.headers.set('Authorization', `Bearer ${token}`);
        }

        // 로그인/인증/버전체크 요청이 아닌 경우 활동 시간 업데이트
        if (!request.url.includes('/auth/') && !request.url.includes('/version')) {
          updateLastActivity();
        }
      },
    ],
    afterResponse: [
      async (request: KyRequest, options: Options, response: KyResponse) => {
        // 401 Unauthorized 시 토큰 갱신 시도
        if (response.status === 401) {
          // 로그인/갱신 요청은 제외
          if (request.url.includes('/auth/login') || request.url.includes('/auth/refresh')) {
            return response;
          }

          // 세션 만료 체크 (30분 비활동)
          if (isSessionExpired()) {
            console.log('세션 만료: 30분 동안 활동이 없어 로그아웃됩니다.');
            forceLogout();
            return response;
          }

          if (!isRefreshing) {
            isRefreshing = true;

            const newToken = await refreshToken();

            isRefreshing = false;

            if (newToken) {
              onRefreshed(newToken);

              // 원래 요청 재시도
              const newRequest = new Request(request, {
                headers: new Headers(request.headers),
              });
              newRequest.headers.set('Authorization', `Bearer ${newToken}`);

              return ky(newRequest);
            } else {
              // 갱신 실패 시 로그아웃
              forceLogout();
              return response;
            }
          } else {
            // 이미 갱신 중이면 대기
            return new Promise((resolve) => {
              addRefreshSubscriber((token: string) => {
                const newRequest = new Request(request, {
                  headers: new Headers(request.headers),
                });
                newRequest.headers.set('Authorization', `Bearer ${token}`);
                resolve(ky(newRequest));
              });
            });
          }
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
