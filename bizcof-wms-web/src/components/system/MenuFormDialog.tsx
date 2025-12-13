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
import { menuApi, type MenuItem, type MenuCreateRequest, type MenuUpdateRequest } from '@/services/api/menu';
import { Loader2 } from 'lucide-react';

// Zod 스키마 정의
const menuFormSchema = z.object({
  menuCd: z.string().min(1, '메뉴코드는 필수입니다.'),
  menuNm: z.string().min(1, '메뉴명은 필수입니다.'),
  menuLocation: z.string().optional(),
  parentCd: z.string().optional(),
  sortOrder: z.number().min(0, '정렬순서는 0 이상이어야 합니다.'),
  level: z.number().min(1, '레벨은 1 이상이어야 합니다.'),
  useYn: z.string().optional(),
  icon: z.string().optional(),
  parentYn: z.string().optional(),
});

type MenuFormValues = z.infer<typeof menuFormSchema>;

interface MenuFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  initialData?: MenuItem;
}

export function MenuFormDialog({ open, onOpenChange, mode, initialData }: MenuFormDialogProps) {
  const queryClient = useQueryClient();

  const form = useForm<MenuFormValues>({
    resolver: zodResolver(menuFormSchema),
    defaultValues: {
      menuCd: '',
      menuNm: '',
      menuLocation: '',
      parentCd: '',
      sortOrder: 0,
      level: 1,
      useYn: 'Y',
      icon: '',
      parentYn: 'N',
    },
  });

  // 수정 모드일 때 초기 데이터 설정
  useEffect(() => {
    if (mode === 'edit' && initialData && open) {
      form.reset({
        menuCd: initialData.menuCd,
        menuNm: initialData.menuNm,
        menuLocation: initialData.menuLocation || '',
        parentCd: initialData.parentCd || '',
        sortOrder: initialData.sortOrder,
        level: initialData.level,
        useYn: initialData.useYn || 'Y',
        icon: initialData.icon || '',
        parentYn: initialData.parentYn || 'N',
      });
    } else if (mode === 'create' && open) {
      form.reset({
        menuCd: '',
        menuNm: '',
        menuLocation: '',
        parentCd: '',
        sortOrder: 0,
        level: 1,
        useYn: 'Y',
        icon: '',
        parentYn: 'N',
      });
    }
  }, [mode, initialData, open, form]);

  // 메뉴 생성 mutation
  const createMutation = useMutation({
    mutationFn: (data: MenuCreateRequest) => menuApi.createMenu(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menus-flat'] });
      queryClient.invalidateQueries({ queryKey: ['menu-list'] });
      alert('메뉴가 등록되었습니다.');
      onOpenChange(false);
    },
    onError: (error: any) => {
      alert(`메뉴 등록 실패: ${error.message || '알 수 없는 오류'}`);
    },
  });

  // 메뉴 수정 mutation
  const updateMutation = useMutation({
    mutationFn: (data: MenuUpdateRequest) => menuApi.updateMenu(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menus-flat'] });
      queryClient.invalidateQueries({ queryKey: ['menu-list'] });
      alert('메뉴가 수정되었습니다.');
      onOpenChange(false);
    },
    onError: (error: any) => {
      alert(`메뉴 수정 실패: ${error.message || '알 수 없는 오류'}`);
    },
  });

  // 폼 제출
  const onSubmit = (values: MenuFormValues) => {
    if (mode === 'create') {
      createMutation.mutate(values as MenuCreateRequest);
    } else {
      updateMutation.mutate(values as MenuUpdateRequest);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? '메뉴 등록' : '메뉴 수정'}</DialogTitle>
          <DialogDescription>
            {mode === 'create' ? '새로운 메뉴를 등록합니다.' : '메뉴 정보를 수정합니다.'}
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
                  name="menuCd"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>메뉴코드 *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="메뉴코드 입력"
                          {...field}
                          disabled={mode === 'edit'}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="menuNm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>메뉴명 *</FormLabel>
                      <FormControl>
                        <Input placeholder="메뉴명 입력" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="menuLocation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL</FormLabel>
                      <FormControl>
                        <Input placeholder="/view/example" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="parentCd"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>상위메뉴코드</FormLabel>
                      <FormControl>
                        <Input placeholder="상위메뉴코드 입력" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* 설정 정보 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">설정 정보</h3>
              <div className="grid gap-4 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>레벨 *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="레벨 입력"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sortOrder"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>정렬순서 *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="정렬순서 입력"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="icon"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>아이콘</FormLabel>
                      <FormControl>
                        <Input placeholder="fas fa-home" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="parentYn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>부모여부</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="선택" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Y">예</SelectItem>
                          <SelectItem value="N">아니오</SelectItem>
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
