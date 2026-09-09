import { useCallback, useEffect, useState } from 'react';

import { DmsApiError } from '@/features/auth/api-client';

import { fetchAnalysisData, fetchAnalysisDetail } from './analysis-detail-api';
import type { AnalysisDataQueryResponse, AnalysisDetailResponse } from './types';

export function useAnalysisDetail(
  analysisId: number,
  onUnauthorized?: (error: DmsApiError) => void | Promise<void>,
) {
  const [detail, setDetail] = useState<AnalysisDetailResponse | null>(null);
  const [data, setData] = useState<AnalysisDataQueryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshVersion, setRefreshVersion] = useState(0);

  const reload = useCallback(() => setRefreshVersion((version) => version + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const nextDetail = await fetchAnalysisDetail(analysisId, controller.signal);
        if (!active) return;
        setDetail(nextDetail);
        if (nextDetail.chartConfig.datasetId == null) {
          throw new Error('该分析没有可用的数据集配置。');
        }
        const nextData = await fetchAnalysisData(
          {
            analysisId,
            datasetId: nextDetail.chartConfig.datasetId,
            dimensions: nextDetail.chartConfig.dimensions,
            measures: nextDetail.chartConfig.measures,
            filters: nextDetail.chartConfig.filters,
            orders: nextDetail.chartConfig.orders,
            commonChartConfig: nextDetail.chartConfig.commonChartConfig,
          },
          controller.signal,
        );
        if (active) setData(nextData);
      } catch (nextError) {
        if (!active || controller.signal.aborted) return;
        setError(nextError instanceof Error ? nextError.message : '加载分析图表失败，请稍后重试。');
        if (
          nextError instanceof DmsApiError &&
          (nextError.status === 401 || nextError.code === 401)
        ) {
          await onUnauthorized?.(nextError);
        }
      } finally {
        if (active && !controller.signal.aborted) setIsLoading(false);
      }
    };

    void load();
    return () => {
      active = false;
      controller.abort();
    };
  }, [analysisId, onUnauthorized, refreshVersion]);

  return { detail, data, isLoading, error, reload };
}
