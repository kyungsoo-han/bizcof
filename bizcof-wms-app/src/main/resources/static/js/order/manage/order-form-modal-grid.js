// /static/js/material/order/modal-order-task-grid.js
import {createGrid} from '/realgrid/realgrid-helper.js';

export let orderMngModalProvider, orderMngModalGridView;

let orderMngModalField = [
    {fieldName: "orderId"},
    {fieldName: "itemId", dataType: "text"},
    {fieldName: "itemName", dataType: "text"},
    {fieldName: "boxPerSkuQty", dataType: "text"},
    {fieldName: "boxQty", dataType: "text"},
    {fieldName: "pltPerSkuQty", dataType: "text"},
    {fieldName: "pltQty", dataType: "text"},
    {fieldName: "orderQty", dataType: "text"},
    {fieldName: "subMemo", dataType: "text"},
    {fieldName: "isDeleted", dataType: "text"}
];
let orderMngModalColumn = [
    {
        name: "orderId",
        fieldName: "orderId",
        type: "data",
        width: "50",
        header: {text: "주문 Id"},
        styleName: "text-right",
                visible: false
    }, {
        name: "itemId",
        fieldName: "itemId",
        type: "data",
        width: "100",
        header: {text: "품목 ID"},
        styleName: "text-right",
        visible: false
        // ,
        // button: "action",
        // buttonVisibility: "always"
    },
    {
        name: "itemName",
        fieldName: "itemName",
        type: "data",
        width: "200",
        header: {text: "품목"},
        styleName: "text-left",
        editable: false
    },
    {
        name: "boxPerSkuQty",
        fieldName: "boxPerSkuQty",
        type: "data",
        width: "100",
        header: {text: "박스당 수량"},
        styleName: "text-right",
        editable: false, visible: false
    },
    {
        name: "boxQty",
        fieldName: "boxQty",
        type: "data",
        width: "100",
        header: {text: "박스 수량"},
        styleName: "text-right",
        editable: false, visible: false
    },
    {
        name: "pltPerSkuQty",
        fieldName: "pltPerSkuQty",
        type: "data",
        width: "100",
        header: {text: "팔레트당 수량"},
        styleName: "text-right",
        editable: false, visible: false
    },
    {
        name: "pltQty",
        fieldName: "pltQty",
        type: "data",
        width: "100",
        header: {text: "팔레트 수량"},
        styleName: "text-right",
        editable: false, visible: false
    },
    {
        name: "orderQty",
        fieldName: "orderQty",
        type: "data",
        width: "100",
        header: {text: "주문수량"},
        styleName: "text-right",
        required: true
    },
    {
        name: "subMemo",
        fieldName: "subMemo",
        type: "data",
        width: "250",
        header: {text: "상세 메모"},
        styleName: "text-left"
    },
    {
        name: "isDeleted",
        fieldName: "isDeleted",
        type: "data",
        width: "50",
        header: {text: "삭제"},
        editable: false

    }
];

export function createOrderMngModalGrid() {
    const modalGrid = createGrid("orderFormModalGrid", orderMngModalField, orderMngModalColumn, {
        checkBarVisible: false,
        editable: true,
        filtering: true,
        groupPanelVisible: false
    });

    orderMngModalProvider = modalGrid.dataProvider;
    orderMngModalGridView = modalGrid.gridView;

    return {
        orderMngModalProvider,
        orderMngModalGridView
    };
}