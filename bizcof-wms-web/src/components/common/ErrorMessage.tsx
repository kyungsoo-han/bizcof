import { cn } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';

/**
 * ErrorMessage Props
 */
export interface ErrorMessageProps {
  /** 에러 객체 또는 메시지 */
  error?: Error | string | null;
  /** 에러가 없을 때 표시할 대체 메시지 */
  fallback?: string;
  /** 컨테이너 높이 (기본값: h-64) */
  height?: string;
  /** 추가 className */
  className?: string;
}

/**
 * 에러 메시지 표시 컴포넌트
 *
 * @example
 * // 기본 사용
 * {error && <ErrorMessage error={error} />}
 *
 * @example
 * // 조건부 렌더링과 함께
 * {error ? (
 *   <ErrorMessage error={error} fallback="API가 구현되지 않았습니다" />
 * ) : (
 *   <DataGrid ... />
 * )}
 */
export function ErrorMessage({
  error,
  fallback = '오류가 발생했습니다',
  height = 'h-64',
  className,
}: ErrorMessageProps) {
  if (!error) return null;

  const message = typeof error === 'string'
    ? error
    : error.message || fallback;

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-muted-foreground gap-2',
        height,
        className
      )}
    >
      <AlertCircle className="h-8 w-8 text-destructive" />
      <p>{message}</p>
    </div>
  );
}

/**
 * 빈 상태 메시지 컴포넌트
 *
 * @example
 * {!selectedItem ? (
 *   <EmptyMessage message="항목을 선택하세요" />
 * ) : (
 *   <DetailView item={selectedItem} />
 * )}
 */
export function EmptyMessage({
  message = '데이터가 없습니다',
  height = 'h-64',
  className,
}: {
  message?: string;
  height?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-center text-muted-foreground',
        height,
        className
      )}
    >
      <p>{message}</p>
    </div>
  );
}
