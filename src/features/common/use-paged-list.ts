import { useCallback, useEffect, useRef, useState } from 'react';

import {
  DmsApiError,
  getDmsErrorMessage,
  isUnauthorizedDmsError,
} from '@/features/auth/api-client';

export type PagedListRequest = {
  pageNum: number;
  pageSize: number;
  keyword?: string;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
};

export type PagedListSort = {
  field: string;
  order: 'asc' | 'desc';
};

const DEFAULT_PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 350;

type UsePagedListOptions<T> = {
  onUnauthorized?: (error: DmsApiError) => void | Promise<void>;
  /** 服务端页大小，默认 20。 */
  pageSize?: number;
  /** 提供后 hook 持有排序状态并暴露 setSort；排序变化触发首页重载。 */
  initialSort?: PagedListSort;
  /** 追加下一页时按此键去重，防止服务端翻页期间数据变化导致重复项。 */
  dedupeKey?: (item: T) => string | number;
  /** 错误兜底文案中的资源名（如 '日志'）；仅在抛出值不是 Error 时使用。 */
  errorLabel: string;
  /** 初始加载与刷新时并行执行的附加加载（如通知未读数）；需自行处理并吞掉自身错误。 */
  loadExtras?: (signal: AbortSignal) => void | Promise<void>;
};

/**
 * 跨 feature 的通用分页列表 hook：关键词防抖搜索 + 可选排序 + 初始加载/刷新/加载更多与竞态取消。
 * fetchPage 必须传模块级函数保持引用稳定；服务端负责过滤、排序与分页，响应只含 list 和 total。
 */
export function usePagedList<T>(
  fetchPage: (
    request: PagedListRequest,
    signal?: AbortSignal,
  ) => Promise<{ list: T[]; total: number }>,
  {
    onUnauthorized,
    pageSize = DEFAULT_PAGE_SIZE,
    initialSort,
    dedupeKey,
    errorLabel,
    loadExtras,
  }: UsePagedListOptions<T>,
) {
  const [keyword, setKeyword] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const [sort, setSortState] = useState<PagedListSort | undefined>(initialSort);
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
  const loadExtrasRef = useRef(loadExtras);
  const dedupeKeyRef = useRef(dedupeKey);

  useEffect(() => {
    onUnauthorizedRef.current = onUnauthorized;
    loadExtrasRef.current = loadExtras;
    dedupeKeyRef.current = dedupeKey;
  });

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

  const buildRequest = useCallback(
    (nextPageNum: number): PagedListRequest => ({
      pageNum: nextPageNum,
      pageSize,
      keyword: debouncedKeyword,
      ...(sort ? { sortField: sort.field, sortOrder: sort.order } : {}),
    }),
    [debouncedKeyword, pageSize, sort],
  );

  useEffect(() => {
    const controller = new AbortController();
    activeRequest.current?.abort();
    activeRequest.current = controller;
    const currentRequest = ++requestVersion.current;

    void (async () => {
      try {
        const [response] = await Promise.all([
          fetchPage(buildRequest(1), controller.signal),
          loadExtrasRef.current?.(controller.signal),
        ]);
        if (controller.signal.aborted || currentRequest !== requestVersion.current) return;
        setItems(response.list);
        setTotal(response.total);
        setPageNum(1);
        setIsInitialLoading(false);
      } catch (error) {
        if (controller.signal.aborted || currentRequest !== requestVersion.current) return;
        setItems([]);
        setTotal(0);
        setIsInitialLoading(false);
        setInitialError(getDmsErrorMessage(error, `加载${errorLabel}失败，请稍后重试。`));
        if (isUnauthorizedDmsError(error)) await onUnauthorizedRef.current?.(error);
      }
    })();

    return () => controller.abort();
  }, [buildRequest, errorLabel, fetchPage, reloadVersion]);

  const refresh = useCallback(async () => {
    const controller = new AbortController();
    activeRequest.current?.abort();
    activeRequest.current = controller;
    const currentRequest = ++requestVersion.current;

    setIsRefreshing(true);
    setRefreshError(null);
    setLoadMoreError(null);

    try {
      const [response] = await Promise.all([
        fetchPage(buildRequest(1), controller.signal),
        loadExtrasRef.current?.(controller.signal),
      ]);
      if (controller.signal.aborted || currentRequest !== requestVersion.current) return;
      setItems(response.list);
      setTotal(response.total);
      setPageNum(1);
    } catch (error) {
      if (controller.signal.aborted || currentRequest !== requestVersion.current) return;
      setRefreshError(getDmsErrorMessage(error, `刷新${errorLabel}失败，请稍后重试。`));
      if (isUnauthorizedDmsError(error)) await onUnauthorizedRef.current?.(error);
    } finally {
      if (!controller.signal.aborted && currentRequest === requestVersion.current) {
        setIsRefreshing(false);
      }
    }
  }, [buildRequest, errorLabel, fetchPage]);

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
      const response = await fetchPage(buildRequest(pageNum + 1), controller.signal);
      if (controller.signal.aborted || currentRequest !== requestVersion.current) return;
      const getKey = dedupeKeyRef.current;
      setItems((currentItems) =>
        getKey
          ? mergeUniqueItems(currentItems, response.list, getKey)
          : [...currentItems, ...response.list],
      );
      setTotal(response.total);
      setPageNum(pageNum + 1);
    } catch (error) {
      if (controller.signal.aborted || currentRequest !== requestVersion.current) return;
      setLoadMoreError(getDmsErrorMessage(error, `加载更多${errorLabel}失败，请稍后重试。`));
      if (isUnauthorizedDmsError(error)) await onUnauthorizedRef.current?.(error);
    } finally {
      if (!controller.signal.aborted && currentRequest === requestVersion.current) {
        setIsLoadingMore(false);
      }
    }
  }, [
    buildRequest,
    errorLabel,
    fetchPage,
    hasMore,
    isInitialLoading,
    isLoadingMore,
    isRefreshing,
    pageNum,
  ]);

  const setSort = useCallback(
    (nextSort: PagedListSort) => {
      if (sort && sort.field === nextSort.field && sort.order === nextSort.order) return;
      startInitialLoad();
      setSortState(nextSort);
    },
    [sort, startInitialLoad],
  );

  const retryInitialLoad = useCallback(() => {
    startInitialLoad();
    setReloadVersion((version) => version + 1);
  }, [startInitialLoad]);

  const updateItems = useCallback((updater: (currentItems: T[]) => T[]) => setItems(updater), []);

  return {
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
    updateItems,
  };
}

function mergeUniqueItems<T>(
  currentItems: readonly T[],
  nextItems: readonly T[],
  getKey: (item: T) => string | number,
): T[] {
  const itemsByKey = new Map(currentItems.map((item) => [getKey(item), item]));
  nextItems.forEach((item) => itemsByKey.set(getKey(item), item));
  return Array.from(itemsByKey.values());
}
