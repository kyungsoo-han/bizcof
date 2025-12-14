import { forwardRef, useImperativeHandle, useEffect, useMemo, useState } from 'react';
import { Download, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRealGrid } from '@/hooks/realgrid';
import type { RealGridColumn, RealGridField, RealGridOptions } from '@/types/realgrid';
import { cn } from '@/lib/utils';
import { ColumnSettingsDialog, type ColumnInfo } from './ColumnSettingsDialog';

/**
 * DataGrid 컴포넌트 Props
 */
export interface DataGridProps {
  /** 그리드 컬럼 정의 */
  columns: RealGridColumn[];

  /**
   * 그리드 필드 정의 (autoFields=false 일 때만 사용)
   * autoFields=true 이면 columns에서 자동 생성되므로 무시됨
   */
  fields?: RealGridField[];

  /**
   * fields 자동 생성 여부
   * - true (기본값): columns의 fieldName과 dataType으로 fields 자동 생성
   * - false: fields prop을 직접 전달해야 함
   */
  autoFields?: boolean;

  /** 그리드에 표시할 데이터 */
  data?: any[];

  /** RealGrid 옵션 (display, checkBar, stateBar, edit 등) */
  options?: RealGridOptions;

  /** 그리드 컨테이너 className */
  className?: string;

  /** 툴바 표시 여부 (기본값: true) */
  showToolbar?: boolean;

  /** 선택된 행이 변경될 때 호출 */
  onSelectionChanged?: (selectedRows: any[]) => void;

  /** 데이터가 변경될 때 호출 */
  onDataChanged?: () => void;

  /** 셀 클릭 시 호출 */
  onRowClick?: (rowData: any) => void;

  /** 셀 더블클릭 시 호출 */
  onRowDoubleClick?: (rowData: any) => void;

  /**
   * 포커스된 행이 변경될 때 호출 (키보드/마우스 모두)
   * - 키보드 ↑↓ 이동 시 호출
   * - 마우스로 다른 행 클릭 시 호출
   */
  onFocusedRowChanged?: (rowData: any) => void;

  /** 체크박스 선택 시 호출 */
  onItemChecked?: () => void;

  /** 셀 편집 완료 시 호출 */
  onCellEdited?: (grid: any, itemIndex: number, row: number, field: number) => void;
}

/**
 * columns 배열에서 fields 배열을 자동 생성
 * @param columns - RealGrid 컬럼 정의 배열
 * @returns RealGrid 필드 정의 배열
 */
function columnsToFields(columns: RealGridColumn[]): RealGridField[] {
  return columns.map(col => ({
    fieldName: col.fieldName || col.name,
    dataType: col.dataType || 'text',
  }));
}

/**
 * DataGrid ref로 접근 가능한 메서드들
 */
export interface DataGridRef {
  /** 그리드에 데이터 설정 */
  setData: (data: any[]) => void;
  /** 그리드의 현재 데이터 가져오기 */
  getData: () => any[];
  /** 체크된 행들 가져오기 */
  getCheckedRows: () => any[];
  /** 선택된 행들 가져오기 */
  getSelectedRows: () => any[];
  /** Excel 파일로 내보내기 */
  exportToExcel: (fileName?: string) => void;
  /** 그리드 새로고침 */
  refresh: () => void;
  /** 행 추가 */
  addRow: (data: any) => void;
  /** 행 삭제 */
  removeRow: (rowId: number) => void;
  /** RealGrid GridView 인스턴스 */
  gridView: any;
  /** RealGrid DataProvider 인스턴스 */
  dataProvider: any;
}

/**
 * RealGrid 기반 데이터 그리드 컴포넌트
 *
 * @example
 * // 기본 사용법 (fields 자동 생성)
 * <DataGrid
 *   columns={columns}
 *   data={data}
 *   onFocusedRowChanged={(row) => console.log(row)}
 * />
 *
 * @example
 * // fields 직접 지정
 * <DataGrid
 *   columns={columns}
 *   fields={customFields}
 *   autoFields={false}
 *   data={data}
 * />
 */
