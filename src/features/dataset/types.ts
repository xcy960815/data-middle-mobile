export type DatasetListSortField = 'datasetName' | 'createTime' | 'updateTime' | 'viewCount';
export type DatasetListSortOrder = 'asc' | 'desc';
export type DatasetListRequest = {
  pageNum?: number;
  pageSize?: number;
  keyword?: string;
  sortField?: DatasetListSortField;
  sortOrder?: DatasetListSortOrder;
};
export type DatasetField = {
  columnName: string;
  columnType: string;
  columnComment: string;
  displayName?: string;
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
  pageNum: number;
  pageSize: number;
  keyword: string;
  sortField: DatasetListSortField;
  sortOrder: DatasetListSortOrder;
};
export type DatasetDetailResponse = Omit<DatasetListItem, 'fieldCount'> & {
  currentConfigId: number;
  fieldsConfig: DatasetField[];
};
export type DatasetPreviewResponse = {
  columns: DatasetField[];
  rows: Record<string, string | number | boolean | null>[];
  elapsedMs?: number;
};
