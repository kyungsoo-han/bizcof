import { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
import { DataGrid, type DataGridRef } from '@/components/common/DataGrid';
import type { RealGridColumn, RealGridField } from '@/types/realgrid';
import { SearchDialog } from '@/components/common/SearchDialog';
import { col, hiddenCol, numCol } from '@/lib/grid-helpers';
import { orderApi, type OrderCreateRequest, type OrderUpdateRequest } from '@/services/api/order';
import { itemApi, type ItemModal } from '@/services/api/item';
import { Calendar, Plus, Trash2 } from 'lucide-react';

interface OrderFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderNo?: string; // 수정 시 주문번호
}

interface FormData {
  orderDate: string;
  deliveryDate: string;
  dueDate: string;
  customerId: string;
  customerName: string;
  customerName2: string;
  deliveryAddress: string;
  phoneNbr: string;
  memo: string;
  customerMemo: string;
}

interface OrderItem {
  itemId: number;
  itemCode: string;
  itemName: string;
  orderQty: number;
  subMemo?: string;
}

export function OrderFormDialog({ open, onOpenChange, orderNo }: OrderFormDialogProps) {
  const queryClient = useQueryClient();
  const itemGridRef = useRef<DataGridRef>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [isItemSearchOpen, setIsItemSearchOpen] = useState(false);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      orderDate: format(new Date(), 'yyyy-MM-dd'),
      deliveryDate: format(new Date(), 'yyyy-MM-dd'),
      dueDate: format(new Date(), 'yyyy-MM-dd'),
      customerId: '',
      customerName: '',
      customerName2: '',
      deliveryAddress: '',
      phoneNbr: '',
      memo: '',
      customerMemo: '',
    },
  });

  const isEditMode = !!orderNo;

  // 생성 mutation
  const createMutation = useMutation({
    mutationFn: (data: OrderCreateRequest) => orderApi.createOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      onOpenChange(false);
      reset();
    },
    onError: (error) => {
      console.error('주문 등록 실패:', error);
      alert('주문 등록에 실패했습니다.');
    },
  });

  // 수정 mutation
  const updateMutation = useMutation({
    mutationFn: (data: OrderUpdateRequest) => orderApi.updateOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      onOpenChange(false);
      reset();
    },
    onError: (error) => {
      console.error('주문 수정 실패:', error);
      alert('주문 수정에 실패했습니다.');
    },
  });

  const onSubmit = (data: FormData) => {
    const requestData: OrderCreateRequest = {
      orderDate: data.orderDate,
      deliveryDate: data.deliveryDate,
      dueDate: data.dueDate,
      customerId: parseInt(data.customerId),
      customerName: data.customerName,
      customerName2: data.customerName2,
      deliveryAddress: data.deliveryAddress,
      phoneNbr: data.phoneNbr,
      memo: data.memo,
      customerMemo: data.customerMemo,
      details: items.map((item) => ({
        itemId: item.itemId,
        orderQty: item.orderQty || 0,
        subMemo: item.subMemo,
      })),
    };

    if (isEditMode && orderNo) {
      updateMutation.mutate({ ...requestData, orderNo });
    } else {
      createMutation.mutate(requestData);
    }
  };

  // 거래처 검색 (임시)
  const handleCustomerSearch = () => {
    alert('거래처 검색 기능은 구현 예정입니다.');
  };

  // 품목 그리드 필드 정의
  const itemFields: RealGridField[] = [
    { fieldName: 'itemId', dataType: 'number' },
    { fieldName: 'itemCode', dataType: 'text' },
    { fieldName: 'itemName', dataType: 'text' },
    { fieldName: 'orderQty', dataType: 'number' },
    { fieldName: 'subMemo', dataType: 'text' },
  ];

  // 품목 그리드 컬럼 정의
  const itemColumns: RealGridColumn[] = [
    {
      name: 'itemId',
      fieldName: 'itemId',
      type: 'data',
      width: 80,
      header: { text: '품목ID' },
      visible: false,
      editable: false,
    },
    {
      name: 'itemCode',
      fieldName: 'itemCode',
      type: 'data',
      width: 150,
      header: { text: '품목 코드' },
      editable: false,
    },
    {
      name: 'itemName',
      fieldName: 'itemName',
      type: 'data',
      width: 250,
      header: { text: '품목명' },
      editable: false,
    },
    {
      name: 'orderQty',
      fieldName: 'orderQty',
      type: 'data',
      width: 120,
      header: { text: '주문 수량' },
      editable: true,
      numberFormat: '#,##0',
    },
    {
      name: 'subMemo',
      fieldName: 'subMemo',
      type: 'data',
      width: 300,
      header: { text: '상세 메모' },
      editable: true,
    },
  ];

  // 품목 추가
  const handleAddItem = (selectedItems: ItemModal[]) => {
    const newItems: OrderItem[] = selectedItems.map(selectedItem => ({
      itemId: selectedItem.id,
      itemCode: selectedItem.code,
      itemName: selectedItem.name,
      orderQty: 0,
      subMemo: '',
    }));
    setItems([...items, ...newItems]);
  };

  // 품목 제거
  const handleRemoveItem = () => {
    const selectedRows = itemGridRef.current?.getSelectedRows();
    if (selectedRows && selectedRows.length > 0) {
      const selectedIndices = selectedRows.map((row) => row.dataRow);
      const newItems = items.filter((_, index) => !selectedIndices.includes(index));
      setItems(newItems);
    } else {
      alert('삭제할 품목을 선택하세요.');
    }
  };

  // 그리드 데이터 변경 시 items 업데이트
  const handleItemDataChange = () => {
    const gridData = itemGridRef.current?.getData() as OrderItem[];
    if (gridData) {
      setItems(gridData);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? '주문 수정' : '주문 등록'}</DialogTitle>
          <DialogDescription>
            주문 정보를 입력하세요.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {/* 주문 번호 (수정 시만 표시) */}
            {isEditMode && (
              <div className="space-y-2">
                <Label>주문 번호</Label>
                <Input value={orderNo} readOnly className="bg-gray-50" />
              </div>
            )}

            {/* 주문 일자 */}
            <div className="space-y-2">
              <Label htmlFor="orderDate" className="required">
                주문 일자
              </Label>
              <Input
                id="orderDate"
                type="date"
                {...register('orderDate', { required: '주문 일자는 필수입니다.' })}
                className={errors.orderDate ? 'border-red-500' : ''}
              />
              {errors.orderDate && (
                <p className="text-sm text-red-500">{errors.orderDate.message}</p>
              )}
            </div>

            {/* 배송 일자 */}
            <div className="space-y-2">
              <Label htmlFor="deliveryDate" className="required">
                배송 일자
              </Label>
              <Input
                id="deliveryDate"
                type="date"
                {...register('deliveryDate', { required: '배송 일자는 필수입니다.' })}
                className={errors.deliveryDate ? 'border-red-500' : ''}
              />
              {errors.deliveryDate && (
                <p className="text-sm text-red-500">{errors.deliveryDate.message}</p>
              )}
            </div>

            {/* 요청 납기일 */}
            <div className="space-y-2">
              <Label htmlFor="dueDate" className="required">
                요청 납기일
              </Label>
              <Input
                id="dueDate"
                type="date"
                {...register('dueDate', { required: '요청 납기일은 필수입니다.' })}
                className={errors.dueDate ? 'border-red-500' : ''}
              />
              {errors.dueDate && (
                <p className="text-sm text-red-500">{errors.dueDate.message}</p>
              )}
            </div>

            {/* 거래처 */}
            <div className="space-y-2 col-span-2">
              <Label htmlFor="customerName" className="required">
                거래처
              </Label>
              <div className="flex gap-2">
                <Input
                  id="customerName"
                  {...register('customerName', { required: '거래처는 필수입니다.' })}
                  readOnly
                  placeholder="거래처 검색"
                  className={`flex-1 ${errors.customerName ? 'border-red-500' : ''}`}
                />
                <Button type="button" variant="outline" onClick={handleCustomerSearch}>
                  검색
                </Button>
              </div>
              <input type="hidden" {...register('customerId')} />
              {errors.customerName && (
                <p className="text-sm text-red-500">{errors.customerName.message}</p>
              )}
            </div>

            {/* 고객 이름2 */}
            <div className="space-y-2">
              <Label htmlFor="customerName2">고객 이름2</Label>
              <Input id="customerName2" {...register('customerName2')} />
            </div>

            {/* 배송지 주소 */}
            <div className="space-y-2 col-span-2">
              <Label htmlFor="deliveryAddress">배송지 주소</Label>
              <Input id="deliveryAddress" {...register('deliveryAddress')} />
            </div>

            {/* 연락처 */}
            <div className="space-y-2">
              <Label htmlFor="phoneNbr">연락처</Label>
              <Input id="phoneNbr" {...register('phoneNbr')} />
            </div>
          </div>

          {/* 메모 */}
          <div className="space-y-2">
            <Label htmlFor="memo">메모</Label>
            <Textarea id="memo" {...register('memo')} rows={2} />
          </div>

          {/* 고객 요청사항 */}
          <div className="space-y-2">
            <Label htmlFor="customerMemo">고객 요청사항</Label>
            <Textarea id="customerMemo" {...register('customerMemo')} rows={2} />
          </div>

          {/* 품목 목록 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>주문 상세</Label>
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
              fields={itemFields}
              data={items}
              className="h-[300px]"
              onDataChange={handleItemDataChange}
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
      </DialogContent>
    </Dialog>
  );
}
