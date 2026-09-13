import { getDmsSm2PublicKey } from '@/features/auth/config';
import { dmsRequest } from '@/features/auth/api-client';
import { encryptSm2Payload } from '@/features/auth/sm2';

import type {
  DashboardConfigHistoryItem,
  DashboardDetailResponse,
  DashboardWidgetDataResponse,
} from './types';

/**
 * 拉取看板详情，请求附带 trackViewCount: true 触发服务端浏览量统计。
 *
 * @param {number} id - 看板 id。
 * @param {AbortSignal} [signal] - 中止信号，用于取消进行中的请求。
 * @returns {Promise<DashboardDetailResponse>} 看板详情，含布局配置与组件列表。
 * @throws {DmsApiError} 网络失败或 DMS 返回非 200 业务码时抛出。
 */
export function fetchDashboardDetail(id: number, signal?: AbortSignal) {
  return dmsRequest<DashboardDetailResponse>('/api/dashboard/detail', {
    method: 'POST',
    body: JSON.stringify({ id, trackViewCount: true }),
    signal,
  });
}

/**
 * 拉取看板的历史配置版本列表。
 *
 * @param {number} dashboardId - 看板 id。
 * @param {AbortSignal} [signal] - 中止信号，用于取消进行中的请求。
 * @returns {Promise<DashboardConfigHistoryItem[]>} 该看板的历史配置版本列表。
 * @throws {DmsApiError} 网络失败或 DMS 返回非 200 业务码时抛出。
 */
export function fetchDashboardConfigHistory(dashboardId: number, signal?: AbortSignal) {
  return dmsRequest<DashboardConfigHistoryItem[]>('/api/dashboard/config/history', {
    method: 'POST',
    body: JSON.stringify({ dashboardId }),
    signal,
  });
}

/**
 * 查询看板中单个组件绑定分析的数据；请求负载经 SM2 加密后以 encryptedPayload 字段提交。
 *
 * @param {number} dashboardId - 看板 id。
 * @param {number} analysisId - 组件关联的分析 id。
 * @param {number} configId - 组件关联分析当前生效的图表配置版本 id。
 * @param {AbortSignal} [signal] - 中止信号，用于取消进行中的请求。
 * @returns {Promise<DashboardWidgetDataResponse>} 该组件的行数据 rows 与查询耗时
 *   queryElapsedMs。
 * @throws {DmsApiError} 网络失败或 DMS 返回非 200 业务码时抛出。
 */
export function fetchDashboardWidgetData(
  dashboardId: number,
  analysisId: number,
  configId: number,
  signal?: AbortSignal,
) {
  const payload = { dashboardId, analysisId, configId };
  return dmsRequest<DashboardWidgetDataResponse>('/api/dashboard/analysis/data/query', {
    method: 'POST',
    body: JSON.stringify({ encryptedPayload: encryptSm2Payload(getDmsSm2PublicKey(), payload) }),
    signal,
  });
}

/**
 * 开启或关闭看板的分享链接（对应详情的 shareEnabled 开关）。
 *
 * @param {number} id - 看板 id。
 * @param {boolean} enabled - true 开启分享，false 关闭分享。
 * @param {AbortSignal} [signal] - 中止信号，用于取消进行中的请求。
 * @returns {Promise<null>} 操作成功即 resolve，业务数据恒为 null。
 * @throws {DmsApiError} 网络失败或 DMS 返回非 200 业务码时抛出。
 */
export function updateDashboardShare(id: number, enabled: boolean, signal?: AbortSignal) {
  return dmsRequest<null>('/api/dashboard/share/update', {
    method: 'POST',
    body: JSON.stringify({ id, enabled }),
    signal,
  });
}

/**
 * 开启或关闭看板的公开访问（对应详情的 isPublic 开关）。
 *
 * @param {number} id - 看板 id。
 * @param {boolean} enabled - true 公开访问，false 仅非公开。
 * @param {AbortSignal} [signal] - 中止信号，用于取消进行中的请求。
 * @returns {Promise<null>} 操作成功即 resolve，业务数据恒为 null。
 * @throws {DmsApiError} 网络失败或 DMS 返回非 200 业务码时抛出。
 */
export function updateDashboardPublic(id: number, enabled: boolean, signal?: AbortSignal) {
  return dmsRequest<null>('/api/dashboard/public/update', {
    method: 'POST',
    body: JSON.stringify({ id, enabled }),
    signal,
  });
}

/**
 * 删除指定看板。
 *
 * @param {number} id - 看板 id。
 * @param {AbortSignal} [signal] - 中止信号，用于取消进行中的请求。
 * @returns {Promise<null>} 操作成功即 resolve，业务数据恒为 null。
 * @throws {DmsApiError} 网络失败或 DMS 返回非 200 业务码时抛出。
 */
export function deleteDashboard(id: number, signal?: AbortSignal) {
  return dmsRequest<null>('/api/dashboard/delete', {
    method: 'POST',
    body: JSON.stringify({ id }),
    signal,
  });
}
