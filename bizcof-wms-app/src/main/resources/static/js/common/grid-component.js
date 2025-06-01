


// 전역 객체에 GridComponent 추가
window.GridComponent = class {
    constructor(container, fields, columns, apiUrl) {
        this.container = container;
        this.fields = fields;
        this.columns = columns;
        this.apiUrl = apiUrl;
        this.dataProvider = null;
        this.gridView = null;
    }

    createGrid() {
        this.dataProvider = new RealGrid.LocalDataProvider();
        this.dataProvider.setFields(this.fields);
        this.dataProvider.setOptions({
            softDeleting: false
        });

        this.gridView = new RealGrid.GridView(this.container);
        this.gridView.setEditOptions({
            commitByCell: true,
            commitWhenExitLast: true,
            commitWhenLeave: true
        });
        this.gridView.setStateBar({ visible: true });
        this.gridView.editOptions.editable = false;
        this.gridView.pasteOptions.checkReadOnly = true;
        this.gridView.groupPanel.visible = true;

        this.gridView.header.height = 30;
        this.gridView.footer.height = 30;
        this.gridView.stateBar.width = 16;
        this.gridView.displayOptions.rowHeight = 23;
        this.gridView.sortMode = "explicit";

        this.gridView.setDataSource(this.dataProvider);
        this.gridView.setColumns(this.columns);

        this.gridView.onContextMenuPopup = (grid, x, y, elementName) => {
            setContextMenu(this.gridView);
        };
        this.gridView.onContextMenuItemClicked = onContextMenuClick;
    }

};

function onContextMenuClick(grid, data, index) {
    var cell = grid.getCurrent();
    var col = grid.columnByName(cell.column);

    // data.parent 에 Tag 속성이 없어 switch문 전에 확인한다.
    // parent에 Tag가 추가되면 switch 문에서 처리하자.
    if (data.parent.label == "컬럼") {
        grid.setColumnProperty(data.tag, "visible", data.checked);
    }

    switch (data.tag){
        case "1rowFixed" :
            grid.setFixedOptions({rowCount: 1});
            break;
        case "2rowFixed" :
            grid.setFixedOptions({rowCount: 2});
            break;
        case "rowFixed" :
            grid.setFixedOptions({rowCount: cell.itemIndex + 1});
            break;
        case "1colFixed" :
            grid.setFixedOptions({colCount: 1});
            break;
        case "2colFixed" :
            grid.setFixedOptions({colCount: 2});
            break;
        case "colFixed" :
            grid.setFixedOptions({colCount: col.index });
            break;
        case "cancelFixed" :
            grid.setFixedOptions({colCount: 0, rowCount: 0});
            break;
        case "rowNormalHeight" :
            grid.displayOptions.rowHeight = 28;
            break;
        case "rowSmallHeight" :
            grid.displayOptions.rowHeight = 20;
            break;
        case "rowLargeHeight" :
            grid.displayOptions.rowHeight = 36;
            break;
        case "excelExport" :
            exportExcel(grid);
            break;
        case "autoFilter" :
            {
                col.autoFilter = true;
                grid.refresh();
                break;
            }
        case "columnHide" :
            col.visible = false;
            break;
        case "columnShow" :
            {
                var columns = grid.getColumns();
                for (var i in columns) {
                    columns[i].visible = true;
                }
            };
            break;
    }
};


// column Name이 다른 컬럼이어야 한다.
function setContextMenu(grid) {
    var columns = grid.getColumnNames();
    var row = grid.getCurrent().itemIndex + 1;

    var visibleContextMenu = [];

    for (var i in columns) {
        var menuItem = {};
        var checked;

        var column = grid.columnByName(columns[i]);

        if (column.fieldName) {
            menuItem.label = column.header.text;
            menuItem.tag = column.name;
            menuItem.type = "check";
            menuItem.checked = column.visible;

            visibleContextMenu.push(menuItem);
        }
    };

    visibleContextMenu.push(
        {
                label: "-"
        },
        {
            label: "컬럼 모두 보기",
            tag: 'columnShow'
        },
        {
            label: "-"
        },
        {
            label: "현재 컬럼 필터 켜기",
            tag: 'autoFilter'
        }
    );

    //var column = grid.columnByName(grid.getCurrent().column);
    var column = grid.columnByName(grid.getCurrent().column);

    var contextMenu = [
        {
            label: "고정",
            children: [
                {
                    label: "첫번째 행",
                    tag: '1rowFixed'
                },
                {
                    label: "두번째 행",
                    tag: '2rowFixed'
                },
                {
                label: "현재 행까지("+ row +")",
                tag: 'rowFixed'
                },
                {
                    label: "-"
                },
                {
                    label: "첫번째 열",
                    tag: '1colFixed'
                },
                {
                    label: "두번째 열",
                    tag: '2colFixed'
                },
                {
                label: "현재 열까지("+ column.header.text +")",
                tag: 'colFixed'
                },
                {
                    label: "-"
                },
                {
                label: "고정 취소",
                tag: 'cancelFixed',
                enabled: (grid.fixedOptions.rightCount + grid.fixedOptions.colCount + grid.fixedOptions.rowCount) != 0
                }]
        },
        {
            label: "컬럼",
            tag: "columnMenu",
            children: visibleContextMenu
        },
        {
            label: "행 높이",
            children: [
                {
                    label: "보통 (28px)",
                    tag: 'rowNormalHeight'
                },
                {
                    label: "좁게 (20px)",
                    tag: 'rowSmallHeight'
                },
                {
                    label: "넓게 (36px)",
                    tag: 'rowLargeHeight'
                }
            ]
        },
        {
            label: "-" // menu separator를 삽입합니다.
        },
        {
            label: "엑셀 내려받기",
            tag: 'excelExport'
        }
    ];
    grid.setContextMenu(contextMenu);
} ;


function excelExport() {

    if (dataProvider.getRowCount() == 0){
        alert("조회된 목록이 없습니다.");
        return;
    }
    let now = new Date();
    let tempTime = now.YYYYMMDDHHMMSS();
    gridView.exportGrid({
        type: "excel",
        target: "local",
        fileName: "입고요청현황" + +"_"+tempTime +".xlsx",
        applyDynamicStyles: true,
        done: function () {
            // 엑셀 받기 완료 후
            /* alert("done excel export")*/
        }
    });
}

Date.prototype.YYYYMMDDHHMMSS = function () {
    let yyyy = this.getFullYear().toString();
    let MM = pad(this.getMonth() + 1,2);
    let dd = pad(this.getDate(), 2);
    let hh = pad(this.getHours(), 2);
    let mm = pad(this.getMinutes(), 2)
    let ss = pad(this.getSeconds(), 2)

    return yyyy +  MM + dd+  hh + mm + ss;
};

function pad(number, length) {
    let str = '' + number;
    while (str.length < length) {
        str = '0' + str;
    }
    return str;
}