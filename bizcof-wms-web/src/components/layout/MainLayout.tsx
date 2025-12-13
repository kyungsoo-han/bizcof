import { useEffect } from 'react';
import { Outlet, useNavigate } from '@tanstack/react-router';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { AppHeader } from './AppHeader';
import { TabBar } from './TabBar';
import { useAuthStore } from '@/stores/authStore';
import { useTabStore } from '@/stores/tabStore';
import { VersionCheckAlert } from '@/features/version-check';

export function MainLayout() {
  const { isAuthenticated, checkAuth } = useAuthStore();
  const navigate = useNavigate();
  const { closeAllTabs } = useTabStore();

  useEffect(() => {
    checkAuth();

    // 새로고침 시 탭 초기화 및 메인 페이지로 이동
    closeAllTabs();
    if (window.location.pathname !== '/') {
      navigate({ to: '/' });
    }

    // 인증되지 않은 경우 로그인 페이지로 리다이렉트
    if (!isAuthenticated) {
      navigate({ to: '/login' });
    }
  }, [isAuthenticated, checkAuth, navigate, closeAllTabs]);

  // 인증되지 않은 경우 아무것도 렌더링하지 않음
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
            <Outlet />
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
