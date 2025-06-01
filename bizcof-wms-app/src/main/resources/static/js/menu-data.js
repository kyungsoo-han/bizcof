// static/js/menu-data.js

import {FetchApi} from "/js/common/fetch-api.js";


let menuResponse = await FetchApi("/api/system/menu/list", "GET");
let menuData = menuResponse.data;

// 트리 구성 시작
buildMenuTree(menuData, "", $("#menuList"));

/**
 * 메뉴 데이터를 기반으로 재귀적으로 사이드 메뉴 트리 구성
 * @param {Array} data - 전체 메뉴 데이터
 * @param {string} parentCd - 상위 메뉴 코드
 * @param {jQuery} $container - 하위 메뉴를 삽입할 jQuery 객체
 */
function buildMenuTree(data, parentCd, $container) {
  const children = data.filter(item => item.parentCd === parentCd && item.useYn === 'Y');

  children.forEach(item => {
    const hasChildren = data.some(d => d.parentCd === item.menuCd && d.useYn === 'Y');
    const iconClass = item.icon || "far fa-circle";

    let $li;

    if (hasChildren) {
      // 드롭다운 메뉴
      $li = $(`
        <li class="nav-item has-treeview" id="${item.menuCd}">
          <a href="${item.menuLocation || '#'}" class="nav-link">
            <i class="${iconClass} nav-icon"></i>
            <p>
              ${item.menuNm}
              <i class="fas fa-angle-left right"></i>
            </p>
          </a>
          <ul class="nav nav-treeview" id="${item.menuCd}"></ul>
        </li>
      `);
    } else {
      // 최하위 iframe 메뉴
      $li = $(`
        <li class="nav-item" id="${item.menuCd}">
          <a href="${item.menuLocation || '#'}" class="nav-link" data-widget="iframe">
            <i class="${iconClass} nav-icon"></i>
            <p>${item.menuNm}</p>
          </a>
        </li>
      `);
    }

    $container.append($li);

    // 하위 메뉴가 있으면 재귀 호출
    if (hasChildren) {
      buildMenuTree(data, item.menuCd, $li.find("ul").first());
    }
  });
}