import { api } from './client';

// BOM 트리 응답 타입 (백엔드 BomTreeResponse와 일치)
export interface BomTreeResponse {
  treeId: string;           // 트리 ID (계층 표현용) - "00", "0001" 형식
  parentTreeId: string | null;  // 상위 트리 ID
  bomId: number;
  parentBomId: number | null;
  parentItemId: number;
  childItemId: number;
  itemCode: string;
  itemName: string;
  spec?: string;
  requiredQty: number;      // 소요량
  unit?: string;
  sortOrder: number;
  isEditable: boolean;      // 편집 가능 여부
  hasChild: boolean;        // 자식 노드 존재 여부
}

// BOM 저장 요청
export interface BomSaveRequest {
  topItemId: number;
  rows: BomDetailRequest[];
}

// BOM 상세 저장 요청
export interface BomDetailRequest {
  rowState: 'created' | 'updated' | 'deleted';
  bomId?: number;
  parentBomId?: number | null;
  parentItemId: number;
  childItemId: number;
  requiredQty: number;
  sortOrder?: number;
  memo?: string;
}

export const bomApi = {
  /**
   * 특정 품목의 BOM 트리 조회
   */
  async getBomTree(topItemId: number): Promise<BomTreeResponse[]> {
    return api.get<BomTreeResponse[]>(`bom/tree/${topItemId}`);
  },

  /**
   * BOM 일괄 저장 (등록/수정/삭제)
   */
  async saveBomList(data: BomSaveRequest): Promise<void> {
    return api.post<void>('bom/bulk', data);
  },
};
