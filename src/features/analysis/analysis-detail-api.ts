import { getDmsSm2PublicKey } from '@/features/auth/config';
import { dmsRequest } from '@/features/auth/api-client';
import { encryptSm2Payload } from '@/features/auth/sm2';

import type {
  AnalysisConfigHistoryItem,
  AnalysisDataQueryRequest,
  AnalysisDataQueryResponse,
  AnalysisDetailResponse,
  AnalysisUsageResponse,
} from './types';

export function fetchAnalysisDetail(analysisId: number, signal?: AbortSignal) {
  return dmsRequest<AnalysisDetailResponse>('/api/analysis/detail', {
    method: 'POST',
    body: JSON.stringify({ id: analysisId, trackViewCount: true }),
    signal,
  });
}

export function fetchAnalysisConfigHistory(analysisId: number, signal?: AbortSignal) {
  return dmsRequest<AnalysisConfigHistoryItem[]>('/api/analysis/config/history', {
    method: 'POST',
    body: JSON.stringify({ analysisId }),
    signal,
  });
}

export function fetchAnalysisUsage(analysisId: number, signal?: AbortSignal) {
  return dmsRequest<AnalysisUsageResponse>('/api/analysis/usage/detail', {
    method: 'POST',
    body: JSON.stringify({ id: analysisId }),
    signal,
  });
}

export function fetchAnalysisData(request: AnalysisDataQueryRequest, signal?: AbortSignal) {
  return dmsRequest<AnalysisDataQueryResponse>('/api/analysis/data/query', {
    method: 'POST',
    body: JSON.stringify({ encryptedPayload: encryptSm2Payload(getDmsSm2PublicKey(), request) }),
    signal,
  });
}
