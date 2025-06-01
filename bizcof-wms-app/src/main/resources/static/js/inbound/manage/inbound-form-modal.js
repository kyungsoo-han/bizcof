// ✅ /static/js/inbound/manage/inbound-form-modal.js

// 📦 공통 유틸 및 모듈 임포트
import {FetchApi} from "/js/common/fetch-api.js";
import {selectCustomer} from "/js/master/customer/customer-search-modal.js";
import {selectItem} from "/js/master/item/item-search-modal.js";
import {inboundMngModalProvider, inboundMngModalGridView} from "./inbound-form-modal-grid.js";
import {
    validateFields,
    updateReadonlyValidation,
    showMessageModal,
    calculateUnitQty,
    validateGridFields
} from "/js/common/utils.js";

// 🔹 입고 등록 처리 함수
export async function SaveInbound() {
    // 🔸 1. 폼 필드 및 그리드 유효성 검사
    const form = document.getElementById("inboundForm");
    if (!validateFields(form)) return false;
    if (!validateGridFields(inboundMngModalGridView, inboundMngModalProvider, "상세 정보")) return false;

    // 🔸 2. 폼 데이터 수집
    const modal = document.getElementById("inboundMngModal");
    const inboundDate = modal.querySelector("#inboundDate").value;
    const customerId = modal.querySelector("#customerId").value;
    const inboundType = modal.querySelector("#inboundType").value;
    const memo = modal.querySelector("#memo").value;

    // 🔸 3. 그리드 데이터 수집 (입고 상세)
    const items = extractDetailItems();
    if (!items) return false;

    // 🔸 4. 등록 요청 데이터 구성
    const requestData = {inboundDate, customerId, inboundType, memo, items};
    const responseBody = await FetchApi('/api/inbound', 'POST', requestData);

    // 🔸 5. 서버 응답 결과 처리
    if (responseBody.statusCode === 'SUCCESS') {
        showMessageModal('success', '입고 등록이 완료되었습니다.');
        return true;
    } else {
        showMessageModal('error', '입고 등록에 실패했습니다.');
        return false;
    }
}

// 🔹 입고 수정 처리 함수
export async function UpdateInbound(headerData, detailList) {
    // 🔸 1. 폼 및 그리드 유효성 검사
    const form = document.getElementById("inboundForm");
    if (!validateFields(form)) return false;
    if (!validateGridFields(inboundMngModalGridView, inboundMngModalProvider, "상세 정보")) return false;

    // 🔸 2. 수정 요청 데이터 구성
    const modal = document.getElementById("inboundMngModal");
    const requestData = {
        inboundNo: headerData.inboundNo,
        inboundDate: modal.querySelector("#inboundDate").value,
        customerId: modal.querySelector("#customerId").value,
        inboundType: modal.querySelector("#inboundType").value,
        memo: modal.querySelector("#memo").value,
        items: extractDetailItems(true)
    };

    // 🔸 3. API 호출 및 응답 처리
    const responseBody = await FetchApi('/api/inbound', 'PUT', requestData);
    if (responseBody.statusCode === 'SUCCESS') {
        showMessageModal('success', '입고 수정이 완료되었습니다.');
    } else {
        showMessageModal('error', '입고 수정에 실패했습니다.');
    }
    return responseBody;
}

// 🔹 입고 상세 그리드 데이터 추출 함수
// ✅ 신규 입력/수정에 따라 seqNo 포함 여부 결정 가능
function extractDetailItems(needSeq = false) {
    const itemCount = inboundMngModalProvider.getRowCount();
    if (itemCount === 0) {
        showMessageModal('warning', '입고 상세 품목을 추가해주세요.');
        return null;
    }
    const items = [];
    for (let i = 0; i < itemCount; i++) {
        const item = {
            itemId: inboundMngModalProvider.getValue(i, "itemId"),
            inboundQty: inboundMngModalProvider.getValue(i, "inboundQty"),
            boxQty: inboundMngModalProvider.getValue(i, "boxQty"),
            pltQty: inboundMngModalProvider.getValue(i, "pltQty"),
            locationCode: inboundMngModalProvider.getValue(i, "locationCode"),
            expireDate: inboundMngModalProvider.getValue(i, "expireDate"),
            makeDate: inboundMngModalProvider.getValue(i, "makeDate"),
            makeNo: inboundMngModalProvider.getValue(i, "makeNo"),
            lotNo: inboundMngModalProvider.getValue(i, "lotNo"),
            memo: inboundMngModalProvider.getValue(i, "memo")
        };
        if (needSeq) {
            item.seqNo = inboundMngModalProvider.getValue(i, "seqNo");
            item.isDeleted = inboundMngModalProvider.getValue(i, "isDeleted");
        }
        if (!item.itemId || !item.inboundQty) {
            showMessageModal('error', `입고 상세 ${i + 1}번 행에 필수값이 누락되었습니다.`);
            return null;
        }
        items.push(item);
    }
    return items;
}

// 🔹 모달 이벤트 초기 바인딩 처리 (데이터 세팅은 늦게 뜸)
// ✅ 모달 열릴 때 거래처 검색, 품목 추가/삭제, 수량 계산 등 기능 연결
$(document).on("shown.bs.modal", "#inboundMngModal", function () {

    // 공통 초기화 실행
    //initInboundFormModal(headerData, detailList);

    // 🔸 거래처 검색 버튼 이벤트
    document.getElementById("btnModalCustomerSearch").addEventListener("click", async () => {
        await selectCustomer((result) => {
            document.querySelector("#customerId").value = result.id;
            document.querySelector("#customerName").value = result.name;
            updateReadonlyValidation(document.querySelector("#customerName"));
        }, {autoSearch: true});
    });

    // 🔸 품목 추가 버튼 이벤트
    document.getElementById("btnAddItemSearch").addEventListener("click", async () => {
        await selectItem((selectedItems) => {
            if (!selectedItems || selectedItems.length === 0) return;
            selectedItems.forEach(item => {
                inboundMngModalProvider.addRow({
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
        const current = inboundMngModalGridView.getCurrent();
        if (!current || current.dataRow < 0) {
            showMessageModal('warning', '삭제할 행을 선택해주세요.');
            return;
        }
        const seqNo = inboundMngModalProvider.getValue(current.dataRow, "seqNo");
        if (!seqNo) {
            inboundMngModalProvider.removeRow(current.dataRow);
        } else {
            inboundMngModalProvider.setValue(current.dataRow, "isDeleted", "Y");
            inboundMngModalGridView.setRowStyleCallback((grid, item) => {
                return inboundMngModalProvider.getValue(item.dataRow, "isDeleted") ? "deleted-row" : null;
            });
        }
    });

    // 🔸 셀 편집 시 계산 로직 처리
    inboundMngModalGridView.onCellEdited = function (grid, itemIndex, row, field) {
        const fieldName = grid.getColumn(field).fieldName;
        if (fieldName === "inboundQty") {
            const inboundQty = grid.getValue(itemIndex, "inboundQty");
            const boxPerSkuQty = grid.getValue(itemIndex, "boxPerSkuQty");
            const pltPerSkuQty = grid.getValue(itemIndex, "pltPerSkuQty");
            const {boxQty, pltQty} = calculateUnitQty(inboundQty, boxPerSkuQty, pltPerSkuQty);
            grid.setValues(itemIndex, {boxQty, pltQty});
        }
    };
});


