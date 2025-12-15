import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface MenuState {
  expandedMenus: string[];
  toggleMenu: (menuCd: string) => void;
  setExpanded: (menuCd: string, expanded: boolean) => void;
  isExpanded: (menuCd: string) => boolean;
}

export const useMenuStore = create<MenuState>()(
  persist(
    (set, get) => ({
      expandedMenus: [],

      toggleMenu: (menuCd) =>
        set((state) => {
          const isCurrentlyExpanded = state.expandedMenus.includes(menuCd);
          if (isCurrentlyExpanded) {
            return { expandedMenus: state.expandedMenus.filter((id) => id !== menuCd) };
          } else {
            return { expandedMenus: [...state.expandedMenus, menuCd] };
          }
        }),

      setExpanded: (menuCd, expanded) =>
        set((state) => {
          const isCurrentlyExpanded = state.expandedMenus.includes(menuCd);
          if (expanded && !isCurrentlyExpanded) {
            return { expandedMenus: [...state.expandedMenus, menuCd] };
          } else if (!expanded && isCurrentlyExpanded) {
            return { expandedMenus: state.expandedMenus.filter((id) => id !== menuCd) };
          }
          return state;
        }),

      isExpanded: (menuCd) => get().expandedMenus.includes(menuCd),
    }),
    {
      name: 'menu-storage',
      storage: {
        getItem: (name) => {
          const value = sessionStorage.getItem(name);
          return value ? JSON.parse(value) : null;
        },
        setItem: (name, value) => {
          sessionStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          sessionStorage.removeItem(name);
        },
      },
    }
  )
);
