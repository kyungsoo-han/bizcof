import { createFileRoute } from '@tanstack/react-router';
import { useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataGrid, type DataGridRef } from '@/components/common/DataGrid';
import { SearchForm, type SearchField } from '@/components/common/SearchForm';
import { col, hiddenCol, numCol, dateCol } from '@/lib/grid-helpers';
import { menuApi, type MenuSearchRequest, type MenuItem } from '@/services/api/menu';
import { MenuFormDialog } from '@/components/system/MenuFormDialog';
import { Plus, Pencil, Trash2, Download } from 'lucide-react';

export const Route = createFileRoute('/_layout/view/system/menu')({
  component: MenuManage,
});

function MenuManage() {
  const queryClient = useQueryClient();
  const gridRef = useRef<DataGridRef>(null);
  const [searchParams, setSearchParams] = useState<MenuSearchRequest>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedMenu, setSelectedMenu] = useState<MenuItem | undefined>();

  // 검색 필드 정의
  const searchFields: SearchField[] = [
    { name: 'menuCd', label: '메뉴코드', type: 'text', placeholder: '메뉴코드 입력' },
    { name: 'menuNm', label: '메뉴명', type: 'text', placeholder: '메뉴명 입력' },
    { name: 'useYn', label: '사용여부', type: 'select', options: [
      { value: 'ALL', label: '전체' },
      { value: 'Y', label: '사용' },
      { value: 'N', label: '미사용' },
    ]},
  ];

  // 메뉴 목록 조회 (flat)
  const { data: menus = [], isLoading, error } = useQuery({
    queryKey: ['menus-flat', searchParams],
    queryFn: () => menuApi.getMenuListFlat(searchParams),
    retry: false,
    throwOnError: false,
  });

  // 그리드 컬럼 정의
  const columns = [
    col('menuCd', '메뉴코드', 120),
    col('menuNm', '메뉴명', 200, { align: 'left' }),
    col('menuLocation', 'URL', 200, { align: 'left' }),
    col('parentCd', '상위메뉴', 120),
    numCol('level', '레벨', 60),
    numCol('sortOrder', '정렬순서', 80),
    col('icon', '아이콘', 150),
    col('parentYn', '부모여부', 80),
    col('useYn', '사용여부', 80),
    dateCol('createdDt', '등록일'),
    dateCol('modifiedDt', '수정일'),
  ];

  // 검색 실행
  const handleSearch = (params: Record<string, string>) => {
    setSearchParams(params as MenuSearchRequest);
  };

  // Excel 내보내기
  const handleExport = () => {
    gridRef.current?.exportToExcel('menu-list.xlsx');
  };

  // 삭제 mutation
  const deleteMutation = useMutation({
    mutationFn: (menuCd: string) => menuApi.deleteMenu(menuCd),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menus-flat'] });
      queryClient.invalidateQueries({ queryKey: ['menu-list'] });
      alert('메뉴가 삭제되었습니다.');
    },
    onError: (error: any) => {
      alert(`메뉴 삭제 실패: ${error.message || '알 수 없는 오류'}`);
    },
  });

  // 신규 메뉴 등록
  const handleNewMenu = () => {
    setModalMode('create');
    setSelectedMenu(undefined);
    setIsModalOpen(true);
  };

  // 메뉴 수정
  const handleEditMenu = () => {
    const checkedRows = gridRef.current?.getCheckedRows() || [];

    if (checkedRows.length === 0) {
      alert('수정할 메뉴를 선택해주세요.');
      return;
    }

    if (checkedRows.length > 1) {
      alert('메뉴는 하나만 선택해주세요.');
      return;
    }

    setModalMode('edit');
    setSelectedMenu(checkedRows[0] as MenuItem);
    setIsModalOpen(true);
  };

  // 메뉴 삭제
  const handleDeleteMenu = () => {
    const checkedRows = gridRef.current?.getCheckedRows() || [];

    if (checkedRows.length === 0) {
      alert('삭제할 메뉴를 선택해주세요.');
      return;
    }

    if (confirm(`${checkedRows.length}개의 메뉴를 삭제하시겠습니까?`)) {
      checkedRows.forEach((row: any) => {
        deleteMutation.mutate(row.menuCd);
      });
    }
  };

  // 모달 닫기
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMenu(undefined);
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
              <CardTitle>메뉴 목록 (총 {menus?.length || 0}개)</CardTitle>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleNewMenu}>
                <Plus className="h-4 w-4 mr-2" />
                신규 등록
              </Button>
              <Button variant="outline" size="sm" onClick={handleEditMenu}>
                <Pencil className="h-4 w-4 mr-2" />
                수정
              </Button>
              <Button variant="destructive" size="sm" onClick={handleDeleteMenu}>
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
              data={menus || []}
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

      {/* 메뉴 등록/수정 다이얼로그 */}
      <MenuFormDialog
        open={isModalOpen}
        onOpenChange={(open) => !open && handleCloseModal()}
        mode={modalMode}
        initialData={selectedMenu}
      />
    </div>
  );
}
