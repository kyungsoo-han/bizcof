// /static/js/material/inbound/modal-inbound-task-grid.js
import {createGrid} from '/realgrid/realgrid-helper.js';

export let inboundMngModalProvider, inboundMngModalGridView;

let inboundMngModalField = [
    {fieldName: "seqNo", dataType: "text"},
    {fieldName: "itemId", dataType: "text"},
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
    {fieldName: "lotNo", dataType: "text"},
    {fieldName: "memo", dataType: "text"},
    {fieldName: "isDeleted", dataType: "text"}
];
let inboundMngModalColumn = [
    {
        name: "seqNo",
        fieldName: "seqNo",
        type: "data",
        width: "50",
        header: {text: "순번"},
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
        editable: false
    },
    {
        name: "boxQty",
        fieldName: "boxQty",
        type: "data",
        width: "100",
        header: {text: "박스 수량"},
        styleName: "text-right",
        editable: false
    },
    {
        name: "pltPerSkuQty",
        fieldName: "pltPerSkuQty",
        type: "data",
        width: "100",
        header: {text: "팔레트당 수량"},
        styleName: "text-right",
        editable: false
    },
    {
        name: "pltQty",
        fieldName: "pltQty",
        type: "data",
        width: "100",
        header: {text: "팔레트 수량"},
        styleName: "text-right",
        editable: false
    },
    {
        name: "inboundQty",
        fieldName: "inboundQty",
        type: "data",
        width: "100",
        header: {text: "입고수량"},
        styleName: "text-right",
        required: true
    },
    {
        name: "locationCode",
        fieldName: "locationCode",
        type: "data",
        width: 150,
        header: {text: "로케이션 코드"},
        // styleName: "text-left",
        editor: {
            type: "text",
            mask: {
                editMask: "**-00-00-00",
                includedFormat: true
            },
            textCase: "upper"
        },
        textFormat: "([A-Z]{2})-([0-9]{2})-([0-9]{2})-([0-9]{2});$1-$2-$3-$4",
        required: true
    },
    {
        name: "expireDate", fieldName: "expireDate", type: "data", width: "100", header: {text: "유통 기한"},
        editor: {
            type: "date",
            datetimeFormat: "yyyy-MM-dd",
            commitOnSelect: true,
            dropDownWhenClick: true,
            showButtons: false,
            showToday: false,
            mask: {
                editMask: "9999-99-99",
                includedFormat: true
            }
        },
        required: true
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
        name: "makeDate", fieldName: "makeDate", type: "data", width: "100", header: {text: "제조 일자"},
        editor: {
            type: "date",
            datetimeFormat: "yyyy-MM-dd",
            commitOnSelect: true,
            dropDownWhenClick: true,
            showButtons: false,
            showToday: false,
            mask: {
                editMask: "9999-99-99",
                includedFormat: true
            }
        }
    },
    {
        name: "lotNo",
        fieldName: "lotNo",
        type: "data",
        width: "150",
        header: {text: "LOT 번호"},
        styleName: "text-left",
        editable: false
    },
    {
        name: "memo",
        fieldName: "memo",
        type: "data",
        width: "250",
        header: {text: "메모"},
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

export function createInboundMngModalGrid() {
    const modalGrid = createGrid("inboundFormModalGrid", inboundMngModalField, inboundMngModalColumn, {
        checkBarVisible: false,
        editable: true,
        filtering: true,
        groupPanelVisible: false
    });

    inboundMngModalProvider = modalGrid.dataProvider;
    inboundMngModalGridView = modalGrid.gridView;

    return {
        inboundMngModalProvider,
        inboundMngModalGridView
    };
}