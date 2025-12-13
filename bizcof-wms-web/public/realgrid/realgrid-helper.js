// /static/realgrid/realgrid-helper.js

import {
    showMessageModal
} from "/js/common/utils.js";
import {
    onContextMenuClick,
    applyEditableStyleCallback
} from "/realgrid/realgrid-utils.js";


window.alert = function (message) {
    let type = 'info';

    if (/오류|에러/.test(message)) {
        type = 'error';
    } else if (/경고|주의|필수|잘못/.test(message)) {
        type = 'warning';
    }

    showMessageModal(type, message);

};

export function createGrid(containerId, fieldList, columnList, options = {}) {

    columnList.forEach(col => {
        if (col.required) {
            const headerText = col.header?.text || col.fieldName;

            col.header = {
                ...(col.header || {}),
                template: "${headerText}<span style='color: red;'>*</span>",
                values: {
                    headerText: headerText
                }
            };
        }
    });

    // 데이터 프로바이더 생성 및 필드 설정
    const dataProvider = new RealGrid.LocalDataProvider();
    dataProvider.setFields(fieldList);
    dataProvider.setOptions({
        softDeleting: false,
        ...options.dataProviderOptions
    });

    // 동적 editable ( isEditable 컬럼 존재 필요)
    // setColumns전에 설정
    if (options.dynamicEditableFields?.length) {
        applyEditableStyleCallback(columnList, options.dynamicEditableFields);
    }

    // 그리드 뷰 생성 및 데이터 소스 연결
    const gridView = new RealGrid.GridView(containerId);
    gridView.setDataSource(dataProvider);
    gridView.setColumns(columnList);

    // 해더 설정
    gridView.setHeader({showTooltip: true});

    // 편집 설정
    gridView.setEditOptions({
        commitByCell: true,
        commitWhenExitLast: true,
        commitWhenLeave: true,
        ...options.editOptions
    });

    // 상태 표시바 설정 (삭제/수정 등 표시)
    gridView.setStateBar({
        visible: options.stateBarVisible ?? false
    });

    // 붙여넣기 시 읽기 전용 셀 무시
    gridView.pasteOptions.checkReadOnly = true;

    // 그룹 패널 표시 여부
    gridView.groupPanel.visible = options.groupPanelVisible ?? true;

    // 기본 UI 크기 설정
    gridView.header.height = 35;
    gridView.footer.height = 30;
    gridView.stateBar.width = 16;
    gridView.displayOptions.rowHeight = 28;

    // 정렬 모드는 수동 정렬
    gridView.sortMode = "explicit";

    // 체크박스 열 표시 여부
    gridView.setCheckBar({
        visible: options.checkBarVisible ?? true
    });

    // 푸터 표시 여부
    gridView.setFooters({
        visible: options.footerVisible ?? true
    });

    // 전체 편집 불가 설정
    if (options.editable === false) {
        gridView.editOptions.editable = false;
    }

    // 상태바
    if (options.stateBarVisible) {
        gridView.setStateBar({
            visible: true
        });
        gridView.stateBar.width = 16;
    }

    // 컨텍스트 메뉴 이벤트 등록
    gridView.onContextMenuPopup = () => setContextMenu(gridView);
    gridView.onContextMenuItemClicked = onContextMenuClick;

    // 필터 기능 설정
    if (options.filterVisible) {
        gridView.setFilteringOptions({enabled: true});
        gridView.setFilterPanel({height: 25, visible: true, filterDelay: 100});
    }

    // 페이징 기능 설정
    if (options.paging) {
        gridView.setPaging({
            rowsPerPage: options.paging.rowsPerPage || 50,
            ...options.paging
        });
    }

    // 툴팁 설정
    const columns = gridView.getColumns();
    columns.forEach(col => {
        const field = col.fieldName;
        const width = col.width;
        gridView.columnByName(field).header.tooltip = `필드명: ${field}\n넓이: ${width}`;
        if (col.editable === false && !col.styleCallback) {
            const originalStyleName = col.styleName || "";
            col.styleCallback = () => originalStyleName + " readonly-cell";
        }
    });

    // 컬럼 크기 조정 시 툴팁 업데이트
    gridView.onColumnPropertyChanged = function (grid, column, property, newValue, oldValue) {
        if (property === "displayWidth") {
            const col = gridView.columnByName(column.fieldName);
            if (col && col.header) {
                col.header.tooltip = `필드명: ${column.fieldName}\n넓이: ${newValue}`;
                console.log(`⏱ 너비 변경: ${column.fieldName} → ${newValue}`);
            }
        }
    };


    // 옵션에 따라 라인 색상 제거
    const displayOptions = {
        rowHeight: 28,
        useRowStyle: false,
        ...(options.useLineColor === false ? {
            oddRow: {background: "#ffffff"},
            evenRow: {background: "#ffffff"}
        } : {}),
        ...(options.displayOptions || {})
    };
    gridView.setDisplayOptions(displayOptions);


    if (options.dynamicEditableFields?.length) {
        // 동적 editable 필드가 있으면 라인 색상 제거
        gridView.displayOptions.useAlternateRowStyle = false;
    }

    // 데이터 프로바이더와 그리드 뷰 반환
    return {dataProvider, gridView};
}

