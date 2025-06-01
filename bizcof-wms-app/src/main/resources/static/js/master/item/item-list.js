// /static/js/master/item/item-list.js
import {FetchApi} from "/js/common/fetch-api.js";
import {dataProvider, gridView} from "./item-grid.js";
import {SaveItem, UpdateItem, GetItem} from "/js/master/item/item-form-modal.js";
import {ModalLoader, ModalPostApi} from "/js/common/modal-helper.js";
import {getSearchParams} from "/js/common/utils.js";


document.addEventListener("DOMContentLoaded", function () {
    const btnSearch = document.getElementById("btnSearch");
    btnSearch.addEventListener("click", async function () {

        gridView.showLoading();

        const params = getSearchParams();
        const responseBody = await FetchApi("/api/master/item/list", "GET", params);
        dataProvider.fillJsonData(responseBody.data, {});   // 결과 데이터 그리드에 채워 넣기

        gridView.closeLoading();                    // 로딩창 닫기

    });
});

document.getElementById("btnItemRegister").addEventListener("click", async () => {
    await ModalLoader("/view/master/item/form-modal", "itemModal", SaveItem, 'modal-item-container', {
        triggerSelector: "#btnSaveItem",
        onResult: (result) => {

        }
    });
});


document.getElementById("btnItemUpdate").addEventListener("click", async () => {
    let current = gridView.getCurrent();  // {dataRow: 0, itemIndex: 0, column: "code", fieldName: "code", ...}
    let row = current.dataRow;
    if (row < 0) return;

    const itemData = dataProvider.getJsonRow(row);  // row 전체 데이터를 JSON으로


    await ModalLoader("/view/master/item/form-modal", "itemModal", () => UpdateItem(itemData), 'modal-item-container', {
        triggerSelector: "#btnSaveItem",
        onResult: (result) => {
            dataProvider.updateRow(row, result.data);   //변경된 정보로 그리드의 row 값을 변경
        },
        onShown: () => {
            document.querySelector("#itemModal .modal-title").textContent = "품목 수정";
            GetItem(itemData);
        }
    });
});
