import type { AnalysisChartConfig, AnalysisChartType } from '@/features/analysis/types';

/** 看板列表的合法排序字段。 */
export type DashboardListSortField = 'dashboardName' | 'createTime' | 'updateTime' | 'viewCount';

/** 列表排序方向：升序或降序。 */
export type DashboardListSortOrder = 'asc' | 'desc';

/** 看板列表查询参数：分页、关键词搜索与排序，均由服务端执行。 */
export type DashboardListRequest = {
  pageNum?: number;
  pageSize?: number;
  keyword?: string;
  sortField?: DashboardListSortField;
  sortOrder?: DashboardListSortOrder;
};

/**
 * 当前用户对看板的权限级别：none 无权限、view 可查看、edit 可编辑、manage 可管理。
 */
export type DashboardPermission = 'none' | 'view' | 'edit' | 'manage';

/** 看板列表项：看板的展示信息、组件数量与权限标记。 */
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
  /** 当前用户对看板的权限级别，可能缺省。 */
  dashboardPermission?: DashboardPermission;
};

/** 看板列表分页结果。 */
export type DashboardListResponse = {
  list: DashboardListItem[];
  total: number;
};

/** 看板网格布局配置；refreshInterval 为自动刷新间隔（秒），0 表示不自动刷新。 */
export type DashboardLayout = { columnCount: number; rowHeight: number; refreshInterval: number };
/** 看板中的组件：绑定一个分析并按网格坐标摆放。 */
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
  /** 组件关联的分析概要；为 null 时该组件无法加载数据。 */
  analysis: { id: number; analysisName: string; chartConfig: AnalysisChartConfig } | null;
};
/** 看板详情：在列表项基础上补充当前配置版本、布局与组件列表。 */
export type DashboardDetailResponse = DashboardListItem & {
  /** 当前生效的看板配置版本 id。 */
  currentConfigId: number;
  /** 是否开启分享：1 开启、0 关闭。 */
  shareEnabled: number;
  /** 是否公开访问：1 公开、0 非公开。 */
  isPublic: number;
  layoutConfig: DashboardLayout;
  widgets: DashboardWidget[];
};

/** 看板组件数据查询结果。 */
export type DashboardWidgetDataResponse = {
  rows: Record<string, string | number | boolean | null>[];
  /** 服务端查询耗时（毫秒）。 */
  queryElapsedMs: number;
};

/** 看板配置的历史版本条目。 */
export type DashboardConfigHistoryItem = {
  id: number;
  dashboardId: number;
  versionNo: number;
  widgetCount: number;
  createTime: string;
  createdBy: string;
  updateTime: string;
};
