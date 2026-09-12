import { DmsApiError } from '@/features/auth/api-client';
import {
  usePagedList,
  type PagedListRequest,
  type PagedListSort,
} from '@/features/common/use-paged-list';

import { fetchDataSourceList } from './data-source-api';
import type { DataSourceListItem, DataSourceSortField, DataSourceSortOrder } from './types';

const PAGE_SIZE = 12;

type UseDataSourceListOptions = {
  onUnauthorized?: (error: DmsApiError) => void | Promise<void>;
};

const DATA_SOURCE_INITIAL_SORT: PagedListSort = { field: 'updateTime', order: 'desc' };

function fetchDataSourcePage(request: PagedListRequest, signal?: AbortSignal) {
  return fetchDataSourceList(
    {
      pageNum: request.pageNum,
      pageSize: request.pageSize,
      keyword: request.keyword,
      sortField: request.sortField as DataSourceSortField,
      sortOrder: request.sortOrder as DataSourceSortOrder,
    },
    signal,
  );
}

/**
 * 数据源分页列表 hook：防抖关键词搜索、排序、刷新与加载更多。
 *
 * 基于 usePagedList 封装，固定每页 12 条，默认按 updateTime 降序排序；
 * 过滤、排序与分页均由服务端完成。
 *
 * @param {UseDataSourceListOptions} [options] - 可选配置。
 * @param [options.onUnauthorized] - 会话失效回调，收到触发 401 的 DmsApiError 时触发，
 *   由调用方处理全局会话逻辑。
 * @returns {ReturnType<typeof usePagedList<DataSourceListItem>> & { sort: PagedListSort }}
 *   分页列表状态与操作：items 已加载数据、total 总数、keyword/setKeyword 搜索关键词、
 *   sort/setSort 当前排序（sort 恒有值，未设置时回退为默认 updateTime 降序）、
 *   isInitialLoading/isRefreshing/isLoadingMore 三段加载状态、initialError/refreshError/
 *   loadMoreError 三段错误文案，以及 hasMore/refresh/loadMore/retryInitialLoad/updateItems
 *   操作。错误不抛出，按阶段写入对应 error 字段；401 会触发 onUnauthorized。
 */
export function useDataSourceList({ onUnauthorized }: UseDataSourceListOptions = {}) {
  const list = usePagedList<DataSourceListItem>(fetchDataSourcePage, {
    onUnauthorized,
    pageSize: PAGE_SIZE,
    initialSort: DATA_SOURCE_INITIAL_SORT,
    dedupeKey: (item) => item.id,
    errorLabel: '数据源',
  });
  return { ...list, sort: list.sort ?? DATA_SOURCE_INITIAL_SORT };
}
