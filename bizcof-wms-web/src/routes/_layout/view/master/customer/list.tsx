import { createFileRoute } from '@tanstack/react-router';
import { useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataGrid, type DataGridRef } from '@/components/common/DataGrid';
import { SearchForm, type SearchField } from '@/components/common/SearchForm';
import { col, hiddenCol, dateCol } from '@/lib/grid-helpers';
import { customerApi, type CustomerSearchRequest, type Customer } from '@/services/api/customer';
import { CustomerFormDialog } from '@/components/master/CustomerFormDialog';
import { Plus, Pencil, Trash2, Download } from 'lucide-react';

export const Route = createFileRoute('/_layout/view/master/customer/list')({
  component: CustomerList,
});

function CustomerList() {
  const queryClient = useQueryClient();
  const gridRef = useRef<DataGridRef>(null);
  const [searchParams, setSearchParams] = useState<CustomerSearchRequest>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | undefined>();

  // 검색 필드 정의
  const searchFields: SearchField[] = [
    { name: 'code', label: '거래처코드', type: 'text', placeholder: '거래처코드 입력' },
    { name: 'name', label: '거래처명', type: 'text', placeholder: '거래처명 입력' },
    { name: 'useYn', label: '사용여부', type: 'select', options: [
      { value: 'ALL', label: '전체' },
      { value: 'Y', label: '사용' },
      { value: 'N', label: '미사용' },
    ]},
  ];

  // 거래처 목록 조회
  const { data: customers = [], isLoading, error } = useQuery({
    queryKey: ['customers', searchParams],
    queryFn: () => customerApi.getCustomerList(searchParams),
    retry: false,
    throwOnError: false,
  });

  // 그리드 컬럼 정의
  const columns = [
    hiddenCol('id'),
    col('code', '거래처코드', 120),
    col('name', '거래처명', 200, { align: 'left' }),
    col('businessNumber', '사업자번호', 120),
    col('representative', '대표자명', 100),
    col('address', '주소', 250, { align: 'left' }),
    col('addressDetail', '상세주소', 200, { align: 'left' }),
    col('tel', '전화번호', 120),
    col('fax', '팩스번호', 120),
    col('email', '이메일', 150),
    col('manager', '담당자', 100),
    col('managerTel', '담당자 연락처', 120),
    col('description', '설명', 200, { align: 'left' }),
    col('useYn', '사용여부', 60),
    dateCol('createdDt', '등록일'),
    dateCol('modifiedDt', '수정일'),
  ];

  // 검색 실행
  const handleSearch = (params: Record<string, string>) => {
    setSearchParams(params as CustomerSearchRequest);
  };

  // Excel 내보내기
  const handleExport = () => {
    gridRef.current?.exportToExcel('customer-list.xlsx');
  };

  // 삭제 mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => customerApi.deleteCustomer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      alert('거래처가 삭제되었습니다.');
    },
    onError: (error: any) => {
      alert(`거래처 삭제 실패: ${error.message || '알 수 없는 오류'}`);
    },
  });

  // 신규 거래처 등록
  const handleNewCustomer = () => {
    setModalMode('create');
    setSelectedCustomer(undefined);
    setIsModalOpen(true);
  };

  // 거래처 수정
  const handleEditCustomer = () => {
    const checkedRows = gridRef.current?.getCheckedRows() || [];

    if (checkedRows.length === 0) {
      alert('수정할 거래처를 선택해주세요.');
      return;
    }

    if (checkedRows.length > 1) {
      alert('거래처는 하나만 선택해주세요.');
      return;
    }

    setModalMode('edit');
    setSelectedCustomer(checkedRows[0] as Customer);
    setIsModalOpen(true);
  };

  // 거래처 삭제
  const handleDeleteCustomer = () => {
    const checkedRows = gridRef.current?.getCheckedRows() || [];

    if (checkedRows.length === 0) {
      alert('삭제할 거래처를 선택해주세요.');
      return;
    }

    if (confirm(`${checkedRows.length}개의 거래처를 삭제하시겠습니까?`)) {
      checkedRows.forEach((row: any) => {
        deleteMutation.mutate(row.id);
      });
    }
  };

  // 모달 닫기
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCustomer(undefined);
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
              <CardTitle>거래처 목록 (총 {customers?.length || 0}개)</CardTitle>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleNewCustomer}>
                <Plus className="h-4 w-4 mr-2" />
                신규 등록
              </Button>
              <Button variant="outline" size="sm" onClick={handleEditCustomer}>
                <Pencil className="h-4 w-4 mr-2" />
                수정
              </Button>
              <Button variant="destructive" size="sm" onClick={handleDeleteCustomer}>
                <Trash2 className="h-4 w-4 mr-2" />
                삭제
              </Button>
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
              data={customers || []}
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

      {/* 거래처 등록/수정 다이얼로그 */}
      <CustomerFormDialog
        open={isModalOpen}
        onOpenChange={(open) => !open && handleCloseModal()}
        mode={modalMode}
        initialData={selectedCustomer}
      />
    </div>
  );
}