export function createTreeView(containerId, fieldList, columnList, options = {}) {
    // 트리용 데이터 프로바이더
    const dataProvider = new RealGrid.LocalTreeDataProvider();
    dataProvider.setFields(fieldList);
    dataProvider.setOptions({
        softDeleting: false,
        ...options.dataProviderOptions
    });

    // 동적 editable ( isEditable 컬럼 존재 필요)
    // setColumns전에 설정
    if (options.dynamicEditableFields?.length) {
        applyEditableStyleCallback(columnList, options.dynamicEditableFields);
    }

    // 트리 뷰 생성
    const treeView = new RealGrid.TreeView(containerId);
    treeView.setDataSource(dataProvider);
    treeView.setColumns(columnList);

    // 기본 옵션 설정
    treeView.setHeader({showTooltip: true});
    treeView.setEditOptions({
        commitByCell: true,
        commitWhenExitLast: true,
        commitWhenLeave: true,
        ...options.editOptions
    });
    treeView.setStateBar({visible: options.stateBarVisible ?? false});
    treeView.pasteOptions.checkReadOnly = true;
    treeView.header.height = 35;
    treeView.footer.height = 30;
    treeView.stateBar.width = 16;
    treeView.displayOptions.rowHeight = 28;
    treeView.sortMode = "explicit";
    treeView.setCheckBar({visible: options.checkBarVisible ?? true});
    treeView.setFooters({visible: options.footerVisible ?? true});

    if (options.editable === false) {
        treeView.editOptions.editable = false;
    }

    // 필터 기능
    if (options.filterVisible) {
        treeView.setFilteringOptions({enabled: true});
        treeView.setFilterPanel({height: 25, visible: true, filterDelay: 100});
    }

    if (options.useLineColor === false) {
        treeView.setDisplayOptions({
            ...options.displayOptions,
            oddRow: {background: "#ffffff"},
            evenRow: {background: "#ffffff"}
        });
    }

    // 상태바
    if (options.stateBarVisible) {
        treeView.setStateBar({
            visible: true
        });

        treeView.stateBar.width = 16;
    }
    // 툴팁 및 스타일 설정
    const columns = treeView.getColumns();
    columns.forEach(col => {
        const field = col.fieldName;
        const width = col.width;
        treeView.columnByName(field).header.tooltip = `필드명: ${field}\n넓이: ${width}`;
        if (col.editable === false && !col.styleCallback) {
            const originalStyleName = col.styleName || "";
            col.styleCallback = () => originalStyleName + " readonly-cell";
        }
    });

    // 컬럼 크기 조정 시 툴팁 반영
    treeView.onColumnPropertyChanged = function (grid, column, property, newValue, oldValue) {
        if (property === "displayWidth") {
            const col = treeView.columnByName(column.fieldName);
            if (col && col.header) {
                col.header.tooltip = `필드명: ${column.fieldName}\n넓이: ${newValue}`;
                console.log(`📐 너비 변경: ${column.fieldName} → ${newValue}`);
            }
        }
    };

    if (options.dynamicEditableFields?.length) {
          // 동적 editable 필드가 있으면 라인 색상 제거
          treeView.displayOptions.useAlternateRowStyle = false;
      }

    return {dataProvider, treeView};
}
