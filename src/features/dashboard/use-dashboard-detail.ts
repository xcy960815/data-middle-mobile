import { useEffect, useState } from 'react';

import { DmsApiError } from '@/features/auth/api-client';

import { fetchDashboardDetail, fetchDashboardWidgetData } from './dashboard-detail-api';
import type { DashboardDetailResponse, DashboardWidgetDataResponse } from './types';

export function useDashboardDetail(
  dashboardId: number,
  onUnauthorized?: (error: DmsApiError) => void | Promise<void>,
) {
  const [detail, setDetail] = useState<DashboardDetailResponse | null>(null);
  const [widgetData, setWidgetData] = useState<Record<number, DashboardWidgetDataResponse>>({});
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
        const nextDetail = await fetchDashboardDetail(dashboardId, controller.signal);
        if (!active) return;
        setDetail(nextDetail);
        const entries = await Promise.all(
          nextDetail.widgets.map(async (widget) => {
            const configId = widget.analysis?.chartConfig.id;
            if (!configId) return [widget.id, null] as const;
            return [
              widget.id,
              await fetchDashboardWidgetData(
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
                (entry): entry is [number, DashboardWidgetDataResponse] => entry[1] !== null,
              ),
            ),
          );
      } catch (nextError) {
        if (!active || controller.signal.aborted) return;
        setError(nextError instanceof Error ? nextError.message : '加载看板失败，请稍后重试。');
        if (
          nextError instanceof DmsApiError &&
          (nextError.status === 401 || nextError.code === 401)
        )
          await onUnauthorized?.(nextError);
      } finally {
        if (active && !controller.signal.aborted) setIsLoading(false);
      }
    };
    void load();
    return () => {
      active = false;
      controller.abort();
    };
  }, [dashboardId, onUnauthorized, refreshVersion]);

  return {
    detail,
    widgetData,
    isLoading,
    error,
    reload: () => setRefreshVersion((version) => version + 1),
  };
}
