import { api } from './client';

// 출고 마스터 타입 정의
export interface Outbound {
  outboundNo: string;
  outboundDate: string;
  outboundType: string;
  outboundTypeName: string;
  customerId: number;
  customerCode: string;
  customerName: string;
  memo?: string;
  status: string;
}

// 출고 상세 타입 정의
export interface OutboundDetail {
  seqNo: number;
  itemId: number;
  itemCode: string;
  itemName: string;
  boxPerSkuQty: number;
  boxQty: number;
  pltPerSkuQty: number;
  pltQty: number;
  outboundQty: number;
  locationCode?: string;
  expireDate?: string;
  makeDate?: string;
  makeNo?: string;
  lotNo?: string;
  memo?: string;
}

// 출고 검색 요청
export interface OutboundSearchRequest {
  startDate?: string;
  endDate?: string;
  outboundNo?: string;
  customerCode?: string;
  customerName?: string;
}

// 출고 생성 요청
export interface OutboundCreateRequest {
  outboundDate: string;
  outboundType: string;
  customerId: number;
  memo?: string;
  details: OutboundDetailCreateRequest[];
}

// 출고 상세 생성 요청
export interface OutboundDetailCreateRequest {
  itemId: number;
  boxPerSkuQty: number;
  boxQty: number;
  pltPerSkuQty: number;
  pltQty: number;
  outboundQty: number;
  locationCode?: string;
  expireDate?: string;
  makeDate?: string;
  makeNo?: string;
  lotNo?: string;
  memo?: string;
}

// 출고 수정 요청
export interface OutboundUpdateRequest extends OutboundCreateRequest {
  outboundNo: string;
}

// 출고 전체 정보 (헤더 + 상세)
export interface OutboundFull {
  header: Outbound;
  details: OutboundDetail[];
}

export const outboundApi = {
  /**
   * 출고 목록 조회
   */
  async getOutboundList(params?: OutboundSearchRequest): Promise<Outbound[]> {
    return api.get<Outbound[]>('outbound/list', params);
  },

  /**
   * 출고 상세 조회
   */
  async getOutbound(outboundNo: string): Promise<Outbound> {
    return api.get<Outbound>(`outbound/${outboundNo}`);
  },

  /**
   * 출고 상세 아이템 조회
   */
  async getOutboundDetails(outboundNo: string): Promise<OutboundDetail[]> {
    return api.get<OutboundDetail[]>(`outbound/${outboundNo}/details`);
  },

  /**
   * 출고 전체 정보 조회 (헤더 + 상세)
   */
  async getOutboundFull(outboundNo: string): Promise<OutboundFull> {
    return api.get<OutboundFull>(`outbound/full/${outboundNo}`);
  },

  /**
   * 출고 등록
   */
  async createOutbound(data: OutboundCreateRequest): Promise<string> {
    return api.post<string>('outbound', data);
  },

  /**
   * 출고 수정
   */
  async updateOutbound(data: OutboundUpdateRequest): Promise<OutboundUpdateRequest> {
    return api.put<OutboundUpdateRequest>('outbound', data);
  },

  /**
   * 출고 삭제
   */
  async deleteOutbound(outboundNo: string): Promise<void> {
    return api.delete(`outbound/${outboundNo}`);
  },
};
