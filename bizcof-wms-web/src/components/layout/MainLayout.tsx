import { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from '@tanstack/react-router';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { AppHeader } from './AppHeader';
import { TabBar } from './TabBar';
import { TabContentArea } from './TabContentArea';
import { useAuthStore } from '@/stores/authStore';
import { useTabStore } from '@/stores/tabStore';
import { VersionCheckAlert } from '@/features/version-check';

export function MainLayout() {
  const { isAuthenticated, checkAuth } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { tabs } = useTabStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // 인증되지 않은 경우 로그인 페이지로 리다이렉트
  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: '/login' });
    }
  }, [isAuthenticated, navigate]);

  // 탭이 모두 닫혔는데 홈이 아닌 경우 홈으로 이동
  useEffect(() => {
    if (isAuthenticated && tabs.length === 0 && location.pathname !== '/') {
      navigate({ to: '/' });
    }
  }, [isAuthenticated, tabs.length, location.pathname, navigate]);

  // 인증되지 않은 경우 렌더링하지 않음 (리다이렉트 대기)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <VersionCheckAlert />
        <AppHeader />
        <TabBar />
        <div className="flex flex-1 flex-col gap-4 p-4">
          <main className="flex-1">
            {tabs.length > 0 ? <TabContentArea /> : <Outlet />}
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
