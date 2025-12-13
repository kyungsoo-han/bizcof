import { useEffect, useRef, useState } from 'react';
import type { RealGridColumn, RealGridField, RealGridOptions } from '@/types/realgrid';
import {
  createBaseContextMenu,
  handleBaseContextMenuClick,
  getColumnSettings as getColumnSettingsUtil,
  setColumnVisible as setColumnVisibleUtil,
  showAllColumns as showAllColumnsUtil,
} from './common';

interface UseRealTreeGridProps {
  columns: RealGridColumn[];
  fields: RealGridField[];
  options?: RealGridOptions;
  treeField?: string; // 트리 구조의 ID 필드명
  parentField?: string; // 부모 ID 필드명
  onColumnSettingsClick?: () => void;
}

/**
 * 트리 전용 컨텍스트 메뉴 클릭 핸들러
 */
function handleTreeContextMenuClick(treeView: any, tag: string): boolean {
  switch (tag) {
    case 'expandAll':
      treeView.expandAll();
      return true;
    case 'collapseAll':
      treeView.collapseAll();
      return true;
    case 'expandLevel1':
      treeView.collapseAll();
      treeView.expandAll(1);
      return true;
    case 'expandLevel2':
      treeView.collapseAll();
      treeView.expandAll(2);
      return true;
    case 'expandLevel3':
      treeView.collapseAll();
      treeView.expandAll(3);
      return true;
    default:
      return false;
  }
}

