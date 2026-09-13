/** 分析列表的合法排序字段。 */
export type AnalysisListSortField = 'analysisName' | 'createTime' | 'updateTime' | 'viewCount';

/** 列表排序方向：升序或降序。 */
export type AnalysisListSortOrder = 'asc' | 'desc';

/**
 * 当前用户对分析的权限级别：none 无权限、view 可查看、edit 可编辑、manage 可管理。
 */
export type AnalysisPermission = 'none' | 'view' | 'edit' | 'manage';

/**
 * 分析图表类型；interval 为柱状图、stacked 为堆叠图、combo 为组合图、kpiCard 为指标卡。
 */
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

/** 分析列表查询参数：分页、关键词搜索与排序，均由服务端执行。 */
export type AnalysisListRequest = {
  pageNum?: number;
  pageSize?: number;
  keyword?: string;
  sortField?: AnalysisListSortField;
  sortOrder?: AnalysisListSortOrder;
};

/** 分析列表项：分析的展示信息与权限标记。 */
export type AnalysisListItem = {
  id: number;
  analysisName: string;
  analysisDesc: string;
  viewCount: number;
  createTime: string;
  updateTime: string;
  createdBy: string;
  updatedBy: string;
  /** 当前用户对分析的权限级别，可能缺省。 */
  analysisPermission?: AnalysisPermission;
  /** 图表类型；服务端可能缺省或返回 null。 */
  chartType?: AnalysisChartType | null;
};

/** 分析列表分页结果。 */
export type AnalysisListResponse = {
  list: AnalysisListItem[];
  total: number;
};

/**
 * 数据集列定义：分析的维度、度量、筛选与排序都在列信息上附加各自的规则。
 */
export type AnalysisColumn = {
  columnName: string;
  columnType: string;
  columnComment: string;
  displayName: string;
  /** 字段角色：dimension 维度、measure 度量，缺省表示未指定。 */
  fieldRole?: 'dimension' | 'measure';
  isCustom?: boolean;
  expression?: string;
};

/** 维度列：dimensionRule 携带服务端规则，钻取逻辑读取其中的 drill.enabled 与 drill.value。 */
export type AnalysisDimension = AnalysisColumn & { dimensionRule: Record<string, unknown> };
/** 度量列：在列定义上附加 measureRule 规则，结构由服务端定义。 */
export type AnalysisMeasure = AnalysisColumn & { measureRule: Record<string, unknown> };
/** 筛选列：filterRule 携带 aggregation、operator、operand 等服务端筛选规则。 */
export type AnalysisFilter = AnalysisColumn & { filterRule: Record<string, unknown> };
/** 排序列：orderRule 携带 direction 等服务端排序规则。 */
export type AnalysisOrder = AnalysisColumn & { orderRule: Record<string, unknown> };

/** 分析图表配置：图表类型与维度、度量、筛选、排序的完整定义。 */
export type AnalysisChartConfig = {
  id: number;
  analysisId: number;
  versionNo: number;
  /** 关联数据集 id；null 表示尚未绑定数据集。 */
  datasetId: number | null;
  chartType: AnalysisChartType;
  dimensions: AnalysisDimension[];
  measures: AnalysisMeasure[];
  filters: AnalysisFilter[];
  orders: AnalysisOrder[];
  /** 通用图表配置；aiAnalysis 表示是否开启 AI 分析。 */
  commonChartConfig: { limit: number; aiAnalysis: boolean; datasetName?: string };
  privateChartConfig: Record<string, unknown>;
  updateTime: string;
  createTime: string;
  createdBy: string;
  updatedBy: string;
};

/** 分析详情：在列表项基础上补充当前配置版本、分享开关与图表配置。 */
export type AnalysisDetailResponse = AnalysisListItem & {
  /** 当前生效的图表配置版本 id。 */
  currentConfigId: number;
  /** 是否开启分享：1 开启、0 关闭。 */
  shareEnabled: number;
  /** 是否公开访问：1 公开、0 非公开。 */
  isPublic: number;
  chartConfig: AnalysisChartConfig;
};

/** 分析图表数据查询负载：随请求经 SM2 加密后提交。 */
export type AnalysisDataQueryRequest = {
  analysisId: number;
  datasetId: number;
  dimensions: AnalysisDimension[];
  measures: AnalysisMeasure[];
  filters: AnalysisFilter[];
  orders: AnalysisOrder[];
  commonChartConfig: AnalysisChartConfig['commonChartConfig'];
};

/** 分析图表数据查询结果。 */
export type AnalysisDataQueryResponse = {
  rows: Record<string, string | number | boolean | null>[];
  /** 服务端查询耗时（毫秒）。 */
  queryElapsedMs: number;
};

/** 分析图表配置的历史版本条目。 */
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

/** 引用该分析的看板。 */
export type AnalysisDashboardReference = {
  id: number;
  dashboardName: string;
  dashboardDesc: string | null;
  createdBy: string;
  updateTime: string;
  /** 该看板中引用此分析的组件数量。 */
  affectedWidgetCount: number;
};

/** 引用该分析的邮件任务。 */
export type AnalysisEmailTaskReference = {
  id: number;
  taskName: string;
  /** 任务类型：scheduled 定时、recurring 周期。 */
  taskType: 'scheduled' | 'recurring';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  /** 是否禁用：1 禁用、0 启用。 */
  isDisabled: 0 | 1;
  createdBy: string;
  updatedTime: string;
};

/** 引用该分析的报警规则。 */
export type AnalysisAlarmReference = {
  id: number;
  alarmName: string;
  /** 是否禁用：1 禁用、0 启用。 */
  isDisabled: 0 | 1;
  cronExpression: string;
  /** 报警触发策略：always 始终触发、once_per_day 每天最多一次、only_state_change 仅状态变化时触发。 */
  alarmStrategy: 'always' | 'once_per_day' | 'only_state_change';
  createdBy: string;
  updateTime: string;
};

/** 分析被引用情况：引用计数汇总与各来源的引用明细。 */
export type AnalysisUsageResponse = {
  usageSummary: { dashboardCount: number; emailTaskCount: number; alarmCount: number };
  usageReferences: {
    dashboards: AnalysisDashboardReference[];
    emailTasks: AnalysisEmailTaskReference[];
    alarms: AnalysisAlarmReference[];
  };
};
