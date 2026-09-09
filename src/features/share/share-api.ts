import { getDmsSm2PublicKey } from '@/features/auth/config';
import { dmsRequest } from '@/features/auth/api-client';
import { encryptSm2Payload } from '@/features/auth/sm2';

import type { AnalysisDataQueryResponse, AnalysisDetailResponse } from '@/features/analysis/types';
import type { DashboardDetailResponse } from '@/features/dashboard/types';

export function fetchShareAnalysisDetail(analysisId: number, signal?: AbortSignal) {
  return dmsRequest<AnalysisDetailResponse>('/api/share/analysis/detail', {
    method: 'POST',
    body: JSON.stringify({ id: analysisId, trackViewCount: true }),
    signal,
  });
}

export function fetchShareAnalysisData(analysisId: number, configId: number, signal?: AbortSignal) {
  return dmsRequest<AnalysisDataQueryResponse>('/api/share/analysis/data/query', {
    method: 'POST',
    body: JSON.stringify({
      encryptedPayload: encryptSm2Payload(getDmsSm2PublicKey(), { analysisId, configId }),
    }),
    signal,
  });
}

export function fetchShareDashboardDetail(dashboardId: number, signal?: AbortSignal) {
  return dmsRequest<DashboardDetailResponse>('/api/share/dashboard/detail', {
    method: 'POST',
    body: JSON.stringify({ id: dashboardId, trackViewCount: true }),
    signal,
  });
}

export function fetchShareDashboardWidgetData(
  dashboardId: number,
  analysisId: number,
  configId: number,
  signal?: AbortSignal,
) {
  const payload = { dashboardId, analysisId, configId };
  return dmsRequest<AnalysisDataQueryResponse>('/api/share/dashboard/analysis/data/query', {
    method: 'POST',
    body: JSON.stringify({ encryptedPayload: encryptSm2Payload(getDmsSm2PublicKey(), payload) }),
    signal,
  });
}
