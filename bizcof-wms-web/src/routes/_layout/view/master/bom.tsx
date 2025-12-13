import { createFileRoute } from '@tanstack/react-router';
import { useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataGrid, type DataGridRef } from '@/components/common/DataGrid';
import { TreeGrid, type TreeGridRef } from '@/components/common/TreeGrid';
import { SearchForm, type SearchField } from '@/components/common/SearchForm';
import { col, hiddenCol, numCol } from '@/lib/grid-helpers';
import { bomApi, type BomTreeResponse } from '@/services/api/bom';
import { itemApi, type Item, type ItemSearchRequest } from '@/services/api/item';
import { Download, ChevronDown, ChevronRight } from 'lucide-react';

export const Route = createFileRoute('/_layout/view/master/bom')({
  component: BomManage,
});

function BomManage() {
  const masterGridRef = useRef<DataGridRef>(null);
  const detailTreeRef = useRef<TreeGridRef>(null);
  const [searchParams, setSearchParams] = useState<ItemSearchRequest>({});
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [selectedItemName, setSelectedItemName] = useState<string>('');

  // 검색 필드 정의
  const searchFields: SearchField[] = [
    { name: 'code', label: '품목코드', type: 'text', placeholder: '품목코드 입력' },
    { name: 'name', label: '품목명', type: 'text', placeholder: '품목명 입력' },
    { name: 'useYn', label: '사용여부', type: 'select', options: [
      { value: 'ALL', label: '전체' },
      { value: 'Y', label: '사용' },
      { value: 'N', label: '미사용' },
    ]},
  ];

  // 품목 목록 조회
  const { data: items = [], isLoading: isLoadingMaster, error: errorMaster } = useQuery({
    queryKey: ['items', searchParams],
    queryFn: () => itemApi.getItemList(searchParams),
    retry: false,
    throwOnError: false,
  });

  // BOM 트리 조회
  const { data: bomTree = [], isLoading: isLoadingDetail, error: errorDetail } = useQuery({
    queryKey: ['bomTree', selectedItemId],
    queryFn: () => bomApi.getBomTree(selectedItemId!),
    enabled: !!selectedItemId,
    retry: false,
    throwOnError: false,
  });

  // 마스터 그리드 컬럼 정의
  const masterColumns = [
    hiddenCol('id'),
    col('code', '품목코드', 100),
    col('name', '품목명', 180, { align: 'left' }),
    col('spec', '규격', 100, { align: 'left' }),
    col('customerName', '거래처', 120, { align: 'left' }),
    col('useYn', '사용', 50),
  ];

  // 트리 그리드 컬럼 정의
  const treeColumns = [
    hiddenCol('treeId'),
    hiddenCol('parentTreeId'),
    hiddenCol('bomId'),
    hiddenCol('childItemId'),
    col('itemCode', '품목코드', 150),
    col('itemName', '품목명', 200, { align: 'left' }),
    col('spec', '규격', 120, { align: 'left' }),
    numCol('requiredQty', '소요량', 80),
    col('unit', '단위', 60),
  ];

  // 검색 실행
  const handleSearch = (params: Record<string, string>) => {
    const searchReq: ItemSearchRequest = {};
    if (params.code) searchReq.code = params.code;
    if (params.name) searchReq.name = params.name;
    if (params.useYn && params.useYn !== 'ALL') searchReq.useYn = params.useYn;
    setSearchParams(searchReq);
  };

  // 검색 초기화
  const handleReset = () => {
    setSelectedItemId(null);
    setSelectedItemName('');
  };

  // Excel 내보내기 - 마스터
  const handleExportMaster = () => {
    masterGridRef.current?.exportToExcel('item-list.xlsx');
  };

  // Excel 내보내기 - 트리
  const handleExportTree = () => {
    detailTreeRef.current?.exportToExcel('bom-tree.xlsx');
  };

  // 마스터 그리드 row 선택 시
  const handleMasterRowClick = (rowData: Item) => {
    setSelectedItemId(rowData.id);
    setSelectedItemName(rowData.name);
  };

  // 트리 전체 펼치기
  const handleExpandAll = () => {
    detailTreeRef.current?.expandAll();
  };

  // 트리 전체 접기
  const handleCollapseAll = () => {
    detailTreeRef.current?.collapseAll();
  };

  return (
    <div className="space-y-4">
      {/* 검색 영역 */}
      <SearchForm
        fields={searchFields}
        onSearch={handleSearch}
        onReset={handleReset}
      />

      {/* 좌우 레이아웃 */}
      <div className="flex gap-4">
        {/* 왼쪽: 품목 목록 */}
        <Card className="w-1/3 flex-shrink-0">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">품목 목록 ({items?.length || 0})</CardTitle>
              <Button onClick={handleExportMaster} variant="outline" size="sm">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {errorMaster ? (
              <div className="flex items-center justify-center h-[500px] text-muted-foreground text-sm">
                데이터를 불러오는 중 오류가 발생했습니다
              </div>
            ) : (
              <DataGrid
                ref={masterGridRef}
                columns={masterColumns}
                data={items || []}
                className="h-[500px]"
                onRowClick={handleMasterRowClick}
              />
            )}
          </CardContent>
        </Card>

        {/* 오른쪽: BOM 트리 */}
        <Card className="flex-1">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                재료 구성
                {selectedItemName && <span className="text-muted-foreground ml-2 font-normal">- {selectedItemName}</span>}
              </CardTitle>
              <div className="flex gap-1">
                <Button onClick={handleExpandAll} variant="outline" size="sm" disabled={!selectedItemId || bomTree.length === 0}>
                  <ChevronDown className="h-4 w-4" />
                </Button>
                <Button onClick={handleCollapseAll} variant="outline" size="sm" disabled={!selectedItemId || bomTree.length === 0}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button onClick={handleExportTree} variant="outline" size="sm" disabled={bomTree.length === 0}>
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {errorDetail ? (
              <div className="flex items-center justify-center h-[500px] text-muted-foreground text-sm">
                BOM 데이터를 불러오는 중 오류가 발생했습니다
              </div>
            ) : selectedItemId ? (
              bomTree.length > 0 ? (
                <TreeGrid
                  ref={detailTreeRef}
                  columns={treeColumns}
                  data={bomTree || []}
                  className="h-[500px]"
                  treeField="treeId"
                  parentField="parentTreeId"
                />
              ) : (
                <div className="flex items-center justify-center h-[500px] text-muted-foreground text-sm">
                  등록된 BOM이 없습니다
                </div>
              )
            ) : (
              <div className="flex items-center justify-center h-[500px] text-muted-foreground text-sm">
                품목을 선택하세요
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {(isLoadingMaster || isLoadingDetail) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg shadow-lg">
            <p className="text-lg">로딩 중...</p>
          </div>
        </div>
      )}
    </div>
  );
}