export function useRealTreeGrid({
  columns,
  fields,
  options,
  treeField = 'id',
  parentField = 'parentId',
  onColumnSettingsClick,
}: UseRealTreeGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const treeViewRef = useRef<any>(null);
  const dataProviderRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!containerRef.current || !window.RealGrid) {
      return;
    }

    try {
      // 컨테이너 비우기
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }

      // TreeDataProvider 생성
      const dataProvider = new window.RealGrid.LocalTreeDataProvider(false);
      dataProviderRef.current = dataProvider;

      // 트리 옵션 설정
      dataProvider.setOptions({
        restoreMode: 'auto',
      });

      // TreeView 생성
      const treeView = new window.RealGrid.TreeView(containerRef.current);
      treeViewRef.current = treeView;

      // TreeView와 DataProvider 연결
      treeView.setDataSource(dataProvider);

      // 필드 설정
      dataProvider.setFields(fields);

      // 컬럼 설정
      const isGridEditable = options?.edit?.editable !== false;
      const processedColumns = columns.map(col => {
        if (col.editable === false && !col.styleCallback && isGridEditable) {
          const originalStyleName = col.styleName || '';
          return {
            ...col,
            styleCallback: () => originalStyleName + ' readonly-cell'
          };
        }
        return col;
      });
      treeView.setColumns(processedColumns);

      // 헤더 설정
      treeView.setHeader({ showTooltip: true });

      // 기본 UI 크기 설정
      treeView.header.height = 35;
      treeView.footer.height = 30;
      treeView.stateBar.width = 16;
      treeView.displayOptions.rowHeight = options?.display?.rowHeight || 28;

      // 트리 옵션 설정 - 첫 번째 visible 컬럼을 트리 컬럼으로 설정
      const visibleColumns = columns.filter(col => col.visible !== false);
      const treeColumnName = visibleColumns.length > 0 ? visibleColumns[0].name : columns[0]?.name;

      treeView.setTreeOptions({
        iconVisible: false,       // 폴더 아이콘 숨김
        iconWidth: 0,
        lineVisible: true,        // 트리 라인 표시
        expanderWidth: 20,        // 확장 버튼 너비
        expanderColumn: treeColumnName,
        showCheckBox: false,
        showIcon: false,
      });

      // 인덴트 설정
      treeView.setDisplayOptions({
        ...options?.display,
        rowHeight: options?.display?.rowHeight || 28,
      });

      // 옵션 설정
      if (options) {
        if (options.edit) {
          treeView.setEditOptions({
            commitByCell: true,
            commitWhenExitLast: true,
            commitWhenLeave: true,
            ...options.edit,
          });
        }

        if (options.checkBar) {
          treeView.setCheckBar(options.checkBar);
        }

        if (options.stateBar) {
          treeView.setStateBar(options.stateBar);
        }

        if (options.display) {
          treeView.setDisplayOptions(options.display);
        }
      }

      // 컨텍스트 메뉴 설정
      treeView.onContextMenuPopup = () => {
        const current = treeView.getCurrent();
        const row = current.itemIndex + 1;
        const currentColumn = treeView.columnByName(current.column);
        const fixedOptionsSum = treeView.fixedOptions.rightCount + treeView.fixedOptions.colCount + treeView.fixedOptions.rowCount;

        const contextMenu = createBaseContextMenu({
          row,
          currentColumnText: currentColumn?.header?.text || '',
          fixedOptionsSum,
          treeMenu: true, // 트리 메뉴 포함
        });
        treeView.setContextMenu(contextMenu);
      };

      treeView.onContextMenuItemClicked = (grid: any, data: any) => {
        try {
          const cell = grid.getCurrent();
          const col = grid.columnByName(cell.column);

          // 트리 전용 메뉴 처리
          if (handleTreeContextMenuClick(grid, data.tag)) {
            return;
          }

          // 공통 메뉴 처리
          const handled = handleBaseContextMenuClick({
            grid,
            dataProvider,
            tag: data.tag,
            cell,
            col,
            onColumnSettingsClick,
          });

          if (!handled) {
            console.warn('Unhandled context menu tag:', data.tag);
          }
        } catch (error) {
          console.error('Context menu action failed:', error);
        }
      };

      setIsReady(true);
    } catch (error) {
      console.error('Failed to initialize RealGrid TreeView:', error);
    }

    // Cleanup
    return () => {
      setIsReady(false);

      if (treeViewRef.current) {
        try {
          treeViewRef.current.destroy();
        } catch (e) {
          console.error('Error destroying treeView:', e);
        }
        treeViewRef.current = null;
      }

      if (dataProviderRef.current) {
        try {
          dataProviderRef.current.destroy();
        } catch (e) {
          console.error('Error destroying dataProvider:', e);
        }
        dataProviderRef.current = null;
      }

      // 컨테이너 비우기
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, []);

  // 트리 데이터 설정 (계층 구조 데이터)
  const setTreeData = (data: any[], treeFieldName: string = treeField, parentFieldName: string = parentField) => {
    if (dataProviderRef.current) {
      dataProviderRef.current.setRows(data, treeFieldName, false, '', parentFieldName);
    }
  };

  // 플랫 데이터 설정 후 트리로 변환
  const setFlatData = (data: any[], treeFieldName: string = treeField, parentFieldName: string = parentField) => {
    if (dataProviderRef.current) {
      dataProviderRef.current.setRows(data, treeFieldName, false, '', parentFieldName);
    }
  };

  // 데이터 가져오기
  const getData = (): any[] => {
    if (dataProviderRef.current) {
      return dataProviderRef.current.getOutputRows({ datetimeFormat: 'yyyy-MM-dd' }, 0, -1);
    }
    return [];
  };

  // 체크된 행 가져오기
  const getCheckedRows = (): any[] => {
    if (treeViewRef.current && dataProviderRef.current) {
      const checkedRows = treeViewRef.current.getCheckedRows();
      return checkedRows.map((rowId: number) => dataProviderRef.current.getJsonRow(rowId));
    }
    return [];
  };

  // Excel 내보내기
  const exportToExcel = (fileName: string = 'export.xlsx') => {
    if (treeViewRef.current) {
      treeViewRef.current.exportGrid({
        type: 'excel',
        target: 'local',
        fileName,
        done: () => {
          console.log('Excel export completed');
        },
      });
    }
  };

  // 그리드 새로고침
  const refresh = () => {
    if (treeViewRef.current) {
      treeViewRef.current.refresh();
    }
  };

  // 모든 노드 펼치기
  const expandAll = () => {
    if (treeViewRef.current) {
      treeViewRef.current.expandAll();
    }
  };

  // 모든 노드 접기
  const collapseAll = () => {
    if (treeViewRef.current) {
      treeViewRef.current.collapseAll();
    }
  };

  // 특정 레벨까지 펼치기
  const expandToLevel = (level: number) => {
    if (treeViewRef.current) {
      treeViewRef.current.collapseAll();
      treeViewRef.current.expandAll(level);
    }
  };

  // 컬럼 설정 정보 가져오기 (다이얼로그용)
  const getColumnSettings = () => {
    return getColumnSettingsUtil(treeViewRef.current);
  };

  // 컬럼 표시/숨김
  const setColumnVisible = (columnName: string, visible: boolean) => {
    setColumnVisibleUtil(treeViewRef.current, columnName, visible);
  };

  // 모든 컬럼 표시
  const showAllColumns = () => {
    showAllColumnsUtil(treeViewRef.current);
  };

  return {
    containerRef,
    get treeView() { return treeViewRef.current; },
    get dataProvider() { return dataProviderRef.current; },
    isReady,
    setTreeData,
    setFlatData,
    getData,
    getCheckedRows,
    exportToExcel,
    refresh,
    expandAll,
    collapseAll,
    expandToLevel,
    getColumnSettings,
    setColumnVisible,
    showAllColumns,
  };
}
