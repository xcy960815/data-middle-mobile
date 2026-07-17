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

export type DmsAnalysisListItem = {
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

export type DmsAnalysisListResponse = {
  list: DmsAnalysisListItem[];
  total: number;
  pageNum: number;
  pageSize: number;
  keyword: string;
  sortField: AnalysisListSortField;
  sortOrder: AnalysisListSortOrder;
};
