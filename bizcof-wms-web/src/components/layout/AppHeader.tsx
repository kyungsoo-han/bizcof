import { useNavigate, useLocation } from '@tanstack/react-router';
import { LogOut, User, Menu, ChevronRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuthStore } from '@/stores/authStore';
import { useSidebar } from '@/components/ui/sidebar';
import { useToast } from '@/hooks/useToast';
import { menuApi, type MenuItem } from '@/services/api/menu';

// 메뉴 트리에서 현재 경로에 해당하는 메뉴 찾기
function findMenuByPath(menuList: MenuItem[], path: string): { menu: MenuItem; parent?: MenuItem } | null {
  for (const menu of menuList) {
    if (menu.menuLocation === path) {
      return { menu };
    }
    if (menu.children && menu.children.length > 0) {
      for (const child of menu.children) {
        if (child.menuLocation === path) {
          return { menu: child, parent: menu };
        }
      }
    }
  }
  return null;
}

export function AppHeader() {
  const { user, logout } = useAuthStore();
  const { toggleSidebar } = useSidebar();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // 메뉴 리스트 가져오기
  const { data: menuList = [] } = useQuery({
    queryKey: ['menu-list'],
    queryFn: async () => {
      const list = await menuApi.getMenuList();
      return menuApi.buildMenuTree(list);
    },
  });

  // 현재 경로에 해당하는 메뉴 찾기
  const currentMenuInfo = findMenuByPath(menuList, location.pathname);

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: '로그아웃',
        description: '성공적으로 로그아웃되었습니다.',
      });
      navigate({ to: '/login' });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '로그아웃 실패',
        description: '로그아웃 중 오류가 발생했습니다.',
      });
    }
  };

  const userInitials = user?.username
    ? user.username
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 lg:px-6">
      <Button variant="ghost" size="icon" onClick={toggleSidebar}>
        <Menu className="h-5 w-5" />
      </Button>

      {/* 네비게이션 */}
      <div className="flex-1 flex items-center">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                onClick={() => navigate({ to: '/' })}
                className="cursor-pointer"
              >
                홈
              </BreadcrumbLink>
            </BreadcrumbItem>
            {currentMenuInfo && (
              <>
                {currentMenuInfo.parent && (
                  <>
                    <BreadcrumbSeparator>
                      <ChevronRight className="h-4 w-4" />
                    </BreadcrumbSeparator>
                    <BreadcrumbItem>
                      <span className="text-foreground">
                        {currentMenuInfo.parent.menuNm}
                      </span>
                    </BreadcrumbItem>
                  </>
                )}
                <BreadcrumbSeparator>
                  <ChevronRight className="h-4 w-4" />
                </BreadcrumbSeparator>
                <BreadcrumbItem>
                  <BreadcrumbPage className="font-bold">
                    {currentMenuInfo.menu.menuNm}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-9 w-9 rounded-full">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {userInitials}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user?.username || '사용자'}</p>
              {user?.email && (
                <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
              )}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>로그아웃</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
