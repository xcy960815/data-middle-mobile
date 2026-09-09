import { dmsRequest } from '@/features/auth/api-client';

import type { AnalysisListRequest, AnalysisListResponse } from './types';

export function fetchAnalysisList(
  params: AnalysisListRequest,
  signal?: AbortSignal,
): Promise<AnalysisListResponse> {
  return dmsRequest<AnalysisListResponse>('/api/analysis/list', {
    method: 'POST',
    body: JSON.stringify(params),
    signal,
  });
}
