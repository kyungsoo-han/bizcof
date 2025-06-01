// ✅ /static/js/material/inbound/inbound-task.js

import {FetchApi} from "/js/common/fetch-api.js";
import {
    InboundMngDetailListGridView,
    InboundMngDetailListProvider,
    InboundMngListGridView,
    InboundMngListProvider
} from "./inbound-task-grid.js";
import {createInboundMngModalGrid, inboundMngModalProvider} from "./inbound-form-modal-grid.js";
import {ModalLoader} from "/js/common/modal-helper.js";
import {
    getSearchParams,
    showMessageModal,
    showConfirmModal,
    initDateRangePicker,
    checkRequiredSearchFields,
    initCommonCode,
    initDatePicker
} from "/js/common/utils.js";
import {SaveInbound, UpdateInbound} from "/js/inbound/manage/inbound-form-modal.js";


/**
 * ✅ 문서 로딩 시 기본 이벤트 바인딩 처리
 */
document.addEventListener("DOMContentLoaded", function () {
    // 날짜 range picker 초기화
    initDateRangePicker('searchDateRange', {
        preset: "last7days",
        startKey: "inboundStartDate",
        endKey: "inboundEndDate"
    });
    // const el = document.getElementById("searchDateRange");
    // const startDate = el.dataset.startDate || null;
    // const endDate = el.dataset.endDate || null;

    const btnSearch = document.getElementById("btnSearch");
    btnSearch.addEventListener("click", handleSearch);

    InboundMngListGridView.onCellClicked = handleHeaderRowClick;
});

/**
 * 🔍 검색 버튼 클릭 시 입고 헤더 + 상세 초기화
 */
async function handleSearch() {

    if (!checkRequiredSearchFields()) return;

    InboundMngListGridView.showLoading();
    const params = getSearchParams();
    const responseBody = await FetchApi("/api/inbound/header", "GET", params);
    InboundMngListProvider.fillJsonData(responseBody.data, {});
    InboundMngDetailListProvider.clearRows();
    InboundMngListGridView.closeLoading();
}

/**
 * 📌 행 클릭 시 해당 입고번호의 상세 리스트 바인딩
 */
async function handleHeaderRowClick(grid, clickData) {

    const row = clickData.dataRow;
    if (row == null || row < 0) return;

    InboundMngDetailListGridView.showLoading();
    const selectedData = InboundMngListProvider.getJsonRow(row);
    const inboundNo = selectedData.inboundNo;
    const detailResponse = await FetchApi(`/api/inbound/detail/${inboundNo}`, "GET");
    InboundMngDetailListProvider.fillJsonData(detailResponse.data, {});
    InboundMngDetailListGridView.closeLoading();
}

/**
 * ➕ 입고 등록 버튼 클릭 시 모달 호출
 */
document.getElementById("btnInboundRegister").addEventListener("click", async () => {

    await ModalLoader("/view/inbound/manage/form-modal", "inboundMngModal", SaveInbound, 'modal-inbound-form-container', {
        triggerSelector: "#btnSaveInbound",
        backdrop: true,
        onShown: () => {
          initInboundFormModal();
        }
    });
});

/**
 * ✏️ 입고 수정 버튼 클릭 시 모달 + 데이터 바인딩
 */
document.getElementById("btnInboundUpdate").addEventListener("click", async () => {
    const current = InboundMngListGridView.getCurrent();
    const row = current.dataRow;
    if (row < 0) return;

    const headerData = InboundMngListProvider.getJsonRow(row);
    const inboundNo = headerData.inboundNo;
    const detailResponse = await FetchApi(`/api/inbound/detail/${inboundNo}`, "GET");
    const detailList = detailResponse.data;

    await ModalLoader("/view/inbound/manage/form-modal", "inboundMngModal", () => UpdateInbound(headerData, detailList), 'modal-inbound-form-container', {
        triggerSelector: "#btnSaveInbound",
        backdrop: true,
        onResult: () => {
            const header = extractHeaderFromForm();
            const details = extractDetailsFromGrid();

            InboundMngListProvider.updateRow(row, header);
            //InboundMngDetailListProvider.fillJsonData(details, {});
        },
        onShown: () => {
          initInboundFormModal(headerData, detailList);
        }
    });
});


