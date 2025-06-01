// /static/js/material/inbound/inbound-task-grid.js
import {createGrid} from '/realgrid/realgrid-helper.js';
import {FetchApi} from "/js/common/fetch-api.js";

export let InboundMngListProvider, InboundMngListGridView, InboundMngDetailListProvider, InboundMngDetailListGridView;
let InboundMngListField = [
    {fieldName: "inboundNo", dataType: "text"},
    {fieldName: "inboundDate", dataType: "text"},
    {fieldName: "inboundType", dataType: "text"},
    {fieldName: "inboundTypeName", dataType: "text"},
    {fieldName: "customerId", dataType: "text"},
    {fieldName: "customerCode", dataType: "text"},
    {fieldName: "customerName", dataType: "text"},
    {fieldName: "memo", dataType: "text"},
    {fieldName: "status", dataType: "text"}
];
let InboundMngListColumn = [
    {name: "inboundNo", fieldName: "inboundNo", type: "data", width: "125", header: {text: "입고 번호"}},
    {name: "inboundDate", fieldName: "inboundDate", type: "data", width: "100", header: {text: "입고 일자"}},
    {name: "inboundType", fieldName: "inboundType", type: "data", width: "100", header: {text: "입고 타입(CODE)"}, visible: false},
    {name: "inboundTypeName", fieldName: "inboundTypeName", type: "data", width: "100", header: {text: "입고 타입"}},
    {name: "customerId", fieldName: "customerId", type: "data", width: "100", header: {text: "거래처 ID"}, visible: false},
    {name: "customerCode", fieldName: "customerCode", type: "data", width: "100", header: {text: "거래처 코드"}, visible: false},
    {
        name: "customerName",
        fieldName: "customerName",
        type: "data",
        width: "200",
        header: {text: "거래처"},
        styleName: "text-left"
    },
    {name: "memo", fieldName: "memo", type: "data", width: "200", header: {text: "메모"}, styleName: "text-left"},
    {name: "status", fieldName: "status", type: "data", width: "80", header: {text: "상태"}}
];

let InboundMngDetailListField = [
    {fieldName: "seqNo", dataType: "text"},
    {fieldName: "itemId", dataType: "text"},
    {fieldName: "itemCode", dataType: "text"},
    {fieldName: "itemName", dataType: "text"},
    {fieldName: "boxPerSkuQty", dataType: "text"},
    {fieldName: "boxQty", dataType: "text"},
    {fieldName: "pltPerSkuQty", dataType: "text"},
    {fieldName: "pltQty", dataType: "text"},
    {fieldName: "inboundQty", dataType: "text"},
    {fieldName: "locationCode", dataType: "text"},
    {fieldName: "expireDate", dataType: "text", datetimeFormat: "yyyy-MM-dd"},
    {fieldName: "makeDate", dataType: "text", datetimeFormat: "yyyy-MM-dd"},
    {fieldName: "makeNo", dataType: "text"},
    {fieldName: "lotNo", dataType: "text"}
];
let InboundMngDetailListColumn = [

    {name: "seqNo", fieldName: "seqNo", type: "data", width: "50", header: {text: "순번"}, visible: false },
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
        name: "inboundQty",
        fieldName: "inboundQty",
        type: "data",
        width: "100",
        header: {text: "입고수량"},
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
        name: "expireDate", fieldName: "expireDate", type: "data", width: "100", header: {text: "유통 기한"}

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
    },
    {
        name: "memo",
        fieldName: "memo",
        type: "data",
        width: "250",
        header: {text: "메모"},
        styleName: "text-left"
    }
];



document.addEventListener("DOMContentLoaded", () => {

    const masterGrid = createGrid("inboundList", InboundMngListField, InboundMngListColumn, {
        checkBarVisible: false,
        editable: false,
        filtering: true
    });
    const detailGrid = createGrid("inboundDetailList", InboundMngDetailListField, InboundMngDetailListColumn, {
        checkBarVisible: false,
        editable: false,
        filtering: true
    });

    InboundMngListProvider = masterGrid.dataProvider;
    InboundMngListGridView = masterGrid.gridView;

    InboundMngDetailListProvider = detailGrid.dataProvider;
    InboundMngDetailListGridView = detailGrid.gridView;

    InboundMngListGridView.resetSize();
    InboundMngDetailListGridView.resetSize();


    InboundMngListGridView.onCellDblClicked = async function (grid, clickData) {
        const row = clickData.dataRow;
        if (row < 0) return;

        const itemData = InboundMngListProvider.getJsonRow(row);  // row 전체 데이터를 JSON으로

    };
});