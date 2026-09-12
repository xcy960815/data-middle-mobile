import { getDmsSm2PublicKey } from '@/features/auth/config';
import { dmsRequest } from '@/features/auth/api-client';
import { encryptSm2Payload } from '@/features/auth/sm2';

import type {
  CreateDataSourceRequest,
  DataSourceDetailResponse,
  DataSourceListRequest,
  DataSourceListResponse,
  TestDataSourceConnectionRequest,
  UpdateDataSourceRequest,
} from './types';

export function fetchDataSourceList(request: DataSourceListRequest, signal?: AbortSignal) {
  return dmsRequest<DataSourceListResponse>('/api/data-source/list', {
    method: 'POST',
    body: JSON.stringify(request),
    signal,
  });
}

export function fetchDataSourceDetail(id: number, signal?: AbortSignal) {
  return dmsRequest<DataSourceDetailResponse>('/api/data-source/detail', {
    method: 'POST',
    body: JSON.stringify({ id }),
    signal,
  });
}

export function createDataSource(request: CreateDataSourceRequest, signal?: AbortSignal) {
  return dmsRequest<null>('/api/data-source/create', {
    method: 'POST',
    body: JSON.stringify({ encryptedPayload: encryptSm2Payload(getDmsSm2PublicKey(), request) }),
    signal,
  });
}

export function updateDataSource(request: UpdateDataSourceRequest, signal?: AbortSignal) {
  return dmsRequest<null>('/api/data-source/update', {
    method: 'POST',
    body: JSON.stringify({ encryptedPayload: encryptSm2Payload(getDmsSm2PublicKey(), request) }),
    signal,
  });
}

export function testDataSourceConnection(
  request: TestDataSourceConnectionRequest,
  signal?: AbortSignal,
) {
  return dmsRequest<null>('/api/data-source/test-connection', {
    method: 'POST',
    body: JSON.stringify({ encryptedPayload: encryptSm2Payload(getDmsSm2PublicKey(), request) }),
    signal,
  });
}

export function deleteDataSource(id: number, signal?: AbortSignal) {
  return dmsRequest<null>('/api/data-source/delete', {
    method: 'POST',
    body: JSON.stringify({ id }),
    signal,
  });
}
