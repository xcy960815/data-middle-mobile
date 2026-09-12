import { DmsApiError } from '@/features/auth/api-client';
import { useAsyncResource } from '@/features/common/use-async-resource';
import { fetchMonitorSnapshot } from './monitor-api';
import type { SnapshotResponse } from './types';

const loadSnapshot = (signal: AbortSignal) => fetchMonitorSnapshot(signal);

export function useMonitorSnapshot(onUnauthorized?: (error: DmsApiError) => void | Promise<void>) {
  const resource = useAsyncResource<SnapshotResponse>({
    load: loadSnapshot,
    fallbackErrorMessage: '加载监控快照失败。',
    onUnauthorized,
  });

  return {
    snapshot: resource.data,
    isLoading: resource.isLoading,
    error: resource.error,
    reload: resource.reload,
  };
}
