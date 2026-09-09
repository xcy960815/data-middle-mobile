import { dmsRequest } from '@/features/auth/api-client';
import type { DataSourceListRequest, DataSourceListResponse } from './types';

export function fetchDataSourceList(request: DataSourceListRequest, signal?: AbortSignal) {
  return dmsRequest<DataSourceListResponse>('/api/data-source/list', {
    method: 'POST',
    body: JSON.stringify(request),
    signal,
  });
}
