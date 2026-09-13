import { dmsRequest } from '@/features/auth/api-client';

import type {
  AlarmLogListResponse,
  EmailLogListResponse,
  EmailTaskItem,
  LoginLogListResponse,
  LogListRequest,
} from './types';

/**
 * 拉取报警日志分页列表，返回报警规则的触发记录与邮件通知结果。
 *
 * @param {LogListRequest} request - 分页与关键词搜索参数。
 * @param {AbortSignal} [signal] - 中止信号，用于取消进行中的请求。
 * @returns {Promise<AlarmLogListResponse>} 报警日志分页结果，list 为当前页条目，total 为服务端总数。
 * @throws {DmsApiError} 网络失败或 DMS 返回非 200 业务码时抛出。
 */
export function fetchAlarmLogList(request: LogListRequest, signal?: AbortSignal) {
  return dmsRequest<AlarmLogListResponse>('/api/log/alarm/list', {
    method: 'POST',
    body: JSON.stringify(request),
    signal,
  });
}

/**
 * 拉取邮件日志分页列表，即分析邮件任务的发送执行记录。
 *
 * @param {LogListRequest} request - 分页与关键词搜索参数。
 * @param {AbortSignal} [signal] - 中止信号，用于取消进行中的请求。
 * @returns {Promise<EmailLogListResponse>} 邮件日志分页结果，list 为当前页条目，total 为服务端总数。
 * @throws {DmsApiError} 网络失败或 DMS 返回非 200 业务码时抛出。
 */
export function fetchEmailLogList(request: LogListRequest, signal?: AbortSignal) {
  return dmsRequest<EmailLogListResponse>('/api/log/email/list', {
    method: 'POST',
    body: JSON.stringify(request),
    signal,
  });
}

/**
 * 拉取登录日志分页列表，记录平台用户的登录结果与失败原因。
 *
 * @param {LogListRequest} request - 分页与关键词搜索参数。
 * @param {AbortSignal} [signal] - 中止信号，用于取消进行中的请求。
 * @returns {Promise<LoginLogListResponse>} 登录日志分页结果，list 为当前页条目，total 为服务端总数。
 * @throws {DmsApiError} 网络失败或 DMS 返回非 200 业务码时抛出。
 */
export function fetchLoginLogList(request: LogListRequest, signal?: AbortSignal) {
  return dmsRequest<LoginLogListResponse>('/api/log/login/list', {
    method: 'POST',
    body: JSON.stringify(request),
    signal,
  });
}

/**
 * 拉取定时邮件任务列表（管理员端点，仅管理员可用），接口本身不带分页参数。
 *
 * @param {AbortSignal} [signal] - 中止信号，用于取消进行中的请求。
 * @returns {Promise<EmailTaskItem[]>} 邮件任务条目数组。
 * @throws {DmsApiError} 网络失败或 DMS 返回非 200 业务码时抛出。
 */
export function fetchEmailTasks(signal?: AbortSignal) {
  return dmsRequest<EmailTaskItem[]>('/api/email/task/list', { method: 'GET', signal });
}
