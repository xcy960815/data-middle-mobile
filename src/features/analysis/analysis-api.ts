import { dmsRequest } from '@/features/auth/api-client';

import type { AnalysisListRequest, DmsAnalysisListResponse } from './types';

export function fetchAnalysisList(
  params: AnalysisListRequest,
  signal?: AbortSignal,
): Promise<DmsAnalysisListResponse> {
  return dmsRequest<DmsAnalysisListResponse>('/api/analysis/list', {
    method: 'POST',
    body: JSON.stringify(params),
    signal,
  });
}
