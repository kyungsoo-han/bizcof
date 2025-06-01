// /static/js/master/item/item-grid.js
import {createGrid} from '/realgrid/realgrid-helper.js';
import {ModalLoader} from "/js/common/modal-helper.js";

export let dataProvider, gridView;
let itemListField = [
    {fieldName: "id", dataType: "text"},
    {fieldName: "code", dataType: "text"},
    {fieldName: "name", dataType: "text"},
    {fieldName: "sname", dataType: "text"},
    {fieldName: "ename", dataType: "text"},
    {fieldName: "type", dataType: "text"},
    {fieldName: "spec", dataType: "text"},
    {fieldName: "skuUnitCode", dataType: "text"},
    {fieldName: "inventoryUnitCode", dataType: "text"},
    {fieldName: "skuPerIuQty", dataType: "text"},
    {fieldName: "boxPerSkuQty", dataType: "text"},
    {fieldName: "pltPerSkuQty", dataType: "text"},
    {fieldName: "customerId", dataType: "text"},
    {fieldName: "customerCode", dataType: "text"},
    {fieldName: "customerName", dataType: "text"},
    {fieldName: "category", dataType: "text"},
    {fieldName: "price", dataType: "int"},
    {fieldName: "useYn", dataType: "text"},
    {fieldName: "barcode", dataType: "text"},
    {fieldName: "width", dataType: "number"},
    {fieldName: "height", dataType: "number"},
    {fieldName: "depth", dataType: "number"},
    {fieldName: "weight", dataType: "number"},
    {fieldName: "description", dataType: "text"},
    {fieldName: "memo", dataType: "text"},
    {fieldName: "createdDt", dataType: "text"},
    {fieldName: "modifiedDt", dataType: "text"}
];
let itemListColumn = [
    {name: "id", fieldName: "id", type: "data", width: "60", visible:false, header: {text: "품목ID"}, styleName: "text-right"},
    {
        name: "code", fieldName: "code", type: "data", width: "100", header: {text: "품목코드"},
        // button: "action",
        // buttonVisibility: "always"
    },
    {name: "name", fieldName: "name", type: "data", width: "140", header: {text: "품목명"}, styleName: "text-left"},
    {name: "sname", fieldName: "sname", type: "data", width: "120", header: {text: "약칭"}, styleName: "text-left"},
    {name: "ename", fieldName: "ename", type: "data", width: "120", header: {text: "영문 명칭"}, styleName: "text-left"},
    {name: "type", fieldName: "type", type: "data", width: "80", header: {text: "타입"}},
    {name: "spec", fieldName: "spec", type: "data", width: "120", header: {text: "규격"}, styleName: "text-left"},
    {name: "skuUnitCode", fieldName: "skuUnitCode", type: "data", width: "60", header: {text: "SKU 단위"}},
    {name: "inventoryUnitCode", fieldName: "inventoryUnitCode", type: "data", width: "60", header: {text: "IU 단위"}},
    {name: "skuPerIuQty", fieldName: "skuPerIuQty", type: "data", width: "80", header: {text: "SKU당 IU수량"}, styleName: "text-right"},
    {name: "boxPerSkuQty", fieldName: "boxPerSkuQty", type: "data", width: "80", header: {text: "BOX당 수량"}, styleName: "text-right"},
    {name: "pltPerSkuQty", fieldName: "pltPerSkuQty", type: "data", width: "80", header: {text: "PLT당 수량"}, styleName: "text-right"},
    {name: "customerId", fieldName: "customerId", type: "data", visible:false, width: "100", header: {text: "거래처 ID"}},
    {name: "customerCode", fieldName: "customerCode", type: "data", width: "100", header: {text: "거래처 코드"}},
    {
        name: "customerName",
        fieldName: "customerName",
        type: "data",
        width: "200",
        header: {text: "거래처 명"},
        styleName: "text-left"
    },
    {name: "category", fieldName: "category", type: "data", width: "120", header: {text: "카테고리"}},
    {name: "price", fieldName: "price", type: "data", width: "60", header: {text: "단가"}, styleName: "text-right"},
    {name: "useYn", fieldName: "useYn", type: "data", width: "60", header: {text: "사용여부"}},
    {name: "barcode", fieldName: "barcode", type: "data", width: "120", header: {text: "바코드"}},
    {name: "width", fieldName: "width", type: "data", width: "60", header: {text: "가로"}, styleName: "text-right"},
    {name: "height", fieldName: "height", type: "data", width: "60", header: {text: "높이"}, styleName: "text-right"},
    {name: "depth", fieldName: "depth", type: "data", width: "60", header: {text: "깊이"}, styleName: "text-right"},
    {name: "weight", fieldName: "weight", type: "data", width: "60", header: {text: "무게"}, styleName: "text-right"},
    {
        name: "description",
        fieldName: "description",
        type: "data",
        width: "200",
        header: {text: "설명"},
        styleName: "text-left"
    },
    {name: "memo", fieldName: "memo", type: "data", width: "200", header: {text: "메모"}, styleName: "text-left"},
    {name: "createdDt", fieldName: "createdDt", type: "data", width: "130", header: {text: "등록일"}},
    {name: "modifiedDt", fieldName: "modifiedDt", type: "data", width: "130", header: {text: "수정일"}}
];

document.addEventListener("DOMContentLoaded", () => {
    const grid = createGrid("itemList", itemListField, itemListColumn, {
        editable: false,
        filtering: true
    });

    dataProvider = grid.dataProvider;
    gridView = grid.gridView;

    gridView.onCellDblClicked = async function (grid, clickData) {
        const row = clickData.dataRow;
        if (row < 0) return;

        const itemData = dataProvider.getJsonRow(row);  // row 전체 데이터를 JSON으로

    };
});