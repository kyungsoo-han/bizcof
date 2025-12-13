import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export interface ColumnInfo {
  name: string;
  headerText: string;
  visible: boolean;
  fieldName?: string;
}

interface ColumnSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  columns: ColumnInfo[];
  onColumnVisibilityChange: (columnName: string, visible: boolean) => void;
  onShowAllColumns?: () => void;
}

export function ColumnSettingsDialog({
  open,
  onOpenChange,
  columns,
  onColumnVisibilityChange,
  onShowAllColumns,
}: ColumnSettingsDialogProps) {
  const [localColumns, setLocalColumns] = useState<ColumnInfo[]>(columns);

  // columns prop이 변경될 때 로컬 상태 업데이트
  useEffect(() => {
    setLocalColumns(columns);
  }, [columns]);

  const handleToggle = (columnName: string, checked: boolean) => {
    // 로컬 상태 즉시 업데이트 (UI 반응성)
    setLocalColumns(prev =>
      prev.map(col =>
        col.name === columnName ? { ...col, visible: checked } : col
      )
    );
    // 실제 그리드에 반영
    onColumnVisibilityChange(columnName, checked);
  };

  const handleShowAll = () => {
    // 모든 컬럼 표시
    setLocalColumns(prev => prev.map(col => ({ ...col, visible: true })));
    onShowAllColumns?.();
  };

  const handleHideAll = () => {
    // 모든 컬럼 숨기기 (최소 1개는 남겨야 함)
    const visibleColumns = localColumns.filter(col => col.visible);
    if (visibleColumns.length <= 1) return;

    // 첫 번째 컬럼은 유지하고 나머지 숨기기
    setLocalColumns(prev =>
      prev.map((col, index) => ({ ...col, visible: index === 0 }))
    );
    localColumns.forEach((col, index) => {
      if (index > 0) {
        onColumnVisibilityChange(col.name, false);
      }
    });
  };

  // fieldName이 있는 컬럼만 표시 (실제 데이터 컬럼)
  const displayColumns = localColumns.filter(col => col.fieldName);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>열 표시/숨김</DialogTitle>
        </DialogHeader>

        <div className="flex gap-2 mb-4">
          <Button variant="outline" size="sm" onClick={handleShowAll}>
            전체 표시
          </Button>
          <Button variant="outline" size="sm" onClick={handleHideAll}>
            전체 숨김
          </Button>
        </div>

        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {displayColumns.map((column) => (
            <div key={column.name} className="flex items-center space-x-2">
              <Checkbox
                id={column.name}
                checked={column.visible}
                onCheckedChange={(checked) =>
                  handleToggle(column.name, checked as boolean)
                }
              />
              <Label
                htmlFor={column.name}
                className="text-sm font-normal cursor-pointer"
              >
                {column.headerText}
              </Label>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
