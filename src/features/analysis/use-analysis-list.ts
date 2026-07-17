import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { DmsApiError } from '@/features/auth/api-client';

import { fetchAnalysisList } from './analysis-api';
import type { AnalysisListSortField, AnalysisListSortOrder, DmsAnalysisListItem } from './types';

const PAGE_SIZE = 12;
const SEARCH_DEBOUNCE_MS = 350;

type AnalysisSort = {
  field: AnalysisListSortField;
  order: AnalysisListSortOrder;
};

type UseAnalysisListOptions = {
  onUnauthorized?: (error: DmsApiError) => void | Promise<void>;
};

function isUnauthorizedError(error: unknown): error is DmsApiError {
  return error instanceof DmsApiError && (error.status === 401 || error.code === 401);
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : '加载分析列表失败，请稍后重试。';
}

function appendUniqueAnalyses(
  currentItems: readonly DmsAnalysisListItem[],
  nextItems: readonly DmsAnalysisListItem[],
): DmsAnalysisListItem[] {
  const itemsById = new Map(currentItems.map((item) => [item.id, item]));
  nextItems.forEach((item) => itemsById.set(item.id, item));
  return Array.from(itemsById.values());
}

export function useAnalysisList({ onUnauthorized }: UseAnalysisListOptions = {}) {
  const [keyword, setKeyword] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const [sort, setSort] = useState<AnalysisSort>({ field: 'updateTime', order: 'desc' });
  const [items, setItems] = useState<DmsAnalysisListItem[]>([]);
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

    void fetchAnalysisList(
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
      const response = await fetchAnalysisList(
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
      const response = await fetchAnalysisList(
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
      setItems((currentItems) => appendUniqueAnalyses(currentItems, response.list));
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
    (nextSort: AnalysisSort) => {
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

  return useMemo(
    () => ({
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
      updateSort,
    ],
  );
}