/**
 * 🗑️ 입고 삭제 버튼 클릭
 */
document.getElementById("btnInboundDelete").addEventListener("click", async () => {
    const current = InboundMngListGridView.getCurrent();
    const row = current.dataRow;

    if (row < 0) {
        showMessageModal("warning", "삭제할 행을 선택해야합니다.");
        return;
    }

    const rowData = InboundMngListProvider.getJsonRow(row);
    const inboundNo = rowData.inboundNo;
    const confirmed = await showConfirmModal(`입고번호 ${inboundNo}를 삭제하시겠습니까?`);
    if (!confirmed) return;

    const result = await FetchApi(`/api/inbound/${inboundNo}`, "DELETE");

    if (result.statusCode === 'SUCCESS') {
        showMessageModal("success", "삭제가 완료되었습니다.");
        InboundMngListProvider.removeRow(row);
        InboundMngDetailListProvider.clearRows();
    } else {
        showMessageModal("error", "삭제를 실패했습니다.");
    }
});

/**
 * 🧩 모달 폼에서 헤더 정보 추출
 */
function extractHeaderFromForm() {
    return {
        inboundNo: document.getElementById("inboundNo").value,
        inboundDate: document.querySelector("#inboundDate").value,
        customerId: document.getElementById("customerId").value,
        customerName: document.getElementById("customerName").value,
        inboundType: document.getElementById("inboundType").value,
        memo: document.getElementById("memo").value,
        status: "수정됨"
    };
}

/**
 * 🧩 모달 폼에서 상세 그리드 정보 추출
 */
function extractDetailsFromGrid() {
    const details = [];
    const rowCount = inboundMngModalProvider.getRowCount();
    for (let i = 0; i < rowCount; i++) {
        const row = {};
        inboundMngModalProvider.getFieldNames().forEach(field => {
            row[field] = inboundMngModalProvider.getValue(i, field);
        });
        details.push(row);
    }
    return details;
}

/**
 * 📌 입고 모달 폼 공통 초기화 (등록/수정 공용)
 * @param {Object|null} headerData - 헤더 데이터 (수정일 경우만 존재)
 * @param {Array|null} detailList - 상세 리스트 데이터 (수정일 경우만 존재)
 */
 function initInboundFormModal(headerData = null, detailList = null) {
  const modal = document.getElementById("inboundMngModal");

  // 🔹 입고 타입 Select 바인딩 (수정 시 selectedValue 포함)
  initCommonCode("INBOUND_TYPE", "inboundType", {
    selectedValue: headerData?.inboundType
  });

  // 🔹 기본 필드 설정 (등록/수정 공용 처리)
  modal.querySelector("#inboundNo").value = headerData?.inboundNo || "";
  modal.querySelector("#inboundDate").value = headerData?.inboundDate || "";
  modal.querySelector("#customerId").value = headerData?.customerId || "";
  modal.querySelector("#customerName").value = headerData?.customerName || "";
  //modal.querySelector("#inboundType").value = headerData?.inboundType || "";
  modal.querySelector("#memo").value = headerData?.memo || "";

  // 🔹 상세 그리드 초기화
  const {inboundMngModalProvider, inboundMngModalGridView} = createInboundMngModalGrid();

  if (detailList && detailList.length > 0) {
    inboundMngModalProvider.fillJsonData(detailList, {});
  }

  inboundMngModalGridView.resetSize();

  // 🔹 모달 타이틀 설정
  document.querySelector("#inboundMngModal .modal-title").textContent = headerData ? "입고 수정" : "입고 등록";

  // 🔹 입고 일자 datepicker 초기화
  initDatePicker("inboundDate");
}