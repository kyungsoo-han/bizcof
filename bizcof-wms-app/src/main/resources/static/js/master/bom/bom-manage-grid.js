import {createGrid, createTreeView} from '/realgrid/realgrid-helper.js';


export let ItemProvider, ItemGridView, BomManageProvider, BomManageTreeView;

const parentFields = [
    {fieldName: "id"},
    {fieldName: "code"},
    {fieldName: "name"},
    {fieldName: "spec"},
    {fieldName: "inventoryUnitCode"}
];

const parentColumns = [
    {name: "id", fieldName: "id", header: {text: "품목 ID"}, width: 100, visible: false},
    {name: "code", fieldName: "code", header: {text: "품목 코드"}, width: 100},
    {name: "name", fieldName: "name", header: {text: "품목 명"}, width: 200, styleName: "text-left"},
    {name: "spec", fieldName: "spec", header: {text: "규격"}, width: 150, styleName: "text-left"},
    {name: "inventoryUnitCode", fieldName: "inventoryUnitCode", header: {text: "단위"}, width: 80}
];

const childFields = [
    {fieldName: "treeId"},           // keyField
    {fieldName: "childItemId"},
    {fieldName: "parentItemId"},
    {fieldName: "bomId"},
    {fieldName: "parentBomId"},
    {fieldName: "itemCode"},
    {fieldName: "itemName"},
    {fieldName: "spec"},
    {fieldName: "requiredQty", dataType: "number"},
    {fieldName: "unit"},
    {fieldName: "sortOrder"},
    {fieldName: "parentTreeId"},        // parentKeyField
    {fieldName: "isEditable", dataType: "boolean"},
    {fieldName: "hasChild", dataType: "boolean"}
];

const childColumns = [
    {name: "treeId", fieldName: "treeId", header: {text: "treeId"}, width: 200, visible: false},
    {name: "childItemId", fieldName: "childItemId", header: {text: "childItemId"}, width: 70, visible: false},
    {name: "parentItemId", fieldName: "parentItemId", header: {text: "parentItemId"}, width: 70, visible: false},
    {name: "bomId", fieldName: "bomId", header: {text: "bomId"}, width: 70, visible: false},
    {name: "parentBomId", fieldName: "parentBomId", header: {text: "parentBomId"}, width: 70, visible: false},
    {
        name: "itemCode", fieldName: "itemCode", header: {text: "품목 코드"}, width: 200,
        editable: false
    },
    {
        name: "itemName", fieldName: "itemName", header: {text: "품목 명"}, width: 200, styleName: "text-left",
        editable: false
    },
    {
        name: "spec", fieldName: "spec", header: {text: "규격"}, width: 150, styleName: "text-left",
        editable: false
    },
    {
        name: "requiredQty", fieldName: "requiredQty", header: {text: "소요량"}, width: 100, styleName: "text-right"
    },
    {
        name: "unit", fieldName: "unit", header: {text: "단위"}, width: 80,
        editable: false
    },
    {
        name: "sortOrder", fieldName: "sortOrder", header: {text: "정렬 순서"}, width: 80
    },
    {name: "parentTreeId", fieldName: "parentTreeId", header: {text: "parentTreeId"}, width: 80, visible: false},
    {name: "isEditable", fieldName: "isEditable", header: {text: "isEditable"}, width: 80, visible: false},
    {name: "hasChild", fieldName: "hasChild", header: {text: "hasChild"}, width: 80, visible: false}
];

document.addEventListener("DOMContentLoaded", async () => {
    ({dataProvider: ItemProvider, gridView: ItemGridView} = createGrid("itemList", parentFields, parentColumns, {
        editable: false,
        filtering: true,
        checkBarVisible: false,
        groupPanelVisible: false
    }));

    //ItemGridView.setStateBar({
    //    visible: true
    //});
    //ItemGridView.stateBar.width = 16;

    // RealGrid TreeView 생성
    ({
        dataProvider: BomManageProvider,
        treeView: BomManageTreeView
    } = createTreeView("bomList", childFields, childColumns, {
        checkBarVisible: false,
        stateBarVisible: true,
        dynamicEditableFields: ["requiredQty", "sortOrder"] // ✅ isEditable 필드 기준 동적 편집 제어
    }));

});

