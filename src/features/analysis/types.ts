export type AnalysisListSortField = 'analysisName' | 'createTime' | 'updateTime' | 'viewCount';

export type AnalysisListSortOrder = 'asc' | 'desc';

export type AnalysisPermission = 'none' | 'view' | 'edit' | 'manage';

export type AnalysisChartType =
  | 'table'
  | 'line'
  | 'pie'
  | 'interval'
  | 'funnel'
  | 'scatter'
  | 'area'
  | 'stacked'
  | 'combo'
  | 'kpiCard';

export type AnalysisListRequest = {
  pageNum?: number;
  pageSize?: number;
  keyword?: string;
  sortField?: AnalysisListSortField;
  sortOrder?: AnalysisListSortOrder;
};

export type AnalysisListItem = {
  id: number;
  analysisName: string;
  analysisDesc: string;
  viewCount: number;
  createTime: string;
  updateTime: string;
  createdBy: string;
  updatedBy: string;
  analysisPermission?: AnalysisPermission;
  chartType?: AnalysisChartType | null;
};

export type AnalysisListResponse = {
  list: AnalysisListItem[];
  total: number;
};

export type AnalysisColumn = {
  columnName: string;
  columnType: string;
  columnComment: string;
  displayName: string;
  fieldRole?: 'dimension' | 'measure';
  isCustom?: boolean;
  expression?: string;
};

export type AnalysisDimension = AnalysisColumn & { dimensionRule: Record<string, unknown> };
export type AnalysisMeasure = AnalysisColumn & { measureRule: Record<string, unknown> };
export type AnalysisFilter = AnalysisColumn & { filterRule: Record<string, unknown> };
export type AnalysisOrder = AnalysisColumn & { orderRule: Record<string, unknown> };

export type AnalysisChartConfig = {
  id: number;
  analysisId: number;
  versionNo: number;
  datasetId: number | null;
  chartType: AnalysisChartType;
  dimensions: AnalysisDimension[];
  measures: AnalysisMeasure[];
  filters: AnalysisFilter[];
  orders: AnalysisOrder[];
  commonChartConfig: { limit: number; aiAnalysis: boolean; datasetName?: string };
  privateChartConfig: Record<string, unknown>;
  updateTime: string;
  createTime: string;
  createdBy: string;
  updatedBy: string;
};

export type AnalysisDetailResponse = AnalysisListItem & {
  currentConfigId: number;
  shareEnabled: number;
  isPublic: number;
  chartConfig: AnalysisChartConfig;
};

export type AnalysisDataQueryRequest = {
  analysisId: number;
  datasetId: number;
  dimensions: AnalysisDimension[];
  measures: AnalysisMeasure[];
  filters: AnalysisFilter[];
  orders: AnalysisOrder[];
  commonChartConfig: AnalysisChartConfig['commonChartConfig'];
};

export type AnalysisDataQueryResponse = {
  rows: Record<string, string | number | boolean | null>[];
  queryElapsedMs: number;
};

export type AnalysisConfigHistoryItem = {
  id: number;
  analysisId: number;
  versionNo: number;
  datasetId: number | null;
  chartType: AnalysisChartType | null;
  commonChartConfig: { limit: number; aiAnalysis: boolean; datasetName?: string };
  updateTime: string;
  createTime: string;
  createdBy: string;
  updatedBy: string;
};

export type AnalysisDashboardReference = {
  id: number;
  dashboardName: string;
  dashboardDesc: string | null;
  createdBy: string;
  updateTime: string;
  affectedWidgetCount: number;
};

export type AnalysisEmailTaskReference = {
  id: number;
  taskName: string;
  taskType: 'scheduled' | 'recurring';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  isDisabled: 0 | 1;
  createdBy: string;
  updatedTime: string;
};

export type AnalysisAlarmReference = {
  id: number;
  alarmName: string;
  isDisabled: 0 | 1;
  cronExpression: string;
  alarmStrategy: 'always' | 'once_per_day' | 'only_state_change';
  createdBy: string;
  updateTime: string;
};

export type AnalysisUsageResponse = {
  usageSummary: { dashboardCount: number; emailTaskCount: number; alarmCount: number };
  usageReferences: {
    dashboards: AnalysisDashboardReference[];
    emailTasks: AnalysisEmailTaskReference[];
    alarms: AnalysisAlarmReference[];
  };
};
