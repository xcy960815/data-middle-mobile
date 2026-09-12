import { dmsRequest } from '@/features/auth/api-client';

import type { SnapshotResponse } from './types';

export function fetchMonitorSnapshot(signal?: AbortSignal) {
  return dmsRequest<SnapshotResponse>('/api/monitor/snapshot', { method: 'GET', signal });
}
