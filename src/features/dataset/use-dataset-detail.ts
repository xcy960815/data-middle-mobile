import { useCallback } from 'react';

import { DmsApiError, getDmsErrorMessage } from '@/features/auth/api-client';
import {
  useAsyncResource,
  type AsyncResourcePartialError,
} from '@/features/common/use-async-resource';
import { fetchDatasetDetail, fetchDatasetPreview } from './dataset-api';
import type { DatasetDetailResponse, DatasetPreviewResponse } from './types';

type DatasetDetailResult = {
  detail: DatasetDetailResponse;
  preview: DatasetPreviewResponse | null;
  previewError: string | null;
  previewErrorCode: number | null;
};

export function useDatasetDetail(
  id: number,
  onUnauthorized?: (error: DmsApiError) => void | Promise<void>,
) {
  const load = useCallback(
    async (signal: AbortSignal): Promise<DatasetDetailResult> => {
      const detail = await fetchDatasetDetail(id, signal);
      try {
        const preview = await fetchDatasetPreview(id, signal);
        return { detail, preview, previewError: null, previewErrorCode: null };
      } catch (error) {
        // 预览失败不影响详情展示，仅预览区降级。
        return {
          detail,
          preview: null,
          previewError: getDmsErrorMessage(error, '加载数据集预览失败。'),
          previewErrorCode: error instanceof DmsApiError ? (error.code ?? null) : null,
        };
      }
    },
    [id],
  );

  const resource = useAsyncResource<DatasetDetailResult>({
    load,
    fallbackErrorMessage: '加载数据集详情失败。',
    pickError: (result): AsyncResourcePartialError | null => {
      if (!result.previewError) return null;
      // 仅 401 需要冒泡给全局会话处理；其余预览错误码不改变详情页的错误语义。
      return {
        message: result.previewError,
        code: result.previewErrorCode === 401 ? 401 : null,
      };
    },
    onUnauthorized,
  });

  return {
    detail: resource.data?.detail ?? null,
    preview: resource.data?.preview ?? null,
    loading: resource.isLoading,
    error: resource.error,
    errorCode: resource.errorCode,
    previewError: resource.data?.previewError ?? null,
    reload: resource.reload,
  };
}
