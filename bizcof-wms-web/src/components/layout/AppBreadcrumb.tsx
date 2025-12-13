import { Link, useLocation } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { Home } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { menuApi, type MenuItem } from '@/services/api/menu';

interface BreadcrumbSegment {
  title: string;
  href?: string;
}

export function AppBreadcrumb() {
  const location = useLocation();
  const { data: menuList = [] } = useQuery({
    queryKey: ['menu-list'],
    queryFn: async () => {
      const list = await menuApi.getMenuList();
      return list;
    },
  });

  // 모든 메뉴를 평탄화하여 검색하기 쉽게 만듦
  const flattenMenus = (menus: MenuItem[]): MenuItem[] => {
    const result: MenuItem[] = [];
    menus.forEach((menu) => {
      result.push(menu);
      if (menu.children) {
        result.push(...flattenMenus(menu.children));
      }
    });
    return result;
  };

  const allMenus = flattenMenus(menuList);

  // 현재 경로에 해당하는 메뉴 찾기
  const currentMenu = allMenus.find((menu) => menu.menuLocation === location.pathname);

  // 부모 메뉴들을 역순으로 찾기
  const getBreadcrumbPath = (menu: MenuItem | undefined): BreadcrumbSegment[] => {
    if (!menu) return [];

    const path: BreadcrumbSegment[] = [];
    let current: MenuItem | undefined = menu;

    while (current) {
      path.unshift({
        title: current.menuNm,
        href: current.menuLocation && current.menuLocation !== '#' ? current.menuLocation : undefined,
      });

      // 부모 메뉴 찾기
      if (current.parentCd) {
        current = allMenus.find((m) => m.menuCd === current!.parentCd);
      } else {
        current = undefined;
      }
    }

    return path;
  };

  const breadcrumbs: BreadcrumbSegment[] = [
    { title: '홈', href: '/' },
    ...getBreadcrumbPath(currentMenu),
  ];

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbs.map((item, index) => (
          <div key={index} className="flex items-center">
            {index > 0 && <BreadcrumbSeparator />}
            <BreadcrumbItem>

              {item.href  ? (
                <BreadcrumbLink asChild>
                  <Link to={item.href} className="flex items-center gap-1">
                    {index === 0 && <Home className="h-4 w-4" />}
                    {item.title}
                  </Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage>{item.title}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
          </div>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
