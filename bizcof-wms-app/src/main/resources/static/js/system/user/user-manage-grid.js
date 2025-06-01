// /static/js/master/item/item-grid.js
import {createGrid} from '/realgrid/realgrid-helper.js';
import {ModalLoader} from "/js/common/modal-helper.js";
import {UpdateUser, GetUser} from "/js/system/user/user-form-modal.js";

export let dataProvider, gridView;
let itemListField = [
    {fieldName: "userId", dataType: "text"},
    {fieldName: "loginId", dataType: "text"},
    {fieldName: "name", dataType: "text"},
    {fieldName: "useYn", dataType: "text"},
    {fieldName: "memo", dataType: "text"},
    {fieldName: "createdDt", dataType: "text"},
    {fieldName: "modifiedDt", dataType: "text"}
];
let itemListColumn = [
    {name: "userId", fieldName: "userId", type: "data", width: "60", visible:false, header: {text: "사용자 ID"}, styleName: "text-right"},
    {
        name: "loginId", fieldName: "loginId", type: "data", width: "100", header: {text: "로그인 ID"},
        // button: "action",
        // buttonVisibility: "always"
    },
    {name: "name", fieldName: "name", type: "data", width: "100", header: {text: "이름"}},
    {name: "useYn", fieldName: "useYn", type: "data", width: "60", header: {text: "사용 여부"}},
    {name: "memo", fieldName: "memo", type: "data", width: "320", header: {text: "메모"}, styleName: "text-left"},
    {name: "createdDt", fieldName: "createdDt", type: "data", width: "130", header: {text: "등록일"}},
    {name: "modifiedDt", fieldName: "modifiedDt", type: "data", width: "130", header: {text: "수정일"}}
];

document.addEventListener("DOMContentLoaded", () => {
    const grid = createGrid("userList", itemListField, itemListColumn, {
        editable: false,
        filtering: true
    });

    dataProvider = grid.dataProvider;
    gridView = grid.gridView;

    gridView.onCellDblClicked = async function (grid, clickData) {
        const row = clickData.dataRow;
        if (row < 0) return;

        const userData = dataProvider.getJsonRow(row);  // row 전체 데이터를 JSON으로

        await ModalLoader("/view/system/user/form-modal", "userModal", () => UpdateUser(itemData), 'modal-item-container', {
            triggerSelector: "#btnInsertUser",
            onResult: (result) => {
                dataProvider.updateRow(row, result.data);   //변경된 정보로 그리드의 row 값을 변경
            },
            onShown: () => {
                GetUser(userData);
            }
        });

    };
});