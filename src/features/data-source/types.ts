export type DataSourceSortField = 'sourceName' | 'createTime' | 'updateTime';
export type DataSourceSortOrder = 'asc' | 'desc';

export type DataSourceListItem = {
  id: number;
  sourceName: string;
  sourceDesc: string;
  sourceType: 'mysql' | 'postgresql';
  connectionMode: 'managed' | 'dedicated';
  runtimeSourceName: string;
  databaseName: string;
  host: string | null;
  port: number | null;
  username: string | null;
  isDisable: 0 | 1;
  createTime: string;
  updateTime: string;
  createdBy: string;
  updatedBy: string;
  dataSourcePermission?: 'none' | 'view' | 'edit' | 'manage';
};

export type DataSourceListRequest = {
  pageNum: number;
  pageSize: number;
  keyword?: string;
  sortField: DataSourceSortField;
  sortOrder: DataSourceSortOrder;
};

export type DataSourceListResponse = {
  list: DataSourceListItem[];
  total: number;
};
