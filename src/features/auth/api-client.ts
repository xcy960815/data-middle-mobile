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

function isApiResponse<T>(value: unknown): value is ApiResponse<T> {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as ApiResponse<T>).code === 'number' &&
    typeof (value as ApiResponse<T>).message === 'string' &&
    typeof (value as ApiResponse<T>).success === 'boolean'
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
    if (!response.ok || !payload.success || payload.code !== 200 || payload.data == null) {
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
