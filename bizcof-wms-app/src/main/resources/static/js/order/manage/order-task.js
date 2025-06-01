// ✅ /static/js/material/order/order-task.js

import {FetchApi} from "/js/common/fetch-api.js";
import {
    orderMngDetailListGridView,
    orderMngDetailListProvider,
    orderMngListGridView,
    orderMngListProvider
} from "./order-task-grid.js";
import {createOrderMngModalGrid, orderMngModalProvider} from "./order-form-modal-grid.js";
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
import {SaveOrder, UpdateOrder} from "/js/order/manage/order-form-modal.js";


/**
 * ✅ 문서 로딩 시 기본 이벤트 바인딩 처리
 */
document.addEventListener("DOMContentLoaded", function () {
    // 날짜 range picker 초기화
    initDateRangePicker('searchDateRange', {
        preset: "last7days",
        startKey: "orderStartDate",
        endKey: "orderEndDate"
    });
    // const el = document.getElementById("searchDateRange");
    // const startDate = el.dataset.startDate || null;
    // const endDate = el.dataset.endDate || null;

    const btnSearch = document.getElementById("btnSearch");
    btnSearch.addEventListener("click", handleSearch);

    orderMngListGridView.onCellClicked = handleHeaderRowClick;
});

/**
 * 🔍 검색 버튼 클릭 시 주문 헤더 + 상세 초기화
 */
async function handleSearch() {

    if (!checkRequiredSearchFields()) return;

    orderMngListGridView.showLoading();
    const params = getSearchParams();
    const responseBody = await FetchApi("/api/order/header", "GET", params);
    orderMngListProvider.fillJsonData(responseBody.data, {});
    orderMngDetailListProvider.clearRows();
    orderMngListGridView.closeLoading();
}

/**
 * 📌 행 클릭 시 해당 주문번호의 상세 리스트 바인딩
 */
async function handleHeaderRowClick(grid, clickData) {

    const row = clickData.dataRow;
    if (row == null || row < 0) return;

    orderMngDetailListGridView.showLoading();
    const selectedData = orderMngListProvider.getJsonRow(row);
    const orderNo = selectedData.orderNo;
    const detailResponse = await FetchApi(`/api/order/detail/${orderNo}`, "GET");
    orderMngDetailListProvider.fillJsonData(detailResponse.data, {});
    orderMngDetailListGridView.closeLoading();
}

/**
 * ➕ 주문 등록 버튼 클릭 시 모달 호출
 */
document.getElementById("btnOrderRegister").addEventListener("click", async () => {

    await ModalLoader("/view/order/manage/form-modal", "orderMngModal", SaveOrder, 'modal-order-form-container', {
        triggerSelector: "#btnSaveOrder",
        backdrop: true,
        onShown: () => {
            initorderFormModal();
        }
    });
});

/**
 * ✏️ 주문 수정 버튼 클릭 시 모달 + 데이터 바인딩
 */
document.getElementById("btnOrderUpdate").addEventListener("click", async () => {
    const current = orderMngListGridView.getCurrent();
    const row = current.dataRow;
    if (row < 0) return;

    const headerData = orderMngListProvider.getJsonRow(row);
    const orderNo = headerData.orderNo;
    const orderStatus = headerData.orderStatus;
    if (orderStatus === 'CONFIRMED') {
        showMessageModal("warning", "확정된 주문을 수정할 수 없습니다.");
        return;
    }

    const detailResponse = await FetchApi(`/api/order/detail/${orderNo}`, "GET");
    const detailList = detailResponse.data;

    await ModalLoader("/view/order/manage/form-modal", "orderMngModal", () => UpdateOrder(headerData, detailList), 'modal-order-form-container', {
        triggerSelector: "#btnSaveOrder",
        backdrop: true,
        onResult: () => {
            const header = extractHeaderFromForm();
            const details = extractDetailsFromGrid();

            orderMngListProvider.updateRow(row, header);
            //orderMngDetailListProvider.fillJsonData(details, {});
        },
        onShown: () => {
            initorderFormModal(headerData, detailList);
        }
    });
});


/**
 * 🗑️ 주문 삭제 버튼 클릭
 */
