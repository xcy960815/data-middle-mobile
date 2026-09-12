import { useCallback } from 'react';

import { DmsApiError } from '@/features/auth/api-client';
import { useAsyncResource } from '@/features/common/use-async-resource';
import { fetchAnalysisUsage } from '@/features/analysis/analysis-detail-api';
import type { AnalysisUsageResponse } from '@/features/analysis/types';
import { fetchDatasetUsage } from '@/features/dataset/dataset-api';
import type { DatasetUsageResponse } from '@/features/dataset/types';

type ResourceUsageFetcher = (resourceId: number, signal: AbortSignal) => Promise<unknown>;

type ResourceUsageState<T> = {
  usage: T | null;
  isLoading: boolean;
  error: string | null;
};

/**
 * 引用影响随详情页一次性拉取，不支持手动刷新（下拉刷新详情页会重挂载并重新加载）。
 * fetcher 只接收模块级函数引用，保证 effect 依赖在渲染间保持稳定。
 */
function useResourceUsage<T>(
  fetcher: ResourceUsageFetcher,
  resourceId: number,
  onUnauthorized?: (error: DmsApiError) => void | Promise<void>,
  enabled = true,
): ResourceUsageState<T> {
  const load = useCallback(
    async (signal: AbortSignal) => (await fetcher(resourceId, signal)) as T,
    [fetcher, resourceId],
  );

  const resource = useAsyncResource<T>({
    load,
    fallbackErrorMessage: '获取引用影响失败。',
    onUnauthorized,
    enabled,
  });

  return { usage: resource.data, isLoading: resource.isLoading, error: resource.error };
}

export function useAnalysisUsage(
  analysisId: number,
  onUnauthorized?: (error: DmsApiError) => void | Promise<void>,
  enabled = true,
) {
  return useResourceUsage<AnalysisUsageResponse>(
    fetchAnalysisUsage,
    analysisId,
    onUnauthorized,
    enabled,
  );
}

export function useDatasetUsage(
  datasetId: number,
  onUnauthorized?: (error: DmsApiError) => void | Promise<void>,
) {
  return useResourceUsage<DatasetUsageResponse>(fetchDatasetUsage, datasetId, onUnauthorized);
}
