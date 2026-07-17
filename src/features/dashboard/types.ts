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
  pageNum: number;
  pageSize: number;
  keyword: string;
  sortField: DashboardListSortField;
  sortOrder: DashboardListSortOrder;
};
