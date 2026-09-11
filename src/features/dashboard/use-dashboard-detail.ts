import { useCallback, useEffect, useRef, useState } from 'react';

import { DmsApiError } from '@/features/auth/api-client';

import { fetchDashboardDetail, fetchDashboardWidgetData } from './dashboard-detail-api';
import type { DashboardDetailResponse, DashboardWidgetDataResponse } from './types';

export function useDashboardDetail(
  dashboardId: number,
  onUnauthorized?: (error: DmsApiError) => void | Promise<void>,
) {
  const [detail, setDetail] = useState<DashboardDetailResponse | null>(null);
  const [widgetData, setWidgetData] = useState<Record<number, DashboardWidgetDataResponse>>({});
  const [widgetErrors, setWidgetErrors] = useState<Record<number, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshVersion, setRefreshVersion] = useState(0);
  const onUnauthorizedRef = useRef(onUnauthorized);
  const autoRefreshController = useRef<AbortController | null>(null);

  useEffect(() => {
    onUnauthorizedRef.current = onUnauthorized;
  }, [onUnauthorized]);

  const isUnauthorized = (e: unknown): e is DmsApiError =>
    e instanceof DmsApiError && (e.status === 401 || e.code === 401);

  const loadWidgetData = useCallback(
    async (nextDetail: DashboardDetailResponse, signal: AbortSignal) => {
      await Promise.all(
        nextDetail.widgets.map(async (widget) => {
          const configId = widget.analysis?.chartConfig.id;
          if (!configId) return;
          try {
            const nextData = await fetchDashboardWidgetData(
              dashboardId,
              widget.analysisId,
              configId,
              signal,
            );
            if (signal.aborted) return;
            setWidgetData((current) => ({ ...current, [widget.id]: nextData }));
            setWidgetErrors((current) => {
              if (!(widget.id in current)) return current;
              const next = { ...current };
              delete next[widget.id];
              return next;
            });
          } catch (nextError) {
            if (signal.aborted) return;
            setWidgetErrors((current) => ({
              ...current,
              [widget.id]: nextError instanceof Error ? nextError.message : '该组件暂时无法加载。',
            }));
            setWidgetData((current) => {
              if (!(widget.id in current)) return current;
              const next = { ...current };
              delete next[widget.id];
              return next;
            });
            if (isUnauthorized(nextError)) await onUnauthorizedRef.current?.(nextError);
          }
        }),
      );
    },
    [dashboardId],
  );

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    const load = async () => {
      setIsLoading(true);
      setError(null);
      setWidgetData({});
      setWidgetErrors({});
      try {
        const nextDetail = await fetchDashboardDetail(dashboardId, controller.signal);
        if (!active) return;
        setDetail(nextDetail);
        await loadWidgetData(nextDetail, controller.signal);
      } catch (nextError) {
        if (!active || controller.signal.aborted) return;
        setError(nextError instanceof Error ? nextError.message : '加载看板失败，请稍后重试。');
        if (isUnauthorized(nextError)) await onUnauthorizedRef.current?.(nextError);
      } finally {
        if (active && !controller.signal.aborted) setIsLoading(false);
      }
    };
    void load();
    return () => {
      active = false;
      controller.abort();
    };
  }, [dashboardId, loadWidgetData, refreshVersion]);

  const refreshInterval = detail?.layoutConfig.refreshInterval ?? 0;
  useEffect(() => {
    if (refreshInterval <= 0 || !detail) return;
    const timer = setInterval(() => {
      autoRefreshController.current?.abort();
      const controller = new AbortController();
      autoRefreshController.current = controller;
      void loadWidgetData(detail, controller.signal);
    }, refreshInterval * 1000);
    return () => {
      clearInterval(timer);
      autoRefreshController.current?.abort();
    };
  }, [detail, loadWidgetData, refreshInterval]);

  return {
    detail,
    widgetData,
    widgetErrors,
    isLoading,
    error,
    reload: () => setRefreshVersion((version) => version + 1),
  };
}
