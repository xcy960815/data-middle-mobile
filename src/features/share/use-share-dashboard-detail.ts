import { useCallback, useEffect, useRef, useState } from 'react';

import { getDmsErrorMessage } from '@/features/auth/api-client';

import type { AnalysisDataQueryResponse } from '@/features/analysis/types';
import type { DashboardDetailResponse } from '@/features/dashboard/types';
import {
  fetchShareDashboardDetail,
  fetchShareDashboardWidgetData,
} from '@/features/share/share-api';

/**
 * 免登录分享视图的看板详情 hook：详情成功后逐个查询仍允许分享的组件数据，
 * widget.analysis 为空的组件表示其分析未开放分享，单个组件查询失败只影响该组件。
 * 匿名场景下 401 不跳转登录，仅展示错误。
 *
 * 错误不向调用方抛出：看板详情失败归一为 error 文案，组件数据失败写入 widgetErrors；
 * layoutConfig.refreshInterval 大于 0 时按该秒数定时只重查组件数据，不影响详情。
 *
 * @param {number} dashboardId - 看板 id。
 * @returns {{
 *   detail: DashboardDetailResponse | null;
 *   widgetData: Record<number, AnalysisDataQueryResponse>;
 *   widgetErrors: Record<number, string>;
 *   isLoading: boolean;
 *   error: string | null;
 *   reload: () => void;
 * }} 分享看板状态：detail 为看板详情；widgetData 以组件 id 为键存放查询成功的组件数据；
 *   widgetErrors 以组件 id 为键存放单个组件的失败文案，重查成功后清除；isLoading 覆盖
 *   详情与首轮组件数据查询；error 为看板详情失败的归一错误文案（兜底“加载分享看板失败，
 *   请稍后重试。”）；reload 重新加载详情与全部组件数据。
 */
export function useShareDashboardDetail(dashboardId: number) {
  const [detail, setDetail] = useState<DashboardDetailResponse | null>(null);
  const [widgetData, setWidgetData] = useState<Record<number, AnalysisDataQueryResponse>>({});
  const [widgetErrors, setWidgetErrors] = useState<Record<number, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshVersion, setRefreshVersion] = useState(0);
  const autoRefreshController = useRef<AbortController | null>(null);

  const loadWidgetData = useCallback(
    async (nextDetail: DashboardDetailResponse, signal: AbortSignal) => {
      await Promise.all(
        nextDetail.widgets.map(async (widget) => {
          const configId = widget.analysis?.chartConfig.id;
          if (!configId) return;
          try {
            const nextData = await fetchShareDashboardWidgetData(
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
              [widget.id]: getDmsErrorMessage(nextError, '该组件暂时无法加载。'),
            }));
            setWidgetData((current) => {
              if (!(widget.id in current)) return current;
              const next = { ...current };
              delete next[widget.id];
              return next;
            });
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
        const nextDetail = await fetchShareDashboardDetail(dashboardId, controller.signal);
        if (!active) return;
        setDetail(nextDetail);
        await loadWidgetData(nextDetail, controller.signal);
      } catch (nextError) {
        if (!active || controller.signal.aborted) return;
        setError(getDmsErrorMessage(nextError, '加载分享看板失败，请稍后重试。'));
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
