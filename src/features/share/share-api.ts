import { getDmsApiUrl, getDmsSm2PublicKey } from '@/features/auth/config';
import { dmsRequest } from '@/features/auth/api-client';
import { encryptSm2Payload } from '@/features/auth/sm2';

import type { AnalysisDataQueryResponse, AnalysisDetailResponse } from '@/features/analysis/types';
import type { DashboardDetailResponse } from '@/features/dashboard/types';

/**
 * 分享链接指向 DMS 的 Web 端页面，从 API 地址推导同源 Web 入口。
 *
 * @param {'analysis' | 'dashboard'} resourceType - 资源类型。
 * @param {number} resourceId - 资源 id。
 * @returns {string} 形如 `{origin}/share/{resourceType}/{resourceId}` 的分享页地址，
 *   origin 取自 DMS API 地址。
 * @throws {AuthConfigurationError} API 地址未配置或非法时抛出（由 getDmsApiUrl 决定）。
 */
export function buildShareWebUrl(
  resourceType: 'analysis' | 'dashboard',
  resourceId: number,
): string {
  const origin = new URL(getDmsApiUrl()).origin;
  return `${origin}/share/${resourceType}/${resourceId}`;
}

/**
 * 拉取免登录分享视图的分析详情，并让服务端计入一次浏览量。
 *
 * @param {number} analysisId - 分析 id。
 * @param {AbortSignal} [signal] - 中止信号，用于取消进行中的请求。
 * @returns {Promise<AnalysisDetailResponse>} 分析详情，含当前配置版本 id 与图表配置。
 * @throws {DmsApiError} 网络失败或 DMS 返回非 200 业务码时抛出。
 */
export function fetchShareAnalysisDetail(analysisId: number, signal?: AbortSignal) {
  return dmsRequest<AnalysisDetailResponse>('/api/share/analysis/detail', {
    method: 'POST',
    body: JSON.stringify({ id: analysisId, trackViewCount: true }),
    signal,
  });
}

/**
 * 查询免登录分享视图的分析图表数据；请求体仅提交经 SM2 加密的 {analysisId, configId}，
 * 查询条件由服务端按该配置版本当前保存的内容决定。
 *
 * @param {number} analysisId - 分析 id。
 * @param {number} configId - 图表配置版本 id，通常取分享详情返回的 currentConfigId。
 * @param {AbortSignal} [signal] - 中止信号，用于取消进行中的请求。
 * @returns {Promise<AnalysisDataQueryResponse>} 图表行数据与服务端查询耗时。
 * @throws {DmsApiError} 网络失败或 DMS 返回非 200 业务码时抛出。
 */
export function fetchShareAnalysisData(analysisId: number, configId: number, signal?: AbortSignal) {
  return dmsRequest<AnalysisDataQueryResponse>('/api/share/analysis/data/query', {
    method: 'POST',
    body: JSON.stringify({
      encryptedPayload: encryptSm2Payload(getDmsSm2PublicKey(), { analysisId, configId }),
    }),
    signal,
  });
}

/**
 * 拉取免登录分享视图的看板详情，并让服务端计入一次浏览量。
 *
 * @param {number} dashboardId - 看板 id。
 * @param {AbortSignal} [signal] - 中止信号，用于取消进行中的请求。
 * @returns {Promise<DashboardDetailResponse>} 看板详情，含布局配置与组件列表。
 * @throws {DmsApiError} 网络失败或 DMS 返回非 200 业务码时抛出。
 */
export function fetchShareDashboardDetail(dashboardId: number, signal?: AbortSignal) {
  return dmsRequest<DashboardDetailResponse>('/api/share/dashboard/detail', {
    method: 'POST',
    body: JSON.stringify({ id: dashboardId, trackViewCount: true }),
    signal,
  });
}

/**
 * 查询免登录分享视图中单个看板组件所绑定分析的图表数据；负载经 SM2 加密后提交。
 *
 * @param {number} dashboardId - 看板 id。
 * @param {number} analysisId - 组件绑定的分析 id。
 * @param {number} configId - 该分析的图表配置版本 id。
 * @param {AbortSignal} [signal] - 中止信号，用于取消进行中的请求。
 * @returns {Promise<AnalysisDataQueryResponse>} 该组件的图表行数据与服务端查询耗时。
 * @throws {DmsApiError} 网络失败或 DMS 返回非 200 业务码时抛出。
 */
export function fetchShareDashboardWidgetData(
  dashboardId: number,
  analysisId: number,
  configId: number,
  signal?: AbortSignal,
) {
  const payload = { dashboardId, analysisId, configId };
  return dmsRequest<AnalysisDataQueryResponse>('/api/share/dashboard/analysis/data/query', {
    method: 'POST',
    body: JSON.stringify({ encryptedPayload: encryptSm2Payload(getDmsSm2PublicKey(), payload) }),
    signal,
  });
}
