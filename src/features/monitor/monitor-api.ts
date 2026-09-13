import { dmsRequest } from '@/features/auth/api-client';

import type { SnapshotResponse } from './types';

/**
 * 拉取宿主机监控只读快照，由服务端一次聚合宿主机与应用容器两组运行指标。
 *
 * @param {AbortSignal} [signal] - 中止信号，用于取消进行中的请求。
 * @returns {Promise<SnapshotResponse>} 监控快照，含数据源连接状态、快照元信息与分组指标。
 * @throws {DmsApiError} 网络失败或 DMS 返回非 200 业务码时抛出。
 */
export function fetchMonitorSnapshot(signal?: AbortSignal) {
  return dmsRequest<SnapshotResponse>('/api/monitor/snapshot', { method: 'GET', signal });
}
