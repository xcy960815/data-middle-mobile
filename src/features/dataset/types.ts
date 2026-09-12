/** 数据集列表可排序字段。 */
export type DatasetListSortField = 'datasetName' | 'createTime' | 'updateTime' | 'viewCount';
/** 列表排序方向。 */
export type DatasetListSortOrder = 'asc' | 'desc';
/** 数据集列表分页查询请求，全部字段可选。 */
export type DatasetListRequest = {
  pageNum?: number;
  pageSize?: number;
  keyword?: string;
  sortField?: DatasetListSortField;
  sortOrder?: DatasetListSortOrder;
};
/**
 * 数据集字段配置项，同时用于详情的字段配置与预览的列定义。
 */
export type DatasetFieldConfigItem = {
  sourceColumnName: string;
  /** 字段名，预览数据行的取值键。 */
  fieldName: string;
  /** 展示名称；可能为空字符串，前端回退为 fieldName。 */
  displayName: string;
  /** 字段角色：dimension 维度，measure 度量。 */
  fieldType: 'dimension' | 'measure';
  dataType: string;
  /** 聚合方式（如 SUM），可为空。 */
  aggregationType?: string | null;
  /** 计算字段的表达式。 */
  expression?: string;
  /** 是否展示该字段；预览仅展示为 true 的列。 */
  visible: boolean;
  sortOrder: number;
};
/** 数据集列表项。 */
export type DatasetListItem = {
  id: number;
  datasetName: string;
  datasetDesc: string;
  viewCount: number;
  /** 是否禁用：1 已禁用，0 启用。 */
  isDisable: number;
  /** 是否公开：1 已公开，0 未公开。 */
  isPublic: number;
  createTime: string;
  updateTime: string;
  createdBy: string;
  updatedBy: string;
  dataSourceId: number;
  querySql: string;
  fieldCount: number;
  /** 当前用户对该数据集的操作权限。 */
  datasetPermission?: 'none' | 'view' | 'edit' | 'manage';
};
/** 数据集列表分页结果。 */
export type DatasetListResponse = {
  list: DatasetListItem[];
  total: number;
};
/**
 * 数据集详情：在 DatasetListItem 基础上去掉 fieldCount，附加当前配置 ID 与字段配置。
 */
export type DatasetDetailResponse = Omit<DatasetListItem, 'fieldCount'> & {
  currentConfigId: number;
  fieldsConfig: DatasetFieldConfigItem[];
};
/** 数据集预览结果。 */
export type DatasetPreviewResponse = {
  columns: DatasetFieldConfigItem[];
  /** 数据行，键为字段名 fieldName。 */
  rows: Record<string, string | number | boolean | null>[];
  elapsedMs?: number;
};

/** 数据集配置的历史版本记录。 */
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

/** 引用该数据集的分析。 */
export type DatasetAnalysisReference = {
  id: number;
  analysisName: string;
  analysisDesc: string | null;
  chartType: string;
  createdBy: string;
  updateTime: string;
};

/** 引用该数据集的看板。 */
export type DatasetDashboardReference = {
  id: number;
  dashboardName: string;
  dashboardDesc: string | null;
  createdBy: string;
  updateTime: string;
  /** 受影响的分析数量。 */
  affectedAnalysisCount: number;
  /** 受影响的组件数量。 */
  affectedWidgetCount: number;
};

/** 引用该数据集的邮件任务。 */
export type DatasetEmailTaskReference = {
  id: number;
  taskName: string;
  /** 任务类型：scheduled 定时任务，recurring 重复任务。 */
  taskType: 'scheduled' | 'recurring';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  /** 是否停用：1 已停用，0 启用。 */
  isDisabled: 0 | 1;
  createdBy: string;
  updatedTime: string;
  /** 关联的分析 ID。 */
  analysisId: number;
  analysisName: string;
};

/**
 * 数据集使用情况：各资源的引用计数汇总与引用明细。
 */
export type DatasetUsageResponse = {
  usageSummary: {
    analysisCount: number;
    dashboardCount: number;
    emailTaskCount: number;
    /** 邮件任务明细是否因权限受限；为 true 时仅返回数量，不返回明细。 */
    emailTaskDetailsRestricted: boolean;
  };
  usageReferences: {
    analyses: DatasetAnalysisReference[];
    dashboards: DatasetDashboardReference[];
    emailTasks: DatasetEmailTaskReference[];
  };
};
