import { dmsRequest } from '@/features/auth/api-client';

import type { DashboardListRequest, DashboardListResponse } from './types';

export function fetchDashboardList(
  request: DashboardListRequest,
  signal?: AbortSignal,
): Promise<DashboardListResponse> {
  return dmsRequest<DashboardListResponse>('/api/dashboard/list', {
    method: 'POST',
    body: JSON.stringify(request),
    signal,
  });
}
