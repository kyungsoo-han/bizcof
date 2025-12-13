import { api } from './client';

// 거래처 타입 정의
export interface Customer {
  id: number;
  code: string;
  name: string;
  businessNumber?: string;
  representative?: string;
  address?: string;
  addressDetail?: string;
  tel?: string;
  fax?: string;
  email?: string;
  manager?: string;
  managerTel?: string;
  description?: string;
  useYn?: string;
  createdDt?: string;
  modifiedDt?: string;
}

// 거래처 검색 요청
export interface CustomerSearchRequest {
  code?: string;
  name?: string;
  useYn?: string;
}

// 거래처 생성 요청
export interface CustomerCreateRequest {
  code: string;
  name: string;
  businessNumber?: string;
  representative?: string;
  address?: string;
  addressDetail?: string;
  tel?: string;
  fax?: string;
  email?: string;
  manager?: string;
  managerTel?: string;
  description?: string;
  useYn?: string;
}

// 거래처 수정 요청
export interface CustomerUpdateRequest extends CustomerCreateRequest {
  id: number;
}

// 거래처 모달용 (간단한 정보)
export interface CustomerModal {
  id: number;
  code: string;
  name: string;
}

export const customerApi = {
  /**
   * 거래처 목록 조회
   */
  async getCustomerList(params?: CustomerSearchRequest ): Promise<Customer[]> {
    return api.get<Customer[]>('master/customer/list', params );
  },

  /**
   * 거래처 상세 조회
   */
  async getCustomer(id: number): Promise<Customer> {
    return api.get<Customer>(`master/customer/${id}`);
  },

  /**
   * 거래처 등록
   */
  async createCustomer(data: CustomerCreateRequest): Promise<string> {
    return api.post<string>('master/customer', data);
  },

  /**
   * 거래처 수정
   */
  async updateCustomer(data: CustomerUpdateRequest): Promise<CustomerUpdateRequest> {
    return api.put<CustomerUpdateRequest>('master/customer', data);
  },

  /**
   * 거래처 삭제
   */
  async deleteCustomer(id: number): Promise<void> {
    return api.delete(`master/customer/${id}`);
  },

  /**
   * 거래처 검색 모달용
   */
  async getModalCustomers(searchKeyword: string): Promise<CustomerModal[]> {
    return api.get<CustomerModal[]>('master/customer/modal', {
      searchKeyword,
    });
  },
};
