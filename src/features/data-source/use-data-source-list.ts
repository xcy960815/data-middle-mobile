import { useCallback, useEffect, useRef, useState } from 'react';

import { DmsApiError } from '@/features/auth/api-client';

import { fetchDataSourceList } from './data-source-api';
import type { DataSourceListItem, DataSourceSortField, DataSourceSortOrder } from './types';

const PAGE_SIZE = 12;
const SEARCH_DEBOUNCE_MS = 350;

type DataSourceSort = {
  field: DataSourceSortField;
  order: DataSourceSortOrder;
};

type UseDataSourceListOptions = {
  onUnauthorized?: (error: DmsApiError) => void | Promise<void>;
};

function isUnauthorizedError(error: unknown): error is DmsApiError {
  return error instanceof DmsApiError && (error.status === 401 || error.code === 401);
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : '加载数据源失败，请稍后重试。';
}

function appendUniqueDataSources(
  currentItems: readonly DataSourceListItem[],
  nextItems: readonly DataSourceListItem[],
): DataSourceListItem[] {
  const itemsById = new Map(currentItems.map((item) => [item.id, item]));
  nextItems.forEach((item) => itemsById.set(item.id, item));
  return Array.from(itemsById.values());
}

export function useDataSourceList({ onUnauthorized }: UseDataSourceListOptions = {}) {
  const [keyword, setKeyword] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const [sort, setSort] = useState<DataSourceSort>({ field: 'updateTime', order: 'desc' });
  const [items, setItems] = useState<DataSourceListItem[]>([]);
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
  const onUnauthorizedRef = useRef(onUnauthorized);

  useEffect(() => {
    onUnauthorizedRef.current = onUnauthorized;
  }, [onUnauthorized]);

  const startInitialLoad = useCallback(() => {
    setIsInitialLoading(true);
    setIsRefreshing(false);
    setIsLoadingMore(false);
    setInitialError(null);
    setRefreshError(null);
    setLoadMoreError(null);
  }, []);

  useEffect(() => {
    const nextKeyword = keyword.trim();
    const timer = setTimeout(() => {
      if (nextKeyword === debouncedKeyword) return;
      startInitialLoad();
      setDebouncedKeyword(nextKeyword);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [debouncedKeyword, keyword, startInitialLoad]);

  const handleRequestError = useCallback(async (error: unknown) => {
    if (isUnauthorizedError(error)) {
      await onUnauthorizedRef.current?.(error);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    activeRequest.current?.abort();
    activeRequest.current = controller;
    const currentRequest = ++requestVersion.current;

    void fetchDataSourceList(
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
        setIsInitialLoading(false);
      },
      async (error: unknown) => {
        if (controller.signal.aborted || currentRequest !== requestVersion.current) return;
        setItems([]);
        setTotal(0);
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
      const response = await fetchDataSourceList(
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
      const response = await fetchDataSourceList(
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
      setItems((currentItems) => appendUniqueDataSources(currentItems, response.list));
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

  const updateSort = useCallback(
    (nextSort: DataSourceSort) => {
      if (nextSort.field === sort.field && nextSort.order === sort.order) return;
      startInitialLoad();
      setSort(nextSort);
    },
    [sort.field, sort.order, startInitialLoad],
  );

  const retryInitialLoad = useCallback(() => {
    startInitialLoad();
    setReloadVersion((version) => version + 1);
  }, [startInitialLoad]);

  return {
    items,
    total,
    keyword,
    setKeyword,
    sort,
    setSort: updateSort,
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
  };
}
