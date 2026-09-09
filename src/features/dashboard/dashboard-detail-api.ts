import { getDmsSm2PublicKey } from '@/features/auth/config';
import { dmsRequest } from '@/features/auth/api-client';
import { encryptSm2Payload } from '@/features/auth/sm2';

import type { DashboardDetailResponse, DashboardWidgetDataResponse } from './types';

export function fetchDashboardDetail(id: number, signal?: AbortSignal) {
  return dmsRequest<DashboardDetailResponse>('/api/dashboard/detail', {
    method: 'POST',
    body: JSON.stringify({ id, trackViewCount: true }),
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
