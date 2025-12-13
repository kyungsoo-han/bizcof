import { api } from './client';

// 사용자 타입 정의
export interface User {
  id: number;
  userId: string;
  userName: string;
  email?: string;
  tel?: string;
  department?: string;
  position?: string;
  role?: string;
  useYn: string;
  createdDt?: string;
  modifiedDt?: string;
}

// 사용자 검색 요청
export interface UserSearchRequest {
  userId?: string;
  userName?: string;
  department?: string;
  useYn?: string;
}

// 사용자 생성 요청
export interface UserCreateRequest {
  userId: string;
  password: string;
  userName: string;
  email?: string;
  tel?: string;
  department?: string;
  position?: string;
  role?: string;
  useYn?: string;
}

// 사용자 수정 요청
export interface UserUpdateRequest {
  id: number;
  userName: string;
  email?: string;
  tel?: string;
  department?: string;
  position?: string;
  role?: string;
  useYn?: string;
}

// 비밀번호 변경 요청
export interface PasswordChangeRequest {
  id: number;
  currentPassword: string;
  newPassword: string;
}

export const userApi = {
  /**
   * 사용자 목록 조회
   */
  async getUserList(params?: UserSearchRequest): Promise<User[]> {
    return api.get<User[]>('system/user/list', params);
  },

  /**
   * 사용자 상세 조회
   */
  async getUser(id: number): Promise<User> {
    return api.get<User>(`system/user/${id}`);
  },

  /**
   * 사용자 등록
   */
  async createUser(data: UserCreateRequest): Promise<string> {
    return api.post<string>('system/user', data);
  },

  /**
   * 사용자 수정
   */
  async updateUser(data: UserUpdateRequest): Promise<UserUpdateRequest> {
    return api.put<UserUpdateRequest>('system/user', data);
  },

  /**
   * 사용자 삭제
   */
  async deleteUser(id: number): Promise<void> {
    return api.delete(`system/user/${id}`);
  },

  /**
   * 비밀번호 변경
   */
  async changePassword(data: PasswordChangeRequest): Promise<void> {
    return api.put('system/user/password', data);
  },

  /**
   * 비밀번호 초기화
   */
  async resetPassword(id: number): Promise<void> {
    return api.post(`system/user/${id}/reset-password`, {});
  },
};
