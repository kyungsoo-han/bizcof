import { useNavigate, useLocation } from '@tanstack/react-router';
import { useTabStore } from '@/stores/tabStore';
import { X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRef, useState, useEffect } from 'react';

export function TabBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { tabs, activeTabId, setActiveTab, removeTab, closeOtherTabs, closeAllTabs } = useTabStore();
  const tabListRef = useRef<HTMLDivElement>(null);
  const [showScrollButtons, setShowScrollButtons] = useState(false);

  // URL과 activeTabId 동기화 (브라우저 뒤로가기/앞으로가기 지원)
  useEffect(() => {
    if (location.pathname === '/') {
      setActiveTab('');
      return;
    }
    // 현재 URL에 해당하는 탭 찾아서 활성화
    const matchingTab = tabs.find((t) => t.path === location.pathname);
    if (matchingTab && matchingTab.id !== activeTabId) {
      setActiveTab(matchingTab.id);
    }
  }, [location.pathname, tabs, activeTabId, setActiveTab]);

  useEffect(() => {
    const checkScroll = () => {
      if (tabListRef.current) {
        const { scrollWidth, clientWidth } = tabListRef.current;
        setShowScrollButtons(scrollWidth > clientWidth);
      }
    };

    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [tabs]);

  const handleTabClick = (tabId: string, path: string) => {
    setActiveTab(tabId);
    navigate({ to: path });
  };

  const handleCloseTab = (e: React.MouseEvent, tabId: string) => {
    e.stopPropagation();

    // 닫을 탭을 제외한 나머지 탭들
    const remainingTabs = tabs.filter((t) => t.id !== tabId);

    // 탭 제거
    removeTab(tabId);

    // 닫은 탭이 활성 탭이었으면 다른 탭으로 이동
    if (activeTabId === tabId) {
      if (remainingTabs.length > 0) {
        // 마지막 탭으로 이동
        const newActiveTab = remainingTabs[remainingTabs.length - 1];
        navigate({ to: newActiveTab.path });
      } else {
        // 모든 탭이 닫히면 홈으로
        navigate({ to: '/' });
      }
    }
  };

  const scrollTabs = (direction: 'left' | 'right') => {
    if (tabListRef.current) {
      const scrollAmount = 200;
      tabListRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (tabs.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center border-b bg-white" style={{ height: '40px' }}>
      {/* 닫기 드롭다운 */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="destructive" size="sm" className="h-full rounded-none border-r">
            닫기
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="mt-0">
          <DropdownMenuItem onClick={() => {
              closeAllTabs();
              navigate({ to: '/' });
            }}>
            모두 닫기
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => activeTabId && closeOtherTabs(activeTabId)}>
            다른 탭 닫기
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* 왼쪽 스크롤 */}
      {showScrollButtons && (
        <Button
          variant="ghost"
          size="sm"
          className="h-full rounded-none border-r px-2"
          onClick={() => scrollTabs('left')}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      )}

      {/* 탭 목록 */}
      <div
        ref={tabListRef}
        className="flex flex-1 overflow-x-auto scrollbar-hide"
        style={{ scrollbarWidth: 'none' }}
      >
        {tabs.map((tab) => (
          <div
            key={tab.id}
            onClick={() => handleTabClick(tab.id, tab.path)}
            className={`
              flex items-center gap-2 px-4 py-2 cursor-pointer border-r whitespace-nowrap
              bg-white hover:bg-gray-50 transition-colors
              ${activeTabId === tab.id ? 'border-b-2 border-b-black font-medium' : ''}
            `}
          >
            <span className="text-sm">{tab.title}</span>
            <button
              onClick={(e) => handleCloseTab(e, tab.id)}
              className="hover:bg-gray-200 rounded p-0.5 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>

      {/* 오른쪽 스크롤 */}
      {showScrollButtons && (
        <Button
          variant="ghost"
          size="sm"
          className="h-full rounded-none border-l px-2"
          onClick={() => scrollTabs('right')}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}

      {/* 전체화면 */}
      <Button variant="ghost" size="sm" className="h-full rounded-none border-l px-2">
        <Maximize2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
