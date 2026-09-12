import { DmsApiError } from '@/features/auth/api-client';
import {
  usePagedList,
  type PagedListRequest,
  type PagedListSort,
} from '@/features/common/use-paged-list';

import { fetchAnalysisList } from './analysis-api';
import type { AnalysisListItem, AnalysisListSortField, AnalysisListSortOrder } from './types';

const PAGE_SIZE = 12;

type UseAnalysisListOptions = {
  onUnauthorized?: (error: DmsApiError) => void | Promise<void>;
};

const ANALYSIS_INITIAL_SORT: PagedListSort = { field: 'updateTime', order: 'desc' };

function fetchAnalysisPage(request: PagedListRequest, signal?: AbortSignal) {
  return fetchAnalysisList(
    {
      pageNum: request.pageNum,
      pageSize: request.pageSize,
      keyword: request.keyword,
      sortField: request.sortField as AnalysisListSortField,
      sortOrder: request.sortOrder as AnalysisListSortOrder,
    },
    signal,
  );
}

export function useAnalysisList({ onUnauthorized }: UseAnalysisListOptions = {}) {
  const list = usePagedList<AnalysisListItem>(fetchAnalysisPage, {
    onUnauthorized,
    pageSize: PAGE_SIZE,
    initialSort: ANALYSIS_INITIAL_SORT,
    dedupeKey: (item) => item.id,
    errorLabel: '分析列表',
  });
  return { ...list, sort: list.sort ?? ANALYSIS_INITIAL_SORT };
}
