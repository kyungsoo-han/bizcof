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
import { userApi, type User, type UserCreateRequest, type UserUpdateRequest } from '@/services/api/user';
import { Loader2 } from 'lucide-react';

// Zod 스키마 정의
const userFormSchema = z.object({
  userId: z.string().min(1, '사용자 ID는 필수입니다.'),
  password: z.string().optional(),
  userName: z.string().min(1, '사용자 명은 필수입니다.'),
  email: z.string().email('올바른 이메일 형식이 아닙니다.').optional().or(z.literal('')),
  tel: z.string().optional(),
  department: z.string().optional(),
  position: z.string().optional(),
  role: z.string().optional(),
  useYn: z.string().optional(),
});

type UserFormValues = z.infer<typeof userFormSchema>;

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  initialData?: User;
}

export function UserFormDialog({ open, onOpenChange, mode, initialData }: UserFormDialogProps) {
  const queryClient = useQueryClient();

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      userId: '',
      password: '',
      userName: '',
      email: '',
      tel: '',
      department: '',
      position: '',
      role: 'USER',
      useYn: 'Y',
    },
  });

  // 수정 모드일 때 초기 데이터 설정
  useEffect(() => {
    if (mode === 'edit' && initialData && open) {
      form.reset({
        userId: initialData.userId,
        password: '',
        userName: initialData.userName,
        email: initialData.email || '',
        tel: initialData.tel || '',
        department: initialData.department || '',
        position: initialData.position || '',
        role: initialData.role || 'USER',
        useYn: initialData.useYn || 'Y',
      });
    } else if (mode === 'create' && open) {
      form.reset({
        userId: '',
        password: '',
        userName: '',
        email: '',
        tel: '',
        department: '',
        position: '',
        role: 'USER',
        useYn: 'Y',
      });
    }
  }, [mode, initialData, open, form]);

  // 사용자 생성 mutation
  const createMutation = useMutation({
    mutationFn: (data: UserCreateRequest) => userApi.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      alert('사용자가 등록되었습니다.');
      onOpenChange(false);
    },
    onError: (error: any) => {
      alert(`사용자 등록 실패: ${error.message || '알 수 없는 오류'}`);
    },
  });

  // 사용자 수정 mutation
  const updateMutation = useMutation({
    mutationFn: (data: UserUpdateRequest) => userApi.updateUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      alert('사용자가 수정되었습니다.');
      onOpenChange(false);
    },
    onError: (error: any) => {
      alert(`사용자 수정 실패: ${error.message || '알 수 없는 오류'}`);
    },
  });

  // 폼 제출
  const onSubmit = (values: UserFormValues) => {
    if (mode === 'create') {
      if (!values.password) {
        alert('비밀번호를 입력해주세요.');
        return;
      }
      createMutation.mutate(values as UserCreateRequest);
    } else if (initialData) {
      const updateData: UserUpdateRequest = {
        id: initialData.id,
        userName: values.userName,
        email: values.email,
        tel: values.tel,
        department: values.department,
        position: values.position,
        role: values.role,
        useYn: values.useYn,
      };
      updateMutation.mutate(updateData);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? '사용자 등록' : '사용자 수정'}</DialogTitle>
          <DialogDescription>
            {mode === 'create' ? '새로운 사용자를 등록합니다.' : '사용자 정보를 수정합니다.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* 계정 정보 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">계정 정보</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="userId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>사용자 ID *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="사용자 ID 입력"
                          {...field}
                          disabled={mode === 'edit'}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {mode === 'create' && (
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>비밀번호 *</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="비밀번호 입력" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                <FormField
                  control={form.control}
                  name="userName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>사용자 명 *</FormLabel>
                      <FormControl>
                        <Input placeholder="사용자 명 입력" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>권한</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="선택" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ADMIN">관리자</SelectItem>
                          <SelectItem value="USER">일반사용자</SelectItem>
                        </SelectContent>
                      </Select>
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

            {/* 연락처 정보 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">연락처 정보</h3>
              <div className="grid gap-4 md:grid-cols-2">
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
                <FormField
                  control={form.control}
                  name="tel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>연락처</FormLabel>
                      <FormControl>
                        <Input placeholder="000-0000-0000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* 조직 정보 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">조직 정보</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>부서</FormLabel>
                      <FormControl>
                        <Input placeholder="부서 입력" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>직위</FormLabel>
                      <FormControl>
                        <Input placeholder="직위 입력" {...field} />
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
