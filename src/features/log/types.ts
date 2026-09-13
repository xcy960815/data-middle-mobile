/** 日志页签类型：alarm 报警日志、email 邮件日志、login 登录日志。 */
export type LogKind = 'alarm' | 'email' | 'login';

/** 三类日志分页列表接口共用的查询参数，分页与关键词过滤均由服务端完成。 */
export type LogListRequest = {
  pageNum: number;
  pageSize: number;
  keyword?: string;
};

/** 报警日志条目：一次报警规则执行的触发与通知结果。 */
export type AlarmLogItem = {
  id: number;
  /** 关联的报警规则 ID。 */
  alarmId: number;
  /** 关联的分析 ID；null 表示未关联分析。 */
  analysisId: number | null;
  /** 关联的分析名称；null 表示未关联分析。 */
  analysisName: string | null;
  alarmName: string | null;
  executeTime: string;
  /** 是否触发报警：1 已触发，0 未触发。 */
  isTriggered: 0 | 1;
  /** 报警触发的结构化明细；null 表示未记录。 */
  triggerDetail: Record<string, string | number | boolean | null> | null;
  /** 邮件通知结果：success 通知成功、failed 通知失败、skipped 跳过通知；null 表示未记录通知状态。 */
  notifyStatus: 'success' | 'failed' | 'skipped' | null;
  errorMessage: string | null;
};

/** 报警日志分页结果：list 为当前页条目，total 为服务端总数。 */
export type AlarmLogListResponse = { list: AlarmLogItem[]; total: number };

/** 邮件日志条目：一次分析邮件任务的发送记录。 */
export type EmailLogItem = {
  id: number;
  /** 关联的邮件任务 ID。 */
  taskId: number;
  analysisId: number;
  analysisName: string;
  /** 发送触发方式：manual 手动发送，scheduled 定时发送。 */
  triggerType: 'manual' | 'scheduled';
  executionTime: string;
  status: 'success' | 'failed';
  message: string | null;
  senderEmail: string | null;
  emailSubject: string | null;
  /** 发送耗时（毫秒）；null 表示未记录。 */
  executionDuration: number | null;
};

/** 邮件日志分页结果：list 为当前页条目，total 为服务端总数。 */
export type EmailLogListResponse = { list: EmailLogItem[]; total: number };

/** 登录日志条目：一次用户登录尝试的结果记录。 */
export type LoginLogItem = {
  id: number;
  userName: string;
  loginTime: string;
  loginIp: string | null;
  userAgent: string | null;
  status: 'success' | 'failed';
  failReason: string | null;
};

/** 登录日志分页结果：list 为当前页条目，total 为服务端总数。 */
export type LoginLogListResponse = { list: LoginLogItem[]; total: number };

/** 邮件任务条目：管理员端点 /api/email/task/list 返回的定时/重复邮件任务。 */
export type EmailTaskItem = {
  id: number;
  taskName: string;
  /** 任务类型：scheduled 定时任务，recurring 重复任务。 */
  taskType: 'scheduled' | 'recurring';
  /** 执行状态：pending 待执行、running 执行中、completed 已完成、failed 失败、cancelled 已取消。 */
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  /** 是否已禁用：1 已禁用，0 未禁用。 */
  isDisabled: 0 | 1;
  /** 计划执行时间；null 表示未指定。 */
  scheduleTime: string | null;
  /** 下次计划执行时间；null 表示暂无排期。 */
  nextExecutionTime: string | null;
  /** 上次执行时间；null 表示尚未执行。 */
  executedTime: string | null;
  errorMessage: string | null;
  createdBy: string;
  createdTime: string;
};
