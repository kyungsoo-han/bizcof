import { createFileRoute } from '@tanstack/react-router';
import { useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataGrid, type DataGridRef } from '@/components/common/DataGrid';
import { SearchForm, type SearchField } from '@/components/common/SearchForm';
import { col, hiddenCol, numCol, dateCol } from '@/lib/grid-helpers';
import { inventoryApi, type InventorySearchRequest } from '@/services/api/inventory';
import { Download } from 'lucide-react';

export const Route = createFileRoute('/_layout/view/inventory/list')({
  component: InventoryList,
});

function InventoryList() {
  const gridRef = useRef<DataGridRef>(null);
  const [searchParams, setSearchParams] = useState<InventorySearchRequest>({});

  // 검색 필드 정의
  const searchFields: SearchField[] = [
    { name: 'itemCode', label: '품목코드', type: 'text', placeholder: '품목코드 입력' },
    { name: 'itemName', label: '품목명', type: 'text', placeholder: '품목명 입력' },
    { name: 'customerCode', label: '거래처코드', type: 'text', placeholder: '거래처코드 입력' },
    { name: 'customerName', label: '거래처명', type: 'text', placeholder: '거래처명 입력' },
  ];

  // 재고 목록 조회
  const { data: inventories = [], isLoading, error } = useQuery({
    queryKey: ['inventories', searchParams],
    queryFn: () => inventoryApi.getInventoryList(searchParams),
    retry: false,
    throwOnError: false,
  });

  // 그리드 컬럼 정의
  const columns = [
    hiddenCol('id'),
    col('itemCode', '품목코드', 120),
    col('itemName', '품목명', 200, { align: 'left' }),
    col('customerCode', '거래처코드', 120),
    col('customerName', '거래처명', 200, { align: 'left' }),
    numCol('quantity', '재고수량', 100),
    numCol('availableQuantity', '가용수량', 100),
    numCol('reservedQuantity', '예약수량', 100),
    col('locationCode', '로케이션', 120),
    col('lotNumber', 'LOT번호', 120),
    dateCol('expiryDate', '유효기한'),
    dateCol('createdDt', '등록일'),
    dateCol('modifiedDt', '수정일'),
  ];

  // 검색 실행
  const handleSearch = (params: Record<string, string>) => {
    setSearchParams(params as InventorySearchRequest);
  };

  // Excel 내보내기
  const handleExport = () => {
    gridRef.current?.exportToExcel('inventory-list.xlsx');
  };

  return (
    <div className="space-y-4">
      {/* 검색 영역 */}
      <SearchForm
        fields={searchFields}
        onSearch={handleSearch}
      />

      {/* 그리드 영역 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>재고 목록 (총 {inventories?.length || 0}개)</CardTitle>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleExport} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Excel
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              백엔드 API가 구현되지 않았습니다
            </div>
          ) : (
            <DataGrid
              ref={gridRef}
              columns={columns}
              data={inventories || []}
              className="h-[600px]"
            />
          )}
        </CardContent>
      </Card>

      {isLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg shadow-lg">
            <p className="text-lg">로딩 중...</p>
          </div>
        </div>
      )}
    </div>
  );
}
