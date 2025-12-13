/**
 * RealGrid 공통 함수
 * GridView와 TreeView에서 공유하는 기능들
 */

export interface ContextMenuOptions {
  row: number;
  currentColumnText: string;
  fixedOptionsSum: number;
  treeMenu?: boolean; // 트리 전용 메뉴 포함 여부
}

/**
 * 기본 컨텍스트 메뉴 생성
 */
export function createBaseContextMenu(options: ContextMenuOptions): any[] {
  const { row, currentColumnText, fixedOptionsSum, treeMenu } = options;

  const baseMenu: any[] = [];

  // 트리 메뉴 (TreeView 전용)
  if (treeMenu) {
    baseMenu.push({
      label: '트리',
      children: [
        { label: '전체 펼치기', tag: 'expandAll' },
        { label: '전체 접기', tag: 'collapseAll' },
        { label: '-' },
        { label: '1단계까지 펼치기', tag: 'expandLevel1' },
        { label: '2단계까지 펼치기', tag: 'expandLevel2' },
        { label: '3단계까지 펼치기', tag: 'expandLevel3' },
      ],
    });
    baseMenu.push({ label: '-' });
  }

  // 고정 메뉴
  baseMenu.push({
    label: '고정',
    children: [
      { label: '첫번째 행', tag: '1rowFixed' },
      { label: '두번째 행', tag: '2rowFixed' },
      { label: `현재 행까지 (${row}행)`, tag: 'rowFixed' },
      { label: '-' },
      { label: '첫번째 열', tag: '1colFixed' },
      { label: '두번째 열', tag: '2colFixed' },
      { label: `현재 열까지 (${currentColumnText})`, tag: 'colFixed' },
      { label: '-' },
      {
        label: '고정 취소',
        tag: 'cancelFixed',
        enabled: fixedOptionsSum !== 0,
      },
    ],
  });

  // 열 표시/숨김
  baseMenu.push({ label: '-' });
  baseMenu.push({ label: '열 표시/숨김', tag: 'columnSettings' });

  // 열 너비
  baseMenu.push({ label: '-' });
  baseMenu.push({
    label: '열 너비',
    children: [
      { label: `현재 열 자동 맞춤 (${currentColumnText})`, tag: 'fitCurrentColumn' },
      { label: '전체 열 자동 맞춤', tag: 'fitAllColumns' },
    ],
  });

  // 행 높이
  baseMenu.push({ label: '-' });
  baseMenu.push({
    label: '행 높이',
    children: [
      { label: '보통 (28px)', tag: 'rowNormalHeight' },
      { label: '좁게 (20px)', tag: 'rowSmallHeight' },
      { label: '넓게 (36px)', tag: 'rowLargeHeight' },
    ],
  });

  // 필터
  baseMenu.push({ label: '-' });
  baseMenu.push({ label: `현재 열 필터 설정 (${currentColumnText})`, tag: 'autoFilter' });

  // 엑셀 내보내기
  baseMenu.push({ label: '-' });
  baseMenu.push({ label: '엑셀 내려받기', tag: 'excelExport' });

  return baseMenu;
}

export interface ContextMenuClickOptions {
  grid: any;
  dataProvider: any;
  tag: string;
  cell: any;
  col: any;
  onColumnSettingsClick?: () => void;
}

/**
 * 공통 컨텍스트 메뉴 클릭 핸들러
 * @returns true if handled, false if not
 */
export function handleBaseContextMenuClick(options: ContextMenuClickOptions): boolean {
  const { grid, dataProvider, tag, cell, col, onColumnSettingsClick } = options;

  switch (tag) {
    case 'columnSettings':
      onColumnSettingsClick?.();
      return true;

    // 고정 관련
    case '1rowFixed':
      grid.setFixedOptions({ rowCount: 1 });
      return true;
    case '2rowFixed':
      grid.setFixedOptions({ rowCount: 2 });
      return true;
    case 'rowFixed':
      grid.setFixedOptions({ rowCount: cell.itemIndex + 1 });
      return true;
    case '1colFixed':
      grid.setFixedOptions({ colCount: 1 });
      return true;
    case '2colFixed':
      grid.setFixedOptions({ colCount: 2 });
      return true;
    case 'colFixed':
      grid.setFixedOptions({ colCount: col.index });
      return true;
    case 'cancelFixed':
      grid.setFixedOptions({ colCount: 0, rowCount: 0 });
      return true;

    // 행 높이
    case 'rowNormalHeight':
      grid.displayOptions.rowHeight = 28;
      grid.refresh();
      return true;
    case 'rowSmallHeight':
      grid.displayOptions.rowHeight = 20;
      grid.refresh();
      return true;
    case 'rowLargeHeight':
      grid.displayOptions.rowHeight = 36;
      grid.refresh();
      return true;

    // 엑셀 내보내기
    case 'excelExport':
      if (dataProvider.getRowCount() === 0) {
        alert('조회된 목록이 없습니다.');
        return true;
      }
      const now = new Date();
      const timestamp = now.toISOString().replace(/[-:]/g, '').split('.')[0].replace('T', '');
      grid.exportGrid({
        type: 'excel',
        target: 'local',
        fileName: `export_${timestamp}.xlsx`,
        applyDynamicStyles: true,
        showProgress: true,
        progressMessage: '엑셀 파일을 생성하는 중입니다...',
        done: () => {
          console.log('Excel export completed');
        },
        error: (error: any) => {
          console.error('Excel export failed:', error);
          alert('엑셀 내보내기에 실패했습니다.');
        },
      });
      return true;

    // 필터
    case 'autoFilter':
      if (col) {
        col.autoFilter = true;
        grid.setColumn(col);
      }
      return true;

    // 열 너비 자동 맞춤
    case 'fitCurrentColumn':
      if (col) {
        grid.fitLayoutWidth(col.name, 500, 50, true);
      }
      return true;
    case 'fitAllColumns':
      const columnNames = grid.getColumnNames();
      columnNames.forEach((name: string) => {
        const column = grid.columnByName(name);
        if (column && column.fieldName && column.visible) {
          grid.fitLayoutWidth(name, 500, 50, true);
        }
      });
      return true;

    default:
      return false;
  }
}

/**
 * 컬럼 설정 정보 가져오기 (다이얼로그용)
 */
export function getColumnSettings(gridView: any): any[] {
  if (!gridView) return [];

  const columnNames = gridView.getColumnNames();
  return columnNames.map((name: string) => {
    const column = gridView.columnByName(name);
    return {
      name: column.name,
      headerText: column.header?.text || column.name,
      visible: column.visible,
      fieldName: column.fieldName,
    };
  });
}

/**
 * 컬럼 표시/숨김
 */
export function setColumnVisible(gridView: any, columnName: string, visible: boolean): void {
  if (!gridView) return;

  const column = gridView.columnByName(columnName);
  if (column) {
    column.visible = visible;
  }
}

/**
 * 모든 컬럼 표시
 */
export function showAllColumns(gridView: any): void {
  if (!gridView) return;

  const columnNames = gridView.getColumnNames();
  columnNames.forEach((name: string) => {
    const column = gridView.columnByName(name);
    if (column.fieldName) {
      column.visible = true;
    }
  });
}
