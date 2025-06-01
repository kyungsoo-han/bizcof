// /static/js/master/item/item-list.js
import {FetchApi} from "/js/common/fetch-api.js";
import {dataProvider, gridView} from "./user-manage-grid.js";
import {InsertUser} from "/js/system/user/user-form-modal.js";
import { ModalLoader,ModalPostApi } from "/js/common/modal-helper.js";
import { getSearchParams} from "/js/common/utils.js";


document.addEventListener("DOMContentLoaded", function () {
    const btnSearch = document.getElementById("btnSearch");
    btnSearch.addEventListener("click", async function () {

        gridView.showLoading();
        const params = getSearchParams();
        const responseBody = await FetchApi("/api/system/user/list", "GET", params);
        dataProvider.fillJsonData(responseBody.data, {});   // 결과 데이터 그리드에 채워 넣기
        gridView.closeLoading();                    // 로딩창 닫기

    });
});

document.getElementById("btnUserRegister").addEventListener("click", async () => {
  await ModalLoader("/view/system/user/form-modal", "userModal", InsertUser, 'modal-user-container',{
      triggerSelector: "#btnInsertUser",
      onResult: (result) =>{

      }
  });
});
