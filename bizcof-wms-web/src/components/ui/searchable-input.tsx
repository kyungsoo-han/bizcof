import * as React from 'react';
import { Input } from './input';
import { Button } from './button';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SearchableInputProps {
  /** 표시될 텍스트 (선택된 항목의 이름 등) */
  displayValue?: string;
  /** 검색 버튼 클릭 핸들러 */
  onSearchClick: () => void;
  /** placeholder 텍스트 */
  placeholder?: string;
  /** 에러 상태 여부 */
  error?: boolean;
  /** 비활성화 여부 */
  disabled?: boolean;
  /** 추가 className */
  className?: string;
}

/**
 * 검색 팝업을 통해 값을 선택하는 Input 컴포넌트
 * 거래처, 품목 등 검색이 필요한 필드에 사용
 */
export function SearchableInput({
  displayValue = '',
  onSearchClick,
  placeholder,
  error,
  disabled,
  className,
}: SearchableInputProps) {
  return (
    <div className={cn('flex gap-2', className)}>
      <Input
        value={displayValue}
        readOnly
        placeholder={placeholder}
        disabled={disabled}
        className={cn('flex-1', error && 'border-red-500')}
      />
      <Button
        type="button"
        variant="outline"
        onClick={onSearchClick}
        disabled={disabled}
      >
        <Search className="h-4 w-4" />
      </Button>
    </div>
  );
}
