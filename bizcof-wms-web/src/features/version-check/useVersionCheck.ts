import { useEffect, useState } from 'react';
import { api, SESSION_TIMEOUT } from '@/services/api/client';

interface VersionResponse {
  buildTime: string;
}

const LAST_ACTIVITY_KEY = 'lastActivity';

const useVersionCheck = (interval = 60000) => {
  const [needsRefresh, setNeedsRefresh] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);
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

    // 주기적으로 버전 및 세션 체크
    const checkAll = async () => {
      // 1. 세션 체크
      const lastActivity = localStorage.getItem(LAST_ACTIVITY_KEY);
      if (lastActivity) {
        const elapsed = Date.now() - parseInt(lastActivity, 10);
        if (elapsed > SESSION_TIMEOUT) {
          setSessionExpired(true);
          return; // 세션 만료 시 버전 체크 불필요
        }
      }

      // 2. 버전 체크
      try {
        const data = await api.get<VersionResponse>('version');
        if (currentVersion && data.buildTime !== currentVersion) {
          setNeedsRefresh(true);
        }
      } catch (error) {
        console.error('Version check failed:', error);
      }
    };

    const intervalId = setInterval(checkAll, interval);

    return () => clearInterval(intervalId);
  }, [interval, currentVersion]);

  const refreshPage = () => {
    window.location.reload();
  };

  return { needsRefresh, sessionExpired, refreshPage };
};

export default useVersionCheck;
