import { cn } from '@/lib/utils';

/**
 * LoadingOverlay Props
 */
export interface LoadingOverlayProps {
  /** 로딩 표시 여부 */
  visible: boolean;
  /** 로딩 메시지 */
  message?: string;
  /** 전체 화면 오버레이 여부 (기본값: true) */
  fullScreen?: boolean;
  /** 추가 className */
  className?: string;
}

/**
 * 로딩 오버레이 컴포넌트
 *
 * @example
 * // 전체 화면 로딩
 * <LoadingOverlay visible={isLoading} message="데이터를 불러오는 중..." />
 *
 * @example
 * // 영역 내 로딩 (fullScreen=false)
 * <div className="relative">
 *   <LoadingOverlay visible={isLoading} fullScreen={false} />
 *   <DataGrid ... />
 * </div>
 */
export function LoadingOverlay({
  visible,
  message = '로딩 중...',
  fullScreen = true,
  className,
}: LoadingOverlayProps) {
  if (!visible) return null;

  return (
    <div
      className={cn(
        'bg-black/50 flex items-center justify-center z-50',
        fullScreen ? 'fixed inset-0' : 'absolute inset-0',
        className
      )}
    >
      <div className="bg-background p-6 rounded-lg shadow-lg">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
          <p className="text-lg">{message}</p>
        </div>
      </div>
    </div>
  );
}
