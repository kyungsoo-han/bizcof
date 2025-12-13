import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
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
import {col, dateCol, hiddenCol, numCol} from '@/lib/grid-helpers';
import { inboundApi, type InboundCreateRequest, type InboundUpdateRequest } from '@/services/api/inbound';
import { itemApi, type ItemModal } from '@/services/api/item';
import { customerApi, type CustomerModal } from '@/services/api/customer';
import { Calendar, Plus, Trash2 } from 'lucide-react';

interface InboundFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inboundNo?: string; // 수정 시 입고번호
}

interface FormData {
  inboundDate: string;
  customerId: string;
  customerName: string;
  inboundType: string;
  memo: string;
}

interface InboundItem {
  seqNo?: number;          // 순번 (저장된 데이터에만 존재)
  itemId: number;
  itemCode: string;
  itemName: string;
  boxPerSkuQty: number;    // 박스당 수량 (품목에서 가져옴)
  boxQty: number;          // 박스 수량 (계산됨)
  pltPerSkuQty: number;    // 팔레트당 수량 (품목에서 가져옴)
  pltQty: number;          // 팔레트 수량 (계산됨)
  inboundQty: number;      // 입고수량 (입력)
  locationCode: string;    // 로케이션 코드
  expireDate: string;      // 유통기한
  makeDate?: string;       // 제조일자
  makeNo?: string;         // 제조번호
  lotNo?: string;          // LOT번호
  memo?: string;           // 메모
  isDeleted?: string;      // 삭제 여부 (Y/N)
}

