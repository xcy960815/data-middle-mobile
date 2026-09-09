import { useCallback, useEffect, useRef, useState } from 'react';

import { DmsApiError } from '@/features/auth/api-client';

import {
  fetchAccessApplyList,
  fetchNotificationList,
  fetchUnreadNotificationCount,
  markNotificationsRead,
} from './notification-api';
import type { AccessApplyItem, NotificationItem } from './types';

const PAGE_SIZE = 20;

function isUnauthorizedError(error: unknown): error is DmsApiError {
  return error instanceof DmsApiError && (error.status === 401 || error.code === 401);
}

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

function appendUniqueNotifications(
  currentItems: readonly NotificationItem[],
  nextItems: readonly NotificationItem[],
): NotificationItem[] {
  const itemsById = new Map(currentItems.map((item) => [item.id, item]));
  nextItems.forEach((item) => itemsById.set(item.id, item));
  return Array.from(itemsById.values());
}

/**
 * 通知中心数据 hook：管理通知分页列表、未读数与我的权限申请记录。
 * 通知与申请数据由服务端按当前用户过滤，没有搜索与排序参数。
 */
export function useNotifications(onUnauthorized?: (error: DmsApiError) => void | Promise<void>) {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [total, setTotal] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [myApplies, setMyApplies] = useState<AccessApplyItem[]>([]);
  const [pageNum, setPageNum] = useState(1);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [initialError, setInitialError] = useState<string | null>(null);
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);
  const [reloadVersion, setReloadVersion] = useState(0);
  const activeRequest = useRef<AbortController | null>(null);
  const requestVersion = useRef(0);
  const onUnauthorizedRef = useRef(onUnauthorized);

  useEffect(() => {
    onUnauthorizedRef.current = onUnauthorized;
  }, [onUnauthorized]);

  const handleRequestError = useCallback(async (error: unknown) => {
    if (isUnauthorizedError(error)) {
      await onUnauthorizedRef.current?.(error);
    }
  }, []);

  const loadCountAndApplies = useCallback(async (signal?: AbortSignal) => {
    const [countResponse, applyResponse] = await Promise.all([
      fetchUnreadNotificationCount(signal),
      fetchAccessApplyList(signal),
    ]);
    setUnreadCount(countResponse.count);
    setMyApplies(applyResponse.mine);
  }, []);

  const startInitialLoad = useCallback(() => {
    setIsInitialLoading(true);
    setIsRefreshing(false);
    setIsLoadingMore(false);
    setInitialError(null);
    setRefreshError(null);
    setLoadMoreError(null);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    activeRequest.current?.abort();
    activeRequest.current = controller;
    const currentRequest = ++requestVersion.current;

    void (async () => {
      try {
        const [listResponse] = await Promise.all([
          fetchNotificationList(1, PAGE_SIZE, controller.signal),
          loadCountAndApplies(controller.signal).catch(() => undefined),
        ]);
        if (controller.signal.aborted || currentRequest !== requestVersion.current) return;
        setItems(listResponse.list);
        setTotal(listResponse.total);
        setPageNum(listResponse.pageNum);
        setIsInitialLoading(false);
      } catch (error) {
        if (controller.signal.aborted || currentRequest !== requestVersion.current) return;
        setItems([]);
        setTotal(0);
        setIsInitialLoading(false);
        setInitialError(getErrorMessage(error, '加载通知失败，请稍后重试。'));
        await handleRequestError(error);
      }
    })();

    return () => controller.abort();
  }, [handleRequestError, loadCountAndApplies, reloadVersion]);

  const refresh = useCallback(async () => {
    const controller = new AbortController();
    activeRequest.current?.abort();
    activeRequest.current = controller;
    const currentRequest = ++requestVersion.current;

    setIsRefreshing(true);
    setRefreshError(null);
    setLoadMoreError(null);

    try {
      const [listResponse] = await Promise.all([
        fetchNotificationList(1, PAGE_SIZE, controller.signal),
        loadCountAndApplies(controller.signal).catch(() => undefined),
      ]);
      if (controller.signal.aborted || currentRequest !== requestVersion.current) return;
      setItems(listResponse.list);
      setTotal(listResponse.total);
      setPageNum(listResponse.pageNum);
    } catch (error) {
      if (controller.signal.aborted || currentRequest !== requestVersion.current) return;
      setRefreshError(getErrorMessage(error, '刷新通知失败，请稍后重试。'));
      await handleRequestError(error);
    } finally {
      if (!controller.signal.aborted && currentRequest === requestVersion.current) {
        setIsRefreshing(false);
      }
    }
  }, [handleRequestError, loadCountAndApplies]);

  const hasMore = items.length < total;

  const loadMore = useCallback(async () => {
    if (isInitialLoading || isRefreshing || isLoadingMore || !hasMore) return;

    const controller = new AbortController();
    activeRequest.current?.abort();
    activeRequest.current = controller;
    const currentRequest = ++requestVersion.current;

    setIsLoadingMore(true);
    setLoadMoreError(null);

    try {
      const response = await fetchNotificationList(pageNum + 1, PAGE_SIZE, controller.signal);
      if (controller.signal.aborted || currentRequest !== requestVersion.current) return;
      setItems((currentItems) => appendUniqueNotifications(currentItems, response.list));
      setTotal(response.total);
      setPageNum(response.pageNum);
    } catch (error) {
      if (controller.signal.aborted || currentRequest !== requestVersion.current) return;
      setLoadMoreError(getErrorMessage(error, '加载更多通知失败，请稍后重试。'));
      await handleRequestError(error);
    } finally {
      if (!controller.signal.aborted && currentRequest === requestVersion.current) {
        setIsLoadingMore(false);
      }
    }
  }, [handleRequestError, hasMore, isInitialLoading, isLoadingMore, isRefreshing, pageNum]);

  /** 标记单条通知已读；失败时抛错由调用方提示。 */
  const markRead = useCallback(async (notificationId: number) => {
    await markNotificationsRead({ notificationIds: [notificationId] });
    setItems((currentItems) =>
      currentItems.map((item) => (item.id === notificationId ? { ...item, isRead: true } : item)),
    );
    setUnreadCount((count) => Math.max(0, count - 1));
  }, []);

  const retryInitialLoad = useCallback(() => {
    startInitialLoad();
    setReloadVersion((version) => version + 1);
  }, [startInitialLoad]);

  return {
    items,
    total,
    unreadCount,
    myApplies,
    isInitialLoading,
    isRefreshing,
    isLoadingMore,
    initialError,
    refreshError,
    loadMoreError,
    hasMore,
    refresh,
    loadMore,
    markRead,
    retryInitialLoad,
  };
}
