// /js/system/menu/menu-manage.js

import {FetchApi} from "/js/common/fetch-api.js";
import {validateFields, resetValidationState, showToast} from "/js/common/utils.js";

let menuData = [];

// ✅ DOM이 모두 로드된 후 실행
document.addEventListener("DOMContentLoaded", async () => {
    const $tree = $("#menuTree");

    menuData = await FetchApi("/api/system/menu/list", "GET");
    // ▶️ 트리 구성
    buildTree(menuData.data, "", $tree);

    // ▶️ AdminLTE 트리뷰 플러그인 수동 초기화
    if (typeof $.fn.Treeview === "function") {
        $tree.Treeview();
    } else {
        console.warn("Treeview plugin not loaded");
    }

    // ▶️ 메뉴 클릭 이벤트 바인딩
    bindMenuClick($tree);

    // ▶️ 신규 등록 버튼 이벤트 바인딩
    bindNewRegister();

    menuRegister();
    UpdateMenu();
});


function menuRegister() {
    document.getElementById('btnMenuRegister').addEventListener('click', () => {
        if (document.getElementById('menuCd').readOnly) {
            showToast('신규 등록은 [초기화] 후에 진행해주세요.', 'warning');
            return;
        }
        const form = document.getElementById("menuForm");
        if (!validateFields(form)) return false;

        const requestData = {
            menuCd: document.getElementById('menuCd').value,
            menuNm: document.getElementById('menuNm').value,
            useYn: document.getElementById('useYn').value,
            parentCd: document.getElementById('parentCd').value,
            parentYn: document.getElementById('parentYn').value,
            menuLocation: document.getElementById('menuLocation').value,
            level: document.getElementById('level').value,
            icon: document.getElementById('icon').value
        }
        const responseBody = FetchApi('/api/system/menu', 'POST', requestData);
        if (responseBody.statusCode === 'SUCCESS') {
            showToast('저장이 완료되었습니다.', 'success');
            return responseBody;    //콜백함수에서 처리
        } else {
            showToast('저장이 실패했습니다.', 'error');
            return responseBody;    //콜백함수에서 처리
        }
    });
}

function UpdateMenu() {
    document.getElementById('btnMenuUpdate').addEventListener('click', async () => {
        const form = document.getElementById("menuForm");
        if (!validateFields(form)) return false;

        const requestData = {
            menuCd: document.getElementById('menuCd').value,
            menuNm: document.getElementById('menuNm').value,
            useYn: document.getElementById('useYn').value,
            parentCd: document.getElementById('parentCd').value,
            parentYn: document.getElementById('parentYn').value,
            menuLocation: document.getElementById('menuLocation').value,
            level: document.getElementById('level').value,
            icon: document.getElementById('icon').value
        }
        const responseBody = await FetchApi('/api/system/menu', 'PUT', requestData);
        if (responseBody.statusCode === 'SUCCESS') {
            showToast('저장이 완료되었습니다.', 'success');
            resetValidationState(form);
            return responseBody;    //콜백함수에서 처리
        } else {
            showToast('저장이 실패했습니다.', 'error');
            return responseBody;    //콜백함수에서 처리
        }
    });
}

/**
 * 신규 등록 버튼 클릭 시:
 * - 현재 트리에서 선택된 메뉴를 상위 메뉴로 설정
 * - 등록 폼을 초기화하고 parentCd, level 자동 설정
 * 이 기능은 사용자 편의성과 데이터 정합성을 높이기 위해 사용
 */
