import { createFileRoute } from '@tanstack/react-router';
import { useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataGrid, type DataGridRef } from '@/components/common/DataGrid';
import { SearchForm, type SearchField } from '@/components/common/SearchForm';
import { col, hiddenCol, numCol, dateCol } from '@/lib/grid-helpers';
import { inboundApi, type InboundSearchRequest, type Inbound } from '@/services/api/inbound';
import { InboundFormDialog } from '@/components/inbound/InboundFormDialog';
import { Plus, Pencil, Trash2 } from 'lucide-react';

export const Route = createFileRoute('/_layout/view/inbound/manage')({
  component: InboundManage,
});

function InboundManage() {
  const queryClient = useQueryClient();
  const masterGridRef = useRef<DataGridRef>(null);
  const detailGridRef = useRef<DataGridRef>(null);
  const [searchParams, setSearchParams] = useState<InboundSearchRequest>({});
  const [selectedInboundNo, setSelectedInboundNo] = useState<string | null>(null);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [editInboundNo, setEditInboundNo] = useState<string | undefined>(undefined);

  // 삭제 mutation
  const deleteMutation = useMutation({
    mutationFn: (inboundNo: string) => inboundApi.deleteInbound(inboundNo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inbounds'] });
      setSelectedInboundNo(null);
      alert('입고가 삭제되었습니다.');
    },
    onError: (error) => {
      console.error('입고 삭제 실패:', error);
      alert('입고 삭제에 실패했습니다.');
    },
  });

  // 검색 필드 정의
  const searchFields: SearchField[] = [
    { name: 'dateRange', label: '입고 일자', type: 'dateRange' },
    { name: 'inboundNo', label: '입고 번호', type: 'text', placeholder: '입고 번호 입력' },
    { name: 'customerCode', label: '거래처 코드', type: 'text', placeholder: '거래처 코드 입력' },
    { name: 'customerName', label: '거래처 명', type: 'text', placeholder: '거래처 명 입력' },
  ];

  // 입고 목록 조회
  const { data: inbounds = [], isLoading: isLoadingMaster, error: errorMaster, refetch: refetchInbounds } = useQuery({
    queryKey: ['inbounds', searchParams],
    queryFn: () => inboundApi.getInboundList(searchParams),
    retry: false,
    throwOnError: false,
  });

  // 입고 상세 조회
  const { data: inboundDetails = [], isLoading: isLoadingDetail, error: errorDetail } = useQuery({
    queryKey: ['inboundDetails', selectedInboundNo],
    queryFn: () => inboundApi.getInboundDetails(selectedInboundNo!),
    enabled: !!selectedInboundNo,
    retry: false,
    throwOnError: false,
  });

  // 마스터 그리드 컬럼 정의
  const masterColumns = [
    col('inboundNo', '입고 번호', 125),
    dateCol('inboundDate', '입고 일자'),
    hiddenCol('inboundType'),
    col('inboundTypeName', '입고 타입', 100),
    hiddenCol('customerId'),
    hiddenCol('customerCode'),
    col('customerName', '거래처', 200, {align: 'left'}),
    col('memo', '메모', 200, {align: 'left'}),
    col('status', '상태', 80),
  ];

  // 상세 그리드 컬럼 정의
  const detailColumns = [
    hiddenCol('seqNo'),
    hiddenCol('itemId'),
    col('itemCode', '품목 코드', 100),
    col('itemName', '품목 명', 200, {align:'left'}),
    numCol('boxPerSkuQty', '박스당 수량', 100),
    numCol('boxQty', '박스 수량', 100),
    numCol('pltPerSkuQty', '팔레트당 수량', 100),
    numCol('pltQty', '팔레트 수량', 100),
    numCol('inboundQty', '입고수량', 100),
    col('locationCode', '로케이션', 150),
    dateCol('expireDate', '유통 기한'),
    col('makeNo', '제조 번호', 150),
    dateCol('makeDate', '제조 일자'),
    col('lotNo', 'LOT 번호', 150),
    col('memo', '메모', 250),
  ];

  // 검색 실행
  const handleSearch = (params: Record<string, string>) => {
    setSearchParams(params as InboundSearchRequest);
    setTimeout(() => refetchInbounds(), 0);
  };

  // 검색 초기화
  const handleReset = () => {
    setSelectedInboundNo(null);
  };

  // 마스터 그리드 row 선택 시
  const handleMasterRowClick = (rowData: Inbound) => {
    setSelectedInboundNo(rowData.inboundNo);
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
              <CardTitle>입고 목록 (총 {inbounds?.length || 0}개)</CardTitle>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditInboundNo(undefined);
                  setIsFormDialogOpen(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2 text-blue-500" />
                입고 등록
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!selectedInboundNo}
                onClick={() => {
                  if (selectedInboundNo) {
                    setEditInboundNo(selectedInboundNo);
                    setIsFormDialogOpen(true);
                  }
                }}
              >
                <Pencil className="h-4 w-4 mr-2 text-amber-500" />
                입고 수정
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!selectedInboundNo}
                onClick={() => {
                  if (selectedInboundNo && confirm('정말 삭제하시겠습니까?')) {
                    deleteMutation.mutate(selectedInboundNo);
                  }
                }}
              >
                <Trash2 className="h-4 w-4 mr-2 text-red-500" />
                입고 삭제
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
              data={inbounds || []}
              className="h-[350px]"
              onFocusedRowChanged={handleMasterRowClick}
            />
          )}
        </CardContent>
      </Card>

      {/* 상세 그리드 영역 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>입고 상세 목록 (총 {inboundDetails?.length || 0}개)</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {errorDetail ? (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              백엔드 API가 구현되지 않았습니다
            </div>
          ) : isLoadingDetail ? (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              <div className="flex flex-col items-center gap-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p>상세 정보를 불러오는 중...</p>
              </div>
            </div>
          ) : selectedInboundNo ? (
            <DataGrid
              ref={detailGridRef}
              columns={detailColumns}
              data={inboundDetails || []}
              className="h-[500px]"
            />
          ) : (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              입고 건을 선택하세요
            </div>
          )}
        </CardContent>
      </Card>

      {isLoadingMaster && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg shadow-lg">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="text-lg">페이지를 불러오는 중...</p>
            </div>
          </div>
        </div>
      )}

      <InboundFormDialog
        open={isFormDialogOpen}
        onOpenChange={setIsFormDialogOpen}
        inboundNo={editInboundNo}
      />
    </div>
  );
}
