import { useState, useRef, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataGrid, type DataGridRef } from '@/components/common/DataGrid';
import type { RealGridColumn } from '@/types/realgrid';
import { Search } from 'lucide-react';

/**
 * SearchDialog Props
 * @template T - 검색 결과 아이템 타입
 */
export interface SearchDialogProps<T> {
  /** 다이얼로그 열림 상태 */
  open: boolean;
  /** 다이얼로그 열림 상태 변경 콜백 */
  onOpenChange: (open: boolean) => void;
  /**
   * 선택 콜백
   * - multiSelect=true: 배열로 전달
   * - multiSelect=false: 단일 아이템으로 전달
   */
  onSelect: (items: T | T[]) => void;

  /** 다이얼로그 제목 */
  title: string;
  /** 다이얼로그 설명 */
  description?: string;
  /** 검색 입력 placeholder */
  placeholder?: string;

  /** 그리드 컬럼 정의 */
  columns: RealGridColumn[];
  /**
   * 데이터 조회 함수
   * @param keyword - 검색 키워드
   * @returns Promise<T[]>
   */
  fetchFn: (keyword: string) => Promise<T[]>;
  /** 쿼리 키 (캐시 구분용) */
  queryKey: string;

  /** 다중 선택 허용 여부 (기본값: false) */
  multiSelect?: boolean;
  /** 다이얼로그 최대 너비 (기본값: max-w-3xl) */
  maxWidth?: string;
}

/**
 * 제네릭 검색 다이얼로그 컴포넌트
 *
 * @example
 * // 단일 선택 (거래처)
 * <SearchDialog<CustomerModal>
 *   open={open}
 *   onOpenChange={setOpen}
 *   onSelect={(customer) => handleSelect(customer)}
 *   title="거래처 검색"
 *   placeholder="거래처 코드 또는 거래처명"
 *   columns={customerColumns}
 *   fetchFn={customerApi.getModalCustomers}
 *   queryKey="customers-modal"
 * />
 *
 * @example
 * // 다중 선택 (품목)
 * <SearchDialog<ItemModal>
 *   open={open}
 *   onOpenChange={setOpen}
 *   onSelect={(items) => handleSelect(items as ItemModal[])}
 *   title="품목 검색"
 *   placeholder="품목 코드 또는 품목명"
 *   columns={itemColumns}
 *   fetchFn={itemApi.getModalItems}
 *   queryKey="items-modal"
 *   multiSelect
 *   maxWidth="max-w-4xl"
 * />
 */
export function SearchDialog<T extends { id: number | string }>({
  open,
  onOpenChange,
  onSelect,
  title,
  description,
  placeholder = '검색어를 입력하세요',
  columns,
  fetchFn,
  queryKey,
  multiSelect = false,
  maxWidth = 'max-w-3xl',
}: SearchDialogProps<T>) {
  const gridRef = useRef<DataGridRef>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<T | null>(null);
  const [hasCheckedRows, setHasCheckedRows] = useState(false);

  // 데이터 조회
  const { data: items = [] } = useQuery({
    queryKey: [queryKey, searchQuery],
    queryFn: async () => {
      if (gridRef.current?.gridView) {
        gridRef.current.gridView.showLoading();
      }
      const result = await fetchFn(searchQuery);
      if (gridRef.current?.gridView) {
        gridRef.current.gridView.closeLoading();
      }
      return result;
    },
    retry: false,
  });

  // 검색 실행
  const handleSearch = useCallback(() => {
    setSearchQuery(searchKeyword);
  }, [searchKeyword]);

  // Enter 키 처리
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  }, [handleSearch]);

  // 행 클릭
  const handleRowClick = useCallback((rowData: T) => {
    setSelectedItem(rowData);
  }, []);

  // 행 더블클릭 - 즉시 선택
  const handleRowDoubleClick = useCallback((rowData: T) => {
    onSelect(multiSelect ? [rowData] : rowData);
    handleClose();
  }, [onSelect, multiSelect]);

  // 체크 변경 (다중 선택 시)
  const handleItemChecked = useCallback(() => {
    const checkedRows = gridRef.current?.getCheckedRows() || [];
    setHasCheckedRows(checkedRows.length > 0);
  }, []);

  // 선택 버튼 클릭
  const handleSelect = useCallback(() => {
    if (multiSelect) {
      // 다중 선택: 체크된 행 우선, 없으면 클릭된 행
      const checkedRows = gridRef.current?.getCheckedRows() || [];
      const itemsToSelect = checkedRows.length > 0 ? checkedRows : (selectedItem ? [selectedItem] : []);
      if (itemsToSelect.length > 0) {
        onSelect(itemsToSelect);
        handleClose();
      }
    } else {
      // 단일 선택
      if (selectedItem) {
        onSelect(selectedItem);
        handleClose();
      }
    }
  }, [multiSelect, selectedItem, onSelect]);

  // 다이얼로그 닫기 및 상태 초기화
  const handleClose = useCallback(() => {
    onOpenChange(false);
    setSearchKeyword('');
    setSearchQuery('');
    setSelectedItem(null);
    setHasCheckedRows(false);
  }, [onOpenChange]);

  // 선택 버튼 활성화 여부
  const isSelectDisabled = multiSelect
    ? (!hasCheckedRows && !selectedItem)
    : !selectedItem;

  // 안내 텍스트
  const helperText = multiSelect
    ? `총 ${items.length}개 | 체크 또는 더블클릭하여 선택`
    : `총 ${items.length}개 | 더블클릭하여 선택`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`${maxWidth} max-h-[90vh] flex flex-col p-0 overflow-hidden`}>
        {/* 헤더 */}
        <div className="px-6 pt-6 flex-shrink-0">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
        </div>

        {/* 본문 */}
        <div className="flex-1 flex flex-col px-6 py-4 min-h-0 overflow-hidden">
          {/* 검색 입력 */}
          <div className="flex gap-2 mb-4 flex-shrink-0">
            <Input
              placeholder={placeholder}
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button onClick={handleSearch}>
              <Search className="h-4 w-4 mr-2" />
              검색
            </Button>
          </div>

          {/* 그리드 */}
          <div className="flex-1 border rounded-md overflow-hidden min-h-0">
            {open && (
              <DataGrid
                ref={gridRef}
                columns={columns}
                data={items}
                className="h-full"
                showToolbar={false}
                onRowClick={handleRowClick}
                onRowDoubleClick={handleRowDoubleClick}
                onItemChecked={multiSelect ? handleItemChecked : undefined}
                options={{
                  stateBar: { visible: false },
                  checkBar: { visible: multiSelect },
                  edit: { editable: false },
                }}
              />
            )}
          </div>

          {/* 안내 텍스트 */}
          <div className="text-sm text-muted-foreground mt-2 flex-shrink-0">
            {helperText}
          </div>
        </div>

        {/* 푸터 */}
        <div className="px-6 pb-6 flex-shrink-0">
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              취소
            </Button>
            <Button type="button" onClick={handleSelect} disabled={isSelectDisabled}>
              선택
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
