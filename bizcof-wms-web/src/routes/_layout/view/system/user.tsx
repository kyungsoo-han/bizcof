import { createFileRoute } from '@tanstack/react-router';
import { useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataGrid, type DataGridRef } from '@/components/common/DataGrid';
import { SearchForm, type SearchField } from '@/components/common/SearchForm';
import { col, hiddenCol, dateCol } from '@/lib/grid-helpers';
import { userApi, type UserSearchRequest, type User } from '@/services/api/user';
import { UserFormDialog } from '@/components/system/UserFormDialog';
import { Plus, Pencil, Trash2, Download, KeyRound } from 'lucide-react';

export const Route = createFileRoute('/_layout/view/system/user')({
  component: UserManage,
});

function UserManage() {
  const queryClient = useQueryClient();
  const gridRef = useRef<DataGridRef>(null);
  const [searchParams, setSearchParams] = useState<UserSearchRequest>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedUser, setSelectedUser] = useState<User | undefined>();

  // 검색 필드 정의
  const searchFields: SearchField[] = [
    { name: 'userId', label: '사용자 ID', type: 'text', placeholder: '사용자 ID 입력' },
    { name: 'userName', label: '사용자 명', type: 'text', placeholder: '사용자 명 입력' },
    { name: 'department', label: '부서', type: 'text', placeholder: '부서 입력' },
    { name: 'useYn', label: '사용여부', type: 'select', options: [
      { value: 'ALL', label: '전체' },
      { value: 'Y', label: '사용' },
      { value: 'N', label: '미사용' },
    ]},
  ];

  // 사용자 목록 조회
  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ['users', searchParams],
    queryFn: () => userApi.getUserList(searchParams),
    retry: false,
    throwOnError: false,
  });

  // 그리드 컬럼 정의
  const columns = [
    hiddenCol('id'),
    col('userId', '사용자 ID', 120),
    col('userName', '사용자 명', 150),
    col('email', '이메일', 200),
    col('tel', '연락처', 120),
    col('department', '부서', 120),
    col('position', '직위', 100),
    col('role', '권한', 100),
    col('useYn', '사용여부', 80),
    dateCol('createdDt', '등록일'),
    dateCol('modifiedDt', '수정일'),
  ];

  // 검색 실행
  const handleSearch = (params: Record<string, string>) => {
    setSearchParams(params as UserSearchRequest);
  };

  // Excel 내보내기
  const handleExport = () => {
    gridRef.current?.exportToExcel('user-list.xlsx');
  };

  // 삭제 mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => userApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      alert('사용자가 삭제되었습니다.');
    },
    onError: (error: any) => {
      alert(`사용자 삭제 실패: ${error.message || '알 수 없는 오류'}`);
    },
  });

  // 비밀번호 초기화 mutation
  const resetPasswordMutation = useMutation({
    mutationFn: (id: number) => userApi.resetPassword(id),
    onSuccess: () => {
      alert('비밀번호가 초기화되었습니다.');
    },
    onError: (error: any) => {
      alert(`비밀번호 초기화 실패: ${error.message || '알 수 없는 오류'}`);
    },
  });

  // 신규 사용자 등록
  const handleNewUser = () => {
    setModalMode('create');
    setSelectedUser(undefined);
    setIsModalOpen(true);
  };

  // 사용자 수정
  const handleEditUser = () => {
    const selectedRows = gridRef.current?.getSelectedRows() || [];

    if (selectedRows.length === 0) {
      alert('수정할 사용자를 선택해주세요.');
      return;
    }

    setModalMode('edit');
    setSelectedUser(selectedRows[0] as User);
    setIsModalOpen(true);
  };

  // 사용자 삭제
  const handleDeleteUser = () => {
    const selectedRows = gridRef.current?.getSelectedRows() || [];

    if (selectedRows.length === 0) {
      alert('삭제할 사용자를 선택해주세요.');
      return;
    }

    if (confirm('선택한 사용자를 삭제하시겠습니까?')) {
      deleteMutation.mutate((selectedRows[0] as User).id);
    }
  };

  // 비밀번호 초기화
  const handleResetPassword = () => {
    const selectedRows = gridRef.current?.getSelectedRows() || [];

    if (selectedRows.length === 0) {
      alert('비밀번호를 초기화할 사용자를 선택해주세요.');
      return;
    }

    if (confirm('선택한 사용자의 비밀번호를 초기화하시겠습니까?')) {
      resetPasswordMutation.mutate((selectedRows[0] as User).id);
    }
  };

  // 모달 닫기
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(undefined);
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
              <CardTitle>사용자 목록 (총 {users?.length || 0}명)</CardTitle>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleNewUser}>
                <Plus className="h-4 w-4 mr-2" />
                신규 등록
              </Button>
              <Button variant="outline" size="sm" onClick={handleEditUser}>
                <Pencil className="h-4 w-4 mr-2" />
                수정
              </Button>
              <Button variant="outline" size="sm" onClick={handleResetPassword}>
                <KeyRound className="h-4 w-4 mr-2" />
                비밀번호 초기화
              </Button>
              <Button variant="destructive" size="sm" onClick={handleDeleteUser}>
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
              data={users || []}
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

      {/* 사용자 등록/수정 다이얼로그 */}
      <UserFormDialog
        open={isModalOpen}
        onOpenChange={(open) => !open && handleCloseModal()}
        mode={modalMode}
        initialData={selectedUser}
      />
    </div>
  );
}
