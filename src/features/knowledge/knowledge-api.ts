import { dmsRequest } from '@/features/auth/api-client';

import type { KnowledgeBaseListResponse, KnowledgeDocumentListResponse } from './types';

export function fetchKnowledgeBaseList(
  request: { pageNum: number; pageSize: number; keyword?: string },
  signal?: AbortSignal,
) {
  return dmsRequest<KnowledgeBaseListResponse>('/api/knowledge/base/list', {
    method: 'POST',
    body: JSON.stringify(request),
    signal,
  });
}

export function fetchKnowledgeDocumentList(
  request: { knowledgeBaseId: number; pageNum: number; pageSize: number; keyword?: string },
  signal?: AbortSignal,
) {
  return dmsRequest<KnowledgeDocumentListResponse>('/api/knowledge/document/list', {
    method: 'POST',
    body: JSON.stringify(request),
    signal,
  });
}
