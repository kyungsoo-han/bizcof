import { useEffect, useState } from 'react';
import { api } from '@/services/api/client';

interface VersionResponse {
  buildTime: string;
}

const useVersionCheck = (interval = 60000) => {
  const [needsRefresh, setNeedsRefresh] = useState(false);
  const [currentVersion, setCurrentVersion] = useState<string | null>(null);

  useEffect(() => {
    // 초기 버전 정보 가져오기
    const fetchInitialVersion = async () => {
      try {
        const data = await api.get<VersionResponse>('version');
        setCurrentVersion(data.buildTime);
      } catch (error) {
        console.error('Failed to fetch initial version:', error);
      }
    };

    fetchInitialVersion();

    // 주기적으로 버전 체크
    const checkVersion = async () => {
      try {
        const data = await api.get<VersionResponse>('version');
        if (currentVersion && data.buildTime !== currentVersion) {
          setNeedsRefresh(true);
        }
      } catch (error) {
        console.error('Version check failed:', error);
      }
    };

    const intervalId = setInterval(checkVersion, interval);

    return () => clearInterval(intervalId);
  }, [interval, currentVersion]);

  const refreshPage = () => {
    window.location.reload();
  };

  return { needsRefresh, refreshPage };
};

export default useVersionCheck;
