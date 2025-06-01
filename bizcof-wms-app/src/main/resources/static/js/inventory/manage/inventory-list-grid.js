// /static/js/material/inbound/inbound-task-grid.js
import {createGrid} from '/realgrid/realgrid-helper.js';
import {FetchApi} from "/js/common/fetch-api.js";

export let InventoryListProvider, InventoryListGridView;

let InventoryListField = [
    {fieldName: "itemId", dataType: "text"},
    {fieldName: "itemCode", dataType: "text"},
    {fieldName: "itemName", dataType: "text"},
    {fieldName: "boxPerSkuQty", dataType: "text"},
    {fieldName: "boxQty", dataType: "text"},
    {fieldName: "pltPerSkuQty", dataType: "text"},
    {fieldName: "pltQty", dataType: "text"},
    {fieldName: "stockQty", dataType: "text"},
    {fieldName: "locationCode", dataType: "text"},
    {fieldName: "expireDate", dataType: "text"},
    {fieldName: "makeDate", dataType: "text"},
    {fieldName: "makeNo", dataType: "text"},
    {fieldName: "lotNo", dataType: "text"}
];
let InventoryListColumn = [

    {name: "itemId", fieldName: "itemId", type: "data", width: "100", header: {text: "품목 ID"}, visible: false },
    {name: "itemCode", fieldName: "itemCode", type: "data", width: "100", header: {text: "품목 코드"} },
    {name: "itemName", fieldName: "itemName", type: "data", width: "200", header: {text: "품목 명"}, styleName: "text-left"},

    {
        name: "boxPerSkuQty",
        fieldName: "boxPerSkuQty",
        type: "data",
        width: "100",
        header: {text: "박스당 수량"},
        styleName: "text-right"
    },
    {
        name: "boxQty",
        fieldName: "boxQty",
        type: "data",
        width: "100",
        header: {text: "박스 수량"},
        styleName: "text-right"
    },
    {
        name: "pltPerSkuQty",
        fieldName: "pltPerSkuQty",
        type: "data",
        width: "100",
        header: {text: "팔레트당 수량"},
        styleName: "text-right"
    },
    {
        name: "pltQty",
        fieldName: "pltQty",
        type: "data",
        width: "100",
        header: {text: "팔레트 수량"},
        styleName: "text-right"
    },
    {
        name: "stockQty",
        fieldName: "stockQty",
        type: "data",
        width: "100",
        header: {text: "재고 수량"},
        styleName: "text-right"
    },
    {
        name: "locationCode",
        fieldName: "locationCode",
        type: "data",
        width: 150,
        header: {text: "로케이션"}

    },
    {
        name: "expireDate", fieldName: "expireDate", type: "data", width: "100", header: {text: "유효 기한"}

    },
    {
        name: "makeNo",
        fieldName: "makeNo",
        type: "data",
        width: "150",
        header: {text: "제조 번호"},
        styleName: "text-left"
    },
    {
        name: "makeDate", fieldName: "makeDate", type: "data", width: "100", header: {text: "제조 일자"}
    },
    {
        name: "lotNo",
        fieldName: "lotNo",
        type: "data",
        width: "150",
        header: {text: "LOT 번호"}
    }
];



document.addEventListener("DOMContentLoaded", () => {

    const detailGrid = createGrid("inventoryList", InventoryListField, InventoryListColumn, {
        checkBarVisible: false,
        editable: false,
        filtering: true
    });
    
    InventoryListProvider = detailGrid.dataProvider;
    InventoryListGridView = detailGrid.gridView;

    InventoryListGridView.resetSize();

    InventoryListGridView.onCellDblClicked = async function (grid, clickData) {
        const row = clickData.dataRow;
        if (row < 0) return;

        const itemData = InventoryListProvider.getJsonRow(row);  // row 전체 데이터를 JSON으로

    };
});