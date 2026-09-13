import { dmsRequest } from '@/features/auth/api-client';

import type { DashboardListRequest, DashboardListResponse } from './types';

/**
 * 拉取看板列表分页数据。
 *
 * @param {DashboardListRequest} request - 分页、关键词与排序参数。
 * @param {AbortSignal} [signal] - 中止信号，用于取消进行中的请求。
 * @returns {Promise<DashboardListResponse>} 看板列表分页结果，list 与 total 由服务端计算。
 * @throws {DmsApiError} 网络失败或 DMS 返回非 200 业务码时抛出。
 */
export function fetchDashboardList(
  request: DashboardListRequest,
  signal?: AbortSignal,
): Promise<DashboardListResponse> {
  return dmsRequest<DashboardListResponse>('/api/dashboard/list', {
    method: 'POST',
    body: JSON.stringify(request),
    signal,
  });
}
