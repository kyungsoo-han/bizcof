import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { useTabStore } from '@/stores/tabStore';
import {
  Home,
  Package,
  Users,
  ClipboardList,
  Warehouse,
  ArrowUpCircle,
  ArrowDownCircle,
  Settings,
  ChevronRight,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarHeader,
} from '@/components/ui/sidebar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { menuApi, type MenuItem } from '@/services/api/menu';

// 아이콘 매핑 (FontAwesome class -> Lucide icon)
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'fas fa-box': Package,
  'fas fa-users': Users,
  'fas fa-cog': Settings,
  'fas fa-clipboard-list': ClipboardList,
  'fas fa-warehouse': Warehouse,
  'fas fa-arrow-up': ArrowUpCircle,
  'fas fa-arrow-down': ArrowDownCircle,
  'fas fa-home': Home,
};

function getIcon(iconName?: string) {
  if (!iconName) return Home;
  // FontAwesome 클래스를 Lucide 아이콘으로 매핑
  return iconMap[iconName] || Home;
}

function MenuItemComponent({ item }: { item: MenuItem }) {
  const location = useLocation();
  const navigate = useNavigate();
  const addTab = useTabStore((state) => state.addTab);
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = item.children && item.children.length > 0;
  const Icon = getIcon(item.icon);
  const isActive = item.menuLocation ? location.pathname === item.menuLocation : false;

  const handleMenuClick = (e: React.MouseEvent, menuItem: MenuItem) => {
    if (!menuItem.menuLocation) return;

    e.preventDefault();

    // 탭 추가
    addTab({
      id: menuItem.menuCd,
      title: menuItem.menuNm,
      path: menuItem.menuLocation,
    });

    // 페이지 이동
    navigate({ to: menuItem.menuLocation });
  };

  useEffect(() => {
    // 현재 경로가 자식 메뉴 중 하나와 일치하면 펼침
    if (hasChildren && item.children) {
      const hasActiveChild = item.children.some(
        (child) => child.menuLocation && location.pathname.startsWith(child.menuLocation)
      );
      if (hasActiveChild) {
        setIsOpen(true);
      }
    }
  }, [location.pathname, hasChildren, item.children]);

  if (hasChildren) {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="group/collapsible">
        <SidebarMenuItem>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton
              tooltip={item.menuNm}
              className="cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                setIsOpen(!isOpen);
              }}
            >
              <Icon className="h-4 w-4" />
              <span>{item.menuNm}</span>
              <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub>
              {item.children?.map((child) => {
                const ChildIcon = getIcon(child.icon);
                const isChildActive = child.menuLocation ? location.pathname === child.menuLocation : false;

                return (
                  <SidebarMenuSubItem key={child.menuCd}>
                    <SidebarMenuSubButton
                      isActive={isChildActive}
                      onClick={(e) => handleMenuClick(e, child)}
                      className="cursor-pointer"
                    >
                      <ChildIcon className="h-4 w-4" />
                      <span>{child.menuNm}</span>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                );
              })}
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
    );
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        tooltip={item.menuNm}
        isActive={isActive}
        onClick={(e) => handleMenuClick(e, item)}
      >
        <Icon className="h-4 w-4" />
        <span>{item.menuNm}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function AppSidebar() {
  const { data: menuList = [], isLoading } = useQuery({
    queryKey: ['menu-list'],
    queryFn: async () => {
      const list = await menuApi.getMenuList();
      return menuApi.buildMenuTree(list);
    },
  });

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-6 py-4">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <Package className="h-6 w-6" />
          <span className="text-lg">Bizcof WMS</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>메뉴</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {isLoading ? (
                <div className="px-2 py-4 text-sm text-muted-foreground">메뉴 로딩 중...</div>
              ) : menuList.length === 0 ? (
                <div className="px-2 py-4 text-sm text-muted-foreground">메뉴가 없습니다</div>
              ) : (
                menuList.map((item) => <MenuItemComponent key={item.menuCd} item={item} />)
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
