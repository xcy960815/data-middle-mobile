import { useCallback, useEffect, useRef, useState } from 'react';

import {
  DmsApiError,
  getDmsErrorMessage,
  isUnauthorizedDmsError,
  notifyUnauthorized,
} from '@/features/auth/api-client';

import { fetchDashboardDetail, fetchDashboardWidgetData } from './dashboard-detail-api';
import type { DashboardDetailResponse, DashboardWidgetDataResponse } from './types';

/**
 * 加载单个看板详情与其全部组件数据的 hook。
 *
 * 先请求看板详情（附带 trackViewCount 触发服务端浏览量统计），再并发加载每个组件绑定
 * 分析的数据；单个组件失败只记入 widgetErrors，不影响其他组件与整体状态。组件未关联
 * 分析或缺少图表配置 id 时跳过加载。layoutConfig.refreshInterval 大于 0 时，按该秒数
 * 定时静默刷新全部组件数据（不重载详情、不改变 isLoading）。dashboardId 变化、组件
 * 卸载或调用 reload 时，会中止进行中的请求并重新加载。
 *
 * @param {number} dashboardId - 看板 id。
 * @param [onUnauthorized] - 会话失效回调，整体或组件级请求遇到 401（DmsApiError）时
 *   触发，可异步；通过 ref 持有，引用变化不会触发重新加载。
 * @returns {{
 *   detail: DashboardDetailResponse | null;
 *   widgetData: Record<number, DashboardWidgetDataResponse>;
 *   widgetErrors: Record<number, string>;
 *   isLoading: boolean;
 *   error: string | null;
 *   errorCode: number | null;
 *   reload: () => void;
 * }} 看板加载状态：detail 为看板详情；widgetData 与 widgetErrors 分别以 widget.id 为
 *   键保存组件加载成功的数据与失败的文案（成功后移除对应错误，失败后移除旧数据）；
 *   isLoading 为整体加载状态；error/errorCode 为整体失败的文案与 DMS 业务码（非
 *   DmsApiError 时为 null）；reload 触发整体重新加载。错误不会抛出，整体错误写入
 *   error/errorCode，组件级错误写入 widgetErrors；401 额外回调 onUnauthorized。
 */
export function useDashboardDetail(
  dashboardId: number,
  onUnauthorized?: (error: DmsApiError) => void | Promise<void>,
) {
  const [detail, setDetail] = useState<DashboardDetailResponse | null>(null);
  const [widgetData, setWidgetData] = useState<Record<number, DashboardWidgetDataResponse>>({});
  const [widgetErrors, setWidgetErrors] = useState<Record<number, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<number | null>(null);
  const [refreshVersion, setRefreshVersion] = useState(0);
  const onUnauthorizedRef = useRef(onUnauthorized);
  const autoRefreshController = useRef<AbortController | null>(null);

  useEffect(() => {
    onUnauthorizedRef.current = onUnauthorized;
  }, [onUnauthorized]);

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
              [widget.id]: getDmsErrorMessage(nextError, '该组件暂时无法加载。'),
            }));
            setWidgetData((current) => {
              if (!(widget.id in current)) return current;
              const next = { ...current };
              delete next[widget.id];
              return next;
            });
            if (isUnauthorizedDmsError(nextError))
              await notifyUnauthorized(onUnauthorizedRef.current, nextError);
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
      setErrorCode(null);
      setWidgetData({});
      setWidgetErrors({});
      try {
        const nextDetail = await fetchDashboardDetail(dashboardId, controller.signal);
        if (!active) return;
        setDetail(nextDetail);
        await loadWidgetData(nextDetail, controller.signal);
      } catch (nextError) {
        if (!active || controller.signal.aborted) return;
        setError(getDmsErrorMessage(nextError, '加载看板失败，请稍后重试。'));
        setErrorCode(nextError instanceof DmsApiError ? (nextError.code ?? null) : null);
        if (isUnauthorizedDmsError(nextError))
          await notifyUnauthorized(onUnauthorizedRef.current, nextError);
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
    errorCode,
    reload: () => setRefreshVersion((version) => version + 1),
  };
}
