import { createFileRoute } from '@tanstack/react-router';
import { useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataGrid, type DataGridRef } from '@/components/common/DataGrid';
import { SearchForm, type SearchField } from '@/components/common/SearchForm';
import { col, hiddenCol, numCol, dateCol } from '@/lib/grid-helpers';
import { orderApi, type OrderSearchRequest, type Order, type OrderDetail } from '@/services/api/order';
import { OrderFormDialog } from '@/components/order/OrderFormDialog';
import { Plus, Pencil, CheckCircle, Trash2, Download } from 'lucide-react';
import { format, subDays } from 'date-fns';

// 기본 날짜 범위 (최근 7일)
const getDefaultDateRange = () => {
  const endDate = new Date();
  const startDate = subDays(endDate, 6);
  return {
    startDate: format(startDate, 'yyyy-MM-dd'),
    endDate: format(endDate, 'yyyy-MM-dd'),
  };
};

export const Route = createFileRoute('/_layout/view/order/manage')({
  component: OrderManage,
});

function OrderManage() {
  const queryClient = useQueryClient();
  const masterGridRef = useRef<DataGridRef>(null);
  const detailGridRef = useRef<DataGridRef>(null);
  const [searchParams, setSearchParams] = useState<OrderSearchRequest>(getDefaultDateRange());
  const [selectedOrderNo, setSelectedOrderNo] = useState<string | null>(null);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [editOrderNo, setEditOrderNo] = useState<string | undefined>(undefined);

  // 삭제 mutation
  const deleteMutation = useMutation({
    mutationFn: (orderNo: string) => orderApi.deleteOrder(orderNo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setSelectedOrderNo(null);
      alert('주문이 삭제되었습니다.');
    },
    onError: (error) => {
      console.error('주문 삭제 실패:', error);
      alert('주문 삭제에 실패했습니다.');
    },
  });

  // 확정 mutation
  const confirmMutation = useMutation({
    mutationFn: (orderNo: string) => orderApi.confirmOrder(orderNo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      alert('주문이 확정되었습니다.');
    },
    onError: (error) => {
      console.error('주문 확정 실패:', error);
      alert('주문 확정에 실패했습니다.');
    },
  });

  // 검색 필드 정의
  const searchFields: SearchField[] = [
    { name: 'dateRange', label: '주문 일자', type: 'dateRange' },
    { name: 'orderNo', label: '주문 번호', type: 'text', placeholder: '주문 번호 입력' },
    { name: 'customerCode', label: '거래처 코드', type: 'text', placeholder: '거래처 코드 입력' },
    { name: 'customerName', label: '거래처 명', type: 'text', placeholder: '거래처 명 입력' },
  ];

  // 주문 목록 조회
  const { data: orders = [], isLoading: isLoadingMaster, error: errorMaster, refetch: refetchOrders } = useQuery({
    queryKey: ['orders', searchParams],
    queryFn: () => orderApi.getOrderList(searchParams),
    retry: false,
    throwOnError: false,
  });

  // 주문 상세 조회
  const { data: orderDetails = [], isLoading: isLoadingDetail, error: errorDetail } = useQuery({
    queryKey: ['orderDetails', selectedOrderNo],
    queryFn: () => orderApi.getOrderDetails(selectedOrderNo!),
    enabled: !!selectedOrderNo,
    retry: false,
    throwOnError: false,
  });

  // 마스터 그리드 컬럼 정의
  const masterColumns = [
    col('orderNo', '주문 번호', 140),
    dateCol('orderDate', '주문 일자'),
    dateCol('deliveryDate', '배송 일자'),
    dateCol('dueDate', '요청 납기일'),
    hiddenCol('customerId'),
    col('customerName', '고객 이름', 150),
    col('customerName2', '고객 이름2', 150),
    col('deliveryAddress', '배송지 주소', 200, { align: 'left' }),
    col('phoneNbr', '연락처', 120),
    col('memo', '메모', 200, { align: 'left' }),
    col('customerMemo', '고객 요청사항', 200, { align: 'left' }),
    col('orderStatus', '주문 상태', 100),
  ];

  // 상세 그리드 컬럼 정의
  const detailColumns = [
    hiddenCol('orderId'),
    hiddenCol('itemId'),
    col('itemCode', '품목 코드', 100),
    col('itemName', '품목명', 200, { align: 'left' }),
    numCol('orderQty', '주문 수량', 100),
    col('subMemo', '상세 메모', 250, { align: 'left' }),
  ];

  // 검색 실행
  const handleSearch = (params: Record<string, string>) => {
    setSearchParams(params as OrderSearchRequest);
    setTimeout(() => refetchOrders(), 0);
  };

  // 검색 초기화
  const handleReset = () => {
    setSearchParams(getDefaultDateRange());
    setSelectedOrderNo(null);
  };

  // Excel 내보내기 - 마스터
  const handleExportMaster = () => {
    masterGridRef.current?.exportToExcel('order-list.xlsx');
  };

  // Excel 내보내기 - 상세
  const handleExportDetail = () => {
    detailGridRef.current?.exportToExcel('order-detail-list.xlsx');
  };

  // 마스터 그리드 row 선택 시
  const handleMasterRowClick = (rowData: Order) => {
    setSelectedOrderNo(rowData.orderNo);
  };

  return (
    <div className="space-y-4">
      {/* 검색 영역 */}
      <SearchForm
        fields={searchFields}
        onSearch={handleSearch}
        onReset={handleReset}
      />

      {/* 마스터 그리드 영역 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>주문 목록 (총 {orders?.length || 0}개)</CardTitle>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => {
                  setEditOrderNo(undefined);
                  setIsFormDialogOpen(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                주문 등록
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!selectedOrderNo}
                onClick={() => {
                  if (selectedOrderNo) {
                    setEditOrderNo(selectedOrderNo);
                    setIsFormDialogOpen(true);
                  }
                }}
              >
                <Pencil className="h-4 w-4 mr-2" />
                주문 수정
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={!selectedOrderNo}
                onClick={() => {
                  if (selectedOrderNo && confirm('주문을 확정하시겠습니까?')) {
                    confirmMutation.mutate(selectedOrderNo);
                  }
                }}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                주문 확정
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={!selectedOrderNo}
                onClick={() => {
                  if (selectedOrderNo && confirm('정말 삭제하시겠습니까?')) {
                    deleteMutation.mutate(selectedOrderNo);
                  }
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                주문 삭제
              </Button>
              <Button onClick={handleExportMaster} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Excel
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {errorMaster ? (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              백엔드 API가 구현되지 않았습니다
            </div>
          ) : (
            <DataGrid
              ref={masterGridRef}
              columns={masterColumns}
              data={orders || []}
              className="h-[500px]"
              onRowClick={handleMasterRowClick}
            />
          )}
        </CardContent>
      </Card>

      {/* 상세 그리드 영역 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>주문 상세 목록 (총 {orderDetails?.length || 0}개)</CardTitle>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleExportDetail} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Excel
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {errorDetail ? (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              백엔드 API가 구현되지 않았습니다
            </div>
          ) : selectedOrderNo ? (
            <DataGrid
              ref={detailGridRef}
              columns={detailColumns}
              data={orderDetails || []}
              className="h-[300px]"
            />
          ) : (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              주문 건을 선택하세요
            </div>
          )}
        </CardContent>
      </Card>

      {(isLoadingMaster || isLoadingDetail) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg shadow-lg">
            <p className="text-lg">로딩 중...</p>
          </div>
        </div>
      )}

      <OrderFormDialog
        open={isFormDialogOpen}
        onOpenChange={setIsFormDialogOpen}
        orderNo={editOrderNo}
      />
    </div>
  );
}
