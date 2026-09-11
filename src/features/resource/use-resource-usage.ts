import { useEffect, useState } from 'react';

import { fetchAnalysisUsage } from '@/features/analysis/analysis-detail-api';
import type { AnalysisUsageResponse } from '@/features/analysis/types';
import { DmsApiError } from '@/features/auth/api-client';
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
  const [usage, setUsage] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setUsage(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    const controller = new AbortController();
    let active = true;

    const request = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const nextUsage = await fetcher(resourceId, controller.signal);
        if (!active) return;
        setUsage(nextUsage as T | null);
      } catch (nextError) {
        if (!active || controller.signal.aborted) return;
        setError(nextError instanceof Error ? nextError.message : '获取引用影响失败。');
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

    void request();
    return () => {
      active = false;
      controller.abort();
    };
  }, [enabled, fetcher, onUnauthorized, resourceId]);

  return { usage, isLoading, error };
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
