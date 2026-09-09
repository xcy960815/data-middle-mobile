import { useEffect, useState } from 'react';
import { DmsApiError } from '@/features/auth/api-client';
import { fetchDatasetDetail, fetchDatasetPreview } from './dataset-api';
import type { DatasetDetailResponse, DatasetPreviewResponse } from './types';
export function useDatasetDetail(
  id: number,
  onUnauthorized?: (error: DmsApiError) => void | Promise<void>,
) {
  const [detail, setDetail] = useState<DatasetDetailResponse | null>(null);
  const [preview, setPreview] = useState<DatasetPreviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const c = new AbortController();
    void Promise.all([fetchDatasetDetail(id, c.signal), fetchDatasetPreview(id, c.signal)])
      .then(
        ([d, p]) => {
          setDetail(d);
          setPreview(p);
        },
        async (e) => {
          if (!c.signal.aborted) setError(e instanceof Error ? e.message : '加载数据集详情失败。');
          if (e instanceof DmsApiError && (e.status === 401 || e.code === 401))
            await onUnauthorized?.(e);
        },
      )
      .finally(() => {
        if (!c.signal.aborted) setLoading(false);
      });
    return () => c.abort();
  }, [id, onUnauthorized]);
  return { detail, preview, loading, error };
}
