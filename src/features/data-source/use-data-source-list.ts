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
