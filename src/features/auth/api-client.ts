import { fetch } from 'expo/fetch';

import { getDmsApiUrl } from './config';
import { getDeviceFingerprint } from './device-fingerprint';
import type { ApiResponse } from './types';

const DEVICE_FINGERPRINT_HEADER = 'X-Device-Fingerprint';

type ExpoFetchOptions = Parameters<typeof fetch>[1];

type ErrorPayload = {
  code?: number;
  message?: string;
  statusCode?: number;
  statusMessage?: string;
};

/**
 * DMS 请求错误的统一类型：在标准 Error 之上携带 HTTP 状态码与业务码，供 UI 提示与
 * 会话守卫（如 isUnauthorizedDmsError）判定失败原因。status 为 HTTP 状态码（网络连接
 * 失败时为 0）；code 为 DMS 业务码，可能缺省。
 */
export class DmsApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: number,
  ) {
    super(message);
    this.name = 'DmsApiError';
  }
}

/**
 * DMS 会话失效同时以 HTTP 401 和业务码 401 两种形式出现。
 *
 * @param {unknown} error - 待判定的错误值。
 * @returns {boolean} 是否为会话失效错误；为 true 时 `error` 在类型上收窄为 DmsApiError。
 */
export function isUnauthorizedDmsError(error: unknown): error is DmsApiError {
  return error instanceof DmsApiError && (error.status === 401 || error.code === 401);
}

/**
 * 从任意抛出值中提取可直接展示的错误消息，统一 UI 层的错误文案来源。
 *
 * @param {unknown} error - 待提取的抛出值，通常为 catch 到的错误。
 * @param {string} fallbackMessage - error 不是 Error 或 message 为空字符串时返回的兜底文案。
 * @returns {string} 提取到的错误消息或兜底文案。
 */
export function getDmsErrorMessage(error: unknown, fallbackMessage: string): string {
  return error instanceof Error && error.message ? error.message : fallbackMessage;
}

/**
 * 触发会话失效回调并兜住回调自身的异常，避免回调抛出时在调用方产生未处理的 Promise rejection。
 *
 * @param {((error: DmsApiError) => void | Promise<void>) | undefined} onUnauthorized - 会话失效回调，可为空。
 * @param {DmsApiError} error - 触发 401 的原始错误，原样传给回调。
 * @returns {Promise<void>} 回调执行完毕后解决；回调失败时经 console.error 记录，本函数自身不会拒绝。
 */
export async function notifyUnauthorized(
  onUnauthorized: ((error: DmsApiError) => void | Promise<void>) | undefined,
  error: DmsApiError,
): Promise<void> {
  try {
    await onUnauthorized?.(error);
  } catch (callbackError) {
    console.error('onUnauthorized 回调执行失败：', callbackError);
  }
}

function isApiResponse<T>(value: unknown): value is ApiResponse<T> {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as ApiResponse<T>).code === 'number' &&
    typeof (value as ApiResponse<T>).message === 'string'
  );
}

function getErrorPayload(value: unknown): ErrorPayload {
  return typeof value === 'object' && value !== null ? (value as ErrorPayload) : {};
}

async function readJson(response: Awaited<ReturnType<typeof fetch>>): Promise<unknown> {
  const responseText = await response.text();
  if (!responseText) {
    return null;
  }

  try {
    return JSON.parse(responseText) as unknown;
  } catch {
    throw new DmsApiError('DMS 返回了无法解析的响应。', response.status);
  }
}

/**
 * 向 DMS 后端发起统一请求并返回业务数据，是各 feature 请求函数的公共出口。
 *
 * 自动携带 HttpOnly Cookie 会话（credentials: 'include'）、Accept: application/json 与
 * 设备指纹请求头；body 存在时补默认 Content-Type: application/json。调用方传入的
 * headers 会保留，但 Accept 与设备指纹头会被覆盖。响应按 ApiResponse 包装解析并校验
 * 业务码，成功时返回其中的 data 字段。
 *
 * @param {string} path - API 路径（以 / 开头），拼接到规范化后的 API 地址之后。
 * @param {ExpoFetchOptions} [options='{}'] - 其余 fetch 配置（method、body、headers、signal 等）。
 * @returns {Promise<T>} 业务数据，即服务端 ApiResponse 包装中的 data 字段。
 * @throws {DmsApiError} 网络连接失败（status 为 0）、响应无法解析、HTTP 非 2xx、
 *   业务码非 200 或响应结构不受支持时抛出。API 地址缺失或设备指纹生成失败发生在
 *   请求之前，会以 AuthConfigurationError 或普通 Error 原样抛出，不包装为 DmsApiError。
 */
export async function dmsRequest<T>(path: string, options: ExpoFetchOptions = {}): Promise<T> {
  const apiUrl = getDmsApiUrl();
  const deviceFingerprint = await getDeviceFingerprint();
  const headers = new Headers(options.headers);
  headers.set('Accept', 'application/json');
  headers.set(DEVICE_FINGERPRINT_HEADER, deviceFingerprint);

  if (options.body != null && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  let response: Awaited<ReturnType<typeof fetch>>;
  try {
    response = await fetch(`${apiUrl}${path}`, {
      ...options,
      credentials: 'include',
      headers,
    });
  } catch (error) {
    throw new DmsApiError(
      error instanceof Error
        ? `无法连接数据中台：${error.message}`
        : '无法连接数据中台，请检查网络和 API 地址。',
      0,
    );
  }

  const payload = await readJson(response);
  if (isApiResponse<T>(payload)) {
    if (!response.ok || payload.code !== 200) {
      throw new DmsApiError(payload.message || 'DMS 请求失败。', response.status, payload.code);
    }
    return payload.data;
  }

  if (!response.ok) {
    const errorPayload = getErrorPayload(payload);
    throw new DmsApiError(
      errorPayload.message ||
        errorPayload.statusMessage ||
        `DMS 请求失败（HTTP ${response.status}）。`,
      response.status,
      errorPayload.code || errorPayload.statusCode,
    );
  }

  throw new DmsApiError('DMS 返回了不受支持的响应结构。', response.status);
}
