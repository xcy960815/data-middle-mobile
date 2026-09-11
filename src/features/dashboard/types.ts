import type { AnalysisChartConfig, AnalysisChartType } from '@/features/analysis/types';

export type DashboardListSortField = 'dashboardName' | 'createTime' | 'updateTime' | 'viewCount';

export type DashboardListSortOrder = 'asc' | 'desc';

export type DashboardListRequest = {
  pageNum?: number;
  pageSize?: number;
  keyword?: string;
  sortField?: DashboardListSortField;
  sortOrder?: DashboardListSortOrder;
};

export type DashboardPermission = 'none' | 'view' | 'edit' | 'manage';

export type DashboardListItem = {
  id: number;
  dashboardName: string;
  dashboardDesc: string;
  viewCount: number;
  createTime: string;
  updateTime: string;
  createdBy: string;
  updatedBy: string;
  widgetCount: number;
  dashboardPermission?: DashboardPermission;
};

export type DashboardListResponse = {
  list: DashboardListItem[];
  total: number;
};

export type DashboardLayout = { columnCount: number; rowHeight: number; refreshInterval: number };
export type DashboardWidget = {
  id: number;
  dashboardId: number;
  analysisId: number;
  widgetTitle: string;
  x: number;
  y: number;
  w: number;
  h: number;
  chartType: AnalysisChartType;
  analysis: { id: number; analysisName: string; chartConfig: AnalysisChartConfig } | null;
};
export type DashboardDetailResponse = DashboardListItem & {
  currentConfigId: number;
  shareEnabled: number;
  isPublic: number;
  layoutConfig: DashboardLayout;
  widgets: DashboardWidget[];
};

export type DashboardWidgetDataResponse = {
  rows: Record<string, string | number | boolean | null>[];
  queryElapsedMs: number;
};

export type DashboardConfigHistoryItem = {
  id: number;
  dashboardId: number;
  versionNo: number;
  widgetCount: number;
  createTime: string;
  createdBy: string;
  updateTime: string;
};
