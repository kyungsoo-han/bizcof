import { Button } from '@/components/ui/button';
import useVersionCheck from './useVersionCheck';

const VersionCheckAlert = () => {
  const { needsRefresh, refreshPage } = useVersionCheck();

  if (!needsRefresh) return null;

  return (
    <div className="fixed top-4 right-4 w-96 bg-red-50 border border-red-200 rounded-lg shadow-lg z-50 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg
            className="w-5 h-5 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <p className="text-sm font-medium text-red-800">
              새로운 버전이 배포되었습니다.
            </p>
            <p className="text-xs text-red-600">새로고침이 필요합니다.</p>
          </div>
        </div>
        <Button
          onClick={refreshPage}
          size="sm"
          variant="destructive"
        >
          새로고침
        </Button>
      </div>
    </div>
  );
};

export default VersionCheckAlert;
