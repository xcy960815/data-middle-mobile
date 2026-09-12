import { dmsRequest } from '@/features/auth/api-client';

import type {
  AlarmLogListResponse,
  EmailLogListResponse,
  EmailTaskItem,
  LoginLogListResponse,
  LogListRequest,
} from './types';

export function fetchAlarmLogList(request: LogListRequest, signal?: AbortSignal) {
  return dmsRequest<AlarmLogListResponse>('/api/log/alarm/list', {
    method: 'POST',
    body: JSON.stringify(request),
    signal,
  });
}

export function fetchEmailLogList(request: LogListRequest, signal?: AbortSignal) {
  return dmsRequest<EmailLogListResponse>('/api/log/email/list', {
    method: 'POST',
    body: JSON.stringify(request),
    signal,
  });
}

export function fetchLoginLogList(request: LogListRequest, signal?: AbortSignal) {
  return dmsRequest<LoginLogListResponse>('/api/log/login/list', {
    method: 'POST',
    body: JSON.stringify(request),
    signal,
  });
}

export function fetchEmailTasks(signal?: AbortSignal) {
  return dmsRequest<EmailTaskItem[]>('/api/email/task/list', { method: 'GET', signal });
}
