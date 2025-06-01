// /static/js/master/customer/customer-search-modal.js

// ✅ RealGrid를 생성하는 헬퍼 함수 import
import {createGrid} from '/realgrid/realgrid-helper.js';

// ✅ 공통 API 호출 함수 import
import {FetchApi} from "/js/common/fetch-api.js";

// ✅ 거래처 그리드에 사용할 필드 정의 (데이터 구조)
const customerSearchField = [
    {fieldName: "id", dataType: "text"},
    {fieldName: "code", dataType: "text"},
    {fieldName: "name", dataType: "text"}
];

// ✅ 거래처 그리드에 표시될 컬럼 정의 (UI 구성)
const customerSearchColumn = [
    {
        name: "id",
        fieldName: "id",
        type: "data",
        visible: false,
        width: "100",
        header: {text: "거래처 ID"},
        styleName: "text-right"
    },
    {name: "code", fieldName: "code", type: "data", width: "200", header: {text: "거래처 코드"}},
    {name: "name", fieldName: "name", type: "data", width: "300", header: {text: "거래처 명"}, styleName: "text-left"}
];

// ✅ 전역으로 선언했던 RealGrid 객체 → 유지
export let customerSearchDataProvider, customerSearchGridView;

// ✅ 콜백을 안전하게 관리하기 위한 Map
const customerCallbackMap = new Map();

/**
 * ✅ 그리드 초기화 함수
 * - 거래처 검색 모달이 열릴 때 실행됨
 * - 전달된 콜백(onResultCallback)은 더블클릭 시 선택된 거래처 데이터를 전달
 */
export function initCustomerSearchGrid(onResultCallback = null) {
    const grid = createGrid("customerSearchGrid", customerSearchField, customerSearchColumn, {
        checkBarVisible: false,
        editable: false,
        filterVisible: true,
        groupPanelVisible: false,
        footerVisible: false
    });

    customerSearchDataProvider = grid.dataProvider;
    customerSearchGridView = grid.gridView;

    // ✅ 그리드 행 더블클릭 시: 선택된 거래처 데이터를 콜백으로 전달하고 모달을 닫음
    customerSearchGridView.onCellDblClicked = function () {
        const selected = getSelectedCustomer();
        if (!selected) return;

        resolveCustomerCallback(selected);
        $("#customerSearchModal").modal("hide");
    };
}

/**
 * ✅ 거래처 검색 모달을 실행하고 결과를 콜백으로 전달하는 공통 함수
 * @param {Function} onResult - 거래처 선택 시 실행할 콜백 (선택된 데이터가 전달됨)
 */
export async function selectCustomer(onResult, modalOptions = {}) {
    const {ModalLoader} = await import("/js/common/modal-helper.js");

    const callbackId = `cb_${Date.now()}`;
    customerCallbackMap.set(callbackId, onResult);

    await ModalLoader(
        "/view/master/customer/search-modal",    // 모달 URL
        "customerSearchModal",              // 모달 ID
        getSelectedCustomer,                // 선택 함수
        "modal-customer-search-container",  // 삽입될 컨테이너 ID
        {
            // 🔹 모달이 열린 후에 callbackId 연결 (DOM이 준비된 이후!)
            onShown: () => {
                const modal = document.getElementById("customerSearchModal");
                if (modal) modal.dataset.callbackId = callbackId;
                initCustomerSearchGrid(onResult);
                if (modalOptions.autoSearch)
                    onCustomerSearch();
            },

            triggerSelector: "#btnCustomerSelect",
            onResult: onResult
        }
    );
}

/**
 * ✅ 현재 모달의 callbackId 기반으로 콜백 호출
 */
function resolveCustomerCallback(selected) {
    const modal = document.getElementById("customerSearchModal");
    const callbackId = modal?.dataset.callbackId;
    const callback = callbackId && customerCallbackMap.get(callbackId);
    if (typeof callback === "function") {
        callback(selected);
        customerCallbackMap.delete(callbackId); // 호출 후 제거
    }
}

/**
 * ✅ 거래처 데이터를 서버에서 조회하고 그리드에 채우는 함수
 */
async function onCustomerSearch() {
    customerSearchGridView.showLoading();

    const keyword = document.getElementById("searchKeyword").value;
    const data = await FetchApi(`/api/master/customer/modal?searchKeyword=${keyword}`, "GET");

    customerSearchDataProvider.fillJsonData(data, {});
    customerSearchGridView.closeLoading();
}

/**
 * ✅ 현재 그리드에서 선택된 거래처 정보를 반환하는 함수
 * - 아무 것도 선택되지 않았을 경우 null 반환
 */
function getSelectedCustomer() {
    const idx = customerSearchGridView.getCurrent().dataRow;
    const selected = customerSearchDataProvider.getJsonRow(idx);

    if (!selected) {
        alert("거래처를 선택해주세요.");
        return null;
    }

    return {
        id: selected.id,
        code: selected.code,
        name: selected.name
    };
}

/**
 * ✅ 모달이 화면에 표시될 때 이벤트 바인딩
 * - 조회 버튼: 거래처 데이터 로딩
 * - 선택 버튼: 현재 선택된 거래처 데이터를 콜백에 전달
 */
$(document).on("shown.bs.modal", "#customerSearchModal", function () {
    // 조회 버튼 이벤트 바인딩
    document.getElementById("btnCustomerSearch").addEventListener("click", onCustomerSearch);

    // 선택 버튼 클릭 시 처리
    const btnSelect = document.getElementById("btnCustomerSelect");
    if (btnSelect) {
        btnSelect.addEventListener("click", () => {
            const selected = getSelectedCustomer();
            if (selected) {
                resolveCustomerCallback(selected);
                $("#customerSearchModal").modal("hide");
            }
        });
    }

    // 엔터 입력 시 자동 조회
    document.getElementById("searchKeyword").addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
            e.preventDefault();
            document.getElementById("btnCustomerSearch").click();
        }
    });
});