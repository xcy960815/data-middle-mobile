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
  const [previewError, setPreviewError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    const isUnauthorized = (error: unknown): error is DmsApiError =>
      error instanceof DmsApiError && (error.status === 401 || error.code === 401);

    const load = async () => {
      setLoading(true);
      setError(null);
      setPreviewError(null);
      setPreview(null);
      try {
        const nextDetail = await fetchDatasetDetail(id, controller.signal);
        if (!active) return;
        setDetail(nextDetail);
      } catch (error) {
        if (!active || controller.signal.aborted) return;
        setError(error instanceof Error ? error.message : '加载数据集详情失败。');
        if (isUnauthorized(error)) await onUnauthorized?.(error);
        if (active && !controller.signal.aborted) setLoading(false);
        return;
      }

      try {
        const nextPreview = await fetchDatasetPreview(id, controller.signal);
        if (active) setPreview(nextPreview);
      } catch (error) {
        if (!active || controller.signal.aborted) return;
        setPreviewError(error instanceof Error ? error.message : '加载数据集预览失败。');
        if (isUnauthorized(error)) await onUnauthorized?.(error);
      } finally {
        if (active && !controller.signal.aborted) setLoading(false);
      }
    };

    void load();
    return () => {
      active = false;
      controller.abort();
    };
  }, [id, onUnauthorized]);

  return { detail, preview, loading, error, previewError };
}
