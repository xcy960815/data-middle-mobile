import { useCallback } from 'react';

import { DmsApiError } from '@/features/auth/api-client';
import { useAsyncResource } from '@/features/common/use-async-resource';
import { fetchAnalysisConfigHistory } from '@/features/analysis/analysis-detail-api';
import type { AnalysisConfigHistoryItem } from '@/features/analysis/types';
import { fetchDashboardConfigHistory } from '@/features/dashboard/dashboard-detail-api';
import type { DashboardConfigHistoryItem } from '@/features/dashboard/types';
import { fetchDatasetConfigHistory } from '@/features/dataset/dataset-api';
import type { DatasetConfigHistoryItem } from '@/features/dataset/types';

/** 支持查询配置历史的资源类型：analysis 分析、dashboard 看板、dataset 数据集。 */
export type ResourceHistoryType = 'analysis' | 'dashboard' | 'dataset';

/**
 * 带来源资源类型的历史条目：type 标记该条目来自哪类资源，item 为对应模块的历史版本条目。
 */
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

/**
 * 按资源类型加载配置历史版本列表：type 为 analysis、dashboard、dataset 时分别分发到
 * 分析、看板、数据集的历史接口，返回条目统一包装为带 type 的 ResourceHistoryEntry。
 *
 * 错误不向调用方抛出，统一归一为 error 文案；会话失效（401）额外触发 onUnauthorized 回调。
 *
 * @param {ResourceHistoryType} type - 资源类型，决定请求哪个模块的历史接口。
 * @param {number} resourceId - 资源 id。
 * @param {number} currentConfigId - 当前生效的配置版本 id，由调用方从详情数据传入并原样透传。
 * @param [onUnauthorized] - 会话失效回调；遇到 401 时接收对应的 DmsApiError，可异步。
 * @returns {{
 *   entries: ResourceHistoryEntry[];
 *   currentConfigId: number;
 *   isLoading: boolean;
 *   error: string | null;
 *   reload: () => void;
 * }} 历史版本状态：entries 为历史条目列表，加载前或失败时为空数组；currentConfigId 为
 *   传入的当前配置版本 id，原样透传；isLoading 表示请求进行中；error 为归一后的错误文案
 *   （兜底“获取历史版本失败，请稍后重试。”）；reload 手动触发一次重新加载。
 */
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
