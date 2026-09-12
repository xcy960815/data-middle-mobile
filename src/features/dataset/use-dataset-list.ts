import { DmsApiError } from '@/features/auth/api-client';
import {
  usePagedList,
  type PagedListRequest,
  type PagedListSort,
} from '@/features/common/use-paged-list';

import { fetchDatasetList } from './dataset-api';
import type { DatasetListItem, DatasetListSortField, DatasetListSortOrder } from './types';

const PAGE_SIZE = 12;

type UseDatasetListOptions = {
  onUnauthorized?: (error: DmsApiError) => void | Promise<void>;
};

const DATASET_INITIAL_SORT: PagedListSort = { field: 'updateTime', order: 'desc' };

function fetchDatasetPage(request: PagedListRequest, signal?: AbortSignal) {
  return fetchDatasetList(
    {
      pageNum: request.pageNum,
      pageSize: request.pageSize,
      keyword: request.keyword,
      sortField: request.sortField as DatasetListSortField,
      sortOrder: request.sortOrder as DatasetListSortOrder,
    },
    signal,
  );
}

export function useDatasetList({ onUnauthorized }: UseDatasetListOptions = {}) {
  const list = usePagedList<DatasetListItem>(fetchDatasetPage, {
    onUnauthorized,
    pageSize: PAGE_SIZE,
    initialSort: DATASET_INITIAL_SORT,
    dedupeKey: (item) => item.id,
    errorLabel: '数据集',
  });
  return { ...list, sort: list.sort ?? DATASET_INITIAL_SORT };
}
