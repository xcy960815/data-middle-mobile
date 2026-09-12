import { getDmsSm2PublicKey } from '@/features/auth/config';
import { dmsRequest } from '@/features/auth/api-client';
import { encryptSm2Payload } from '@/features/auth/sm2';

import type {
  DashboardConfigHistoryItem,
  DashboardDetailResponse,
  DashboardWidgetDataResponse,
} from './types';

export function fetchDashboardDetail(id: number, signal?: AbortSignal) {
  return dmsRequest<DashboardDetailResponse>('/api/dashboard/detail', {
    method: 'POST',
    body: JSON.stringify({ id, trackViewCount: true }),
    signal,
  });
}

export function fetchDashboardConfigHistory(dashboardId: number, signal?: AbortSignal) {
  return dmsRequest<DashboardConfigHistoryItem[]>('/api/dashboard/config/history', {
    method: 'POST',
    body: JSON.stringify({ dashboardId }),
    signal,
  });
}

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

export function updateDashboardShare(id: number, enabled: boolean, signal?: AbortSignal) {
  return dmsRequest<null>('/api/dashboard/share/update', {
    method: 'POST',
    body: JSON.stringify({ id, enabled }),
    signal,
  });
}

export function updateDashboardPublic(id: number, enabled: boolean, signal?: AbortSignal) {
  return dmsRequest<null>('/api/dashboard/public/update', {
    method: 'POST',
    body: JSON.stringify({ id, enabled }),
    signal,
  });
}

export function deleteDashboard(id: number, signal?: AbortSignal) {
  return dmsRequest<null>('/api/dashboard/delete', {
    method: 'POST',
    body: JSON.stringify({ id }),
    signal,
  });
}
