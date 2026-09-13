import { getDmsSm2PublicKey } from '@/features/auth/config';
import { dmsRequest } from '@/features/auth/api-client';
import { encryptSm2Payload } from '@/features/auth/sm2';

import type {
  AnalysisConfigHistoryItem,
  AnalysisDataQueryRequest,
  AnalysisDataQueryResponse,
  AnalysisDetailResponse,
  AnalysisUsageResponse,
} from './types';

/**
 * 拉取分析详情，请求附带 trackViewCount: true 触发服务端浏览量统计。
 *
 * @param {number} analysisId - 分析 id。
 * @param {AbortSignal} [signal] - 中止信号，用于取消进行中的请求。
 * @returns {Promise<AnalysisDetailResponse>} 分析详情，含当前生效的图表配置 chartConfig。
 * @throws {DmsApiError} 网络失败或 DMS 返回非 200 业务码时抛出。
 */
export function fetchAnalysisDetail(analysisId: number, signal?: AbortSignal) {
  return dmsRequest<AnalysisDetailResponse>('/api/analysis/detail', {
    method: 'POST',
    body: JSON.stringify({ id: analysisId, trackViewCount: true }),
    signal,
  });
}

/**
 * 拉取分析的历史图表配置版本列表。
 *
 * @param {number} analysisId - 分析 id。
 * @param {AbortSignal} [signal] - 中止信号，用于取消进行中的请求。
 * @returns {Promise<AnalysisConfigHistoryItem[]>} 该分析的历史配置版本列表。
 * @throws {DmsApiError} 网络失败或 DMS 返回非 200 业务码时抛出。
 */
export function fetchAnalysisConfigHistory(analysisId: number, signal?: AbortSignal) {
  return dmsRequest<AnalysisConfigHistoryItem[]>('/api/analysis/config/history', {
    method: 'POST',
    body: JSON.stringify({ analysisId }),
    signal,
  });
}

/**
 * 拉取分析被看板、邮件任务与报警规则引用的情况，作为详情页的引用影响数据。
 *
 * @param {number} analysisId - 分析 id。
 * @param {AbortSignal} [signal] - 中止信号，用于取消进行中的请求。
 * @returns {Promise<AnalysisUsageResponse>} 引用计数汇总与各来源的引用明细。
 * @throws {DmsApiError} 网络失败或 DMS 返回非 200 业务码时抛出。
 */
export function fetchAnalysisUsage(analysisId: number, signal?: AbortSignal) {
  return dmsRequest<AnalysisUsageResponse>('/api/analysis/usage/detail', {
    method: 'POST',
    body: JSON.stringify({ id: analysisId }),
    signal,
  });
}

/**
 * 查询分析图表数据；请求负载经 SM2 加密后以 encryptedPayload 字段提交。
 *
 * @param {AnalysisDataQueryRequest} request - 图表查询负载（数据集、维度、度量、筛选与排序）。
 * @param {AbortSignal} [signal] - 中止信号，用于取消进行中的请求。
 * @returns {Promise<AnalysisDataQueryResponse>} 行数据 rows 与服务端查询耗时 queryElapsedMs。
 * @throws {DmsApiError} 网络失败或 DMS 返回非 200 业务码时抛出。
 */
export function fetchAnalysisData(request: AnalysisDataQueryRequest, signal?: AbortSignal) {
  return dmsRequest<AnalysisDataQueryResponse>('/api/analysis/data/query', {
    method: 'POST',
    body: JSON.stringify({ encryptedPayload: encryptSm2Payload(getDmsSm2PublicKey(), request) }),
    signal,
  });
}

/**
 * 修改分析名称。
 *
 * @param {number} id - 分析 id。
 * @param {string} analysisName - 新的分析名称。
 * @param {AbortSignal} [signal] - 中止信号，用于取消进行中的请求。
 * @returns {Promise<null>} 操作成功即 resolve，业务数据恒为 null。
 * @throws {DmsApiError} 网络失败或 DMS 返回非 200 业务码时抛出。
 */
export function updateAnalysisName(id: number, analysisName: string, signal?: AbortSignal) {
  return dmsRequest<null>('/api/analysis/update-name', {
    method: 'POST',
    body: JSON.stringify({ id, analysisName }),
    signal,
  });
}

/**
 * 修改分析描述。
 *
 * @param {number} id - 分析 id。
 * @param {string} analysisDesc - 新的分析描述。
 * @param {AbortSignal} [signal] - 中止信号，用于取消进行中的请求。
 * @returns {Promise<null>} 操作成功即 resolve，业务数据恒为 null。
 * @throws {DmsApiError} 网络失败或 DMS 返回非 200 业务码时抛出。
 */
export function updateAnalysisDesc(id: number, analysisDesc: string, signal?: AbortSignal) {
  return dmsRequest<null>('/api/analysis/update-desc', {
    method: 'POST',
    body: JSON.stringify({ id, analysisDesc }),
    signal,
  });
}

/**
 * 开启或关闭分析的分享链接（对应详情的 shareEnabled 开关）。
 *
 * @param {number} id - 分析 id。
 * @param {boolean} enabled - true 开启分享，false 关闭分享。
 * @param {AbortSignal} [signal] - 中止信号，用于取消进行中的请求。
 * @returns {Promise<null>} 操作成功即 resolve，业务数据恒为 null。
 * @throws {DmsApiError} 网络失败或 DMS 返回非 200 业务码时抛出。
 */
export function updateAnalysisShare(id: number, enabled: boolean, signal?: AbortSignal) {
  return dmsRequest<null>('/api/analysis/share/update', {
    method: 'POST',
    body: JSON.stringify({ id, enabled }),
    signal,
  });
}

/**
 * 开启或关闭分析的公开访问（对应详情的 isPublic 开关）。
 *
 * @param {number} id - 分析 id。
 * @param {boolean} enabled - true 公开访问，false 仅非公开。
 * @param {AbortSignal} [signal] - 中止信号，用于取消进行中的请求。
 * @returns {Promise<null>} 操作成功即 resolve，业务数据恒为 null。
 * @throws {DmsApiError} 网络失败或 DMS 返回非 200 业务码时抛出。
 */
export function updateAnalysisPublic(id: number, enabled: boolean, signal?: AbortSignal) {
  return dmsRequest<null>('/api/analysis/public/update', {
    method: 'POST',
    body: JSON.stringify({ id, enabled }),
    signal,
  });
}

/**
 * 删除指定分析。
 *
 * @param {number} id - 分析 id。
 * @param {AbortSignal} [signal] - 中止信号，用于取消进行中的请求。
 * @returns {Promise<null>} 操作成功即 resolve，业务数据恒为 null。
 * @throws {DmsApiError} 网络失败或 DMS 返回非 200 业务码时抛出。
 */
export function deleteAnalysis(id: number, signal?: AbortSignal) {
  return dmsRequest<null>('/api/analysis/delete', {
    method: 'POST',
    body: JSON.stringify({ id }),
    signal,
  });
}
