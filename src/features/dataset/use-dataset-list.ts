import { useEffect, useState } from 'react';
import { DmsApiError } from '@/features/auth/api-client';
import { fetchDatasetList } from './dataset-api';
import type { DatasetListItem } from './types';
export function useDatasetList(onUnauthorized?: (error: DmsApiError) => void | Promise<void>) {
  const [items, setItems] = useState<DatasetListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const c = new AbortController();
    void fetchDatasetList(
      { pageNum: 1, pageSize: 50, sortField: 'updateTime', sortOrder: 'desc' },
      c.signal,
    )
      .then(
        (r) => setItems(r.list),
        async (e) => {
          if (!c.signal.aborted) setError(e instanceof Error ? e.message : '加载数据集失败。');
          if (e instanceof DmsApiError && (e.status === 401 || e.code === 401))
            await onUnauthorized?.(e);
        },
      )
      .finally(() => {
        if (!c.signal.aborted) setLoading(false);
      });
    return () => c.abort();
  }, [onUnauthorized]);
  return { items, loading, error };
}
