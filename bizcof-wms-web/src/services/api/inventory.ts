import { api } from './client';

// 재고 타입 정의
export interface Inventory {
  id: number;
  itemId: number;
  itemCode: string;
  itemName: string;
  customerId: number;
  customerCode: string;
  customerName: string;
  quantity: number;
  availableQuantity: number;
  reservedQuantity: number;
  locationCode?: string;
  lotNumber?: string;
  expiryDate?: string;
  createdDt?: string;
  modifiedDt?: string;
}

// 재고 검색 요청
export interface InventorySearchRequest {
  itemCode?: string;
  itemName?: string;
  customerCode?: string;
  customerName?: string;
}

export const inventoryApi = {
  /**
   * 재고 목록 조회
   */
  async getInventoryList(params?: InventorySearchRequest): Promise<Inventory[]> {
    return api.get<Inventory[]>('inventory/list', params);
  },

  /**
   * 재고 상세 조회
   */
  async getInventory(id: number): Promise<Inventory> {
    return api.get<Inventory>(`inventory/${id}`);
  },
};
