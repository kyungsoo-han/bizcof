import { forwardRef, useImperativeHandle, useEffect, useMemo, useState } from 'react';
import { useRealTreeGrid } from '@/hooks/realgrid';
import type { RealGridColumn, RealGridField, RealGridOptions } from '@/types/realgrid';
import { cn } from '@/lib/utils';
import { ColumnSettingsDialog, type ColumnInfo } from './ColumnSettingsDialog';

/**
 * TreeGrid 컴포넌트 Props
 */
export interface TreeGridProps {
  /** 그리드 컬럼 정의 */
  columns: RealGridColumn[];

  /** 그리드 필드 정의 */
  fields?: RealGridField[];

  /** fields 자동 생성 여부 */
  autoFields?: boolean;

  /** 그리드에 표시할 데이터 */
  data?: any[];

  /** RealGrid 옵션 */
  options?: RealGridOptions;

  /** 그리드 컨테이너 className */
  className?: string;

  /** 트리 ID 필드명 (기본값: 'id') */
  treeField?: string;

  /** 부모 ID 필드명 (기본값: 'parentId') */
  parentField?: string;

  /** 행 클릭 시 호출 */
  onRowClick?: (rowData: any) => void;

  /** 행 더블클릭 시 호출 */
  onRowDoubleClick?: (rowData: any) => void;
}

/**
 * columns 배열에서 fields 배열을 자동 생성
 */
function columnsToFields(columns: RealGridColumn[]): RealGridField[] {
  return columns.map(col => ({
    fieldName: col.fieldName || col.name,
    dataType: col.dataType || 'text',
  }));
}

/**
 * TreeGrid ref로 접근 가능한 메서드들
 */
export interface TreeGridRef {
  /** 트리 데이터 설정 */
  setTreeData: (data: any[]) => void;
  /** 플랫 데이터 설정 (자동으로 트리 구조 변환) */
  setFlatData: (data: any[]) => void;
  /** 그리드의 현재 데이터 가져오기 */
  getData: () => any[];
  /** 체크된 행들 가져오기 */
  getCheckedRows: () => any[];
  /** Excel 파일로 내보내기 */
  exportToExcel: (fileName?: string) => void;
  /** 그리드 새로고침 */
  refresh: () => void;
  /** 모든 노드 펼치기 */
  expandAll: () => void;
  /** 모든 노드 접기 */
  collapseAll: () => void;
  /** 특정 레벨까지 펼치기 */
  expandToLevel: (level: number) => void;
  /** RealGrid TreeView 인스턴스 */
  treeView: any;
  /** RealGrid DataProvider 인스턴스 */
  dataProvider: any;
}

/**
 * RealGrid 기반 트리 그리드 컴포넌트
 */
export const TreeGrid = forwardRef<TreeGridRef, TreeGridProps>(
  (
    {
      columns,
      fields,
      autoFields = true,
      data = [],
      options,
      className,
      treeField = 'id',
      parentField = 'parentId',
      onRowClick,
      onRowDoubleClick,
    },
    ref
  ) => {
    // 컬럼 설정 다이얼로그 상태
    const [columnDialogOpen, setColumnDialogOpen] = useState(false);
    const [columnSettings, setColumnSettings] = useState<ColumnInfo[]>([]);

    const resolvedFields = useMemo(() => {
      if (autoFields) {
        return columnsToFields(columns);
      }
      return fields || [];
    }, [autoFields, columns, fields]);

    const grid = useRealTreeGrid({
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
      treeField,
      parentField,
      onColumnSettingsClick: () => setColumnDialogOpen(true),
    });

    // 다이얼로그가 열릴 때 컬럼 설정 가져오기
    useEffect(() => {
      if (columnDialogOpen && grid.isReady) {
        setColumnSettings(grid.getColumnSettings());
      }
    }, [columnDialogOpen, grid.isReady]);

    // ref로 메서드 노출
    useImperativeHandle(
      ref,
      () => ({
        setTreeData: grid.setTreeData,
        setFlatData: grid.setFlatData,
        getData: grid.getData,
        getCheckedRows: grid.getCheckedRows,
        exportToExcel: grid.exportToExcel,
        refresh: grid.refresh,
        expandAll: grid.expandAll,
        collapseAll: grid.collapseAll,
        expandToLevel: grid.expandToLevel,
        treeView: grid.treeView,
        dataProvider: grid.dataProvider,
      }),
      [grid]
    );

    // 데이터 설정
    useEffect(() => {
      if (grid.isReady) {
        if (data.length > 0) {
          grid.setFlatData(data, treeField, parentField);
          // 기본적으로 모든 노드 펼치기
          setTimeout(() => grid.expandAll(), 100);
        } else {
          // 데이터가 없으면 그리드 초기화
          grid.dataProvider?.clearRows();
        }
      }
    }, [grid.isReady, data, treeField, parentField]);

    // 이벤트 리스너 설정
    useEffect(() => {
      if (grid.isReady && grid.treeView) {
        if (onRowClick) {
          grid.treeView.onCellClicked = (_: any, clickData: any) => {
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
          grid.treeView.onCellDblClicked = (_: any, clickData: any) => {
            if (clickData.dataRow >= 0 && grid.dataProvider) {
              const rowData = grid.dataProvider.getJsonRow(clickData.dataRow);
              onRowDoubleClick(rowData);
            }
          };
        }
      }
    }, [grid.isReady, grid.treeView, grid.dataProvider, onRowClick, onRowDoubleClick]);

    // className에서 높이 추출 (h-[xxx] 패턴)
    const heightMatch = className?.match(/h-\[(\d+)px\]/);
    const height = heightMatch ? `${heightMatch[1]}px` : '400px';

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

    return (
      <>
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
      </>
    );
  }
);

TreeGrid.displayName = 'TreeGrid';
