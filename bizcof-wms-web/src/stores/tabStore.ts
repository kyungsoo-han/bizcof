import { create } from 'zustand';

export interface Tab {
  id: string;
  title: string;
  path: string;
}

interface TabState {
  tabs: Tab[];
  activeTabId: string | null;
  addTab: (tab: Tab) => void;
  removeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  closeOtherTabs: (id: string) => void;
  closeAllTabs: () => void;
}

export const useTabStore = create<TabState>((set) => ({
  tabs: [],
  activeTabId: null,

  addTab: (tab) =>
    set((state) => {
      // 이미 존재하는 탭이면 활성화만
      const existingTab = state.tabs.find((t) => t.path === tab.path);
      if (existingTab) {
        return { activeTabId: existingTab.id };
      }

      // 새 탭 추가
      return {
        tabs: [...state.tabs, tab],
        activeTabId: tab.id,
      };
    }),

  removeTab: (id) =>
    set((state) => {
      const newTabs = state.tabs.filter((t) => t.id !== id);
      let newActiveTabId = state.activeTabId;

      // 활성 탭을 닫으면 마지막 탭을 활성화
      if (state.activeTabId === id && newTabs.length > 0) {
        newActiveTabId = newTabs[newTabs.length - 1].id;
      } else if (newTabs.length === 0) {
        newActiveTabId = null;
      }

      return {
        tabs: newTabs,
        activeTabId: newActiveTabId,
      };
    }),

  setActiveTab: (id) => set({ activeTabId: id }),

  closeOtherTabs: (id) =>
    set((state) => ({
      tabs: state.tabs.filter((t) => t.id === id),
      activeTabId: id,
    })),

  closeAllTabs: () =>
    set({
      tabs: [],
      activeTabId: null,
    }),
}));
