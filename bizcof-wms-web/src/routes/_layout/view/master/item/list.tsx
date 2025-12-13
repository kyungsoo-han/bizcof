import { createFileRoute } from '@tanstack/react-router';
import { useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataGrid, type DataGridRef } from '@/components/common/DataGrid';
import { SearchForm, type SearchField } from '@/components/common/SearchForm';
import { col, hiddenCol, numCol, dateCol } from '@/lib/grid-helpers';
import { itemApi, type ItemSearchRequest, type Item } from '@/services/api/item';
import { ItemFormDialog } from '@/components/master/ItemFormDialog';
import { Plus, Pencil, Trash2, Download } from 'lucide-react';

export const Route = createFileRoute('/_layout/view/master/item/list')({
  component: ItemList,
});

function ItemList() {
  const gridRef = useRef<DataGridRef>(null);
  const [searchParams, setSearchParams] = useState<ItemSearchRequest>({});

  // 검색 필드 정의
  const searchFields: SearchField[] = [
    { name: 'code', label: '품목코드', type: 'text', placeholder: '품목코드 입력' },
    { name: 'name', label: '품목명', type: 'text', placeholder: '품목명 입력' },
    { name: 'customerId', label: '거래처 ID', type: 'text', placeholder: '거래처 ID 입력' },
    { name: 'useYn', label: '사용여부', type: 'select', options: [
      { value: 'ALL', label: '전체' },
      { value: 'Y', label: '사용' },
      { value: 'N', label: '미사용' },
    ]},
  ];

  // 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedItem, setSelectedItem] = useState<Item | undefined>();

  // 품목 목록 조회
  const { data: items = [], isLoading } = useQuery({
    queryKey: ['items', searchParams],
    queryFn: () => itemApi.getItemList(searchParams),
  });

  // 그리드 컬럼 정의
  const columns = [
    hiddenCol('id'),
    col('code', '품목코드', 100),
    col('name', '품목명', 140, { align: 'left' }),
    col('sname', '약칭', 120),
    col('ename', '영문 명칭', 120),
    col('type', '타입', 80),
    col('spec', '규격', 120),
    col('skuUnitCode', 'SKU 단위', 60),
    col('inventoryUnitCode', 'IU 단위', 60),
    numCol('skuPerIuQty', 'SKU당 IU수량', 80),
    numCol('boxPerSkuQty', 'BOX당 수량', 80),
    numCol('pltPerSkuQty', 'PLT당 수량', 80),
    hiddenCol('customerId'),
    col('customerCode', '거래처 코드', 100),
    col('customerName', '거래처 명', 200, { align: 'left' }),
    col('category', '카테고리', 120),
    numCol('price', '단가', 60),
    col('useYn', '사용여부', 60),
    col('barcode', '바코드', 120),
    numCol('width', '가로', 60),
    numCol('height', '높이', 60),
    numCol('depth', '깊이', 60),
    numCol('weight', '무게', 60),
    col('description', '설명', 200, { align: 'left' }),
    col('memo', '메모', 200, { align: 'left' }),
    dateCol('createdDt', '등록일'),
    dateCol('modifiedDt', '수정일'),
  ];

  // 검색 실행
  const handleSearch = (params: Record<string, string>) => {
    const searchReq: ItemSearchRequest = {};
    if (params.code) searchReq.code = params.code;
    if (params.name) searchReq.name = params.name;
    if (params.customerId) searchReq.customerId = Number(params.customerId);
    if (params.useYn) searchReq.useYn = params.useYn;
    setSearchParams(searchReq);
  };

  // 신규 품목 등록
  const handleNewItem = () => {
    setModalMode('create');
    setSelectedItem(undefined);
    setIsModalOpen(true);
  };

  // 품목 수정
  const handleEditItem = () => {
    const checkedRows = gridRef.current?.getCheckedRows() || [];

    if (checkedRows.length === 0) {
      alert('수정할 품목을 선택해주세요.');
      return;
    }

    if (checkedRows.length > 1) {
      alert('품목은 하나만 선택해주세요.');
      return;
    }

    setModalMode('edit');
    setSelectedItem(checkedRows[0] as Item);
    setIsModalOpen(true);
  };

  // 모달 닫기
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedItem(undefined);
  };

  // 품목 삭제
  const handleDeleteItem = () => {
    const checkedRows = gridRef.current?.getCheckedRows() || [];

    if (checkedRows.length === 0) {
      alert('삭제할 품목을 선택해주세요.');
      return;
    }

    if (confirm(`${checkedRows.length}개의 품목을 삭제하시겠습니까?`)) {
      // TODO: 실제 삭제 API 호출
      console.log('삭제할 품목:', checkedRows);
      alert('품목 삭제 기능은 다음 단계에서 구현됩니다.');
    }
  };

  // Excel 내보내기
  const handleExport = () => {
    gridRef.current?.exportToExcel('item-list.xlsx');
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
              <CardTitle>품목 목록 (총 {items.length}개)</CardTitle>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleNewItem} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                신규 등록
              </Button>
              <Button onClick={handleEditItem} variant="outline" size="sm">
                <Pencil className="h-4 w-4 mr-2" />
                수정
              </Button>
              <Button onClick={handleDeleteItem} variant="destructive" size="sm">
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
          <DataGrid
            ref={gridRef}
            columns={columns}
            data={items}
            className="h-[600px]"
          />
        </CardContent>
      </Card>

      {isLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg shadow-lg">
            <p className="text-lg">로딩 중...</p>
          </div>
        </div>
      )}

      {/* 품목 등록/수정 다이얼로그 */}
      <ItemFormDialog
        open={isModalOpen}
        onOpenChange={(open) => !open && handleCloseModal()}
        mode={modalMode}
        initialData={selectedItem}
      />
    </div>
  );
}
