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
import { customerApi, type Customer, type CustomerCreateRequest, type CustomerUpdateRequest } from '@/services/api/customer';
import { Loader2 } from 'lucide-react';

// Zod 스키마 정의
const customerFormSchema = z.object({
  code: z.string().min(1, '거래처코드는 필수입니다.'),
  name: z.string().min(1, '거래처명은 필수입니다.'),
  businessNumber: z.string().optional(),
  representative: z.string().optional(),
  address: z.string().optional(),
  addressDetail: z.string().optional(),
  tel: z.string().optional(),
  fax: z.string().optional(),
  email: z.string().email('올바른 이메일 형식이 아닙니다.').optional().or(z.literal('')),
  manager: z.string().optional(),
  managerTel: z.string().optional(),
  description: z.string().optional(),
  useYn: z.string().optional(),
});

type CustomerFormValues = z.infer<typeof customerFormSchema>;

interface CustomerFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  initialData?: Customer;
}

export function CustomerFormDialog({ open, onOpenChange, mode, initialData }: CustomerFormDialogProps) {
  const queryClient = useQueryClient();

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      code: '',
      name: '',
      businessNumber: '',
      representative: '',
      address: '',
      addressDetail: '',
      tel: '',
      fax: '',
      email: '',
      manager: '',
      managerTel: '',
      description: '',
      useYn: 'Y',
    },
  });

  // 수정 모드일 때 초기 데이터 설정
  useEffect(() => {
    if (mode === 'edit' && initialData && open) {
      form.reset({
        code: initialData.code,
        name: initialData.name,
        businessNumber: initialData.businessNumber || '',
        representative: initialData.representative || '',
        address: initialData.address || '',
        addressDetail: initialData.addressDetail || '',
        tel: initialData.tel || '',
        fax: initialData.fax || '',
        email: initialData.email || '',
        manager: initialData.manager || '',
        managerTel: initialData.managerTel || '',
        description: initialData.description || '',
        useYn: initialData.useYn || 'Y',
      });
    } else if (mode === 'create' && open) {
      form.reset({
        code: '',
        name: '',
        businessNumber: '',
        representative: '',
        address: '',
        addressDetail: '',
        tel: '',
        fax: '',
        email: '',
        manager: '',
        managerTel: '',
        description: '',
        useYn: 'Y',
      });
    }
  }, [mode, initialData, open, form]);

  // 거래처 생성 mutation
  const createMutation = useMutation({
    mutationFn: (data: CustomerCreateRequest) => customerApi.createCustomer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      alert('거래처가 등록되었습니다.');
      onOpenChange(false);
    },
    onError: (error: any) => {
      alert(`거래처 등록 실패: ${error.message || '알 수 없는 오류'}`);
    },
  });

  // 거래처 수정 mutation
  const updateMutation = useMutation({
    mutationFn: (data: CustomerUpdateRequest) => customerApi.updateCustomer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      alert('거래처가 수정되었습니다.');
      onOpenChange(false);
    },
    onError: (error: any) => {
      alert(`거래처 수정 실패: ${error.message || '알 수 없는 오류'}`);
    },
  });

  // 폼 제출
  const onSubmit = (values: CustomerFormValues) => {
    if (mode === 'create') {
      createMutation.mutate(values as CustomerCreateRequest);
    } else if (initialData) {
      updateMutation.mutate({
        ...values,
        id: initialData.id,
      } as CustomerUpdateRequest);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? '거래처 등록' : '거래처 수정'}</DialogTitle>
          <DialogDescription>
            {mode === 'create' ? '새로운 거래처를 등록합니다.' : '거래처 정보를 수정합니다.'}
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
                      <FormLabel>거래처코드 *</FormLabel>
                      <FormControl>
                        <Input placeholder="거래처코드 입력" {...field} />
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
                      <FormLabel>거래처명 *</FormLabel>
                      <FormControl>
                        <Input placeholder="거래처명 입력" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="businessNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>사업자번호</FormLabel>
                      <FormControl>
                        <Input placeholder="000-00-00000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="representative"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>대표자명</FormLabel>
                      <FormControl>
                        <Input placeholder="대표자명 입력" {...field} />
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

            {/* 주소 정보 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">주소 정보</h3>
              <div className="grid gap-4 md:grid-cols-1">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>주소</FormLabel>
                      <FormControl>
                        <Input placeholder="주소 입력" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="addressDetail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>상세주소</FormLabel>
                      <FormControl>
                        <Input placeholder="상세주소 입력" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* 연락처 정보 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">연락처 정보</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="tel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>전화번호</FormLabel>
                      <FormControl>
                        <Input placeholder="000-0000-0000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fax"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>팩스번호</FormLabel>
                      <FormControl>
                        <Input placeholder="000-0000-0000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>이메일</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="example@email.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* 담당자 정보 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">담당자 정보</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="manager"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>담당자</FormLabel>
                      <FormControl>
                        <Input placeholder="담당자명 입력" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="managerTel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>담당자 연락처</FormLabel>
                      <FormControl>
                        <Input placeholder="000-0000-0000" {...field} />
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
