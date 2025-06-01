/**
 * ✅ 문서 로딩 시 기본 이벤트 바인딩 처리
 */
import {
    ItemProvider, ItemGridView, BomManageProvider, BomManageTreeView
} from "./bom-manage-grid.js";
import {FetchApi} from "/js/common/fetch-api.js";
import {
    getSearchParams,
    checkRequiredSearchFields,
    showMessageModal,
    getTargetJson
} from "/js/common/utils.js";
import {selectItem} from "/js/master/item/item-search-modal.js";


document.addEventListener("DOMContentLoaded", function () {
    const btnSearch = document.getElementById("btnSearch");
    btnSearch.addEventListener("click", handelSearchParentList);

    document.getElementById("btnSave").addEventListener("click", async () => {
        const rows = [];
        const states = ["created", "updated", "deleted"];

        states.forEach(state => {
            const rowIndices = BomManageProvider.getStateRows(state);
            rowIndices.forEach(row => {
                const data = BomManageProvider.getJsonRow(row);
                data.rowState = state;
                rows.push(data);
            });
        });

        const topItemId = ItemGridView.getCurrent().dataRow >= 0
            ? ItemProvider.getValue(ItemGridView.getCurrent().dataRow, "id")
            : null;

        if (!topItemId || rows.length === 0) return;

        try {
            const response = await FetchApi("/api/bom/bulk", "POST", {
                topItemId,
                rows
            });

            if (response?.statusCode === "SUCCESS") {
                showMessageModal("success", "재료 구성이 완료되었습니다.");
                handleSearchChildList(ItemGridView, { dataRow: ItemGridView.getCurrent().dataRow });
            } else {
                showMessageModal("error", response?.message || "저장 중 오류가 발생했습니다.");
            }
        } catch (e) {
            console.error("저장 실패", e);
            showMessageModal("error", e.message || "서버 오류로 저장에 실패했습니다.");
        }
    });

    document.getElementById("btnAddChildNode").addEventListener("click", async function () {
      const itemRowIndex = ItemGridView.getCurrent().dataRow;
      if (itemRowIndex < 0) {
        showMessageModal("warning", "먼저 상위 품목(완제품)을 선택해주세요.");
        return;
      }

      const parentItem = ItemProvider.getJsonRow(itemRowIndex);
      const parentItemId = parentItem.id;

      const parentTreeRow = BomManageTreeView.getCurrent().dataRow;
      const parentTreeRowData = parentTreeRow >= 0 ? BomManageProvider.getJsonRow(parentTreeRow) : null;

      const parentTreeId = parentTreeRowData?.treeId ?? ""; // 최상위면 ""부터 시작
      const parentBomId = parentTreeRowData?.bomId ?? null;

      let childCount = parentTreeRow >= 0
        ? BomManageProvider.getChildCount(parentTreeRow)
        : BomManageProvider.getRowCount();

      await selectItem((selectedItems) => {
        if (!selectedItems || selectedItems.length === 0) return;

        // ✅ 상위 품목과 동일한 품목 선택 시 경고
        const hasSelfReference = selectedItems.some(item => item.id === parentItemId);
        if (hasSelfReference) {
          showMessageModal("warning", "상위 품목과 동일한 품목은 자식으로 추가할 수 없습니다.");
          return;
        }

        selectedItems.forEach((item, index) => {
          const childIndex = childCount + index;
          const paddedIndex = String(childIndex).padStart(2, '0');
          const newTreeId = parentTreeId + paddedIndex;

          const newRow = [
            newTreeId,              // treeId
            item.id,                // childItemId
            parentItemId,           // parentItemId
            null,                   // bomId
            parentBomId,            // parentBomId
            item.code,              // itemCode
            item.name,              // itemName
            item.spec,              // spec
            0,                      // requiredQty
            item.inventoryUnitCode, // unit
            parentTreeId            // parentTreeId
          ];

          BomManageProvider.insertChildRow(
            parentTreeRow,
            childIndex,
            newRow,
            -1,
            false
          );
        });

        if (parentTreeRow >= 0) {
          BomManageTreeView.expand(parentTreeRow, true);
        } else {
          BomManageTreeView.expandAll(); // 최상위인 경우
        }

        setTimeout(() => BomManageTreeView.resetSize(), 0);
      }, { modalWidth: "900px" });
    });

    // 노드 삭제 버튼 이벤트
    /**
     * 노드 삭제 버튼 이벤트
     */
    document.getElementById("btnRemoveChildNode").addEventListener("click", () => {
        const current = BomManageTreeView.getCurrent();
        if (!current || current.dataRow < 0) {
            showMessageModal('warning', '삭제할 행을 선택해주세요.');
            return;
        }

        const dataRow = current.dataRow;
        const editable = BomManageProvider.getValue(dataRow, "isEditable");

           if (!editable || editable === "false") {
               showMessageModal('warning', '편집이 불가능한 행은 삭제할 수 없습니다.');
               return;
           }

        const bomId = BomManageProvider.getValue(dataRow, "bomId");

        if (!bomId) {
            // 신규 추가된 행은 바로 제거
            BomManageProvider.removeRow(dataRow);
        } else {
            // 기존 행은 상태만 변경
            BomManageProvider.setRowState(dataRow, "deleted");
        }
    });


    ItemGridView.onCellClicked = handleSearchChildList;


});

/**
 * 🔍 검색 버튼 클릭 시 입고 헤더 + 상세 초기화
 */
async function handelSearchParentList() {
    if (!checkRequiredSearchFields()) return;

    ItemGridView.showLoading();

    const params = getSearchParams();
    const responseBody = await FetchApi("/api/master/item/list", "GET", params);
    ItemProvider.fillJsonData(responseBody.data, {});   // 결과 데이터 그리드에 채워 넣기
    BomManageProvider.clearRows();
    ItemGridView.closeLoading();                    // 로딩창 닫기
}

async function handleSearchChildList(grid, clickData) {

    const row = clickData.dataRow;
    if (row == null || row < 0) return;

    BomManageTreeView.showLoading();

    const selectedData = ItemProvider.getJsonRow(row);
    const itemId = selectedData.id;
    const responseBody = await FetchApi(`/api/bom/tree/${itemId}`, "GET");
    BomManageProvider.setRows(responseBody.data, "treeId", false, "hasChild");
    //BomManageTreeView.expandAll();
    BomManageTreeView.closeLoading();


}