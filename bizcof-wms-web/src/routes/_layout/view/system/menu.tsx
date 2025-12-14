import { createFileRoute } from '@tanstack/react-router';
import { useRef, useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TreeGrid, type TreeGridRef } from '@/components/common/TreeGrid';
import { col, hiddenCol, numCol } from '@/lib/grid-helpers';
import { menuApi, type MenuItem } from '@/services/api/menu';
import { Plus, Trash2, Save, FolderTree, ChevronDown, ChevronRight } from 'lucide-react';

export const Route = createFileRoute('/_layout/view/system/menu')({
  component: MenuManage,
});

// 빈 메뉴 폼 데이터
const emptyFormData: MenuItem = {
  menuCd: '',
  menuNm: '',
  menuLocation: '',
  parentCd: '',
  sortOrder: 0,
  level: 1,
  useYn: 'Y',
  icon: '',
  parentYn: 'N',
};

function MenuManage() {
  const queryClient = useQueryClient();
  const treeGridRef = useRef<TreeGridRef>(null);
  const [selectedMenu, setSelectedMenu] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState<MenuItem>(emptyFormData);
  const [isNewMode, setIsNewMode] = useState(false);

  // 트리 그리드 컬럼 정의
  // parentCd는 트리 구조를 위해 필수 (hidden이지만 필드로 존재해야 함)
  const columns = [
    hiddenCol('parentCd'),  // 트리 구조를 위한 필수 필드
    hiddenCol('level'),
    hiddenCol('parentYn'),
    hiddenCol('icon'),
    col('menuNm', '메뉴명', 200, { align: 'left' }),
    col('menuCd', '메뉴코드', 120),
    col('menuLocation', 'URL', 180, { align: 'left' }),
    numCol('sortOrder', '정렬', 60),
    col('useYn', '사용', 50),
  ];

  // 메뉴 목록 조회
  const { data: menusData, isLoading, error } = useQuery({
    queryKey: ['menu-list'],
    queryFn: () => menuApi.getMenuList(),
    retry: false,
  });

  // snake_case를 camelCase로 변환하는 정규화 함수
  const normalizeMenuItem = (item: any): MenuItem => {
    return {
      menuCd: item.menuCd || item.menu_cd || '',
      menuNm: item.menuNm || item.menu_nm || '',
      menuLocation: item.menuLocation || item.menu_location || '',
      parentCd: item.parentCd || item.parent_cd || '',  // snake_case와 camelCase 모두 처리
      sortOrder: item.sortOrder ?? item.sort_order ?? 0,
      level: item.level ?? 1,
      useYn: item.useYn || item.use_yn || 'Y',
      icon: item.icon || '',
      parentYn: item.parentYn || item.parent_yn || 'N',
    };
  };

  // 트리 구조 데이터를 flat 배열로 변환하는 함수
  const flattenMenuTree = (items: any[], result: MenuItem[] = []): MenuItem[] => {
    for (const item of items) {
      result.push(normalizeMenuItem(item));
      const children = item.children || [];
      if (children.length > 0) {
        flattenMenuTree(children, result);
      }
    }
    return result;
  };

  // null 처리 및 필드명 정규화
  // 트리 구조로 받은 경우 flat으로 변환
  const menus = useMemo(() => {
    if (!menusData) return [];
    // 첫 번째 항목에 children이 있으면 트리 구조로 판단하고 flatten
    const hasTreeStructure = menusData.some((m: any) => m.children && m.children.length > 0);
    if (hasTreeStructure) {
      return flattenMenuTree(menusData);
    }
    return menusData.map((m: any) => normalizeMenuItem(m));
  }, [menusData]);

  // 상위 메뉴 목록 (부모 메뉴로 설정 가능한 메뉴)
  const parentMenuOptions = menus.filter(m => m.parentYn === 'Y' || !m.parentCd);

  // 저장 mutation
  const saveMutation = useMutation({
    mutationFn: (data: MenuItem) => {
      if (isNewMode) {
        return menuApi.createMenu(data);
      } else {
        return menuApi.updateMenu(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-list'] });
      alert(isNewMode ? '메뉴가 등록되었습니다.' : '메뉴가 수정되었습니다.');
      setIsNewMode(false);
    },
    onError: (error: any) => {
      alert(`저장 실패: ${error.message || '알 수 없는 오류'}`);
    },
  });

  // 삭제 mutation
  const deleteMutation = useMutation({
    mutationFn: (menuCd: string) => menuApi.deleteMenu(menuCd),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-list'] });
      alert('메뉴가 삭제되었습니다.');
      setSelectedMenu(null);
      setFormData(emptyFormData);
    },
    onError: (error: any) => {
      alert(`삭제 실패: ${error.message || '알 수 없는 오류'}`);
    },
  });

  // 트리 행 포커스 변경 시
  const handleFocusedRowChanged = (rowData: MenuItem) => {
    setSelectedMenu(rowData);
    setFormData(rowData);
    setIsNewMode(false);
  };

  // 신규 메뉴 추가
  const handleNewMenu = () => {
    setIsNewMode(true);
    setSelectedMenu(null);
    setFormData({
      ...emptyFormData,
      parentCd: selectedMenu?.menuCd || '',
      level: selectedMenu ? (selectedMenu.level || 0) + 1 : 1,
    });
  };

  // 하위 메뉴 추가
  const handleAddChildMenu = () => {
    if (!selectedMenu) {
      alert('상위 메뉴를 선택해주세요.');
      return;
    }
    setIsNewMode(true);
    setFormData({
      ...emptyFormData,
      parentCd: selectedMenu.menuCd,
      level: (selectedMenu.level || 0) + 1,
    });
  };

  // 저장
  const handleSave = () => {
    if (!formData.menuCd) {
      alert('메뉴코드를 입력해주세요.');
      return;
    }
    if (!formData.menuNm) {
      alert('메뉴명을 입력해주세요.');
      return;
    }
    saveMutation.mutate(formData);
  };

  // 삭제
  const handleDelete = () => {
    if (!selectedMenu) {
      alert('삭제할 메뉴를 선택해주세요.');
      return;
    }
    if (confirm(`"${selectedMenu.menuNm}" 메뉴를 삭제하시겠습니까?`)) {
      deleteMutation.mutate(selectedMenu.menuCd);
    }
  };

  // 폼 입력 변경
  const handleFormChange = (field: keyof MenuItem, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="flex gap-4 h-[calc(100vh-220px)]">
      {/* 왼쪽: 트리 그리드 */}
      <Card className="w-[500px] flex flex-col">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FolderTree className="h-5 w-5" />
              메뉴 트리
            </CardTitle>
            <div className="flex gap-1">
              <Button size="sm" variant="outline" onClick={() => treeGridRef.current?.expandAll()}>
                <ChevronDown className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={() => treeGridRef.current?.collapseAll()}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 pt-2">
          {error ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              메뉴 데이터를 불러올 수 없습니다
            </div>
          ) : (
            <TreeGrid
              ref={treeGridRef}
              columns={columns}
              data={menus}
              treeField="menuCd"
              parentField="parentCd"
              className="h-full"
              onFocusedRowChanged={handleFocusedRowChanged}
            />
          )}
        </CardContent>
      </Card>

      {/* 오른쪽: 상세 입력 영역 */}
      <Card className="flex-1 flex flex-col">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle>
              {isNewMode ? '메뉴 등록' : selectedMenu ? '메뉴 수정' : '메뉴 상세'}
            </CardTitle>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleNewMenu}>
                <Plus className="h-4 w-4 mr-1" />
                신규
              </Button>
              <Button size="sm" variant="outline" onClick={handleAddChildMenu} disabled={!selectedMenu}>
                <Plus className="h-4 w-4 mr-1" />
                하위 추가
              </Button>
              <Button size="sm" variant="default" onClick={handleSave} disabled={!formData.menuCd}>
                <Save className="h-4 w-4 mr-1" />
                저장
              </Button>
              <Button size="sm" variant="destructive" onClick={handleDelete} disabled={!selectedMenu || isNewMode}>
                <Trash2 className="h-4 w-4 mr-1" />
                삭제
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 pt-4">
          {(selectedMenu || isNewMode) ? (
            <div className="grid grid-cols-2 gap-4">
              {/* 메뉴코드 */}
              <div className="space-y-2">
                <Label htmlFor="menuCd">메뉴코드 *</Label>
                <Input
                  id="menuCd"
                  value={formData.menuCd}
                  onChange={(e) => handleFormChange('menuCd', e.target.value)}
                  placeholder="메뉴코드 입력"
                  disabled={!isNewMode}
                />
              </div>

              {/* 메뉴명 */}
              <div className="space-y-2">
                <Label htmlFor="menuNm">메뉴명 *</Label>
                <Input
                  id="menuNm"
                  value={formData.menuNm}
                  onChange={(e) => handleFormChange('menuNm', e.target.value)}
                  placeholder="메뉴명 입력"
                />
              </div>

              {/* 상위메뉴 */}
              <div className="space-y-2">
                <Label htmlFor="parentCd">상위메뉴</Label>
                <Select
                  value={formData.parentCd || '_none_'}
                  onValueChange={(value) => handleFormChange('parentCd', value === '_none_' ? '' : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="상위메뉴 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none_">없음 (최상위)</SelectItem>
                    {parentMenuOptions.map((menu) => (
                      <SelectItem key={menu.menuCd} value={menu.menuCd}>
                        {menu.menuNm}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* URL */}
              <div className="space-y-2">
                <Label htmlFor="menuLocation">URL</Label>
                <Input
                  id="menuLocation"
                  value={formData.menuLocation || ''}
                  onChange={(e) => handleFormChange('menuLocation', e.target.value)}
                  placeholder="/view/example/page"
                />
              </div>

              {/* 레벨 */}
              <div className="space-y-2">
                <Label htmlFor="level">레벨</Label>
                <Input
                  id="level"
                  type="number"
                  value={formData.level}
                  onChange={(e) => handleFormChange('level', parseInt(e.target.value) || 0)}
                />
              </div>

              {/* 정렬순서 */}
              <div className="space-y-2">
                <Label htmlFor="sortOrder">정렬순서</Label>
                <Input
                  id="sortOrder"
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => handleFormChange('sortOrder', parseInt(e.target.value) || 0)}
                />
              </div>

              {/* 아이콘 */}
              <div className="space-y-2">
                <Label htmlFor="icon">아이콘</Label>
                <Input
                  id="icon"
                  value={formData.icon || ''}
                  onChange={(e) => handleFormChange('icon', e.target.value)}
                  placeholder="lucide 아이콘명 (예: Home, Settings)"
                />
              </div>

              {/* 부모여부 */}
              <div className="space-y-2">
                <Label htmlFor="parentYn">부모메뉴 여부</Label>
                <Select
                  value={formData.parentYn || 'N'}
                  onValueChange={(value) => handleFormChange('parentYn', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Y">예 (하위메뉴 있음)</SelectItem>
                    <SelectItem value="N">아니오</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 사용여부 */}
              <div className="space-y-2">
                <Label htmlFor="useYn">사용여부</Label>
                <Select
                  value={formData.useYn || 'Y'}
                  onValueChange={(value) => handleFormChange('useYn', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Y">사용</SelectItem>
                    <SelectItem value="N">미사용</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              왼쪽 트리에서 메뉴를 선택하거나, 신규 버튼을 클릭하세요.
            </div>
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

export default MenuManage;
