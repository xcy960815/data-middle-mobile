import { getDmsSm2PublicKey } from '@/features/auth/config';
import { dmsRequest } from '@/features/auth/api-client';
import { encryptSm2Payload } from '@/features/auth/sm2';

import type {
  CreateDataSourceRequest,
  DataSourceDetailResponse,
  DataSourceListRequest,
  DataSourceListResponse,
  TestDataSourceConnectionRequest,
  UpdateDataSourceRequest,
} from './types';

/**
 * 拉取数据源分页列表。
 *
 * @param {DataSourceListRequest} request - 分页、关键词与排序参数。
 * @param {AbortSignal} [signal] - 中止信号，用于取消进行中的请求。
 * @returns {Promise<DataSourceListResponse>} 数据源列表分页结果，list 与 total 由服务端计算。
 * @throws {DmsApiError} 网络失败或 DMS 返回非 200 业务码时抛出。
 */
export function fetchDataSourceList(request: DataSourceListRequest, signal?: AbortSignal) {
  return dmsRequest<DataSourceListResponse>('/api/data-source/list', {
    method: 'POST',
    body: JSON.stringify(request),
    signal,
  });
}

/**
 * 拉取数据源详情。
 *
 * @param {number} id - 数据源 ID。
 * @param {AbortSignal} [signal] - 中止信号，用于取消进行中的请求。
 * @returns {Promise<DataSourceDetailResponse>} 数据源详情，结构与列表项一致；
 *   托管（managed）模式下 host/port/username 为 null。
 * @throws {DmsApiError} 网络失败或 DMS 返回非 200 业务码时抛出。
 */
export function fetchDataSourceDetail(id: number, signal?: AbortSignal) {
  return dmsRequest<DataSourceDetailResponse>('/api/data-source/detail', {
    method: 'POST',
    body: JSON.stringify({ id }),
    signal,
  });
}

/**
 * 创建数据源。请求体经 SM2 加密后以 encryptedPayload 字段提交，避免连接信息明文传输。
 *
 * @param {CreateDataSourceRequest} request - 数据源配置；连接字段约束见
 *   DataSourceConnectionFields（托管模式不携带，自建模式需 host/port/username）。
 * @param {AbortSignal} [signal] - 中止信号，用于取消进行中的请求。
 * @returns {Promise<null>} 成功时 data 为 null。
 * @throws {DmsApiError} 网络失败或 DMS 返回非 200 业务码时抛出。
 */
export function createDataSource(request: CreateDataSourceRequest, signal?: AbortSignal) {
  return dmsRequest<null>('/api/data-source/create', {
    method: 'POST',
    body: JSON.stringify({ encryptedPayload: encryptSm2Payload(getDmsSm2PublicKey(), request) }),
    signal,
  });
}

/**
 * 更新数据源。请求体经 SM2 加密后以 encryptedPayload 字段提交，避免连接信息明文传输。
 *
 * @param {UpdateDataSourceRequest} request - 待更新的数据源配置，除 id 外字段均可选；
 *   连接字段约束见 DataSourceConnectionFields。
 * @param {AbortSignal} [signal] - 中止信号，用于取消进行中的请求。
 * @returns {Promise<null>} 成功时 data 为 null。
 * @throws {DmsApiError} 网络失败或 DMS 返回非 200 业务码时抛出。
 */
export function updateDataSource(request: UpdateDataSourceRequest, signal?: AbortSignal) {
  return dmsRequest<null>('/api/data-source/update', {
    method: 'POST',
    body: JSON.stringify({ encryptedPayload: encryptSm2Payload(getDmsSm2PublicKey(), request) }),
    signal,
  });
}

/**
 * 测试数据源连接是否可用。请求体经 SM2 加密后以 encryptedPayload 字段提交。
 *
 * @param {TestDataSourceConnectionRequest} request - 连接信息；编辑已有数据源时携带其 id。
 * @param {AbortSignal} [signal] - 中止信号，用于取消进行中的请求。
 * @returns {Promise<null>} 连接可用时 data 为 null。
 * @throws {DmsApiError} 网络失败或 DMS 返回非 200 业务码时抛出。
 */
export function testDataSourceConnection(
  request: TestDataSourceConnectionRequest,
  signal?: AbortSignal,
) {
  return dmsRequest<null>('/api/data-source/test-connection', {
    method: 'POST',
    body: JSON.stringify({ encryptedPayload: encryptSm2Payload(getDmsSm2PublicKey(), request) }),
    signal,
  });
}

/**
 * 删除数据源。
 *
 * @param {number} id - 数据源 ID。
 * @param {AbortSignal} [signal] - 中止信号，用于取消进行中的请求。
 * @returns {Promise<null>} 成功时 data 为 null。
 * @throws {DmsApiError} 网络失败或 DMS 返回非 200 业务码时抛出。
 */
export function deleteDataSource(id: number, signal?: AbortSignal) {
  return dmsRequest<null>('/api/data-source/delete', {
    method: 'POST',
    body: JSON.stringify({ id }),
    signal,
  });
}
