// ✅ /static/js/order/manage/order-form-modal.js

// 📦 공통 유틸 및 모듈 임포트
import {FetchApi} from "/js/common/fetch-api.js";
import {selectCustomer} from "/js/master/customer/customer-search-modal.js";
import {selectItem} from "/js/master/item/item-search-modal.js";
import {orderMngModalProvider, orderMngModalGridView} from "./order-form-modal-grid.js";
import {
    validateFields,
    updateReadonlyValidation,
    showMessageModal,
    calculateUnitQty,
    validateGridFields,
    handleGridRowDelete
} from "/js/common/utils.js";

// 🔹 주문 등록 처리 함수
export async function SaveOrder() {
    const form = document.getElementById("orderForm");
    if (!validateFields(form)) return false;
    if (!validateGridFields(orderMngModalGridView, orderMngModalProvider, "상세 정보")) return false;

    const modal = document.getElementById("orderMngModal");

    const orderDate = modal.querySelector("#orderDate").value;
    const deliveryDate = modal.querySelector("#deliveryDate").value;
    const dueDate = modal.querySelector("#dueDate").value;
    const customerId = modal.querySelector("#customerId").value;
    const customerName = modal.querySelector("#customerName2").value;
    const deliveryId = modal.querySelector("#deliveryId").value;
    const deliveryAddress = modal.querySelector("#deliveryAddress").value;
    const phoneNbr = modal.querySelector("#phoneNbr").value;
    const memo = modal.querySelector("#memo").value;
    const customerMemo = modal.querySelector("#customerMemo").value;

    const detailItems = extractDetailItems(false);
    if (!detailItems) return false;

    const items = detailItems.map(item => ({
        itemId: item.itemId,
        itemName: item.itemName,
        orderQty: item.orderQty,
        subMemo: item.subMemo || ""
    }));

    const requestData = {
        orderDate,
        deliveryDate,
        dueDate,
        customerId,
        customerName,
        deliveryId,
        deliveryAddress,
        phoneNbr,
        memo,
        customerMemo,
        items
    };

    const response = await FetchApi("/api/order", "POST", requestData);
    if (response.statusCode === 'SUCCESS') {
        showMessageModal("success", "주문 등록이 완료되었습니다.");
        return true;
    } else {
        showMessageModal("error", "주문 등록에 실패했습니다.");
        return false;
    }
}

// 🔹 주문 수정 처리 함수
export async function UpdateOrder(headerData) {
    const form = document.getElementById("orderForm");
    if (!validateFields(form)) return false;
    if (!validateGridFields(orderMngModalGridView, orderMngModalProvider, "상세 정보")) return false;

    const modal = document.getElementById("orderMngModal");

    const orderDate = modal.querySelector("#orderDate").value;
    const deliveryDate = modal.querySelector("#deliveryDate").value;
    const dueDate = modal.querySelector("#dueDate").value;
    const customerId = modal.querySelector("#customerId").value;
    const customerName = modal.querySelector("#customerName").value;
    const deliveryId = modal.querySelector("#deliveryId").value;
    const deliveryAddress = modal.querySelector("#deliveryAddress").value;
    const phoneNbr = modal.querySelector("#phoneNbr").value;
    const memo = modal.querySelector("#memo").value;
    const customerMemo = modal.querySelector("#customerMemo").value;

    const detailItems = extractDetailItems(true);
    if (!detailItems) return false;

    const requestData = {
        orderNo: headerData.orderNo,
        orderDate,
        deliveryDate,
        dueDate,
        customerId,
        customerName,
        deliveryId,
        deliveryAddress,
        phoneNbr,
        memo,
        customerMemo,
        items: detailItems
    };

    const response = await FetchApi("/api/order", "PUT", requestData);
    if (response.statusCode === 'SUCCESS') {
        showMessageModal("success", "주문 수정이 완료되었습니다.");
        return true;
    } else {
        showMessageModal("error", "주문 수정에 실패했습니다.");
        return false;
    }
}

// 🔹 주문 상세 그리드 데이터 추출 함수
// ✅ 신규 입력/수정에 따라 orderId 포함 여부 결정 가능
function extractDetailItems(needSeq = false) {
    const itemCount = orderMngModalProvider.getRowCount();
    if (itemCount === 0) {
        showMessageModal('warning', '주문 상세 품목을 추가해주세요.');
        return null;
    }
    const items = [];
    for (let i = 0; i < itemCount; i++) {
        const item = {
            itemId: orderMngModalProvider.getValue(i, "itemId"),
            orderQty: orderMngModalProvider.getValue(i, "orderQty"),
            subMemo: orderMngModalProvider.getValue(i, "subMemo")
        };
        if (needSeq) {
            item.orderId = orderMngModalProvider.getValue(i, "orderId");
            item.isDeleted = orderMngModalProvider.getValue(i, "isDeleted");
        }
        if (!item.itemId || !item.orderQty) {
            showMessageModal('error', `주문 상세 ${i + 1}번 행에 필수값이 누락되었습니다.`);
            return null;
        }
        items.push(item);
    }
    return items;
}

// 🔹 모달 이벤트 초기 바인딩 처리 (데이터 세팅은 늦게 뜸)
// ✅ 모달 열릴 때 거래처 검색, 품목 추가/삭제, 수량 계산 등 기능 연결
$(document).on("shown.bs.modal", "#orderMngModal", function () {

    // 공통 초기화 실행
    //initOrderFormModal(headerData, detailList);

    // 🔸 거래처 검색 버튼 이벤트
    document.getElementById("btnModalCustomerSearch").addEventListener("click", async () => {
        await selectCustomer((result) => {
            document.querySelector("#customerId").value = result.id;
            document.querySelector("#customerName").value = result.name;
            document.querySelector("#customerName2").value = result.name;
            updateReadonlyValidation(document.querySelector("#customerName"));
        }, {autoSearch: true});
    });

    // 🔸 품목 추가 버튼 이벤트
    document.getElementById("btnAddItemSearch").addEventListener("click", async () => {
        await selectItem((selectedItems) => {
            if (!selectedItems || selectedItems.length === 0) return;
            selectedItems.forEach(item => {
                orderMngModalProvider.addRow({
                    itemId: item.id,
                    itemName: item.name,
                    pltPerSkuQty: item.pltPerSkuQty,
                    boxPerSkuQty: item.boxPerSkuQty
                });
            });
        }, {modalWidth: "900px"});
    });

    // 🔸 품목 삭제 버튼 이벤트
    /**
     * 품목 삭제 버튼 이벤트
     * => 저장되었던 데이터면 isDeleted: Y로 저장버튼 시 삭제 처리, 만약 저장된 데이터가 아니면 바로 removeRow
     */
    document.getElementById("btnRemoveItem").addEventListener("click", async () => {
        handleGridRowDelete(orderMngModalGridView, orderMngModalProvider, "orderId");
    });

    // 🔸 셀 편집 시 계산 로직 처리
    orderMngModalGridView.onCellEdited = function (grid, itemIndex, row, field) {
        const fieldName = grid.getColumn(field).fieldName;
        if (fieldName === "orderQty") {
            const orderQty = grid.getValue(itemIndex, "orderQty");
            const boxPerSkuQty = grid.getValue(itemIndex, "boxPerSkuQty");
            const pltPerSkuQty = grid.getValue(itemIndex, "pltPerSkuQty");
            const {boxQty, pltQty} = calculateUnitQty(orderQty, boxPerSkuQty, pltPerSkuQty);
            grid.setValues(itemIndex, {boxQty, pltQty});
        }
    };
});


