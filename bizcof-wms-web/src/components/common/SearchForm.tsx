import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, RotateCcw } from 'lucide-react';

/**
 * 검색 필드 정의 타입
 */
export interface SearchField {
  /** 필드 이름 (검색 파라미터 키) */
  name: string;
  /** 라벨 텍스트 */
  label: string;
  /** 필드 타입 */
  type: 'text' | 'select' | 'dateRange';
  /** placeholder 텍스트 */
  placeholder?: string;
  /** select 타입일 때 옵션 목록 */
  options?: { value: string; label: string }[];
  /** 기본값 */
  defaultValue?: string;
}

/**
 * SearchForm 컴포넌트 Props
 */
export interface SearchFormProps {
  /** 검색 폼 제목 */
  title?: string;
  /** 검색 필드 정의 배열 */
  fields: SearchField[];
  /** 검색 실행 콜백 */
  onSearch: (params: Record<string, string>) => void;
  /** 초기화 콜백 (선택적) */
  onReset?: () => void;
  /** 날짜 범위 초기 일수 (기본값: 7) */
  defaultDateRangeDays?: number;
  /** 그리드 컬럼 수 (기본값: 4) */
  columns?: number;
}

/**
 * 공통 검색 폼 컴포넌트
 *
 * @example
 * <SearchForm
 *   title="검색 조건"
 *   fields={[
 *     { name: 'dateRange', label: '기간', type: 'dateRange' },
 *     { name: 'code', label: '코드', type: 'text', placeholder: '코드 입력' },
 *     { name: 'name', label: '이름', type: 'text', placeholder: '이름 입력' },
 *     { name: 'useYn', label: '사용여부', type: 'select', options: [
 *       { value: 'ALL', label: '전체' },
 *       { value: 'Y', label: '사용' },
 *       { value: 'N', label: '미사용' },
 *     ]},
 *   ]}
 *   onSearch={(params) => console.log(params)}
 * />
 */
export function SearchForm({
  title = '검색 조건',
  fields,
  onSearch,
  onReset,
  defaultDateRangeDays = 7,
  columns = 4,
}: SearchFormProps) {
  // 날짜 범위 상태
  const [dateRange, setDateRange] = useState<{ startDate: Date | null; endDate: Date | null }>({
    startDate: null,
    endDate: null,
  });

  // 텍스트/셀렉트 필드 상태
  const [values, setValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    fields.forEach(field => {
      if (field.type !== 'dateRange') {
        initial[field.name] = field.defaultValue || '';
      }
    });
    return initial;
  });

  // 초기 날짜 범위 설정
  useEffect(() => {
    const hasDateRange = fields.some(f => f.type === 'dateRange');
    if (hasDateRange) {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - (defaultDateRangeDays - 1));
      setDateRange({ startDate: start, endDate: end });
    }
  }, [fields, defaultDateRangeDays]);

  // 필드 값 변경
  const handleChange = useCallback((name: string, value: string) => {
    setValues(prev => ({ ...prev, [name]: value }));
  }, []);

  // 검색 파라미터 생성
  const buildSearchParams = useCallback(() => {
    const params: Record<string, string> = {};

    // 날짜 범위
    if (dateRange.startDate && dateRange.endDate) {
      params.startDate = format(dateRange.startDate, 'yyyy-MM-dd');
      params.endDate = format(dateRange.endDate, 'yyyy-MM-dd');
    }

    // 텍스트/셀렉트 필드
    Object.entries(values).forEach(([key, value]) => {
      if (value && value !== 'ALL') {
        params[key] = value;
      }
    });

    return params;
  }, [dateRange, values]);

  // 검색 실행
  const handleSearch = useCallback(() => {
    onSearch(buildSearchParams());
  }, [onSearch, buildSearchParams]);

  // 초기화
  const handleReset = useCallback(() => {
    // 날짜 범위 초기화
    const hasDateRange = fields.some(f => f.type === 'dateRange');
    if (hasDateRange) {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - (defaultDateRangeDays - 1));
      setDateRange({ startDate: start, endDate: end });
    }

    // 필드 값 초기화
    const initial: Record<string, string> = {};
    fields.forEach(field => {
      if (field.type !== 'dateRange') {
        initial[field.name] = field.defaultValue || '';
      }
    });
    setValues(initial);

    // 외부 초기화 콜백
    onReset?.();
  }, [fields, defaultDateRangeDays, onReset]);

  // Enter 키 처리
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  }, [handleSearch]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`grid gap-4 md:grid-cols-${columns}`}>
          {fields.map(field => (
            <div key={field.name} className="space-y-2">
              <Label htmlFor={field.name}>{field.label}</Label>

              {/* 날짜 범위 */}
              {field.type === 'dateRange' && (
                <DateRangePicker
                  value={dateRange}
                  onChange={setDateRange}
                  placeholder={field.placeholder || '날짜 범위 선택'}
                />
              )}

              {/* 텍스트 입력 */}
              {field.type === 'text' && (
                <Input
                  id={field.name}
                  placeholder={field.placeholder || `${field.label} 입력`}
                  value={values[field.name] || ''}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  onKeyPress={handleKeyPress}
                />
              )}

              {/* 셀렉트 */}
              {field.type === 'select' && field.options && (
                <Select
                  value={values[field.name] || field.defaultValue || 'ALL'}
                  onValueChange={(value) => handleChange(field.name, value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 flex gap-2">
          <Button onClick={handleSearch}>
            <Search className="h-4 w-4 mr-2" />
            검색
          </Button>
          <Button onClick={handleReset} variant="outline">
            <RotateCcw className="h-4 w-4 mr-2" />
            초기화
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
