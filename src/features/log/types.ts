export type LogKind = 'alarm' | 'email' | 'login';

export type LogListRequest = {
  pageNum: number;
  pageSize: number;
  keyword?: string;
};

export type AlarmLogItem = {
  id: number;
  alarmId: number;
  analysisId: number | null;
  analysisName: string | null;
  alarmName: string | null;
  executeTime: string;
  isTriggered: 0 | 1;
  triggerDetail: Record<string, string | number | boolean | null> | null;
  notifyStatus: 'success' | 'failed' | 'skipped' | null;
  errorMessage: string | null;
};

export type AlarmLogListResponse = { list: AlarmLogItem[]; total: number };

export type EmailLogItem = {
  id: number;
  taskId: number;
  analysisId: number;
  analysisName: string;
  triggerType: 'manual' | 'scheduled';
  executionTime: string;
  status: 'success' | 'failed';
  message: string | null;
  senderEmail: string | null;
  emailSubject: string | null;
  executionDuration: number | null;
};

export type EmailLogListResponse = { list: EmailLogItem[]; total: number };

export type LoginLogItem = {
  id: number;
  userName: string;
  loginTime: string;
  loginIp: string | null;
  userAgent: string | null;
  status: 'success' | 'failed';
  failReason: string | null;
};

export type LoginLogListResponse = { list: LoginLogItem[]; total: number };

export type EmailTaskItem = {
  id: number;
  taskName: string;
  taskType: 'scheduled' | 'recurring';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  isDisabled: 0 | 1;
  scheduleTime: string | null;
  nextExecutionTime: string | null;
  executedTime: string | null;
  errorMessage: string | null;
  createdBy: string;
  createdTime: string;
};
