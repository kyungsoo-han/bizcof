import { useLocation } from '@tanstack/react-router';
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
  const location = useLocation();
  const { tabs, activeTabId, setActiveTab, removeTab, closeOtherTabs, closeAllTabs } = useTabStore();
  const tabListRef = useRef<HTMLDivElement>(null);
  const [showScrollButtons, setShowScrollButtons] = useState(false);

  // 홈으로 이동하면 활성 탭 제거
  useEffect(() => {
    if (location.pathname === '/') {
      setActiveTab('');
    }
  }, [location.pathname, setActiveTab]);

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

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    // navigate 제거 - TabContentArea가 activeTabId에 따라 렌더링
  };

  const handleCloseTab = (e: React.MouseEvent, tabId: string) => {
    e.stopPropagation();
    removeTab(tabId);
    // TabContentArea가 자동으로 다음 활성 탭을 렌더링
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
          <DropdownMenuItem onClick={() => closeAllTabs()}>
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
            onClick={() => handleTabClick(tab.id)}
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
