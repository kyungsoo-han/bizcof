import { createFileRoute } from '@tanstack/react-router';
import { useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataGrid, type DataGridRef } from '@/components/common/DataGrid';
import { SearchForm, type SearchField } from '@/components/common/SearchForm';
import { col, hiddenCol, numCol, dateCol } from '@/lib/grid-helpers';
import { outboundApi, type OutboundSearchRequest, type Outbound } from '@/services/api/outbound';
import { OutboundFormDialog } from '@/components/outbound/OutboundFormDialog';
import { Plus, Pencil, Trash2, Download } from 'lucide-react';
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

export const Route = createFileRoute('/_layout/view/outbound/manage')({
  component: OutboundManage,
});

function OutboundManage() {
  const queryClient = useQueryClient();
  const masterGridRef = useRef<DataGridRef>(null);
  const detailGridRef = useRef<DataGridRef>(null);
  const [searchParams, setSearchParams] = useState<OutboundSearchRequest>(getDefaultDateRange());
  const [selectedOutboundNo, setSelectedOutboundNo] = useState<string | null>(null);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [editOutboundNo, setEditOutboundNo] = useState<string | undefined>(undefined);

  // 검색 필드 정의
  const searchFields: SearchField[] = [
    { name: 'dateRange', label: '출고 일자', type: 'dateRange' },
    { name: 'outboundNo', label: '출고 번호', type: 'text', placeholder: '출고 번호 입력' },
    { name: 'customerCode', label: '거래처 코드', type: 'text', placeholder: '거래처 코드 입력' },
    { name: 'customerName', label: '거래처 명', type: 'text', placeholder: '거래처 명 입력' },
  ];

  // 출고 목록 조회
  const { data: outbounds = [], isLoading: isLoadingMaster, error: errorMaster } = useQuery({
    queryKey: ['outbounds', searchParams],
    queryFn: () => outboundApi.getOutboundList(searchParams),
    retry: false,
    throwOnError: false,
  });

  // 출고 상세 조회
  const { data: outboundDetails = [], isLoading: isLoadingDetail, error: errorDetail } = useQuery({
    queryKey: ['outboundDetails', selectedOutboundNo],
    queryFn: () => outboundApi.getOutboundDetails(selectedOutboundNo!),
    enabled: !!selectedOutboundNo,
    retry: false,
    throwOnError: false,
  });

  // 마스터 그리드 컬럼 정의
  const masterColumns = [
    col('outboundNo', '출고 번호', 125),
    dateCol('outboundDate', '출고 일자'),
    hiddenCol('outboundType'),
    col('outboundTypeName', '출고 타입', 100),
    hiddenCol('customerId'),
    hiddenCol('customerCode'),
    col('customerName', '거래처', 200, { align: 'left' }),
    col('memo', '메모', 200, { align: 'left' }),
    col('status', '상태', 80),
  ];

  // 상세 그리드 컬럼 정의
  const detailColumns = [
    hiddenCol('seqNo'),
    hiddenCol('itemId'),
    col('itemCode', '품목 코드', 100),
    col('itemName', '품목 명', 200, { align: 'left' }),
    numCol('boxPerSkuQty', '박스당 수량', 100),
    numCol('boxQty', '박스 수량', 100),
    numCol('pltPerSkuQty', '팔레트당 수량', 100),
    numCol('pltQty', '팔레트 수량', 100),
    numCol('outboundQty', '출고수량', 100),
    col('locationCode', '로케이션', 150),
    dateCol('expireDate', '유통 기한'),
    col('makeNo', '제조 번호', 150),
    dateCol('makeDate', '제조 일자'),
    col('lotNo', 'LOT 번호', 150),
    col('memo', '메모', 250),
  ];

  // 검색 실행
  const handleSearch = (params: Record<string, string>) => {
    setSearchParams(params as OutboundSearchRequest);
  };

  // 검색 초기화
  const handleReset = () => {
    setSearchParams(getDefaultDateRange());
    setSelectedOutboundNo(null);
  };

  // Excel 내보내기 - 마스터
  const handleExportMaster = () => {
    masterGridRef.current?.exportToExcel('outbound-list.xlsx');
  };

  // Excel 내보내기 - 상세
  const handleExportDetail = () => {
    detailGridRef.current?.exportToExcel('outbound-detail-list.xlsx');
  };

  // 마스터 그리드 row 선택 시
  const handleMasterRowClick = (rowData: Outbound) => {
    setSelectedOutboundNo(rowData.outboundNo);
  };

  // 삭제 mutation
  const deleteMutation = useMutation({
    mutationFn: (outboundNo: string) => outboundApi.deleteOutbound(outboundNo),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['outbounds'] });
      setSelectedOutboundNo(null);
    },
    onError: (error) => {
      console.error('출고 삭제 실패:', error);
      alert('출고 삭제에 실패했습니다.');
    },
  });

  // 출고 등록
  const handleNewOutbound = () => {
    setEditOutboundNo(undefined);
    setIsFormDialogOpen(true);
  };

  // 출고 수정
  const handleEditOutbound = () => {
    if (!selectedOutboundNo) {
      alert('수정할 출고를 선택해주세요.');
      return;
    }
    setEditOutboundNo(selectedOutboundNo);
    setIsFormDialogOpen(true);
  };

  // 출고 삭제
  const handleDeleteOutbound = () => {
    if (!selectedOutboundNo) {
      alert('삭제할 출고를 선택해주세요.');
      return;
    }
    if (confirm('선택한 출고를 삭제하시겠습니까?')) {
      deleteMutation.mutate(selectedOutboundNo);
    }
  };

  // 다이얼로그 닫기
  const handleCloseDialog = (open: boolean) => {
    setIsFormDialogOpen(open);
    if (!open) {
      setEditOutboundNo(undefined);
    }
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
              <CardTitle>출고 목록 (총 {outbounds?.length || 0}개)</CardTitle>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleNewOutbound}>
                <Plus className="h-4 w-4 mr-2" />
                출고 등록
              </Button>
              <Button variant="outline" size="sm" onClick={handleEditOutbound}>
                <Pencil className="h-4 w-4 mr-2" />
                출고 수정
              </Button>
              <Button variant="destructive" size="sm" onClick={handleDeleteOutbound}>
                <Trash2 className="h-4 w-4 mr-2" />
                출고 삭제
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
              data={outbounds || []}
              className="h-[350px]"
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
              <CardTitle>출고 상세 목록 (총 {outboundDetails?.length || 0}개)</CardTitle>
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
          ) : selectedOutboundNo ? (
            <DataGrid
              ref={detailGridRef}
              columns={detailColumns}
              data={outboundDetails || []}
              className="h-[500px]"
            />
          ) : (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              출고 건을 선택하세요
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

      {/* 출고 등록/수정 다이얼로그 */}
      <OutboundFormDialog
        open={isFormDialogOpen}
        onOpenChange={handleCloseDialog}
        outboundNo={editOutboundNo}
      />
    </div>
  );
}
