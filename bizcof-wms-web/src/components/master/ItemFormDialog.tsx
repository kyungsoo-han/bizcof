import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { itemApi, type Item, type ItemCreateRequest, type ItemUpdateRequest } from '@/services/api/item';
import { Loader2 } from 'lucide-react';

// Zod 스키마 정의
const itemFormSchema = z.object({
  code: z.string().min(1, '품목코드는 필수입니다.'),
  name: z.string().min(1, '품목명은 필수입니다.'),
  sname: z.string().optional(),
  ename: z.string().optional(),
  type: z.string().optional(),
  spec: z.string().optional(),
  inventoryUnitCode: z.string().optional(),
  skuUnitCode: z.string().optional(),
  skuPerIuQty: z.number().optional(),
  boxPerSkuQty: z.number().optional(),
  pltPerSkuQty: z.number().optional(),
  customerId: z.number().optional(),
  price: z.number().optional(),
  useYn: z.string().optional(),
  barcode: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  depth: z.number().optional(),
  weight: z.number().optional(),
  description: z.string().optional(),
  memo: z.string().optional(),
});

type ItemFormValues = z.infer<typeof itemFormSchema>;

interface ItemFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  initialData?: Item;
}

export function ItemFormDialog({ open, onOpenChange, mode, initialData }: ItemFormDialogProps) {
  const queryClient = useQueryClient();

  const form = useForm<ItemFormValues>({
    resolver: zodResolver(itemFormSchema),
    defaultValues: {
      code: '',
      name: '',
      sname: '',
      ename: '',
      type: '',
      spec: '',
      inventoryUnitCode: '',
      skuUnitCode: '',
      skuPerIuQty: undefined,
      boxPerSkuQty: undefined,
      pltPerSkuQty: undefined,
      customerId: undefined,
      price: undefined,
      useYn: 'Y',
      barcode: '',
      width: undefined,
      height: undefined,
      depth: undefined,
      weight: undefined,
      description: '',
      memo: '',
    },
  });

  // 수정 모드일 때 초기 데이터 설정
  useEffect(() => {
    if (mode === 'edit' && initialData && open) {
      form.reset({
        code: initialData.code,
        name: initialData.name,
        sname: initialData.sname || '',
        ename: initialData.ename || '',
        type: initialData.type || '',
        spec: initialData.spec || '',
        inventoryUnitCode: initialData.inventoryUnitCode || '',
        skuUnitCode: initialData.skuUnitCode || '',
        skuPerIuQty: initialData.skuPerIuQty,
        boxPerSkuQty: initialData.boxPerSkuQty,
        pltPerSkuQty: initialData.pltPerSkuQty,
        customerId: initialData.customerId,
        price: initialData.price,
        useYn: initialData.useYn || 'Y',
        barcode: initialData.barcode || '',
        width: initialData.width,
        height: initialData.height,
        depth: initialData.depth,
        weight: initialData.weight,
        description: initialData.description || '',
        memo: initialData.memo || '',
      });
    } else if (mode === 'create' && open) {
      form.reset({
        code: '',
        name: '',
        sname: '',
        ename: '',
        type: '',
        spec: '',
        inventoryUnitCode: '',
        skuUnitCode: '',
        skuPerIuQty: undefined,
        boxPerSkuQty: undefined,
        pltPerSkuQty: undefined,
        customerId: undefined,
        price: undefined,
        useYn: 'Y',
        barcode: '',
        width: undefined,
        height: undefined,
        depth: undefined,
        weight: undefined,
        description: '',
        memo: '',
      });
    }
  }, [mode, initialData, open, form]);

  // 품목 생성 mutation
  const createMutation = useMutation({
    mutationFn: (data: ItemCreateRequest) => itemApi.createItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      alert('품목이 등록되었습니다.');
      onOpenChange(false);
    },
    onError: (error: any) => {
      alert(`품목 등록 실패: ${error.message || '알 수 없는 오류'}`);
    },
  });

  // 품목 수정 mutation
  const updateMutation = useMutation({
    mutationFn: (data: ItemUpdateRequest) => itemApi.updateItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      alert('품목이 수정되었습니다.');
      onOpenChange(false);
    },
    onError: (error: any) => {
      alert(`품목 수정 실패: ${error.message || '알 수 없는 오류'}`);
    },
  });

  // 폼 제출
  const onSubmit = (values: ItemFormValues) => {
    if (mode === 'create') {
      createMutation.mutate(values as ItemCreateRequest);
    } else if (initialData) {
      updateMutation.mutate({
        ...values,
        id: initialData.id,
      } as ItemUpdateRequest);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? '품목 등록' : '품목 수정'}</DialogTitle>
          <DialogDescription>
            {mode === 'create' ? '새로운 품목을 등록합니다.' : '품목 정보를 수정합니다.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* 기본 정보 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">기본 정보</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>품목코드 *</FormLabel>
                      <FormControl>
                        <Input placeholder="품목코드 입력" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>품목명 *</FormLabel>
                      <FormControl>
                        <Input placeholder="품목명 입력" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>약칭</FormLabel>
                      <FormControl>
                        <Input placeholder="약칭 입력" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="ename"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>영문명</FormLabel>
                      <FormControl>
                        <Input placeholder="영문명 입력" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>유형</FormLabel>
                      <FormControl>
                        <Input placeholder="유형 입력" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="spec"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>규격</FormLabel>
                      <FormControl>
                        <Input placeholder="규격 입력" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="barcode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>바코드</FormLabel>
                      <FormControl>
                        <Input placeholder="바코드 입력" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="useYn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>사용여부</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="선택" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Y">사용</SelectItem>
                          <SelectItem value="N">미사용</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* 단위 정보 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">단위 정보</h3>
              <div className="grid gap-4 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="inventoryUnitCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>재고단위</FormLabel>
                      <FormControl>
                        <Input placeholder="재고단위 입력" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="skuUnitCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SKU단위</FormLabel>
                      <FormControl>
                        <Input placeholder="SKU단위 입력" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="skuPerIuQty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SKU/재고단위 수량</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="수량 입력"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="boxPerSkuQty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>BOX/SKU 수량</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="수량 입력"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="pltPerSkuQty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>PLT/SKU 수량</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="수량 입력"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* 거래처 및 가격 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">거래처 및 가격</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="customerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>거래처 ID</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="거래처 ID 입력"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>단가</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="단가 입력"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* 치수 및 중량 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">치수 및 중량</h3>
              <div className="grid gap-4 md:grid-cols-4">
                <FormField
                  control={form.control}
                  name="width"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>가로(mm)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="가로 입력"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="height"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>세로(mm)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="세로 입력"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="depth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>높이(mm)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="높이 입력"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>중량(g)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="중량 입력"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* 비고 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">비고</h3>
              <div className="grid gap-4 md:grid-cols-1">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>설명</FormLabel>
                      <FormControl>
                        <Textarea placeholder="설명 입력" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="memo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>메모</FormLabel>
                      <FormControl>
                        <Textarea placeholder="메모 입력" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                취소
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === 'create' ? '등록' : '수정'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
