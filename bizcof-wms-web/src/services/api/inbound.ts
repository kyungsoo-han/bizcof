import { api } from './client';

// 입고 마스터 타입 정의
export interface Inbound {
  inboundNo: string;
  inboundDate: string;
  inboundType: string;
  inboundTypeName: string;
  customerId: number;
  customerCode: string;
  customerName: string;
  memo?: string;
}

// 입고 상세 타입 정의
export interface InboundDetail {
  seqNo: number;
  itemId: number;
  itemCode: string;
  itemName: string;
  boxPerSkuQty: number;
  boxQty: number;
  pltPerSkuQty: number;
  pltQty: number;
  inboundQty: number;
  locationCode?: string;
  expireDate?: string;
  makeDate?: string;
  makeNo?: string;
  lotNo?: string;
  memo?: string;
}

// 입고 검색 요청
export interface InboundSearchRequest {
  startDate?: string;
  endDate?: string;
  inboundNo?: string;
  customerCode?: string;
  customerName?: string;
}

// 입고 생성 요청
export interface InboundCreateRequest {
  inboundDate: string;
  customerId: number;
  inboundType: string;
  memo?: string;
  items: InboundDetailCreateRequest[];
}

// 입고 상세 생성 요청
export interface InboundDetailCreateRequest {
  seqNo?: number;
  itemId: number;
  pltQty?: number;
  boxQty?: number;
  inboundQty: number;
  locationCode?: string;
  expireDate?: string;
  makeDate?: string;
  makeNo?: string;
  lotNo?: string;
  memo?: string;
  isDeleted?: string;
}

// 입고 수정 요청
export interface InboundUpdateRequest extends InboundCreateRequest {
  inboundNo: string;
}

// 입고 전체 정보 (헤더 + 상세)
export interface InboundFull {
  header: Inbound;
  details: InboundDetail[];
}

export const inboundApi = {
  /**
   * 입고 목록 조회
   */
  async getInboundList(params?: InboundSearchRequest): Promise<Inbound[]> {
    return api.get<Inbound[]>('inbound/header', params);
  },

  /**
   * 입고 상세 조회
   */
  async getInbound(inboundNo: string): Promise<Inbound> {
    return api.get<Inbound>(`inbound/header/${inboundNo}`);
  },

  /**
   * 입고 상세 아이템 조회
   */
  async getInboundDetails(inboundNo: string): Promise<InboundDetail[]> {
    return api.get<InboundDetail[]>(`inbound/detail/${inboundNo}`);
  },

  /**
   * 입고 등록
   */
  async createInbound(data: InboundCreateRequest): Promise<string> {
    return api.post<string>('inbound', data);
  },

  /**
   * 입고 수정
   */
  async updateInbound(data: InboundUpdateRequest): Promise<InboundUpdateRequest> {
    return api.put<InboundUpdateRequest>('inbound', data);
  },

  /**
   * 입고 삭제
   */
  async deleteInbound(inboundNo: string): Promise<void> {
    return api.delete(`inbound/${inboundNo}`);
  },

  /**
   * 입고 전체 정보 조회 (헤더 + 상세 통합)
   */
  async getInboundFull(inboundNo: string): Promise<InboundFull> {
    return api.get<InboundFull>(`inbound/${inboundNo}`);
  },
};