function bindNewRegister() {
    document.getElementById("btnNewMenuRegister").addEventListener("click", () => {
        const $activeLink = $("#menuTree .nav-link.active");

        document.getElementById("menuCd").readOnly = false;
        let parentCd = "";
        let parentLevel = 0;

        if ($activeLink.length > 0) {
            const $li = $activeLink.closest("li");
            const menuCd = $li.find("ul").attr("id") || $li.attr("id");
            const selectedMenu = menuData.data.find(item => item.menuCd === menuCd);

            if (selectedMenu) {
                parentCd = selectedMenu.menuCd;
                parentLevel = selectedMenu.level || 0;
            }
        }

        // ▶️ 폼 초기화 및 상위 메뉴 정보 설정
        $("#menuCd").val('');
        $("#menuNm").val('');
        $("#menuLocation").val('');
        $("#useYn").val('N');
        $("#parentCd").val(parentCd);
        $("#parentYn").val('N'); // 기본값: 하위 없음
        $("#level").val(parentLevel + 1); // 부모 레벨 + 1
        $("#icon").val('');
    });
}

/**
 * 트리에서 메뉴 항목 클릭 시:
 * - 선택된 메뉴를 활성화 (.active)
 * - 오른쪽 등록/수정 폼에 데이터 바인딩
 * - 토글 아이콘 클릭은 제외
 */
function bindMenuClick($tree) {
    $tree.on("click", ".nav-link", function (e) {
        // 토글 아이콘만 클릭한 경우는 선택 무시하고 열기/닫기만 수행
        if ($(e.target).closest("i.right.fas.fa-angle-left").length > 0) return;

        document.getElementById("menuCd").readOnly = true;

        e.preventDefault();

        // ▶️ 기존 활성화 해제 후, 현재 메뉴 활성화
        $(".nav-link").removeClass("active");
        $(this).addClass("active");

        // ▶️ 클릭한 메뉴명 기준으로 메뉴 데이터 조회
        const clickedMenuName = $(this).find("p").first().text().trim();
        const parentLi = $(this).closest("li");
        const menuId = parentLi.find("ul").attr("id") || parentLi.attr("id");
        const selectedMenu = menuData.data.find(item => item.menuNm === clickedMenuName);

        // ▶️ 폼에 값 바인딩
        if (selectedMenu) {
            $("#menuCd").val(selectedMenu.menuCd);
            $("#menuNm").val(selectedMenu.menuNm);
            $("#useYn").val(selectedMenu.useYn);
            $("#menuLocation").val(selectedMenu.menuLocation);
            $("#parentCd").val(selectedMenu.parentCd);
            $("#parentYn").val(selectedMenu.parentYn);
            $("#level").val(selectedMenu.level);
            $("#icon").val(selectedMenu.icon);
        } else {
            console.warn("선택한 메뉴 정보를 찾을 수 없습니다:", clickedMenuName);
        }
    });
}

/**
 * 메뉴 데이터를 기반으로 재귀적으로 트리 구조를 생성
 * @param {Array} data - 전체 메뉴 데이터 배열
 * @param {string} parentCd - 상위 메뉴 코드
 * @param {jQuery} $container - 하위 메뉴가 들어갈 ul
 */
function buildTree(data, parentCd, $container) {
    const children = data.filter(item => item.parentCd === parentCd);

    children.forEach(item => {
        const hasChildren = data.some(d => d.parentCd === item.menuCd);
        const icon = item.icon || "far fa-circle";

        // ▶️ 트리 노드 생성
        const $li = hasChildren
            ? $(`
          <li class="nav-item has-treeview menu-is-opening menu-open" id="${item.menuCd}">
            <a href="#" class="nav-link">
              <i class="${icon} nav-icon"></i>
              <p>
                ${item.menuNm}
                <i class="right fas fa-angle-left"></i>
              </p>
            </a>
            <ul class="nav nav-treeview" id="${item.menuCd}"></ul>
          </li>
        `)
            : $(`
          <li class="nav-item" id="${item.menuCd}">
            <a href="#" class="nav-link">
              <i class="${icon} nav-icon"></i>
              <p>${item.menuNm}</p>
            </a>
          </li>
        `);

        $container.append($li);

        // ▶️ 하위 메뉴가 있으면 재귀 호출
        if (hasChildren) {
            buildTree(data, item.menuCd, $li.find("ul").first());
        }
    });
}