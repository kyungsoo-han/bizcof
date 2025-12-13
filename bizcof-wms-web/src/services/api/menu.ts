import { api } from './client';

export interface MenuItem {
  menuCd: string;
  menuNm: string;
  menuLocation?: string;
  parentCd?: string;
  sortOrder: number;
  level: number;
  useYn: string;
  icon?: string;
  parentYn?: string;
  children?: MenuItem[];
  createdDt?: string;
  modifiedDt?: string;
}

// 메뉴 검색 요청
export interface MenuSearchRequest {
  menuCd?: string;
  menuNm?: string;
  useYn?: string;
}

// 메뉴 생성 요청
export interface MenuCreateRequest {
  menuCd: string;
  menuNm: string;
  menuLocation?: string;
  parentCd?: string;
  sortOrder: number;
  level: number;
  useYn?: string;
  icon?: string;
  parentYn?: string;
}

// 메뉴 수정 요청
export interface MenuUpdateRequest extends MenuCreateRequest {}

export const menuApi = {
  /**
   * 메뉴 목록 조회 (트리 구조)
   */
  async getMenuList(): Promise<MenuItem[]> {
    return api.get<MenuItem[]>('system/menu/list');
  },

  /**
   * 메뉴 목록 조회 (flat)
   */
  async getMenuListFlat(params?: MenuSearchRequest): Promise<MenuItem[]> {
    return api.get<MenuItem[]>('system/menu/list-flat', params);
  },

  /**
   * 메뉴 상세 조회
   */
  async getMenu(menuCd: string): Promise<MenuItem> {
    return api.get<MenuItem>(`system/menu/${menuCd}`);
  },

  /**
   * 메뉴 등록
   */
  async createMenu(data: MenuCreateRequest): Promise<string> {
    return api.post<string>('system/menu', data);
  },

  /**
   * 메뉴 수정
   */
  async updateMenu(data: MenuUpdateRequest): Promise<MenuUpdateRequest> {
    return api.put<MenuUpdateRequest>('system/menu', data);
  },

  /**
   * 메뉴 삭제
   */
  async deleteMenu(menuCd: string): Promise<void> {
    return api.delete(`system/menu/${menuCd}`);
  },

  /**
   * 메뉴를 트리 구조로 변환
   */
  buildMenuTree(menuList: MenuItem[]): MenuItem[] {
    const menuMap = new Map<string, MenuItem>();
    const rootMenus: MenuItem[] = [];

    // 먼저 모든 메뉴를 맵에 저장
    menuList.forEach((menu) => {
      menuMap.set(menu.menuCd, { ...menu, children: [] });
    });

    // 부모-자식 관계 설정
    menuList.forEach((menu) => {
      const menuItem = menuMap.get(menu.menuCd)!;

      if (menu.parentCd && menuMap.has(menu.parentCd)) {
        const parent = menuMap.get(menu.parentCd)!;
        if (!parent.children) {
          parent.children = [];
        }
        parent.children.push(menuItem);
      } else {
        rootMenus.push(menuItem);
      }
    });

    // 각 레벨에서 sortOrder로 정렬
    const sortMenus = (menus: MenuItem[]) => {
      menus.sort((a, b) => a.sortOrder - b.sortOrder);
      menus.forEach((menu) => {
        if (menu.children && menu.children.length > 0) {
          sortMenus(menu.children);
        }
      });
    };

    sortMenus(rootMenus);
    return rootMenus;
  },
};
