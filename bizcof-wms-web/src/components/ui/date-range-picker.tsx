import * as React from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Calendar as CalendarIcon } from 'lucide-react';
import { DateRange, type Range, type RangeKeyDict } from 'react-date-range';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import './date-range-picker.css';

export interface DateRangePickerProps {
  value?: { startDate: Date | null; endDate: Date | null };
  onChange?: (range: { startDate: Date | null; endDate: Date | null }) => void;
  placeholder?: string;
  className?: string;
}

const presets = {
  today: {
    label: '오늘',
    getRange: () => ({
      startDate: new Date(),
      endDate: new Date(),
    }),
  },
  yesterday: {
    label: '어제',
    getRange: () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      return {
        startDate: yesterday,
        endDate: yesterday,
      };
    },
  },
  last7days: {
    label: '최근 7일',
    getRange: () => {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 6);
      return {
        startDate: start,
        endDate: end,
      };
    },
  },
  last30days: {
    label: '최근 30일',
    getRange: () => {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 29);
      return {
        startDate: start,
        endDate: end,
      };
    },
  },
  thisMonth: {
    label: '이번 달',
    getRange: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return {
        startDate: start,
        endDate: end,
      };
    },
  },
  lastMonth: {
    label: '지난 달',
    getRange: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      return {
        startDate: start,
        endDate: end,
      };
    },
  },
  thisYear: {
    label: '올해',
    getRange: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), 0, 1);
      const end = new Date();
      return {
        startDate: start,
        endDate: end,
      };
    },
  },
};

export function DateRangePicker({
  value,
  onChange,
  placeholder = '날짜 범위 선택',
  className,
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [dateRange, setDateRange] = React.useState<Range>({
    startDate: value?.startDate || undefined,
    endDate: value?.endDate || undefined,
    key: 'selection',
  });

  React.useEffect(() => {
    if (value) {
      setDateRange({
        startDate: value.startDate || undefined,
        endDate: value.endDate || undefined,
        key: 'selection',
      });
    }
  }, [value]);

  const handleSelect = (ranges: RangeKeyDict) => {
    const selection = ranges.selection;
    setDateRange(selection);
  };

  const handleApply = () => {
    if (onChange && dateRange.startDate && dateRange.endDate) {
      onChange({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      });
    }
    setOpen(false);
  };

  const handleCancel = () => {
    setDateRange({
      startDate: value?.startDate || undefined,
      endDate: value?.endDate || undefined,
      key: 'selection',
    });
    setOpen(false);
  };

  const handlePresetClick = (preset: keyof typeof presets) => {
    const range = presets[preset].getRange();
    setDateRange({
      startDate: range.startDate,
      endDate: range.endDate,
      key: 'selection',
    });
    if (onChange) {
      onChange(range);
    }
    setOpen(false);
  };

  const formatDisplayValue = () => {
    if (value?.startDate && value?.endDate) {
      return `${format(value.startDate, 'yyyy년 MM월 dd일')} ~ ${format(value.endDate, 'yyyy년 MM월 dd일')}`;
    }
    return placeholder;
  };

  // 커스텀 네비게이터 렌더러
  const renderNavigator = (currentMonth: Date, changeShownDate: any) => {
    return (
      <div className="rdrMonthAndYearWrapper">
        <button
          type="button"
          className="rdrNextPrevButton rdrPprevButton"
          onClick={() => changeShownDate(-1, 'monthOffset')}
        >
          <i />
        </button>
        <span className="rdrMonthAndYearPickers">
          {format(currentMonth, 'yyyy년 M월', { locale: ko })}
        </span>
        <button
          type="button"
          className="rdrNextPrevButton rdrNextButton"
          onClick={() => changeShownDate(1, 'monthOffset')}
        >
          <i />
        </button>
      </div>
    );
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-start text-left font-normal',
            !value?.startDate && 'text-muted-foreground',
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {formatDisplayValue()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex">
          {/* 프리셋 사이드바 */}
          <div className="flex flex-col gap-1 border-r p-2">
            {Object.entries(presets).map(([key, preset]) => (
              <Button
                key={key}
                variant="ghost"
                size="sm"
                className="justify-start"
                onClick={() => handlePresetClick(key as keyof typeof presets)}
              >
                {preset.label}
              </Button>
            ))}
          </div>

          {/* 캘린더 */}
          <div>
            <DateRange
              ranges={[dateRange]}
              onChange={handleSelect}
              locale={ko}
              moveRangeOnFirstSelection={false}
              months={2}
              direction="horizontal"
              showMonthAndYearPickers={false}
              monthDisplayFormat="yyyy년 MM월"
              navigatorRenderer={renderNavigator}
            />

            {/* 확인/취소 버튼 */}
            <div className="flex justify-end gap-2 border-t p-2">
              <Button variant="outline" size="sm" onClick={handleCancel}>
                취소
              </Button>
              <Button size="sm" onClick={handleApply}>
                확인
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