export function InboundFormDialog({ open, onOpenChange, inboundNo }: InboundFormDialogProps) {
  const queryClient = useQueryClient();
  const itemGridRef = useRef<DataGridRef>(null);
  const [items, setItems] = useState<InboundItem[]>([]);
  const [isItemSearchOpen, setIsItemSearchOpen] = useState(false);
  const [isCustomerSearchOpen, setIsCustomerSearchOpen] = useState(false);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      inboundDate: format(new Date(), 'yyyy-MM-dd'),
      customerId: '',
      customerName: '',
      inboundType: 'NORMAL',
      memo: '',
    },
  });

  const isEditMode = !!inboundNo;

  // 입고 전체 정보 조회 (수정 모드) - 헤더 + 상세 통합 API
  const { data: inboundFull, isLoading: isLoadingFull } = useQuery({
    queryKey: ['inbound-full', inboundNo],
    queryFn: () => inboundApi.getInboundFull(inboundNo!),
    enabled: isEditMode && !!inboundNo && open,
  });

  // 수정 모드 시 데이터 로드
  useEffect(() => {

    if (isEditMode && open && !isLoadingFull && inboundFull) {

      // 헤더 데이터가 있으면 폼 설정
      if (inboundFull.header) {
        setValue('inboundDate', inboundFull.header.inboundDate);
        setValue('customerId', inboundFull.header.customerId?.toString() || '');
        setValue('customerName', inboundFull.header.customerName || '');
        setValue('inboundType', inboundFull.header.inboundType);
        setValue('memo', inboundFull.header.memo || '');
      }

      // 상세 데이터가 있으면 그리드 설정
      if (inboundFull.details && inboundFull.details.length > 0) {
        const detailItems: InboundItem[] = inboundFull.details.map(detail => ({
          seqNo: detail.seqNo,
          itemId: detail.itemId,
          itemCode: detail.itemCode,
          itemName: detail.itemName,
          boxPerSkuQty: detail.boxPerSkuQty || 0,
          boxQty: detail.boxQty || 0,
          pltPerSkuQty: detail.pltPerSkuQty || 0,
          pltQty: detail.pltQty || 0,
          inboundQty: detail.inboundQty || 0,
          locationCode: detail.locationCode || '',
          expireDate: detail.expireDate || '',
          makeDate: detail.makeDate || '',
          makeNo: detail.makeNo || '',
          lotNo: detail.lotNo || '',
          memo: detail.memo || '',
          isDeleted: 'N',
        }));

        setItems(detailItems);
      }
    }
  }, [isEditMode, open, isLoadingFull, inboundFull, setValue]);

  // Dialog 닫힐 때 초기화
  useEffect(() => {
    if (!open) {
      reset();
      setItems([]);
    }
  }, [open, reset]);

  // 그리드 셀 편집 시 수량 자동 계산
  const handleCellEdited = (gridView: any, itemIndex: number, row: number, field: number) => {
    const fieldName = gridView.getColumn(field).fieldName;

    // 입고수량 필드가 변경된 경우
    if (fieldName === 'inboundQty') {
      const inboundQty = gridView.getValue(itemIndex, 'inboundQty') || 0;
      const boxPerSkuQty = gridView.getValue(itemIndex, 'boxPerSkuQty') || 0;
      const pltPerSkuQty = gridView.getValue(itemIndex, 'pltPerSkuQty') || 0;

      // 박스수량, 팔레트수량 계산
      const boxQty = boxPerSkuQty > 0 ? Math.floor(inboundQty / boxPerSkuQty) : 0;
      const pltQty = pltPerSkuQty > 0 ? Math.floor(inboundQty / pltPerSkuQty) : 0;

      // 계산된 값을 그리드에 설정
      gridView.setValues(itemIndex, { boxQty, pltQty });
    }
  };

  // 생성 mutation
  const createMutation = useMutation({
    mutationFn: (data: InboundCreateRequest) => inboundApi.createInbound(data),
    onSuccess: () => {
      // 즉시 데이터 refetch로 UI 빠르게 업데이트
      queryClient.refetchQueries({ queryKey: ['inbounds'] });
      onOpenChange(false);
      reset();
    },
    onError: (error) => {
      console.error('입고 등록 실패:', error);
      alert('입고 등록에 실패했습니다.');
    },
  });

  // 수정 mutation
  const updateMutation = useMutation({
    mutationFn: (data: InboundUpdateRequest) => inboundApi.updateInbound(data),
    onSuccess: () => {
      // 즉시 데이터 refetch로 UI 빠르게 업데이트
      queryClient.refetchQueries({ queryKey: ['inbounds'] });
      queryClient.invalidateQueries({ queryKey: ['inbound-full'] });
      queryClient.invalidateQueries({ queryKey: ['inboundDetails'] });
      onOpenChange(false);
      reset();
    },
    onError: (error) => {
      console.error('입고 수정 실패:', error);
      alert('입고 수정에 실패했습니다.');
    },
  });

  const onSubmit = (data: FormData) => {
    // 그리드에서 현재 데이터 가져오기
    const gridData = itemGridRef.current?.getData() as InboundItem[];
    if (!gridData || gridData.length === 0) {
      alert('품목을 추가해주세요.');
      return;
    }

    const requestData: InboundCreateRequest = {
      inboundDate: data.inboundDate,
      customerId: parseInt(data.customerId),
      inboundType: data.inboundType,
      memo: data.memo,
      items: gridData.map((item, index) => {
        const itemData: any = {
          itemId: item.itemId,
          inboundQty: item.inboundQty || 0,
          pltQty: item.pltQty,
          boxQty: item.boxQty,
          locationCode: item.locationCode,
          expireDate: item.expireDate,
          makeDate: item.makeDate,
          makeNo: item.makeNo,
          lotNo: item.lotNo,
          memo: item.memo,
        };

        // 수정 모드일 때는 seqNo와 isDeleted 포함
        if (isEditMode) {
          itemData.seqNo = item.seqNo || (index + 1);
          itemData.isDeleted = item.isDeleted || 'N';
        } else {
          // 신규 등록 시에는 seqNo만 포함
          itemData.seqNo = index + 1;
        }

        return itemData;
      }),
    };

    if (isEditMode && inboundNo) {
      updateMutation.mutate({ ...requestData, inboundNo });
    } else {
      createMutation.mutate(requestData);
    }
  };

  // 거래처 선택
  const handleCustomerSelect = (customer: CustomerModal) => {
    setValue('customerId', customer.id.toString());
    setValue('customerName', customer.name);
  };

  // 품목 그리드 컬럼 정의 (fields는 autoFields로 자동 생성)
  const itemColumns = [
    hiddenCol('seqNo', { dataType: 'number' }),
    hiddenCol('itemId', { dataType: 'number' }),
    col('itemCode', '품목 코드', 120),
    col('itemName', '품목명', 200),
    numCol('boxPerSkuQty', '박스당 수량', 100),
    numCol('boxQty', '박스 수량', 100),
    numCol('pltPerSkuQty', '팔레트당 수량', 100),
    numCol('pltQty', '팔레트 수량', 100),
    numCol('inboundQty', '입고 수량', 100, { editable: true }),
    col('locationCode', '로케이션', 120, { editable: true }),
    dateCol('expireDate', '유통기한', 120, { editable: true }),
    dateCol('makeDate', '제조일자', 120, { editable: true }),
    col('makeNo', '제조번호', 120, { editable: true }),
    col('lotNo', 'LOT번호', 120, { editable: true }),
    col('memo', '메모', 200, { editable: true }),
    hiddenCol('isDeleted'),
  ];

  // 품목 추가
  const handleAddItem = (selectedItems: ItemModal[]) => {
    const newItems: InboundItem[] = selectedItems.map(selectedItem => ({
      itemId: selectedItem.id,
      itemCode: selectedItem.code,
      itemName: selectedItem.name,
      boxPerSkuQty: selectedItem.boxPerSkuQty || 0,
      boxQty: 0,
      pltPerSkuQty: selectedItem.pltPerSkuQty || 0,
      pltQty: 0,
      inboundQty: 0,
      locationCode: '',
      expireDate: '',
      makeDate: '',
      makeNo: '',
      lotNo: '',
      memo: '',
    }));
    setItems([...items, ...newItems]);
  };

  // 품목 제거
  const handleRemoveItem = () => {
    const gridView = itemGridRef.current?.gridView;
    const dataProvider = itemGridRef.current?.dataProvider;

    if (!gridView || !dataProvider) {
      alert('그리드가 초기화되지 않았습니다.');
      return;
    }

    const current = gridView.getCurrent();
    if (!current || current.dataRow < 0) {
      alert('삭제할 품목을 선택하세요.');
      return;
    }

    // seqNo 확인 - 저장된 데이터인지 신규 데이터인지 구분
    const seqNo = dataProvider.getValue(current.dataRow, 'seqNo');

    if (!seqNo) {
      // 신규 품목: 즉시 제거
      dataProvider.removeRow(current.dataRow);
    } else {
      // 저장된 품목: isDeleted='Y'로 마킹하고 스타일 적용
      dataProvider.setValue(current.dataRow, 'isDeleted', 'Y');

      // 삭제 표시 스타일 적용 (빨간 배경 + 취소선)
      gridView.setRowStyleCallback((grid: any, item: any) => {
        const isDeleted = dataProvider.getValue(item.dataRow, 'isDeleted');
        return isDeleted === 'Y' ? 'deleted-row' : '';
      });
    }
  };

  // 그리드 데이터 변경 시 items 업데이트
  const handleItemDataChange = () => {
    const gridData = itemGridRef.current?.getData() as InboundItem[];
    if (gridData) {
      setItems(gridData);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? '입고 수정' : '입고 등록'}</DialogTitle>
          <DialogDescription>
            입고 정보를 입력하세요.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* 입고 번호 (수정 시만 표시) */}
            {isEditMode && (
              <div className="space-y-2">
                <Label>입고 번호</Label>
                <Input value={inboundNo} readOnly className="bg-gray-50" />
              </div>
            )}

            {/* 입고 일자 */}
            <div className="space-y-2">
              <Label htmlFor="inboundDate" className="required">
                입고 일자
              </Label>
              <div className="relative">
                <Input
                  id="inboundDate"
                  type="date"
                  {...register('inboundDate', { required: '입고 일자는 필수입니다.' })}
                  className={errors.inboundDate ? 'border-red-500' : ''}
                />
                <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
              {errors.inboundDate && (
                <p className="text-sm text-red-500">{errors.inboundDate.message}</p>
              )}
            </div>

            {/* 거래처 */}
            <div className="space-y-2">
              <Label htmlFor="customerName" className="required">
                거래처
              </Label>
              <SearchableInput
                displayValue={watch('customerName')}
                onSearchClick={() => setIsCustomerSearchOpen(true)}
                placeholder="거래처 검색"
                error={!!errors.customerName}
              />
              {errors.customerName && (
                <p className="text-sm text-red-500">{errors.customerName.message}</p>
              )}
            </div>

            {/* 입고 타입 */}
            <div className="space-y-2">
              <Label htmlFor="inboundType" className="required">
                입고 타입
              </Label>
              <Select
                value={watch('inboundType')}
                onValueChange={(value) => setValue('inboundType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NORMAL">일반입고</SelectItem>
                  <SelectItem value="RETURN">반품입고</SelectItem>
                  <SelectItem value="TRANSFER">이동입고</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 메모 */}
          <div className="space-y-2">
            <Label htmlFor="memo">메모</Label>
            <Textarea id="memo" {...register('memo')} rows={3} />
          </div>

          {/* 품목 목록 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>상세 정보</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsItemSearchOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  품목 추가
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveItem}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  품목 제거
                </Button>
              </div>
            </div>
            <DataGrid
              ref={itemGridRef}
              columns={itemColumns}
              data={items}
              className="h-[300px]"
              onDataChanged={handleItemDataChange}
              onCellEdited={handleCellEdited}
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

        <SearchDialog<ItemModal>
          open={isItemSearchOpen}
          onOpenChange={setIsItemSearchOpen}
          onSelect={(items) => handleAddItem(items as ItemModal[])}
          title="품목 검색"
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

        <SearchDialog<CustomerModal>
          open={isCustomerSearchOpen}
          onOpenChange={setIsCustomerSearchOpen}
          onSelect={(customer) => handleCustomerSelect(customer as CustomerModal)}
          title="거래처 검색"
          placeholder="거래처 코드 또는 거래처명"
          columns={[
            hiddenCol('id'),
            col('code', '거래처코드', 120),
            col('name', '거래처명', 200),
          ]}
          fetchFn={customerApi.getModalCustomers}
          queryKey="customers-modal"
        />
      </DialogContent>
    </Dialog>
  );
}
