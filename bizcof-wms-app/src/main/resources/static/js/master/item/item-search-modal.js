// /static/js/master/item/item-search-modal.js

// ✅ RealGrid를 생성하는 헬퍼 함수 import
import { createGrid } from '/realgrid/realgrid-helper.js';

// ✅ 공통 API 호출 함수 import
import { FetchApi } from "/js/common/fetch-api.js";

// ✅ 품목 그리드에 사용할 필드 정의 (데이터 구조)
const itemSearchField = [
  { fieldName: "id", dataType: "text" },
  { fieldName: "code", dataType: "text" },
  { fieldName: "name", dataType: "text" },
  { fieldName: "spec", dataType: "text" },
  { fieldName: "inventoryUnitCode", dataType: "text" },
  { fieldName: "boxPerSkuQty", dataType: "text" },
  { fieldName: "pltPerSkuQty", dataType: "text" }
];

// ✅ 품목 그리드에 표시될 컬럼 정의 (UI 구성)
const itemSearchColumn = [
  { name: "id", fieldName: "id", type: "data", visible:false, width: "100", header: { text: "품목 ID" }, styleName: "text-right" },
  { name: "code", fieldName: "code", type: "data", width: "130", header: { text: "품목 코드" } },
  { name: "name", fieldName: "name", type: "data", width: "250", header: { text: "품목 명" }, styleName: "text-left" },
  { name: "spec", fieldName: "spec", type: "data", width: "130", header: { text: "규격" }, styleName: "text-left" },
  { name: "inventoryUnitCode", fieldName: "inventoryUnitCode", type: "data", width: "50", header: { text: "단위" } },
  { name: "boxPerSkuQty", fieldName: "boxPerSkuQty", type: "data",  width: "100", header: { text: "박스당 수량" }, styleName: "text-right" },
  { name: "pltPerSkuQty", fieldName: "pltPerSkuQty", type: "data",  width: "100", header: { text: "팔레트당 수량" }, styleName: "text-right" }
];

// ✅ 전역으로 선언했던 RealGrid 객체 → 유지
export let itemSearchDataProvider, itemSearchGridView;

// ✅ 콜백을 안전하게 관리하기 위한 Map
const itemCallbackMap = new Map();

/**
 * ✅ 그리드 초기화 함수
 * - 품목 검색 모달이 열릴 때 실행됨
 * - 전달된 콜백(onResultCallback)은 더블클릭 시 선택된 품목 데이터를 전달
 */
export function initItemSearchGrid(onResultCallback = null) {
  const grid = createGrid("itemSearchGrid", itemSearchField, itemSearchColumn, {
    editable: false,
    filterVisible: true,
    groupPanelVisible: false,
    footerVisible: false
  });

  itemSearchDataProvider = grid.dataProvider;
  itemSearchGridView = grid.gridView;

  // ✅ 그리드 행 더블클릭 시: 선택된 품목 데이터를 콜백으로 전달하고 모달을 닫음
  itemSearchGridView.onCellDblClicked = function () {
    const selected = getSelectedItem();
    if (!selected) return;

    resolveItemCallback(selected);
    $("#itemSearchModal").modal("hide");
  };
}

/**
 * ✅ 품목 검색 모달을 실행하고 결과를 콜백으로 전달하는 공통 함수
 * @param {Function} onResult - 품목 선택 시 실행할 콜백 (선택된 데이터가 전달됨)
 */
export async function selectItem(onResult, modalOptions = {}) {
  const { ModalLoader } = await import("/js/common/modal-helper.js");

  const callbackId = `cb_${Date.now()}`;
  itemCallbackMap.set(callbackId, onResult);

  await ModalLoader(
    "/view/master/item/search-modal", // 모달 템플릿
    "itemSearchModal",                // 모달 ID
    getSelectedItem,                  // 선택 함수
    "modal-item-search-container",    // 삽입될 컨테이너 ID
    {
      ...modalOptions,                // 모달창 옵션 ( 사이즈(modalWidth), 자동조회(autoSearch) 등..)
      onShown: () => {
        const modal = document.getElementById("itemSearchModal");
        if (modal) modal.dataset.callbackId = callbackId;
        initItemSearchGrid(onResult); // 그리드는 모달이 DOM에 추가된 후 초기화!
      }
    }
  );
}

/**
 * ✅ 현재 모달의 callbackId 기반으로 콜백 호출
 */

function resolveItemCallback(selectedItems) {
  const modal = document.getElementById("itemSearchModal");
  const callbackId = modal.dataset.callbackId;
  const callback = itemCallbackMap.get(callbackId);

  if (typeof callback === "function") {
    const items = Array.isArray(selectedItems) ? selectedItems : [selectedItems]; //더블클릭으로 인한 단일 선택이거나 chekcBox로 인한 배열 값
    callback(items);
    itemCallbackMap.delete(callbackId);
  }
}
/**
 * ✅ 품목 데이터를 서버에서 조회하고 그리드에 채우는 함수
 */
async function onItemSearch() {
  itemSearchGridView.showLoading();

  const keyword = document.getElementById("searchKeyword").value;
  const data = await FetchApi(`/api/master/item/modal?searchKeyword=${keyword}`, "GET");

  itemSearchDataProvider.fillJsonData(data, {});
  itemSearchGridView.closeLoading();
}

/**
 * ✅ 현재 그리드에서 선택된 품목 정보를 반환하는 함수
 * - 아무 것도 선택되지 않았을 경우 null 반환
 */
function getSelectedItem() {
  const idx = itemSearchGridView.getCurrent().dataRow;
  const selected = itemSearchDataProvider.getJsonRow(idx);

  if (!selected) {
    alert("품목를 선택해주세요.");
    return null;
  }

  return {
    id: selected.id,
    code: selected.code,
    name: selected.name,
    spec: selected.spec,
    inventoryUnitCode: selected.inventoryUnitCode,
    boxPerSkuQty: selected.boxPerSkuQty,
    pltPerSkuQty: selected.pltPerSkuQty
  };
}

/**
 * ✅ 모달이 화면에 표시될 때 이벤트 바인딩
 * - 조회 버튼: 품목 데이터 로딩
 * - 선택 버튼: 현재 선택된 품목 데이터를 콜백에 전달
 */
$(document).on("shown.bs.modal", "#itemSearchModal", function () {
  // 조회 버튼 이벤트 바인딩
  document.getElementById("btn-item-search").addEventListener("click", onItemSearch);

  // 선택 버튼 클릭 시 처리
  const btnSelect = document.getElementById("btnItemSelect");
  if (btnSelect) {
    btnSelect.addEventListener("click", () => {
      const selectedRows = itemSearchGridView.getCheckedRows();
      const selectedItems = selectedRows.map(row => itemSearchDataProvider.getJsonRow(row));
      resolveItemCallback(selectedItems);
      $("#itemSearchModal").modal("hide");
    });
  }

  // 엔터 입력 시 자동 조회
  document.getElementById("searchKeyword").addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      document.getElementById("btn-item-search").click();
    }
  });
});