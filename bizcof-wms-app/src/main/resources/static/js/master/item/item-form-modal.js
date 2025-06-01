// static/js/master/item/item-form-modal.js

// 🔹 공통 유틸 / 모듈 import
import { FetchApi } from "/js/common/fetch-api.js";
import { selectCustomer } from "/js/master/customer/customer-search-modal.js";
import { validateFields, updateReadonlyValidation, showToast } from "/js/common/utils.js";

// 🔹 품목 저장 처리 함수
export async function SaveItem() {
    // 🔸 유효성 검사
    const form = document.getElementById("itemForm");
    if (!validateFields(form)) return false;

    // 🔸 입력값 수집
    const modal = document.getElementById("itemModal");
    const requestData = {
        name: modal.querySelector("#name").value,
        sname: modal.querySelector("#sname").value,
        ename: modal.querySelector("#ename").value,
        code: modal.querySelector("#code").value,
        customerId: modal.querySelector("#customerId").value,
        type: modal.querySelector("#type").value,
        spec: modal.querySelector("#spec").value,
        inventoryUnitCode: modal.querySelector("#inventoryUnitCode").value,
        skuUnitCode: modal.querySelector("#skuUnitCode").value,
        skuPerIuQty: modal.querySelector("#skuPerIuQty").value,
        boxPerSkuQty: modal.querySelector("#boxPerSkuQty").value,
        pltPerSkuQty: modal.querySelector("#pltPerSkuQty").value,
        price: modal.querySelector("#price").value,
        width: modal.querySelector("#width").value,
        depth: modal.querySelector("#depth").value,
        height: modal.querySelector("#height").value,
        weight: modal.querySelector("#weight").value,
        barcode: modal.querySelector("#barcode").value,
        memo: modal.querySelector("#memo").value,
        description: modal.querySelector("#description").value
    };

    // 🔸 API 호출 및 응답 처리
    const responseBody = await FetchApi('/api/master/item', 'POST', requestData);

    if (responseBody.statusCode === 'SUCCESS') {
        showToast('저장이 완료되었습니다.', 'success');
        return true;
    } else {
        showToast('저장이 실패했습니다.', 'error');
        return false;
    }
}

// 🔹 품목 저장 처리 함수
export async function UpdateItem(itemData) {
    // 🔸 유효성 검사
    const form = document.getElementById("itemForm");
    if (!validateFields(form)) return false;

    // 🔸 입력값 수집
    const modal = document.getElementById("itemModal");

    const customer = modal.querySelector("#customerName").value.match(/^\((.+?)\)\s*(.+)$/);    // 정규식을 이용해서 값의 코드와 문자 데이터를 분할

    // 반환된 값으로 바인딩하기 위해 추가 정보 request에 전송 => 그대로 반환
    const requestData = {
        id: itemData.id,
        name: modal.querySelector("#name").value,
        sname: modal.querySelector("#sname").value,
        ename: modal.querySelector("#ename").value,
        code: modal.querySelector("#code").value,
        customerId: modal.querySelector("#customerId").value,
        customerCode: customer[1],
        customerName: customer[2],
        type: modal.querySelector("#type").value,
        spec: modal.querySelector("#spec").value,
        inventoryUnitCode: modal.querySelector("#inventoryUnitCode").value,
        skuUnitCode: modal.querySelector("#skuUnitCode").value,
        skuPerIuQty: modal.querySelector("#skuPerIuQty").value,
        boxPerSkuQty: modal.querySelector("#boxPerSkuQty").value,
        pltPerSkuQty: modal.querySelector("#pltPerSkuQty").value,
        price: modal.querySelector("#price").value,
        width: modal.querySelector("#width").value,
        depth: modal.querySelector("#depth").value,
        height: modal.querySelector("#height").value,
        weight: modal.querySelector("#weight").value,
        barcode: modal.querySelector("#barcode").value,
        memo: modal.querySelector("#memo").value,
        description: modal.querySelector("#description").value
    };

    // 🔸 API 호출 및 응답 처리
    const responseBody = await FetchApi('/api/master/item', 'PUT', requestData);

    if (responseBody.statusCode === 'SUCCESS') {
        showToast('저장이 완료되었습니다.', 'success');
        return responseBody;    //콜백함수에서 처리
    } else {
        showToast('저장이 실패했습니다.', 'error');
        return responseBody;    //콜백함수에서 처리
    }
}

export async function GetItem(data) {
    document.getElementById("code").readOnly = true;
    document.getElementById("code").value = data.code;
    document.getElementById("name").value = data.name;
    document.getElementById("sname").value = data.sname;
    document.getElementById("ename").value = data.ename;
    document.getElementById("code").value = data.code;
    document.getElementById("customerId").value = data.customerId;
    document.getElementById("customerName").value = `(${data.customerCode}) ${data.customerName}`;
    document.getElementById("spec").value = data.spec;
    document.getElementById("type").value = data.type;
    document.getElementById("inventoryUnitCode").value = data.inventoryUnitCode;
    document.getElementById("skuUnitCode").value = data.skuUnitCode;
    document.getElementById("skuPerIuQty").value = data.skuPerIuQty;
    document.getElementById("boxPerSkuQty").value = data.boxPerSkuQty;
    document.getElementById("pltPerSkuQty").value = data.pltPerSkuQty;
    document.getElementById("price").value = data.price;
    document.getElementById("width").value = data.width;
    document.getElementById("depth").value = data.depth;
    document.getElementById("height").value = data.height;
    document.getElementById("weight").value = data.weight;
    document.getElementById("barcode").value = data.barcode;
    document.getElementById("memo").value = data.memo;
    document.getElementById("description").value = data.description;
}

// 🔹 모달 열릴 때 처리되는 초기 이벤트 바인딩
$(document).on("shown.bs.modal", "#itemModal", function () {


    // 🔸 거래처 검색 버튼 이벤트 연결
    document.getElementById("btnModalCustomerSearch").addEventListener("click", async () => {
        await selectCustomer((result) => {
            // 🔸 선택한 거래처 정보 입력
            document.querySelector("#customerId").value = result.id;
            //document.querySelector("#customerName").value = `(${result.code}) ${result.name}`;
            document.querySelector("#customerName").value = `(${result.code}) ${result.name}`;

            // 🔸 거래처 명 필드 유효성 갱신
            updateReadonlyValidation(document.querySelector("#customerName"));
        });
    });
});

