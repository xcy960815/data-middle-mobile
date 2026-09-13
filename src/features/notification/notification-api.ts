import { dmsRequest } from '@/features/auth/api-client';

import type {
  AccessApplyListResponse,
  AccessApplyStatusResponse,
  CreateAccessApplyRequest,
  HandleAccessApplyRequest,
  NotificationCountResponse,
  NotificationListResponse,
  NotificationReadRequest,
  NotificationResourceType,
} from './types';

/**
 * 分页拉取当前用户的通知列表；通知按当前用户过滤，无关键词与排序参数，分页由服务端完成。
 *
 * @param {number} pageNum - 页码，从 1 开始。
 * @param {number} pageSize - 每页条数。
 * @param {AbortSignal} [signal] - 中止信号，用于取消进行中的请求。
 * @returns {Promise<NotificationListResponse>} 当前页通知与总数。
 * @throws {DmsApiError} 网络失败或 DMS 返回非 200 业务码时抛出。
 */
export function fetchNotificationList(pageNum: number, pageSize: number, signal?: AbortSignal) {
  const query = new URLSearchParams({ pageNum: String(pageNum), pageSize: String(pageSize) });
  return dmsRequest<NotificationListResponse>(`/api/notification/list?${query}`, {
    method: 'GET',
    signal,
  });
}

/**
 * 查询当前用户的未读通知数。
 *
 * @param {AbortSignal} [signal] - 中止信号，用于取消进行中的请求。
 * @returns {Promise<NotificationCountResponse>} 未读通知数。
 * @throws {DmsApiError} 网络失败或 DMS 返回非 200 业务码时抛出。
 */
export function fetchUnreadNotificationCount(signal?: AbortSignal) {
  return dmsRequest<NotificationCountResponse>('/api/notification/count', {
    method: 'GET',
    signal,
  });
}

/**
 * 批量标记通知为已读。
 *
 * @param {NotificationReadRequest} request - 待标记的通知 id 列表。
 * @param {AbortSignal} [signal] - 中止信号，用于取消进行中的请求。
 * @returns {Promise<null>} 业务数据为 null，成功与否以是否抛错判断。
 * @throws {DmsApiError} 网络失败或 DMS 返回非 200 业务码时抛出。
 */
export function markNotificationsRead(request: NotificationReadRequest, signal?: AbortSignal) {
  return dmsRequest<null>('/api/notification/read', {
    method: 'POST',
    body: JSON.stringify(request),
    signal,
  });
}

/**
 * 拉取权限申请记录，服务端分为两组：pending 待当前用户审批、mine 当前用户发起的申请。
 *
 * @param {AbortSignal} [signal] - 中止信号，用于取消进行中的请求。
 * @returns {Promise<AccessApplyListResponse>} pending 与 mine 两组申请记录。
 * @throws {DmsApiError} 网络失败或 DMS 返回非 200 业务码时抛出。
 */
export function fetchAccessApplyList(signal?: AbortSignal) {
  return dmsRequest<AccessApplyListResponse>('/api/permission/apply/list', {
    method: 'GET',
    signal,
  });
}

/**
 * 审批一条权限申请。
 *
 * @param {HandleAccessApplyRequest} request - 申请 id 与审批结论。
 * @param {AbortSignal} [signal] - 中止信号，用于取消进行中的请求。
 * @returns {Promise<null>} 业务数据为 null，成功与否以是否抛错判断。
 * @throws {DmsApiError} 网络失败或 DMS 返回非 200 业务码时抛出。
 */
export function handleAccessApply(request: HandleAccessApplyRequest, signal?: AbortSignal) {
  return dmsRequest<null>('/api/permission/apply/handle', {
    method: 'POST',
    body: JSON.stringify(request),
    signal,
  });
}

/**
 * 提交资源访问权限申请，返回提交后该资源的最新申请状态。
 *
 * @param {CreateAccessApplyRequest} request - 目标资源与申请理由。
 * @param {AbortSignal} [signal] - 中止信号，用于取消进行中的请求。
 * @returns {Promise<AccessApplyStatusResponse>} 提交后该资源的最新申请状态。
 * @throws {DmsApiError} 网络失败或 DMS 返回非 200 业务码时抛出。
 */
export function createAccessApply(request: CreateAccessApplyRequest, signal?: AbortSignal) {
  return dmsRequest<AccessApplyStatusResponse>('/api/permission/apply/create', {
    method: 'POST',
    body: JSON.stringify(request),
    signal,
  });
}

/**
 * 查询某资源对当前用户的申请状态；从未申请过时 status 为 'none'，其余取值见 AccessApplyStatus。
 *
 * @param {NotificationResourceType} resourceType - 资源类型。
 * @param {number} resourceId - 资源 id。
 * @param {AbortSignal} [signal] - 中止信号，用于取消进行中的请求。
 * @returns {Promise<AccessApplyStatusResponse>} 该资源的申请状态与申请、驳回理由。
 * @throws {DmsApiError} 网络失败或 DMS 返回非 200 业务码时抛出。
 */
export function fetchAccessApplyStatus(
  resourceType: NotificationResourceType,
  resourceId: number,
  signal?: AbortSignal,
) {
  const query = new URLSearchParams({ resourceType, resourceId: String(resourceId) });
  return dmsRequest<AccessApplyStatusResponse>(`/api/permission/apply/status?${query}`, {
    method: 'GET',
    signal,
  });
}
