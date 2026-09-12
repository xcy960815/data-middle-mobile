import { useCallback, useEffect, useRef, useState } from 'react';

import { DmsApiError } from '@/features/auth/api-client';

export type PagedListRequest = {
  pageNum: number;
  pageSize: number;
  keyword?: string;
};

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 350;

type UsePagedListOptions = {
  onUnauthorized?: (error: DmsApiError) => void | Promise<void>;
};

/**
 * 跨 feature 的通用分页列表 hook：关键词防抖搜索 + 初始加载/刷新/加载更多与竞态取消。
 * fetchPage 必须传模块级函数保持引用稳定；服务端负责过滤与分页，响应只含 list 和 total。
 * fetchPage 必须传模块级函数保持引用稳定；日志接口由服务端处理过滤与分页，响应只含 list 和 total。
 */
export function usePagedList<T>(
  fetchPage: (
    request: PagedListRequest,
    signal?: AbortSignal,
  ) => Promise<{ list: T[]; total: number }>,
  { onUnauthorized }: UsePagedListOptions = {},
) {
  const [keyword, setKeyword] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const [items, setItems] = useState<T[]>([]);
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

  const handleUnauthorizedError = useCallback(async (error: unknown) => {
    if (error instanceof DmsApiError && (error.status === 401 || error.code === 401)) {
      await onUnauthorizedRef.current?.(error);
    }
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
    const nextKeyword = keyword.trim();
    const timer = setTimeout(() => {
      if (nextKeyword === debouncedKeyword) return;
      startInitialLoad();
      setDebouncedKeyword(nextKeyword);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [debouncedKeyword, keyword, startInitialLoad]);

  useEffect(() => {
    const controller = new AbortController();
    activeRequest.current?.abort();
    activeRequest.current = controller;
    const currentRequest = ++requestVersion.current;

    void fetchPage(
      { pageNum: 1, pageSize: PAGE_SIZE, keyword: debouncedKeyword },
      controller.signal,
    ).then(
      (response) => {
        if (controller.signal.aborted || currentRequest !== requestVersion.current) return;
        setItems(response.list);
        setTotal(response.total);
        setPageNum(1);
        setIsInitialLoading(false);
      },
      async (error: unknown) => {
        if (controller.signal.aborted || currentRequest !== requestVersion.current) return;
        setItems([]);
        setTotal(0);
        setIsInitialLoading(false);
        setInitialError(error instanceof Error ? error.message : '加载日志失败，请稍后重试。');
        await handleUnauthorizedError(error);
      },
    );

    return () => controller.abort();
  }, [debouncedKeyword, fetchPage, handleUnauthorizedError, reloadVersion]);

  const refresh = useCallback(async () => {
    const controller = new AbortController();
    activeRequest.current?.abort();
    activeRequest.current = controller;
    const currentRequest = ++requestVersion.current;

    setIsRefreshing(true);
    setRefreshError(null);
    setLoadMoreError(null);

    try {
      const response = await fetchPage(
        { pageNum: 1, pageSize: PAGE_SIZE, keyword: debouncedKeyword },
        controller.signal,
      );
      if (controller.signal.aborted || currentRequest !== requestVersion.current) return;
      setItems(response.list);
      setTotal(response.total);
      setPageNum(1);
    } catch (error) {
      if (controller.signal.aborted || currentRequest !== requestVersion.current) return;
      setRefreshError(error instanceof Error ? error.message : '刷新日志失败，请稍后重试。');
      await handleUnauthorizedError(error);
    } finally {
      setIsRefreshing(false);
    }
  }, [debouncedKeyword, fetchPage, handleUnauthorizedError]);

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
      const response = await fetchPage(
        { pageNum: pageNum + 1, pageSize: PAGE_SIZE, keyword: debouncedKeyword },
        controller.signal,
      );
      if (controller.signal.aborted || currentRequest !== requestVersion.current) return;
      setItems((currentItems) => [...currentItems, ...response.list]);
      setTotal(response.total);
      setPageNum(pageNum + 1);
    } catch (error) {
      if (controller.signal.aborted || currentRequest !== requestVersion.current) return;
      setLoadMoreError(error instanceof Error ? error.message : '加载更多日志失败，请稍后重试。');
      await handleUnauthorizedError(error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [
    debouncedKeyword,
    fetchPage,
    handleUnauthorizedError,
    hasMore,
    isInitialLoading,
    isLoadingMore,
    isRefreshing,
    pageNum,
  ]);

  const retryInitialLoad = useCallback(() => {
    startInitialLoad();
    setReloadVersion((version) => version + 1);
  }, [startInitialLoad]);

  return {
    items,
    total,
    keyword,
    setKeyword,
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
