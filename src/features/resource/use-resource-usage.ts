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

/**
 * 分析详情页的引用影响 hook：拉取该分析被看板、邮件任务与报警规则引用的汇总计数与明细。
 *
 * 引用影响随详情页一次性拉取，不支持手动刷新（下拉刷新详情页会重挂载并重新加载）；
 * 错误不向调用方抛出，统一归一为 error 文案，会话失效（401）额外触发 onUnauthorized 回调。
 *
 * @param {number} analysisId - 分析 id。
 * @param [onUnauthorized] - 会话失效回调；遇到 401 时接收对应的 DmsApiError，可异步。
 * @param {boolean} [enabled=true] - false 时不请求且 usage 保持 null（如权限未达标时跳过拉取）。
 * @returns {ResourceUsageState<AnalysisUsageResponse>} 引用影响状态：usage 为最近一次
 *   成功拉取的引用影响数据，加载中、失败或 enabled=false 时为 null；isLoading 表示请求
 *   进行中；error 为归一后的错误文案（兜底“获取引用影响失败。”）。
 */
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

/**
 * 数据集详情页的引用影响 hook：拉取该数据集被分析、看板与邮件任务引用的汇总计数与明细。
 *
 * 同 useAnalysisUsage：随详情页一次性拉取，不支持手动刷新；错误不向调用方抛出，统一归一
 * 为 error 文案，会话失效（401）额外触发 onUnauthorized 回调。与 useAnalysisUsage 不同，
 * 本 hook 不提供 enabled 门控，挂载即拉取。
 *
 * @param {number} datasetId - 数据集 id。
 * @param [onUnauthorized] - 会话失效回调；遇到 401 时接收对应的 DmsApiError，可异步。
 * @returns {ResourceUsageState<DatasetUsageResponse>} 引用影响状态：usage 为最近一次
 *   成功拉取的引用影响数据，加载中或失败时为 null；isLoading 表示请求进行中；error 为
 *   归一后的错误文案（兜底“获取引用影响失败。”）。
 */
export function useDatasetUsage(
  datasetId: number,
  onUnauthorized?: (error: DmsApiError) => void | Promise<void>,
) {
  return useResourceUsage<DatasetUsageResponse>(fetchDatasetUsage, datasetId, onUnauthorized);
}
