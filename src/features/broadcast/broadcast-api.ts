import { dmsRequest } from '@/features/auth/api-client';

import type { ActiveBroadcastResponse } from './types';

export function fetchActiveBroadcasts(signal?: AbortSignal) {
  return dmsRequest<ActiveBroadcastResponse>('/api/system-broadcast/active', {
    method: 'GET',
    signal,
  });
}

export function dismissBroadcast(broadcastId: number, signal?: AbortSignal) {
  return dmsRequest<null>('/api/system-broadcast/dismiss', {
    method: 'POST',
    body: JSON.stringify({ broadcastId }),
    signal,
  });
}