export const DataGrid = forwardRef<DataGridRef, DataGridProps>(
  (
    {
      columns,
      fields,
      autoFields = true,  // 기본값: true (fields 자동 생성)
      data = [],
      options,
      className,
      showToolbar = true,
      onSelectionChanged,
      onDataChanged,
      onRowClick,
      onRowDoubleClick,
      onFocusedRowChanged,
      onItemChecked,
      onCellEdited,
    },
    ref
  ) => {
    // 컬럼 설정 다이얼로그 상태
    const [columnDialogOpen, setColumnDialogOpen] = useState(false);
    const [columnSettings, setColumnSettings] = useState<ColumnInfo[]>([]);

    // autoFields=true 이면 columns에서 fields 자동 생성
    // autoFields=false 이면 전달받은 fields 사용
    const resolvedFields = useMemo(() => {
      if (autoFields) {
        return columnsToFields(columns);
      }
      // autoFields=false 인데 fields가 없으면 빈 배열 (에러 방지)
      return fields || [];
    }, [autoFields, columns, fields]);

    const grid = useRealGrid({
      columns,
      fields: resolvedFields,
      options: {
        display: {
          rowHeight: 32,
          ...options?.display,
        },
        checkBar: options?.checkBar ?? {
          visible: false,
        },
        stateBar: options?.stateBar ?? {
          visible: false,
        },
        edit: {
          editable: false,
          insertable: false,
          appendable: false,
          updatable: true,
          deletable: false,
          ...options?.edit,
        },
      },
      onColumnSettingsClick: () => setColumnDialogOpen(true),
    });

    // 다이얼로그가 열릴 때 컬럼 설정 가져오기
    useEffect(() => {
      if (columnDialogOpen && grid.isReady) {
        setColumnSettings(grid.getColumnSettings());
      }
    }, [columnDialogOpen, grid.isReady]);

    // 데이터가 변경되면 그리드에 설정
    useImperativeHandle(
      ref,
      () => ({
        setData: grid.setData,
        getData: grid.getData,
        getCheckedRows: grid.getCheckedRows,
        getSelectedRows: grid.getSelectedRows,
        exportToExcel: grid.exportToExcel,
        refresh: grid.refresh,
        addRow: grid.addRow,
        removeRow: grid.removeRow,
        gridView: grid.gridView,
        dataProvider: grid.dataProvider,
      }),
      [grid]
    );

    // 데이터 설정 (빈 배열도 처리)
    useEffect(() => {
      if (grid.isReady) {
        grid.setData(data);
      }
    }, [grid.isReady, data, grid]);

    // 이벤트 리스너 설정
    useEffect(() => {
      if (grid.isReady && grid.gridView) {
        // onCurrentRowChanged: 키보드/마우스로 행 변경 시
        if (onSelectionChanged || onFocusedRowChanged) {
          grid.gridView.onCurrentRowChanged = (_: any, _oldRow: number, newRow: number) => {
            if (onSelectionChanged) {
              const selectedRows = grid.getSelectedRows();
              onSelectionChanged(selectedRows);
            }
            if (onFocusedRowChanged && newRow >= 0 && grid.dataProvider) {
              const rowData = grid.dataProvider.getJsonRow(newRow);
              onFocusedRowChanged(rowData);
            }
          };
        }

        if (onDataChanged) {
          grid.dataProvider.onDataChanged = onDataChanged;
        }

        if (onRowClick) {
          grid.gridView.onCellClicked = (_: any, clickData: any) => {
            // 체크박스 영역 클릭은 무시 (체크박스 기본 동작 허용)
            if (clickData.cellType === 'check' || clickData.column < 0) {
              return;
            }
            if (clickData.dataRow >= 0 && grid.dataProvider) {
              const rowData = grid.dataProvider.getJsonRow(clickData.dataRow);
              onRowClick(rowData);
            }
          };
        }

        if (onRowDoubleClick) {
          grid.gridView.onCellDblClicked = (_: any, clickData: any) => {
            if (clickData.dataRow >= 0 && grid.dataProvider) {
              const rowData = grid.dataProvider.getJsonRow(clickData.dataRow);
              onRowDoubleClick(rowData);
            }
          };
        }

        if (onItemChecked) {
          grid.gridView.onItemChecked = onItemChecked;
          grid.gridView.onItemAllChecked = onItemChecked;
        }

        if (onCellEdited) {
          grid.gridView.onCellEdited = onCellEdited;
        }
      }
    }, [grid.isReady, grid.gridView, grid.dataProvider, onSelectionChanged, onDataChanged, onRowClick, onRowDoubleClick, onFocusedRowChanged, onItemChecked, onCellEdited]);

    const handleExport = () => {
      const fileName = `export_${new Date().toISOString().split('T')[0]}.xlsx`;
      grid.exportToExcel(fileName);
    };

    const handleRefresh = () => {
      grid.refresh();
    };

    // 컬럼 표시/숨김 핸들러
    const handleColumnVisibilityChange = (columnName: string, visible: boolean) => {
      grid.setColumnVisible(columnName, visible);
    };

    // 전체 컬럼 표시 핸들러
    const handleShowAllColumns = () => {
      grid.showAllColumns();
      // 다이얼로그 상태 업데이트
      setColumnSettings(grid.getColumnSettings());
    };

    // className에서 높이 추출
    const getHeight = () => {
      if (!className) return '500px';
      if (className.includes('h-full')) return '100%';
      const pxMatch = className.match(/h-\[(\d+)px\]/);
      if (pxMatch) return `${pxMatch[1]}px`;
      return '500px';
    };
    const height = getHeight();

    return (
      <div className="flex flex-col gap-2 h-full">
        <div
          ref={grid.containerRef}
          className={cn('w-full border rounded-md', className)}
          style={{ height }}
        />

        {/* 컬럼 설정 다이얼로그 */}
        <ColumnSettingsDialog
          open={columnDialogOpen}
          onOpenChange={setColumnDialogOpen}
          columns={columnSettings}
          onColumnVisibilityChange={handleColumnVisibilityChange}
          onShowAllColumns={handleShowAllColumns}
        />
      </div>
    );
  }
);

DataGrid.displayName = 'DataGrid';
