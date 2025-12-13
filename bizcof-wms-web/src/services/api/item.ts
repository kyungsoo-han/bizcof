import { api } from './client';

// 품목 타입 정의
export interface Item {
  id: number;
  code: string;
  name: string;
  sname?: string;
  ename?: string;
  type?: string;
  spec?: string;
  inventoryUnitCode?: string;
  skuUnitCode?: string;
  skuPerIuQty?: number;
  boxPerSkuQty?: number;
  pltPerSkuQty?: number;
  customerId?: number;
  customerCode?: string;
  customerName?: string;
  category?: string;
  price?: number;
  useYn?: string;
  barcode?: string;
  width?: number;
  height?: number;
  depth?: number;
  weight?: number;
  description?: string;
  memo?: string;
  createdDt?: string;
  modifiedDt?: string;
}

// 품목 검색 요청
export interface ItemSearchRequest {
  code?: string;
  name?: string;
  customerId?: number;
  useYn?: string;
}

// 품목 생성 요청
export interface ItemCreateRequest {
  code: string;
  name: string;
  sname?: string;
  ename?: string;
  type?: string;
  spec?: string;
  inventoryUnitCode?: string;
  skuUnitCode?: string;
  skuPerIuQty?: number;
  boxPerSkuQty?: number;
  pltPerSkuQty?: number;
  customerId?: number;
  price?: number;
  useYn?: string;
  barcode?: string;
  width?: number;
  height?: number;
  depth?: number;
  weight?: number;
  description?: string;
  memo?: string;
}

// 품목 수정 요청
export interface ItemUpdateRequest extends ItemCreateRequest {
  id: number;
}

// 품목 모달용 간단한 DTO (원본과 동일하게)
export interface ItemModal {
  id: number;
  code: string;
  name: string;
  spec?: string;
  inventoryUnitCode?: string;
  boxPerSkuQty?: number;
  pltPerSkuQty?: number;
}

export const itemApi = {
  /**
   * 품목 목록 조회
   */
  async getItemList(params?: ItemSearchRequest): Promise<Item[]> {
    return api.get<Item[]>('master/item/list', params);
  },

  /**
   * 품목 상세 조회
   */
  async getItem(id: number): Promise<Item> {
    return api.get<Item>(`master/item/${id}`);
  },

  /**
   * 품목 생성
   */
  async createItem(data: ItemCreateRequest): Promise<string> {
    return api.post<string>('master/item', data);
  },

  /**
   * 품목 수정
   */
  async updateItem(data: ItemUpdateRequest): Promise<ItemUpdateRequest> {
    return api.put<ItemUpdateRequest>('master/item', data);
  },

  /**
   * 품목 모달 목록 조회 (검색용)
   */
  async getModalItems(searchKeyword: string = ''): Promise<ItemModal[]> {
    return api.get<ItemModal[]>('master/item/modal', { searchKeyword });
  },
};
