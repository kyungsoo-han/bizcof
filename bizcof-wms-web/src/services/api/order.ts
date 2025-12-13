import { api } from './client';

// 주문 마스터 타입 정의
export interface Order {
  orderNo: string;
  orderDate: string;
  deliveryDate: string;
  dueDate: string;
  customerId: number;
  customerName: string;
  customerName2?: string;
  deliveryAddress?: string;
  phoneNbr?: string;
  memo?: string;
  customerMemo?: string;
  orderStatus: string;
}

// 주문 상세 타입 정의
export interface OrderDetail {
  orderId: number;
  itemId: number;
  itemCode: string;
  itemName: string;
  orderItemName?: string;
  orderQty: number;
  subMemo?: string;
}

// 주문 검색 요청
export interface OrderSearchRequest {
  startDate?: string;
  endDate?: string;
  orderNo?: string;
  customerCode?: string;
  customerName?: string;
}

// 주문 생성 요청
export interface OrderCreateRequest {
  orderDate: string;
  deliveryDate: string;
  dueDate: string;
  customerId: number;
  customerName: string;
  customerName2?: string;
  deliveryAddress?: string;
  phoneNbr?: string;
  memo?: string;
  customerMemo?: string;
  details: OrderDetailCreateRequest[];
}

// 주문 상세 생성 요청
export interface OrderDetailCreateRequest {
  itemId: number;
  orderQty: number;
  subMemo?: string;
}

// 주문 수정 요청
export interface OrderUpdateRequest extends OrderCreateRequest {
  orderNo: string;
}

export const orderApi = {
  /**
   * 주문 목록 조회
   */
  async getOrderList(params?: OrderSearchRequest): Promise<Order[]> {
    return api.get<Order[]>('order/header', params);
  },

  /**
   * 주문 상세 조회
   */
  async getOrder(orderNo: string): Promise<Order> {
    return api.get<Order>(`order/header/${orderNo}`);
  },

  /**
   * 주문 상세 아이템 조회
   */
  async getOrderDetails(orderNo: string): Promise<OrderDetail[]> {
    return api.get<OrderDetail[]>(`order/detail/${orderNo}`);
  },

  /**
   * 주문 등록
   */
  async createOrder(data: OrderCreateRequest): Promise<string> {
    return api.post<string>('order', data);
  },

  /**
   * 주문 수정
   */
  async updateOrder(data: OrderUpdateRequest): Promise<OrderUpdateRequest> {
    return api.put<OrderUpdateRequest>('order', data);
  },

  /**
   * 주문 확정
   */
  async confirmOrder(orderNo: string): Promise<void> {
    return api.post(`order/${orderNo}/confirm`);
  },

  /**
   * 주문 삭제
   */
  async deleteOrder(orderNo: string): Promise<void> {
    return api.delete(`order/${orderNo}`);
  },
};
