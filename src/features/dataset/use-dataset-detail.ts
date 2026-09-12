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

/**
 * 加载数据集详情与预览数据。
 *
 * 先加载详情，成功后再加载预览：详情失败则整体加载失败；预览失败仅降级预览区，
 * 不影响详情展示，错误单独通过 previewError 暴露。id 变化时自动重新加载。
 *
 * @param {number} id - 数据集 ID。
 * @param onUnauthorized - 会话失效回调，收到触发 401 的 DmsApiError；
 *   详情或预览返回 401 时触发，由调用方处理全局会话逻辑。
 * @returns {{
 *   detail: DatasetDetailResponse | null;
 *   preview: DatasetPreviewResponse | null;
 *   loading: boolean;
 *   error: string | null;
 *   errorCode: number | null;
 *   previewError: string | null;
 *   reload: () => void;
 * }} 详情与预览的加载状态：detail 加载中或失败时为 null；preview 未加载到或预览失败时为
 *   null（预览失败不影响 detail）；error/errorCode 为详情加载失败的文案与业务码；
 *   previewError 为预览降级错误文案；reload 重新加载。
 */
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
