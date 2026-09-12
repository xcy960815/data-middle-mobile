import { useCallback, useEffect, useState } from 'react';

import { DmsApiError } from '@/features/auth/api-client';
import { fetchMonitorSnapshot } from './monitor-api';
import type { SnapshotResponse } from './types';

export function useMonitorSnapshot(onUnauthorized?: (error: DmsApiError) => void | Promise<void>) {
  const [snapshot, setSnapshot] = useState<SnapshotResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadVersion, setReloadVersion] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setIsLoading(true);
    setError(null);
    void fetchMonitorSnapshot(controller.signal)
      .then((nextSnapshot) => {
        if (active) setSnapshot(nextSnapshot);
      })
      .catch(async (nextError: unknown) => {
        if (!active || controller.signal.aborted) return;
        setError(nextError instanceof Error ? nextError.message : '加载监控快照失败。');
        if (
          nextError instanceof DmsApiError &&
          (nextError.status === 401 || nextError.code === 401)
        ) {
          await onUnauthorized?.(nextError);
        }
      })
      .finally(() => {
        if (active && !controller.signal.aborted) setIsLoading(false);
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [onUnauthorized, reloadVersion]);

  const reload = useCallback(() => setReloadVersion((version) => version + 1), []);

  return { snapshot, isLoading, error, reload };
}
