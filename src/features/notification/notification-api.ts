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

export function fetchNotificationList(pageNum: number, pageSize: number, signal?: AbortSignal) {
  const query = new URLSearchParams({ pageNum: String(pageNum), pageSize: String(pageSize) });
  return dmsRequest<NotificationListResponse>(`/api/notification/list?${query}`, {
    method: 'GET',
    signal,
  });
}

export function fetchUnreadNotificationCount(signal?: AbortSignal) {
  return dmsRequest<NotificationCountResponse>('/api/notification/count', {
    method: 'GET',
    signal,
  });
}

export function markNotificationsRead(request: NotificationReadRequest, signal?: AbortSignal) {
  return dmsRequest<null>('/api/notification/read', {
    method: 'POST',
    body: JSON.stringify(request),
    signal,
  });
}

export function fetchAccessApplyList(signal?: AbortSignal) {
  return dmsRequest<AccessApplyListResponse>('/api/permission/apply/list', {
    method: 'GET',
    signal,
  });
}

export function handleAccessApply(request: HandleAccessApplyRequest, signal?: AbortSignal) {
  return dmsRequest<null>('/api/permission/apply/handle', {
    method: 'POST',
    body: JSON.stringify(request),
    signal,
  });
}

export function createAccessApply(request: CreateAccessApplyRequest, signal?: AbortSignal) {
  return dmsRequest<AccessApplyStatusResponse>('/api/permission/apply/create', {
    method: 'POST',
    body: JSON.stringify(request),
    signal,
  });
}

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
