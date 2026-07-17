import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { DmsApiError } from '@/features/auth/api-client';

import { fetchDashboardList } from './dashboard-api';
import type { DashboardListItem, DashboardListSortField, DashboardListSortOrder } from './types';

const PAGE_SIZE = 12;
const SEARCH_DEBOUNCE_MS = 350;

export type DashboardSort = {
  field: DashboardListSortField;
  order: DashboardListSortOrder;
};

type UseDashboardListOptions = {
  onUnauthorized?: (error: DmsApiError) => void | Promise<void>;
};

function isUnauthorizedError(error: unknown): error is DmsApiError {
  return error instanceof DmsApiError && (error.status === 401 || error.code === 401);
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : '加载看板列表失败，请稍后重试。';
}

function appendUniqueDashboards(
  currentItems: readonly DashboardListItem[],
  nextItems: readonly DashboardListItem[],
): DashboardListItem[] {
  const itemsById = new Map(currentItems.map((item) => [item.id, item]));
  nextItems.forEach((item) => itemsById.set(item.id, item));
  return Array.from(itemsById.values());
}

export function useDashboardList({ onUnauthorized }: UseDashboardListOptions = {}) {
  const [keyword, setKeyword] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const [sort, setSort] = useState<DashboardSort>({ field: 'updateTime', order: 'desc' });
  const [items, setItems] = useState<DashboardListItem[]>([]);
  const [total, setTotal] = useState(0);
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
  const hasSuccessfulResponse = useRef(false);

  useEffect(() => {
    activeRequest.current?.abort();
    const timer = setTimeout(() => setDebouncedKeyword(keyword.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [keyword]);

  const handleRequestError = useCallback(
    async (error: unknown) => {
      if (isUnauthorizedError(error)) {
        await onUnauthorized?.(error);
      }
    },
    [onUnauthorized],
  );

  useEffect(() => {
    const controller = new AbortController();
    activeRequest.current?.abort();
    activeRequest.current = controller;
    const currentRequest = ++requestVersion.current;

    setIsInitialLoading(true);
    setIsRefreshing(false);
    setIsLoadingMore(false);
    setInitialError(null);
    setRefreshError(null);
    setLoadMoreError(null);

    void fetchDashboardList(
      {
        pageNum: 1,
        pageSize: PAGE_SIZE,
        keyword: debouncedKeyword,
        sortField: sort.field,
        sortOrder: sort.order,
      },
      controller.signal,
    ).then(
      (response) => {
        if (controller.signal.aborted || currentRequest !== requestVersion.current) return;
        setItems(response.list);
        setTotal(response.total);
        setPageNum(response.pageNum);
        hasSuccessfulResponse.current = true;
        setIsInitialLoading(false);
      },
      async (error: unknown) => {
        if (controller.signal.aborted || currentRequest !== requestVersion.current) return;
        if (!hasSuccessfulResponse.current) {
          setItems([]);
          setTotal(0);
        }
        setIsInitialLoading(false);
        setInitialError(getErrorMessage(error));
        await handleRequestError(error);
      },
    );

    return () => controller.abort();
  }, [debouncedKeyword, handleRequestError, reloadVersion, sort.field, sort.order]);

  const refresh = useCallback(async () => {
    const controller = new AbortController();
    activeRequest.current?.abort();
    activeRequest.current = controller;
    const currentRequest = ++requestVersion.current;

    setIsRefreshing(true);
    setRefreshError(null);
    setLoadMoreError(null);

    try {
      const response = await fetchDashboardList(
        {
          pageNum: 1,
          pageSize: PAGE_SIZE,
          keyword: debouncedKeyword,
          sortField: sort.field,
          sortOrder: sort.order,
        },
        controller.signal,
      );
      if (controller.signal.aborted || currentRequest !== requestVersion.current) return;
      setItems(response.list);
      setTotal(response.total);
      setPageNum(response.pageNum);
      hasSuccessfulResponse.current = true;
    } catch (error) {
      if (controller.signal.aborted || currentRequest !== requestVersion.current) return;
      setRefreshError(getErrorMessage(error));
      await handleRequestError(error);
    } finally {
      if (!controller.signal.aborted && currentRequest === requestVersion.current) {
        setIsRefreshing(false);
      }
    }
  }, [debouncedKeyword, handleRequestError, sort.field, sort.order]);

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
      const response = await fetchDashboardList(
        {
          pageNum: pageNum + 1,
          pageSize: PAGE_SIZE,
          keyword: debouncedKeyword,
          sortField: sort.field,
          sortOrder: sort.order,
        },
        controller.signal,
      );
      if (controller.signal.aborted || currentRequest !== requestVersion.current) return;
      setItems((currentItems) => appendUniqueDashboards(currentItems, response.list));
      setTotal(response.total);
      setPageNum(response.pageNum);
    } catch (error) {
      if (controller.signal.aborted || currentRequest !== requestVersion.current) return;
      setLoadMoreError(getErrorMessage(error));
      await handleRequestError(error);
    } finally {
      if (!controller.signal.aborted && currentRequest === requestVersion.current) {
        setIsLoadingMore(false);
      }
    }
  }, [
    debouncedKeyword,
    handleRequestError,
    hasMore,
    isInitialLoading,
    isLoadingMore,
    isRefreshing,
    pageNum,
    sort.field,
    sort.order,
  ]);

  const retryInitialLoad = useCallback(() => setReloadVersion((version) => version + 1), []);

  return useMemo(
    () => ({
      items,
      total,
      keyword,
      setKeyword,
      sort,
      setSort,
      isInitialLoading,
      isRefreshing,
      isLoadingMore,
      initialError,
      refreshError,
      loadMoreError,
      hasMore,
      refresh,
      loadMore,
      retryInitialLoad,
    }),
    [
      hasMore,
      initialError,
      isInitialLoading,
      isLoadingMore,
      isRefreshing,
      items,
      keyword,
      loadMore,
      loadMoreError,
      refresh,
      refreshError,
      retryInitialLoad,
      sort,
      total,
    ],
  );
}
