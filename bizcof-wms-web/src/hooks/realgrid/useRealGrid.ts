import { useEffect, useRef, useState, useMemo } from 'react';
import type { RealGridColumn, RealGridField, RealGridOptions } from '@/types/realgrid';
import {
  createBaseContextMenu,
  handleBaseContextMenuClick,
  getColumnSettings as getColumnSettingsUtil,
  setColumnVisible as setColumnVisibleUtil,
  showAllColumns as showAllColumnsUtil,
} from './common';

interface UseRealGridProps {
  columns: RealGridColumn[];
  fields: RealGridField[];
  options?: RealGridOptions;
  onColumnSettingsClick?: () => void;
}

export function useRealGrid({ columns, fields, options, onColumnSettingsClick }: UseRealGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gridViewRef = useRef<any>(null);
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

      // DataProvider 생성
      const dataProvider = new window.RealGrid.LocalDataProvider(false);
      dataProviderRef.current = dataProvider;

      // GridView 생성
      const gridView = new window.RealGrid.GridView(containerRef.current);
      gridViewRef.current = gridView;

      // GridView와 DataProvider 연결
      gridView.setDataSource(dataProvider);

      // 필드 설정
      dataProvider.setFields(fields);

      // 컬럼 설정 (editable: false인 컬럼에 자동으로 readonly 스타일 적용)
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
      gridView.setColumns(processedColumns);

      // 헤더 설정
      gridView.setHeader({ showTooltip: true });

      // 기본 UI 크기 설정
      gridView.header.height = 35;
      gridView.footer.height = 30;
      gridView.stateBar.width = 16;
      gridView.displayOptions.rowHeight = options?.display?.rowHeight || 28;

      // 옵션 설정
      if (options) {
        if (options.edit) {
          gridView.setEditOptions({
            commitByCell: true,
            commitWhenExitLast: true,
            commitWhenLeave: true,
            ...options.edit,
          });
        }

        if (options.checkBar) {
          gridView.setCheckBar(options.checkBar);
        }

        if (options.stateBar) {
          gridView.setStateBar(options.stateBar);
        }

        if (options.display) {
          gridView.setDisplayOptions(options.display);
        }
      }

      // 컨텍스트 메뉴 설정
      gridView.onContextMenuPopup = () => {
        const current = gridView.getCurrent();
        const row = current.itemIndex + 1;
        const currentColumn = gridView.columnByName(current.column);
        const fixedOptionsSum = gridView.fixedOptions.rightCount + gridView.fixedOptions.colCount + gridView.fixedOptions.rowCount;

        const contextMenu = createBaseContextMenu({
          row,
          currentColumnText: currentColumn?.header?.text || '',
          fixedOptionsSum,
          treeMenu: false,
        });
        gridView.setContextMenu(contextMenu);
      };

      gridView.onContextMenuItemClicked = (grid: any, data: any) => {
        try {
          const cell = grid.getCurrent();
          const col = grid.columnByName(cell.column);

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
      console.error('Failed to initialize RealGrid:', error);
    }

    // Cleanup
    return () => {
      setIsReady(false);

      if (gridViewRef.current) {
        try {
          gridViewRef.current.destroy();
        } catch (e) {
          console.error('Error destroying gridView:', e);
        }
        gridViewRef.current = null;
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

  // 데이터 설정
  const setData = (data: any[]) => {
    if (dataProviderRef.current) {
      dataProviderRef.current.setRows(data);
    }
  };

  // 데이터 가져오기 (datetime은 yyyy-MM-dd 형식)
  const getData = (): any[] => {
    if (dataProviderRef.current) {
      return dataProviderRef.current.getOutputRows({ datetimeFormat: 'yyyy-MM-dd' }, 0, -1);
    }
    return [];
  };

  // 체크된 행 가져오기
  const getCheckedRows = (): any[] => {
    if (gridViewRef.current && dataProviderRef.current) {
      const checkedRows = gridViewRef.current.getCheckedRows();
      return checkedRows.map((rowId: number) => dataProviderRef.current.getJsonRow(rowId));
    }
    return [];
  };

  // 선택된 행 가져오기
  const getSelectedRows = (): any[] => {
    if (gridViewRef.current && dataProviderRef.current) {
      const selection = gridViewRef.current.getSelection();
      const rows: any[] = [];

      if (selection) {
        for (let i = selection.startRow; i <= selection.endRow; i++) {
          rows.push(dataProviderRef.current.getJsonRow(i));
        }
      }

      return rows;
    }
    return [];
  };

  // Excel 내보내기
  const exportToExcel = (fileName: string = 'export.xlsx') => {
    if (gridViewRef.current) {
      gridViewRef.current.exportGrid({
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
    if (gridViewRef.current) {
      gridViewRef.current.refresh();
    }
  };

  // 행 추가
  const addRow = (data: any) => {
    if (dataProviderRef.current) {
      dataProviderRef.current.addRow(data);
    }
  };

  // 행 삭제
  const removeRow = (rowId: number) => {
    if (dataProviderRef.current) {
      dataProviderRef.current.removeRow(rowId);
    }
  };

  // 컨텍스트 메뉴 설정
  const setContextMenu = (menuItems: any[]) => {
    if (gridViewRef.current) {
      gridViewRef.current.setContextMenu(menuItems);
    }
  };

  // 필터 설정
  const setColumnFilters = (fieldName: string, filters: any[]) => {
    if (gridViewRef.current) {
      gridViewRef.current.setColumnFilters(fieldName, filters);
    }
  };

  // 필터 초기화
  const clearColumnFilters = (fieldName?: string) => {
    if (gridViewRef.current) {
      if (fieldName) {
        gridViewRef.current.clearColumnFilters(fieldName);
      } else {
        gridViewRef.current.clearColumnFilters();
      }
    }
  };

  // 정렬
  const orderBy = (fieldNames: string[], sortDirs?: string[]) => {
    if (gridViewRef.current) {
      gridViewRef.current.orderBy(fieldNames, sortDirs);
    }
  };

  // 컬럼 표시/숨김
  const setColumnVisible = (columnName: string, visible: boolean) => {
    setColumnVisibleUtil(gridViewRef.current, columnName, visible);
  };

  // 모든 컬럼 가져오기
  const getColumns = () => {
    if (gridViewRef.current) {
      return gridViewRef.current.getColumns();
    }
    return [];
  };

  // 컬럼 설정 정보 가져오기 (다이얼로그용)
  const getColumnSettings = () => {
    return getColumnSettingsUtil(gridViewRef.current);
  };

  // 모든 컬럼 표시
  const showAllColumns = () => {
    showAllColumnsUtil(gridViewRef.current);
  };

  // 행 높이 설정
  const setRowHeight = (height: number) => {
    if (gridViewRef.current) {
      gridViewRef.current.displayOptions.rowHeight = height;
      gridViewRef.current.refresh();
    }
  };

  // 그룹핑 설정
  const setGrouping = (groupFields: string[]) => {
    if (gridViewRef.current) {
      gridViewRef.current.groupBy(groupFields);
    }
  };

  // 그룹핑 해제
  const clearGrouping = () => {
    if (gridViewRef.current) {
      gridViewRef.current.groupBy([]);
    }
  };

  // 컬럼 고정/해제
  const setColumnFixed = (fieldName: string, fixed: boolean) => {
    if (gridViewRef.current) {
      const column = gridViewRef.current.columnByName(fieldName);
      if (column) {
        column.fixed = fixed;
      }
    }
  };

  return useMemo(() => ({
    containerRef,
    gridView: gridViewRef.current,
    dataProvider: dataProviderRef.current,
    isReady,
    setData,
    getData,
    getCheckedRows,
    getSelectedRows,
    exportToExcel,
    refresh,
    addRow,
    removeRow,
    setContextMenu,
    setColumnFilters,
    clearColumnFilters,
    orderBy,
    setColumnVisible,
    getColumns,
    getColumnSettings,
    showAllColumns,
    setRowHeight,
    setGrouping,
    clearGrouping,
    setColumnFixed,
  }), [isReady]);
}
