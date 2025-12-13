import React, { lazy, Suspense } from 'react';
import { useTabStore } from '@/stores/tabStore';

// 라우트별 컴포넌트 lazy loading
const routeComponentMap: Record<string, React.LazyExoticComponent<React.ComponentType>> = {
  // 입고
  '/view/inbound/manage': lazy(() => import('@/routes/_layout/view/inbound/manage').then(m => ({ default: m.Route.options.component as React.ComponentType }))),

  // 출고
  '/view/outbound/manage': lazy(() => import('@/routes/_layout/view/outbound/manage').then(m => ({ default: m.Route.options.component as React.ComponentType }))),

  // 주문
  '/view/order/manage': lazy(() => import('@/routes/_layout/view/order/manage').then(m => ({ default: m.Route.options.component as React.ComponentType }))),

  // 재고
  '/view/inventory/list': lazy(() => import('@/routes/_layout/view/inventory/list').then(m => ({ default: m.Route.options.component as React.ComponentType }))),

  // 기준정보 - 품목
  '/view/master/item/list': lazy(() => import('@/routes/_layout/view/master/item/list').then(m => ({ default: m.Route.options.component as React.ComponentType }))),

  // 기준정보 - 거래처
  '/view/master/customer/list': lazy(() => import('@/routes/_layout/view/master/customer/list').then(m => ({ default: m.Route.options.component as React.ComponentType }))),

  // 기준정보 - BOM
  '/view/master/bom': lazy(() => import('@/routes/_layout/view/master/bom').then(m => ({ default: m.Route.options.component as React.ComponentType }))),

  // 자재 입고
  '/view/material/inbound': lazy(() => import('@/routes/_layout/view/material/inbound').then(m => ({ default: m.Route.options.component as React.ComponentType }))),

  // 시스템 - 사용자
  '/view/system/user': lazy(() => import('@/routes/_layout/view/system/user').then(m => ({ default: m.Route.options.component as React.ComponentType }))),

  // 시스템 - 메뉴
  '/view/system/menu': lazy(() => import('@/routes/_layout/view/system/menu').then(m => ({ default: m.Route.options.component as React.ComponentType }))),
};

// 로딩 컴포넌트
function TabLoading() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="text-muted-foreground">로딩 중...</p>
      </div>
    </div>
  );
}

export function TabContentArea() {
  const { tabs, activeTabId } = useTabStore();

  // 탭이 없으면 홈 화면 표시
  if (tabs.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        메뉴를 선택하세요
      </div>
    );
  }

  return (
    <>
      {tabs.map((tab) => {
        const Component = routeComponentMap[tab.path];

        if (!Component) {
          return (
            <div
              key={tab.id}
              style={{ display: activeTabId === tab.id ? 'block' : 'none' }}
              className="text-muted-foreground text-center py-8"
            >
              지원하지 않는 페이지입니다: {tab.path}
            </div>
          );
        }

        return (
          <div
            key={tab.id}
            style={{ display: activeTabId === tab.id ? 'block' : 'none' }}
          >
            <Suspense fallback={<TabLoading />}>
              <Component />
            </Suspense>
          </div>
        );
      })}
    </>
  );
}
