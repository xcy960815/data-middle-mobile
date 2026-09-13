import { dmsRequest } from '@/features/auth/api-client';

import type { ActiveBroadcastResponse } from './types';

/**
 * 拉取当前可见的系统广播列表；可见性由服务端按投放状态与时间窗口判定。
 *
 * @param {AbortSignal} [signal] - 中止信号，用于取消进行中的请求。
 * @returns {Promise<ActiveBroadcastResponse>} 当前可见的广播列表。
 * @throws {DmsApiError} 网络失败或 DMS 返回非 200 业务码时抛出。
 */
export function fetchActiveBroadcasts(signal?: AbortSignal) {
  return dmsRequest<ActiveBroadcastResponse>('/api/system-broadcast/active', {
    method: 'GET',
    signal,
  });
}

/**
 * 关闭一条系统广播，之后服务端不再向当前用户返回该广播。
 *
 * @param {number} broadcastId - 广播 id。
 * @param {AbortSignal} [signal] - 中止信号，用于取消进行中的请求。
 * @returns {Promise<null>} 业务数据为 null，成功与否以是否抛错判断。
 * @throws {DmsApiError} 网络失败或 DMS 返回非 200 业务码时抛出。
 */
export function dismissBroadcast(broadcastId: number, signal?: AbortSignal) {
  return dmsRequest<null>('/api/system-broadcast/dismiss', {
    method: 'POST',
    body: JSON.stringify({ broadcastId }),
    signal,
  });
}
