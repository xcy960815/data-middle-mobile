import { dmsRequest } from '@/features/auth/api-client';
import type {
  DatasetConfigHistoryItem,
  DatasetDetailResponse,
  DatasetListRequest,
  DatasetListResponse,
  DatasetPreviewResponse,
  DatasetUsageResponse,
} from './types';

/**
 * 拉取数据集分页列表。
 *
 * @param {DatasetListRequest} request - 分页、关键词与排序参数。
 * @param {AbortSignal} [signal] - 中止信号，用于取消进行中的请求。
 * @returns {Promise<DatasetListResponse>} 数据集列表分页结果，list 与 total 由服务端计算。
 * @throws {DmsApiError} 网络失败或 DMS 返回非 200 业务码时抛出。
 */
export function fetchDatasetList(request: DatasetListRequest, signal?: AbortSignal) {
  return dmsRequest<DatasetListResponse>('/api/dataset/list', {
    method: 'POST',
    body: JSON.stringify(request),
    signal,
  });
}

/**
 * 拉取数据集详情。请求固定携带 trackViewCount: true，本次查看会计入浏览次数。
 *
 * @param {number} id - 数据集 ID。
 * @param {AbortSignal} [signal] - 中止信号，用于取消进行中的请求。
 * @returns {Promise<DatasetDetailResponse>} 数据集详情，含当前配置 ID 与字段配置。
 * @throws {DmsApiError} 网络失败或 DMS 返回非 200 业务码时抛出。
 */
export function fetchDatasetDetail(id: number, signal?: AbortSignal) {
  return dmsRequest<DatasetDetailResponse>('/api/dataset/detail', {
    method: 'POST',
    body: JSON.stringify({ id, trackViewCount: true }),
    signal,
  });
}

/**
 * 按已保存配置预览数据集数据，服务端最多返回 100 行。
 *
 * @param {number} id - 数据集 ID。
 * @param {AbortSignal} [signal] - 中止信号，用于取消进行中的请求。
 * @returns {Promise<DatasetPreviewResponse>} 预览列配置与数据行。
 * @throws {DmsApiError} 网络失败或 DMS 返回非 200 业务码时抛出。
 */
export function fetchDatasetPreview(id: number, signal?: AbortSignal) {
  return dmsRequest<DatasetPreviewResponse>('/api/dataset/preview/saved', {
    method: 'POST',
    body: JSON.stringify({ id, limit: 100 }),
    signal,
  });
}

/**
 * 拉取数据集配置变更的历史版本列表。
 *
 * @param {number} id - 数据集 ID。
 * @param {AbortSignal} [signal] - 中止信号，用于取消进行中的请求。
 * @returns {Promise<DatasetConfigHistoryItem[]>} 配置历史版本列表，含版本号、查询 SQL 与操作人。
 * @throws {DmsApiError} 网络失败或 DMS 返回非 200 业务码时抛出。
 */
export function fetchDatasetConfigHistory(id: number, signal?: AbortSignal) {
  return dmsRequest<DatasetConfigHistoryItem[]>('/api/dataset/config/history', {
    method: 'POST',
    body: JSON.stringify({ id }),
    signal,
  });
}

/**
 * 拉取数据集的使用情况：分析、看板、邮件任务的引用计数与引用明细。
 *
 * @param {number} id - 数据集 ID。
 * @param {AbortSignal} [signal] - 中止信号，用于取消进行中的请求。
 * @returns {Promise<DatasetUsageResponse>} 使用汇总计数与各资源引用列表。
 * @throws {DmsApiError} 网络失败或 DMS 返回非 200 业务码时抛出。
 */
export function fetchDatasetUsage(id: number, signal?: AbortSignal) {
  return dmsRequest<DatasetUsageResponse>('/api/dataset/usage/detail', {
    method: 'POST',
    body: JSON.stringify({ id }),
    signal,
  });
}

/**
 * 更新数据集的公开状态。
 *
 * @param {number} id - 数据集 ID。
 * @param {boolean} enabled - 是否公开；true 公开，false 取消公开。
 * @param {AbortSignal} [signal] - 中止信号，用于取消进行中的请求。
 * @returns {Promise<null>} 成功时 data 为 null。
 * @throws {DmsApiError} 网络失败或 DMS 返回非 200 业务码时抛出。
 */
export function updateDatasetPublic(id: number, enabled: boolean, signal?: AbortSignal) {
  return dmsRequest<null>('/api/dataset/public/update', {
    method: 'POST',
    body: JSON.stringify({ id, enabled }),
    signal,
  });
}

/**
 * 删除数据集。
 *
 * @param {number} id - 数据集 ID。
 * @param {AbortSignal} [signal] - 中止信号，用于取消进行中的请求。
 * @returns {Promise<null>} 成功时 data 为 null。
 * @throws {DmsApiError} 网络失败或 DMS 返回非 200 业务码时抛出。
 */
export function deleteDataset(id: number, signal?: AbortSignal) {
  return dmsRequest<null>('/api/dataset/delete', {
    method: 'POST',
    body: JSON.stringify({ id }),
    signal,
  });
}
