import { useEffect, useState } from 'react';

import type { AnalysisDataQueryResponse } from '@/features/analysis/types';
import type { DashboardDetailResponse } from '@/features/dashboard/types';
import {
  fetchShareDashboardDetail,
  fetchShareDashboardWidgetData,
} from '@/features/share/share-api';

/**
 * 免登录分享视图的看板详情 hook：详情成功后逐个查询仍允许分享的组件数据，
 * widget.analysis 为空的组件表示其分析未开放分享。匿名场景下 401 不跳转登录，仅展示错误。
 */
export function useShareDashboardDetail(dashboardId: number) {
  const [detail, setDetail] = useState<DashboardDetailResponse | null>(null);
  const [widgetData, setWidgetData] = useState<Record<number, AnalysisDataQueryResponse>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshVersion, setRefreshVersion] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const nextDetail = await fetchShareDashboardDetail(dashboardId, controller.signal);
        if (!active) return;
        setDetail(nextDetail);
        const entries = await Promise.all(
          nextDetail.widgets.map(async (widget) => {
            const configId = widget.analysis?.chartConfig.id;
            if (!configId) return [widget.id, null] as const;
            return [
              widget.id,
              await fetchShareDashboardWidgetData(
                dashboardId,
                widget.analysisId,
                configId,
                controller.signal,
              ),
            ] as const;
          }),
        );
        if (active)
          setWidgetData(
            Object.fromEntries(
              entries.filter(
                (entry): entry is [number, AnalysisDataQueryResponse] => entry[1] !== null,
              ),
            ),
          );
      } catch (nextError) {
        if (!active || controller.signal.aborted) return;
        setError(nextError instanceof Error ? nextError.message : '加载分享看板失败，请稍后重试。');
      } finally {
        if (active && !controller.signal.aborted) setIsLoading(false);
      }
    };
    void load();
    return () => {
      active = false;
      controller.abort();
    };
  }, [dashboardId, refreshVersion]);

  return {
    detail,
    widgetData,
    isLoading,
    error,
    reload: () => setRefreshVersion((version) => version + 1),
  };
}
