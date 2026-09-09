import { dmsRequest } from '@/features/auth/api-client';
import type {
  DatasetDetailResponse,
  DatasetListRequest,
  DatasetListResponse,
  DatasetPreviewResponse,
} from './types';
export function fetchDatasetList(request: DatasetListRequest, signal?: AbortSignal) {
  return dmsRequest<DatasetListResponse>('/api/dataset/list', {
    method: 'POST',
    body: JSON.stringify(request),
    signal,
  });
}
export function fetchDatasetDetail(id: number, signal?: AbortSignal) {
  return dmsRequest<DatasetDetailResponse>('/api/dataset/detail', {
    method: 'POST',
    body: JSON.stringify({ id, trackViewCount: true }),
    signal,
  });
}
export function fetchDatasetPreview(id: number, signal?: AbortSignal) {
  return dmsRequest<DatasetPreviewResponse>('/api/dataset/preview/saved', {
    method: 'POST',
    body: JSON.stringify({ id, limit: 100 }),
    signal,
  });
}
