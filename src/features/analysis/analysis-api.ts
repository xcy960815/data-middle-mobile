import { dmsRequest } from '@/features/auth/api-client';

import type { AnalysisListRequest, AnalysisListResponse } from './types';

/**
 * 拉取分析列表分页数据。
 *
 * @param {AnalysisListRequest} params - 分页、关键词与排序参数。
 * @param {AbortSignal} [signal] - 中止信号，用于取消进行中的请求。
 * @returns {Promise<AnalysisListResponse>} 分析列表分页结果，list 与 total 由服务端计算。
 * @throws {DmsApiError} 网络失败或 DMS 返回非 200 业务码时抛出。
 */
export function fetchAnalysisList(
  params: AnalysisListRequest,
  signal?: AbortSignal,
): Promise<AnalysisListResponse> {
  return dmsRequest<AnalysisListResponse>('/api/analysis/list', {
    method: 'POST',
    body: JSON.stringify(params),
    signal,
  });
}
