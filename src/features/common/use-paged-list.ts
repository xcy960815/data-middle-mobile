import { useCallback, useEffect, useRef, useState } from 'react';

import {
  DmsApiError,
  getDmsErrorMessage,
  isUnauthorizedDmsError,
  notifyUnauthorized,
} from '@/features/auth/api-client';

/**
 * 分页列表的请求参数：由 usePagedList 构造后传给 fetchPage，过滤、排序与分页均由服务端完成。
 */
export type PagedListRequest = {
  pageNum: number;
  pageSize: number;
  keyword?: string;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
};

/**
 * 列表排序状态：field 为服务端排序字段名，order 为排序方向。
 */
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
 *
 * 错误不会向调用方抛出，而是写入与操作阶段对应的独立错误槽位（initialError /
 * refreshError / loadMoreError）；会话失效（401）额外触发 onUnauthorized 回调。
 *
 * @param fetchPage - 取页函数；接收 PagedListRequest 与可选 AbortSignal，返回
 *   Promise<{ list: T[]; total: number }>。必须传模块级函数保持引用稳定。
 * @param {UsePagedListOptions<T>} options - 配置项，除 errorLabel 外均可省略。
 * @param [options.onUnauthorized] - 会话失效回调；初始加载、刷新或加载更多遇到 401 时
 *   接收对应的 DmsApiError，可异步。
 * @param {number} [options.pageSize=20] - 服务端页大小，默认 20。
 * @param [options.initialSort] - 初始排序；提供后 hook 持有排序状态并暴露 setSort，
 *   排序变化触发首页重载。
 * @param [options.dedupeKey] - 追加下一页时按此键去重，防止服务端翻页期间数据变化导致
 *   重复项；接收列表项，返回 string | number 键。
 * @param options.errorLabel - 错误兜底文案中的资源名（如 '日志'）；仅在抛出值不是 Error 时使用。
 * @param [options.loadExtras] - 初始加载与刷新时并行执行的附加加载（如通知未读数）；接收
 *   AbortSignal，需自行处理并吞掉自身错误，加载更多时不执行。
 * @returns {{
 *   items: T[];
 *   total: number;
 *   keyword: string;
 *   setKeyword: (keyword: string) => void;
 *   sort: PagedListSort | undefined;
 *   setSort: (nextSort: PagedListSort) => void;
 *   isInitialLoading: boolean;
 *   isRefreshing: boolean;
 *   isLoadingMore: boolean;
 *   initialError: string | null;
 *   refreshError: string | null;
 *   loadMoreError: string | null;
 *   hasMore: boolean;
 *   refresh: () => Promise<void>;
 *   loadMore: () => Promise<void>;
 *   retryInitialLoad: () => void;
 *   updateItems: (updater: (currentItems: T[]) => T[]) => void;
 * }} 列表状态与操作方法：items/total 为已聚合的列表数据与服务端总数；keyword/setKeyword
 *   为受控搜索词，输入经 350ms 防抖后触发首页重载；initialError、refreshError 与
 *   loadMoreError 是三个相互独立的错误槽位，分别对应初始加载、刷新与加载更多的失败文案；
 *   hasMore 表示是否还有下一页；refresh 重载首页，loadMore 追加下一页，retryInitialLoad
 *   在初始加载失败后重试，updateItems 允许本地修改 items 而不触发重新请求。
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
        if (isUnauthorizedDmsError(error))
          await notifyUnauthorized(onUnauthorizedRef.current, error);
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
      if (isUnauthorizedDmsError(error)) await notifyUnauthorized(onUnauthorizedRef.current, error);
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
      if (isUnauthorizedDmsError(error)) await notifyUnauthorized(onUnauthorizedRef.current, error);
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
