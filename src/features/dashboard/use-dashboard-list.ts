import { DmsApiError } from '@/features/auth/api-client';
import {
  usePagedList,
  type PagedListRequest,
  type PagedListSort,
} from '@/features/common/use-paged-list';

import { fetchDashboardList } from './dashboard-api';
import type { DashboardListItem, DashboardListSortField, DashboardListSortOrder } from './types';

const PAGE_SIZE = 12;

type UseDashboardListOptions = {
  onUnauthorized?: (error: DmsApiError) => void | Promise<void>;
};

const DASHBOARD_INITIAL_SORT: PagedListSort = { field: 'updateTime', order: 'desc' };

function fetchDashboardPage(request: PagedListRequest, signal?: AbortSignal) {
  return fetchDashboardList(
    {
      pageNum: request.pageNum,
      pageSize: request.pageSize,
      keyword: request.keyword,
      sortField: request.sortField as DashboardListSortField,
      sortOrder: request.sortOrder as DashboardListSortOrder,
    },
    signal,
  );
}

export function useDashboardList({ onUnauthorized }: UseDashboardListOptions = {}) {
  const list = usePagedList<DashboardListItem>(fetchDashboardPage, {
    onUnauthorized,
    pageSize: PAGE_SIZE,
    initialSort: DASHBOARD_INITIAL_SORT,
    dedupeKey: (item) => item.id,
    errorLabel: '看板列表',
  });
  return { ...list, sort: list.sort ?? DASHBOARD_INITIAL_SORT };
}
