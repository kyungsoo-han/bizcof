// /static/js/material/order/order-task-grid.js
import {createGrid} from '/realgrid/realgrid-helper.js';
import {FetchApi} from "/js/common/fetch-api.js";

export let orderMngListProvider, orderMngListGridView, orderMngDetailListProvider, orderMngDetailListGridView;
let orderMngListField = [
    {fieldName: "orderNo", dataType: "text"},
    {fieldName: "orderDate", dataType: "text"},
    {fieldName: "deliveryDate", dataType: "text"},
    {fieldName: "dueDate", dataType: "text"},
    {fieldName: "customerId", dataType: "text"},
    {fieldName: "customerName", dataType: "text"},
    {fieldName: "customerName2", dataType: "text"},
    {fieldName: "deliveryId", dataType: "text"},
    {fieldName: "deliveryAddress", dataType: "text"},
    {fieldName: "phoneNbr", dataType: "text"},
    {fieldName: "memo", dataType: "text"},
    {fieldName: "customerMemo", dataType: "text"},
    {fieldName: "orderStatus", dataType: "text"}
];

let orderMngListColumn = [
    {name: "orderNo", fieldName: "orderNo", width: 140, header: {text: "주문 번호"}},
    {name: "orderDate", fieldName: "orderDate", width: 100, header: {text: "주문 일자"}},
    {name: "deliveryDate", fieldName: "deliveryDate", width: 100, header: {text: "배송 일자"}},
    {name: "dueDate", fieldName: "dueDate", width: 100, header: {text: "요청 납기일"}},
    {name: "customerId", fieldName: "customerId", width: 100, header: {text: "거래처 ID"}, visible: false},
    {name: "customerName", fieldName: "customerName", width: 150, header: {text: "고객 이름"}},
    {name: "customerName2", fieldName: "customerName2", width: 150, header: {text: "고객 이름2"}},
    {name: "deliveryId", fieldName: "deliveryId", width: 100, header: {text: "배송지 ID"}, visible: false},
    {name: "deliveryAddress", fieldName: "deliveryAddress", width: 200, header: {text: "배송지 주소"}, styleName: "text-left"},
    {name: "phoneNbr", fieldName: "phoneNbr", width: 120, header: {text: "연락처"}},
    {name: "memo", fieldName: "memo", width: 200, header: {text: "메모"}, styleName: "text-left"},
    {name: "customerMemo", fieldName: "customerMemo", width: 200, header: {text: "고객 요청사항"}, styleName: "text-left"},
    {name: "orderStatus", fieldName: "orderStatus", width: 100, header: {text: "주문 상태"}}
];


let orderMngDetailListField = [
    {fieldName: "itemId", dataType: "text"},
    {fieldName: "itemName", dataType: "text"},
    {fieldName: "orderQty", dataType: "number"},
    {fieldName: "subMemo", dataType: "text"}
];

let orderMngDetailListColumn = [
    {name: "itemId", fieldName: "itemId", width: 100, header: {text: "품목 ID"}, visible: false},
    {name: "itemName", fieldName: "itemName", width: 200, header: {text: "품목명"}, styleName: "text-left"},
    {name: "orderQty", fieldName: "orderQty", width: 100, header: {text: "주문 수량"}, styleName: "text-right"},
    {name: "subMemo", fieldName: "subMemo", width: 250, header: {text: "상세 메모"}, styleName: "text-left"}
];



document.addEventListener("DOMContentLoaded", () => {

    const masterGrid = createGrid("orderList", orderMngListField, orderMngListColumn, {
        checkBarVisible: false,
        editable: false,
        filtering: true
    });
    const detailGrid = createGrid("orderDetailList", orderMngDetailListField, orderMngDetailListColumn, {
        checkBarVisible: false,
        editable: false,
        filtering: true
    });

    orderMngListProvider = masterGrid.dataProvider;
    orderMngListGridView = masterGrid.gridView;

    orderMngDetailListProvider = detailGrid.dataProvider;
    orderMngDetailListGridView = detailGrid.gridView;

    orderMngListGridView.resetSize();
    orderMngDetailListGridView.resetSize();


});