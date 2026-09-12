import { useCallback } from 'react';

import { DmsApiError } from '@/features/auth/api-client';
import { useAsyncResource } from '@/features/common/use-async-resource';
import { fetchAnalysisConfigHistory } from '@/features/analysis/analysis-detail-api';
import type { AnalysisConfigHistoryItem } from '@/features/analysis/types';
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
  const load = useCallback(
    async (signal: AbortSignal) => {
      const items = await fetchResourceHistory(type, resourceId, signal);
      return items.map((item) => ({ type, item }) as ResourceHistoryEntry);
    },
    [type, resourceId],
  );

  const resource = useAsyncResource<ResourceHistoryEntry[]>({
    load,
    fallbackErrorMessage: '获取历史版本失败，请稍后重试。',
    onUnauthorized,
  });

  return {
    entries: resource.data ?? [],
    currentConfigId,
    isLoading: resource.isLoading,
    error: resource.error,
    reload: resource.reload,
  };
}
