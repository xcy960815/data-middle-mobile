import { useCallback, useEffect, useRef, useState } from 'react';

import {
  DmsApiError,
  getDmsErrorMessage,
  isUnauthorizedDmsError,
  notifyUnauthorized,
} from '@/features/auth/api-client';

import { fetchAnalysisData, fetchAnalysisDetail } from './analysis-detail-api';
import { resolveAnalysisDrillQueryFields } from './drill';
import type { AnalysisDataQueryResponse, AnalysisDetailResponse } from './types';

/**
 * 加载单个分析详情与图表数据的 hook。
 *
 * 先请求分析详情（附带 trackViewCount 触发服务端浏览量统计），再整理钻取维度与筛选
 * 条件后查询图表数据；分析未绑定数据集时按加载失败处理。analysisId 变化、组件卸载
 * 或调用 reload 时，会中止进行中的请求并重新加载。
 *
 * @param {number} analysisId - 分析 id。
 * @param [onUnauthorized] - 会话失效回调，请求遇到 401（DmsApiError）时触发，可异步；
 *   通过 ref 持有，引用变化不会触发重新加载。
 * @returns {{
 *   detail: AnalysisDetailResponse | null;
 *   data: AnalysisDataQueryResponse | null;
 *   isLoading: boolean;
 *   error: string | null;
 *   errorCode: number | null;
 *   reload: () => void;
 * }} 分析加载状态：detail 为分析详情；data 为图表行数据，仅在详情加载成功且已绑定
 *   数据集时更新；isLoading 为整体加载状态；error 为失败文案，errorCode 为失败对应的
 *   DMS 业务码（非 DmsApiError 时为 null）；reload 触发整体重新加载。错误不会抛出，
 *   通过 error/errorCode 暴露，401 额外回调 onUnauthorized。
 */
export function useAnalysisDetail(
  analysisId: number,
  onUnauthorized?: (error: DmsApiError) => void | Promise<void>,
) {
  const [detail, setDetail] = useState<AnalysisDetailResponse | null>(null);
  const [data, setData] = useState<AnalysisDataQueryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<number | null>(null);
  const [refreshVersion, setRefreshVersion] = useState(0);
  const onUnauthorizedRef = useRef(onUnauthorized);

  useEffect(() => {
    onUnauthorizedRef.current = onUnauthorized;
  }, [onUnauthorized]);

  const reload = useCallback(() => setRefreshVersion((version) => version + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    const load = async () => {
      setIsLoading(true);
      setError(null);
      setErrorCode(null);
      try {
        const nextDetail = await fetchAnalysisDetail(analysisId, controller.signal);
        if (!active) return;
        setDetail(nextDetail);
        if (nextDetail.chartConfig.datasetId == null) {
          throw new Error('该分析没有可用的数据集配置。');
        }
        const { dimensions, filters } = resolveAnalysisDrillQueryFields({
          dimensions: nextDetail.chartConfig.dimensions,
          filters: nextDetail.chartConfig.filters,
        });
        const nextData = await fetchAnalysisData(
          {
            analysisId,
            datasetId: nextDetail.chartConfig.datasetId,
            dimensions,
            measures: nextDetail.chartConfig.measures,
            filters,
            orders: nextDetail.chartConfig.orders.filter((item) => item.orderRule?.direction),
            commonChartConfig: nextDetail.chartConfig.commonChartConfig,
          },
          controller.signal,
        );
        if (active) setData(nextData);
      } catch (nextError) {
        if (!active || controller.signal.aborted) return;
        setError(getDmsErrorMessage(nextError, '加载分析图表失败，请稍后重试。'));
        setErrorCode(nextError instanceof DmsApiError ? (nextError.code ?? null) : null);
        if (isUnauthorizedDmsError(nextError)) {
          await notifyUnauthorized(onUnauthorizedRef.current, nextError);
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
  }, [analysisId, refreshVersion]);

  return { detail, data, isLoading, error, errorCode, reload };
}
