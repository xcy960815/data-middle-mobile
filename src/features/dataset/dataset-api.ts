import { dmsRequest } from '@/features/auth/api-client';
import type {
  DatasetConfigHistoryItem,
  DatasetDetailResponse,
  DatasetListRequest,
  DatasetListResponse,
  DatasetPreviewResponse,
  DatasetUsageResponse,
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
export function fetchDatasetConfigHistory(id: number, signal?: AbortSignal) {
  return dmsRequest<DatasetConfigHistoryItem[]>('/api/dataset/config/history', {
    method: 'POST',
    body: JSON.stringify({ id }),
    signal,
  });
}
export function fetchDatasetUsage(id: number, signal?: AbortSignal) {
  return dmsRequest<DatasetUsageResponse>('/api/dataset/usage/detail', {
    method: 'POST',
    body: JSON.stringify({ id }),
    signal,
  });
}

export function updateDatasetPublic(id: number, enabled: boolean, signal?: AbortSignal) {
  return dmsRequest<null>('/api/dataset/public/update', {
    method: 'POST',
    body: JSON.stringify({ id, enabled }),
    signal,
  });
}

export function deleteDataset(id: number, signal?: AbortSignal) {
  return dmsRequest<null>('/api/dataset/delete', {
    method: 'POST',
    body: JSON.stringify({ id }),
    signal,
  });
}
