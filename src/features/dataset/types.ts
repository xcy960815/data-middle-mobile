export type DatasetListSortField = 'datasetName' | 'createTime' | 'updateTime' | 'viewCount';
export type DatasetListSortOrder = 'asc' | 'desc';
export type DatasetListRequest = {
  pageNum?: number;
  pageSize?: number;
  keyword?: string;
  sortField?: DatasetListSortField;
  sortOrder?: DatasetListSortOrder;
};
export type DatasetFieldConfigItem = {
  sourceColumnName: string;
  fieldName: string;
  displayName: string;
  fieldType: 'dimension' | 'measure';
  dataType: string;
  aggregationType?: string | null;
  expression?: string;
  visible: boolean;
  sortOrder: number;
};
export type DatasetListItem = {
  id: number;
  datasetName: string;
  datasetDesc: string;
  viewCount: number;
  isDisable: number;
  isPublic: number;
  createTime: string;
  updateTime: string;
  createdBy: string;
  updatedBy: string;
  dataSourceId: number;
  querySql: string;
  fieldCount: number;
  datasetPermission?: 'none' | 'view' | 'edit' | 'manage';
};
export type DatasetListResponse = {
  list: DatasetListItem[];
  total: number;
};
export type DatasetDetailResponse = Omit<DatasetListItem, 'fieldCount'> & {
  currentConfigId: number;
  fieldsConfig: DatasetFieldConfigItem[];
};
export type DatasetPreviewResponse = {
  columns: DatasetFieldConfigItem[];
  rows: Record<string, string | number | boolean | null>[];
  elapsedMs?: number;
};

export type DatasetConfigHistoryItem = {
  id: number;
  datasetId: number;
  versionNo: number;
  dataSourceId: number;
  querySql: string;
  createTime: string;
  createdBy: string;
  updateTime: string;
};

export type DatasetAnalysisReference = {
  id: number;
  analysisName: string;
  analysisDesc: string | null;
  chartType: string;
  createdBy: string;
  updateTime: string;
};

export type DatasetDashboardReference = {
  id: number;
  dashboardName: string;
  dashboardDesc: string | null;
  createdBy: string;
  updateTime: string;
  affectedAnalysisCount: number;
  affectedWidgetCount: number;
};

export type DatasetEmailTaskReference = {
  id: number;
  taskName: string;
  taskType: 'scheduled' | 'recurring';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  isDisabled: 0 | 1;
  createdBy: string;
  updatedTime: string;
  analysisId: number;
  analysisName: string;
};

export type DatasetUsageResponse = {
  usageSummary: {
    analysisCount: number;
    dashboardCount: number;
    emailTaskCount: number;
    emailTaskDetailsRestricted: boolean;
  };
  usageReferences: {
    analyses: DatasetAnalysisReference[];
    dashboards: DatasetDashboardReference[];
    emailTasks: DatasetEmailTaskReference[];
  };
};