document.getElementById("btnOrderDelete").addEventListener("click", async () => {
    const current = orderMngListGridView.getCurrent();
    const row = current.dataRow;

    if (row < 0) {
        showMessageModal("warning", "삭제할 행을 선택해야합니다.");
        return;
    }

    const rowData = orderMngListProvider.getJsonRow(row);
    const orderNo = rowData.orderNo;
    const orderStatus = rowData.orderStatus;
    if (orderStatus !== 'REGISTERED') {
        showMessageModal("warning", "주문이 홗정되어 삭제할 수 없습니다.");
        return;
    }

    const confirmed = await showConfirmModal(`주문번호 ${orderNo}를 삭제하시겠습니까?`);
    if (!confirmed) return;

    const result = await FetchApi(`/api/order/${orderNo}`, "DELETE");

    if (result.statusCode === 'SUCCESS') {
        showMessageModal("success", "삭제가 완료되었습니다.");
        orderMngListProvider.removeRow(row);
        orderMngDetailListProvider.clearRows();
    } else {
        showMessageModal("error", "삭제를 실패했습니다.");
    }
});

/**
 * 🗑️ 주문 확정 버튼 클릭
 */
document.getElementById("btnOrderConfirm").addEventListener("click", async () => {
    const current = orderMngListGridView.getCurrent();
    const row = current.dataRow;

    if (row < 0) {
        showMessageModal("warning", "확정할 행을 선택해야합니다.");
        return;
    }

    const rowData = orderMngListProvider.getJsonRow(row);
    const orderNo = rowData.orderNo;
    const orderStatus = rowData.orderStatus;
    if (orderStatus === 'CONFIRMED') {
        showMessageModal("warning", "이미 확정되었습니다.");
        return;
    }

    const confirmed = await showConfirmModal(`주문번호 ${orderNo}를 확정하시겠습니까?`);
    if (!confirmed) return;

    const confirm = {
        orderNo: orderNo
    }

    const result = await FetchApi('/api/order/confirm', "POST", confirm);

    if (result.statusCode === 'SUCCESS') {
        showMessageModal("success", "확정이 완료되었습니다.");
        orderMngListGridView.setValue(row, "orderStatus", "CONFIRMED");
    } else {
        showMessageModal("error", result.message);
    }
});

/**
 * 🧩 모달 폼에서 헤더 정보 추출
 */
function extractHeaderFromForm() {
    return {
        orderNo: document.getElementById("orderNo").value,
        orderDate: document.querySelector("#orderDate").value,
        customerId: document.getElementById("customerId").value,
        customerName: document.getElementById("customerName").value,
        memo: document.getElementById("memo").value
    };
}

/**
 * 🧩 모달 폼에서 상세 그리드 정보 추출
 */
function extractDetailsFromGrid() {
    const details = [];
    const rowCount = orderMngModalProvider.getRowCount();
    for (let i = 0; i < rowCount; i++) {
        const row = {};
        orderMngModalProvider.getFieldNames().forEach(field => {
            row[field] = orderMngModalProvider.getValue(i, field);
        });
        details.push(row);
    }
    return details;
}

/**
 * 📌 주문 모달 폼 공통 초기화 (등록/수정 공용)
 * @param {Object|null} headerData - 헤더 데이터 (수정일 경우만 존재)
 * @param {Array|null} detailList - 상세 리스트 데이터 (수정일 경우만 존재)
 */
function initorderFormModal(headerData = null, detailList = null) {
    const modal = document.getElementById("orderMngModal");


    // 🔹 기본 필드 설정 (등록/수정 공용 처리)
    modal.querySelector("#orderNo").value = headerData?.orderNo || "";
    modal.querySelector("#orderDate").value = headerData?.orderDate || "";
    modal.querySelector("#customerId").value = headerData?.customerId || "";
    modal.querySelector("#customerName").value = headerData?.customerName || "";
    modal.querySelector("#customerName2").value = headerData?.customerName2 || "";
    modal.querySelector("#deliveryId").value = headerData?.deliveryId || "";
    modal.querySelector("#customerMemo").value = headerData?.customerMemo || "";
    modal.querySelector("#deliveryAddress").value = headerData?.deliveryAddress || "";
    modal.querySelector("#memo").value = headerData?.memo || "";

    // 🔹 상세 그리드 초기화
    const {orderMngModalProvider, orderMngModalGridView} = createOrderMngModalGrid();

    if (detailList && detailList.length > 0) {
        orderMngModalProvider.fillJsonData(detailList, {});
    }

    orderMngModalGridView.resetSize();

    // 🔹 모달 타이틀 설정
    document.querySelector("#orderMngModal .modal-title").textContent = headerData ? "주문 수정" : "주문 등록";

    // 🔹 주문 일자 datepicker 초기화
    initDatePicker("orderDate");
    initDatePicker("deliveryDate");
    initDatePicker("dueDate");
}