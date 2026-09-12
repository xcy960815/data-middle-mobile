/** 数据源列表可排序字段。 */
export type DataSourceSortField = 'sourceName' | 'createTime' | 'updateTime';
/** 列表排序方向。 */
export type DataSourceSortOrder = 'asc' | 'desc';

/**
 * 数据源列表项。托管（managed）模式不携带直连信息，host/port/username 为 null，
 * 以 runtimeSourceName 作为连接目标的展示；自建（dedicated）模式携带实际连接信息。
 */
export type DataSourceListItem = {
  id: number;
  sourceName: string;
  sourceDesc: string;
  sourceType: 'mysql' | 'postgresql';
  connectionMode: 'managed' | 'dedicated';
  /** 平台侧运行时数据源名称；托管模式下作为连接目标的展示。 */
  runtimeSourceName: string;
  databaseName: string;
  host: string | null;
  port: number | null;
  username: string | null;
  /** 是否禁用：1 已禁用，0 启用。 */
  isDisable: 0 | 1;
  createTime: string;
  updateTime: string;
  createdBy: string;
  updatedBy: string;
  /** 当前用户对该数据源的操作权限。 */
  dataSourcePermission?: 'none' | 'view' | 'edit' | 'manage';
};

/** 数据源列表分页查询请求。 */
export type DataSourceListRequest = {
  pageNum: number;
  pageSize: number;
  keyword?: string;
  sortField: DataSourceSortField;
  sortOrder: DataSourceSortOrder;
};

/** 数据源列表分页结果。 */
export type DataSourceListResponse = {
  list: DataSourceListItem[];
  total: number;
};

/** 数据源详情，结构与列表项一致。 */
export type DataSourceDetailResponse = DataSourceListItem;

/**
 * 数据源连接信息字段集合，被创建/更新/连接测试请求按连接模式复用。
 * 自建（dedicated）模式需要 host/port/username；托管（managed）模式不携带这些字段。
 */
export type DataSourceConnectionFields = {
  host?: string;
  port?: number;
  username?: string;
  password?: string;
};

/**
 * 创建数据源请求。整体经 SM2 加密后以 encryptedPayload 提交；
 * 连接字段约束见 DataSourceConnectionFields。
 */
export type CreateDataSourceRequest = {
  sourceName: string;
  sourceDesc?: string;
  sourceType: 'mysql' | 'postgresql';
  connectionMode: 'managed' | 'dedicated';
  runtimeSourceName: string;
  databaseName?: string;
  isDisable: 0 | 1;
} & DataSourceConnectionFields;

/**
 * 更新数据源请求，除 id 外字段均可选。整体经 SM2 加密后以 encryptedPayload 提交。
 */
export type UpdateDataSourceRequest = {
  id: number;
  sourceName?: string;
  sourceDesc?: string;
  sourceType?: 'mysql' | 'postgresql';
  connectionMode?: 'managed' | 'dedicated';
  runtimeSourceName?: string;
  databaseName?: string;
  isDisable?: 0 | 1;
} & DataSourceConnectionFields;

/**
 * 测试数据源连接请求。整体经 SM2 加密后以 encryptedPayload 提交；
 * 编辑已有数据源时携带 id，新建时省略。
 */
export type TestDataSourceConnectionRequest = {
  id?: number;
  sourceType: 'mysql' | 'postgresql';
  connectionMode: 'managed' | 'dedicated';
  runtimeSourceName: string;
  databaseName?: string;
} & DataSourceConnectionFields;
