import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { SearchableInput } from '@/components/ui/searchable-input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DataGrid, type DataGridRef } from '@/components/common/DataGrid';
import { SearchDialog } from '@/components/common/SearchDialog';
import { col, hiddenCol, numCol } from '@/lib/grid-helpers';
import { bomApi, type BomCreateRequest, type BomUpdateRequest } from '@/services/api/bom';
import { itemApi, type ItemModal } from '@/services/api/item';
import { Plus, Trash2 } from 'lucide-react';

interface BomFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bomId?: number; // 수정 시 BOM ID
}

interface FormData {
  parentItemId: string;
  parentItemName: string;
  useYn: string;
  description: string;
}

interface BomDetailItem {
  id?: number;
  childItemId: number;
  childItemCode: string;
  childItemName: string;
  quantity: number;
  unit: string;
  description: string;
  isDeleted?: string;
}

export function BomFormDialog({ open, onOpenChange, bomId }: BomFormDialogProps) {
  const queryClient = useQueryClient();
  const detailGridRef = useRef<DataGridRef>(null);
  const [details, setDetails] = useState<BomDetailItem[]>([]);
  const [isItemSearchOpen, setIsItemSearchOpen] = useState(false);
  const [isParentItemSearchOpen, setIsParentItemSearchOpen] = useState(false);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      parentItemId: '',
      parentItemName: '',
      useYn: 'Y',
      description: '',
    },
  });

  const isEditMode = !!bomId;

  // BOM 전체 정보 조회 (수정 모드)
  const { data: bomFull, isLoading: isLoadingFull } = useQuery({
    queryKey: ['bom-full', bomId],
    queryFn: () => bomApi.getBomFull(bomId!),
    enabled: isEditMode && !!bomId && open,
  });

  // 수정 모드 시 데이터 로드
  useEffect(() => {
    if (isEditMode && open && !isLoadingFull && bomFull) {
      if (bomFull.header) {
        setValue('parentItemId', bomFull.header.parentItemId?.toString() || '');
        setValue('parentItemName', bomFull.header.parentItemName || '');
        setValue('useYn', bomFull.header.useYn || 'Y');
        setValue('description', bomFull.header.description || '');
      }

      if (bomFull.details && bomFull.details.length > 0) {
        const detailItems: BomDetailItem[] = bomFull.details.map(detail => ({
          id: detail.id,
          childItemId: detail.childItemId,
          childItemCode: detail.childItemCode,
          childItemName: detail.childItemName,
          quantity: detail.quantity || 0,
          unit: detail.unit || '',
          description: detail.description || '',
          isDeleted: 'N',
        }));
        setDetails(detailItems);
      }
    }
  }, [isEditMode, open, isLoadingFull, bomFull, setValue]);

  // Dialog 닫힐 때 초기화
  useEffect(() => {
    if (!open) {
      reset();
      setDetails([]);
    }
  }, [open, reset]);

  // 생성 mutation
  const createMutation = useMutation({
    mutationFn: (data: BomCreateRequest) => bomApi.createBom(data),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['boms'] });
      onOpenChange(false);
      reset();
    },
    onError: (error) => {
      console.error('BOM 등록 실패:', error);
      alert('BOM 등록에 실패했습니다.');
    },
  });

  // 수정 mutation
  const updateMutation = useMutation({
    mutationFn: (data: BomUpdateRequest) => bomApi.updateBom(data),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['boms'] });
      queryClient.invalidateQueries({ queryKey: ['bom-full'] });
      queryClient.invalidateQueries({ queryKey: ['bomDetails'] });
      onOpenChange(false);
      reset();
    },
    onError: (error) => {
      console.error('BOM 수정 실패:', error);
      alert('BOM 수정에 실패했습니다.');
    },
  });

  const onSubmit = (data: FormData) => {
    const gridData = detailGridRef.current?.getData() as BomDetailItem[];
    if (!gridData || gridData.length === 0) {
      alert('구성 자재를 추가해주세요.');
      return;
    }

    const requestData: BomCreateRequest = {
      parentItemId: parseInt(data.parentItemId),
      useYn: data.useYn,
      description: data.description,
      details: gridData.map(item => ({
        childItemId: item.childItemId,
        quantity: item.quantity || 0,
        unit: item.unit,
        description: item.description,
      })),
    };

    if (isEditMode && bomId) {
      updateMutation.mutate({ ...requestData, id: bomId });
    } else {
      createMutation.mutate(requestData);
    }
  };

  // 상위 품목 선택
  const handleParentItemSelect = (item: ItemModal) => {
    setValue('parentItemId', item.id.toString());
    setValue('parentItemName', item.name);
  };

  // 상세 그리드 컬럼 정의
  const detailColumns = [
    hiddenCol('id', { dataType: 'number' }),
    hiddenCol('childItemId', { dataType: 'number' }),
    col('childItemCode', '자재코드', 120),
    col('childItemName', '자재명', 200),
    numCol('quantity', '소요량', 100, { editable: true }),
    col('unit', '단위', 80, { editable: true }),
    col('description', '설명', 200, { editable: true }),
    hiddenCol('isDeleted'),
  ];

  // 자재 추가
  const handleAddItem = (selectedItems: ItemModal[]) => {
    const newItems: BomDetailItem[] = selectedItems.map(selectedItem => ({
      childItemId: selectedItem.id,
      childItemCode: selectedItem.code,
      childItemName: selectedItem.name,
      quantity: 1,
      unit: '',
      description: '',
    }));
    setDetails([...details, ...newItems]);
  };

  // 자재 제거
  const handleRemoveItem = () => {
    const gridView = detailGridRef.current?.gridView;
    const dataProvider = detailGridRef.current?.dataProvider;

    if (!gridView || !dataProvider) {
      alert('그리드가 초기화되지 않았습니다.');
      return;
    }

    const current = gridView.getCurrent();
    if (!current || current.dataRow < 0) {
      alert('삭제할 자재를 선택하세요.');
      return;
    }

    const itemId = dataProvider.getValue(current.dataRow, 'id');

    if (!itemId) {
      dataProvider.removeRow(current.dataRow);
    } else {
      dataProvider.setValue(current.dataRow, 'isDeleted', 'Y');
      gridView.setRowStyleCallback((grid: any, item: any) => {
        const isDeleted = dataProvider.getValue(item.dataRow, 'isDeleted');
        return isDeleted === 'Y' ? 'deleted-row' : '';
      });
    }
  };

  // 그리드 데이터 변경 시 details 업데이트
  const handleDetailDataChange = () => {
    const gridData = detailGridRef.current?.getData() as BomDetailItem[];
    if (gridData) {
      setDetails(gridData);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'BOM 수정' : 'BOM 등록'}</DialogTitle>
          <DialogDescription>
            BOM 정보를 입력하세요.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* 상위 품목 */}
            <div className="space-y-2">
              <Label htmlFor="parentItemName" className="required">
                상위 품목 (완제품)
              </Label>
              <SearchableInput
                displayValue={watch('parentItemName')}
                onSearchClick={() => setIsParentItemSearchOpen(true)}
                placeholder="품목 검색"
                error={!!errors.parentItemName}
              />
            </div>

            {/* 사용 여부 */}
            <div className="space-y-2">
              <Label htmlFor="useYn">사용여부</Label>
              <Select
                value={watch('useYn')}
                onValueChange={(value) => setValue('useYn', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Y">사용</SelectItem>
                  <SelectItem value="N">미사용</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 설명 */}
          <div className="space-y-2">
            <Label htmlFor="description">설명</Label>
            <Textarea id="description" {...register('description')} rows={2} />
          </div>

          {/* 구성 자재 목록 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>구성 자재</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsItemSearchOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  자재 추가
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveItem}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  자재 제거
                </Button>
              </div>
            </div>
            <DataGrid
              ref={detailGridRef}
              columns={detailColumns}
              data={details}
              className="h-[250px]"
              onDataChanged={handleDetailDataChange}
              options={{
                edit: { editable: true }
              }}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              취소
            </Button>
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
              {createMutation.isPending || updateMutation.isPending ? '저장 중...' : '저장'}
            </Button>
          </DialogFooter>
        </form>

        {/* 상위 품목 검색 다이얼로그 */}
        <SearchDialog<ItemModal>
          open={isParentItemSearchOpen}
          onOpenChange={setIsParentItemSearchOpen}
          onSelect={(item) => handleParentItemSelect(item as ItemModal)}
          title="상위 품목 검색"
          placeholder="품목 코드 또는 품목명"
          columns={[
            hiddenCol('id'),
            col('code', '품목코드', 120),
            col('name', '품목명', 200),
            col('spec', '규격', 100),
            col('inventoryUnitCode', '단위', 60),
            numCol('boxPerSkuQty', '박스당 수량', 100),
            numCol('pltPerSkuQty', '팔레트당 수량', 100),
          ]}
          fetchFn={itemApi.getModalItems}
          queryKey="items-modal"
          maxWidth="max-w-5xl"
        />

        {/* 자재 검색 다이얼로그 */}
        <SearchDialog<ItemModal>
          open={isItemSearchOpen}
          onOpenChange={setIsItemSearchOpen}
          onSelect={(items) => handleAddItem(items as ItemModal[])}
          title="자재 검색"
          placeholder="품목 코드 또는 품목명"
          columns={[
            hiddenCol('id'),
            col('code', '품목코드', 120),
            col('name', '품목명', 200),
            col('spec', '규격', 100),
            col('inventoryUnitCode', '단위', 60),
            numCol('boxPerSkuQty', '박스당 수량', 100),
            numCol('pltPerSkuQty', '팔레트당 수량', 100),
          ]}
          fetchFn={itemApi.getModalItems}
          queryKey="items-modal"
          multiSelect
          maxWidth="max-w-5xl"
        />
      </DialogContent>
    </Dialog>
  );
}
