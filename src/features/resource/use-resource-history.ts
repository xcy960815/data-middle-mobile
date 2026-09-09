import { useCallback, useEffect, useState } from 'react';

import { fetchAnalysisConfigHistory } from '@/features/analysis/analysis-detail-api';
import type { AnalysisConfigHistoryItem } from '@/features/analysis/types';
import { DmsApiError } from '@/features/auth/api-client';
import { fetchDashboardConfigHistory } from '@/features/dashboard/dashboard-detail-api';
import type { DashboardConfigHistoryItem } from '@/features/dashboard/types';
import { fetchDatasetConfigHistory } from '@/features/dataset/dataset-api';
import type { DatasetConfigHistoryItem } from '@/features/dataset/types';

export type ResourceHistoryType = 'analysis' | 'dashboard' | 'dataset';

export type ResourceHistoryEntry =
  | { type: 'analysis'; item: AnalysisConfigHistoryItem }
  | { type: 'dashboard'; item: DashboardConfigHistoryItem }
  | { type: 'dataset'; item: DatasetConfigHistoryItem };

function fetchResourceHistory(
  type: ResourceHistoryType,
  resourceId: number,
  signal: AbortSignal,
): Promise<ResourceHistoryEntry['item'][]> {
  if (type === 'analysis') {
    return fetchAnalysisConfigHistory(resourceId, signal).then(
      (items) => items as ResourceHistoryEntry['item'][],
    );
  }
  if (type === 'dashboard') {
    return fetchDashboardConfigHistory(resourceId, signal).then(
      (items) => items as ResourceHistoryEntry['item'][],
    );
  }
  return fetchDatasetConfigHistory(resourceId, signal).then(
    (items) => items as ResourceHistoryEntry['item'][],
  );
}

export function useResourceHistory(
  type: ResourceHistoryType,
  resourceId: number,
  currentConfigId: number,
  onUnauthorized?: (error: DmsApiError) => void | Promise<void>,
) {
  const [entries, setEntries] = useState<ResourceHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshVersion, setRefreshVersion] = useState(0);

  const reload = useCallback(() => setRefreshVersion((version) => version + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const items = await fetchResourceHistory(type, resourceId, controller.signal);
        if (!active) return;
        setEntries(items.map((item) => ({ type, item }) as ResourceHistoryEntry));
      } catch (nextError) {
        if (!active || controller.signal.aborted) return;
        setError(nextError instanceof Error ? nextError.message : '获取历史版本失败，请稍后重试。');
        if (
          nextError instanceof DmsApiError &&
          (nextError.status === 401 || nextError.code === 401)
        ) {
          await onUnauthorized?.(nextError);
        }
      } finally {
        if (active && !controller.signal.aborted) setIsLoading(false);
      }
    };

    void load();
    return () => {
      active = false;
      controller.abort();
    };
  }, [type, resourceId, onUnauthorized, refreshVersion]);

  return { entries, currentConfigId, isLoading, error, reload };
}
