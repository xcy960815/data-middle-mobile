import { useCallback, useEffect, useRef, useState } from 'react';

import {
  DmsApiError,
  getDmsErrorMessage,
  isUnauthorizedDmsError,
} from '@/features/auth/api-client';

/** 加载成功但结果内含局部失败（如详情成功、预览失败）时的错误描述。 */
export type AsyncResourcePartialError = {
  message: string;
  code?: number | null;
};

type UseAsyncResourceOptions<T> = {
  /**
   * 取数函数。必须传模块级函数或 useCallback 包裹的稳定引用，引用变化会中断旧请求并重新加载。
   * 局部失败（不丢整个结果的错误）应包含在返回值中并通过 pickError 提取。
   */
  load: (signal: AbortSignal) => Promise<T>;
  /** 兜底错误文案；仅在抛出值不是 Error 时使用。 */
  fallbackErrorMessage: string;
  /** 从加载结果中提取局部失败；返回 null 视为无错误，401 会冒泡给 onUnauthorized。 */
  pickError?: (data: T) => AsyncResourcePartialError | null;
  onUnauthorized?: (error: DmsApiError) => void | Promise<void>;
  /** false 时不请求并清空数据（如权限未达标时跳过拉取）。 */
  enabled?: boolean;
};

/**
 * 跨 feature 的资源加载生命周期 hook：AbortController 竞态取消、错误归一、
 * 401 回调、reload 计数与 enabled 门控；取数逻辑由调用方注入。
 */
export function useAsyncResource<T>({
  load,
  fallbackErrorMessage,
  pickError,
  onUnauthorized,
  enabled = true,
}: UseAsyncResourceOptions<T>) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<number | null>(null);
  const [reloadVersion, setReloadVersion] = useState(0);
  const onUnauthorizedRef = useRef(onUnauthorized);
  const pickErrorRef = useRef(pickError);
  const fallbackErrorMessageRef = useRef(fallbackErrorMessage);

  useEffect(() => {
    onUnauthorizedRef.current = onUnauthorized;
    pickErrorRef.current = pickError;
    fallbackErrorMessageRef.current = fallbackErrorMessage;
  });

  const reload = useCallback(() => setReloadVersion((version) => version + 1), []);

  useEffect(() => {
    if (!enabled) {
      setData(null);
      setIsLoading(false);
      setError(null);
      setErrorCode(null);
      return;
    }

    const controller = new AbortController();
    let active = true;

    const run = async () => {
      setIsLoading(true);
      setError(null);
      setErrorCode(null);
      try {
        const result = await load(controller.signal);
        if (!active || controller.signal.aborted) return;
        setData(result);
        const partialError = pickErrorRef.current?.(result) ?? null;
        if (partialError) {
          setError(partialError.message);
          setErrorCode(partialError.code ?? null);
          if (partialError.code === 401) {
            await onUnauthorizedRef.current?.(new DmsApiError(partialError.message, 401, 401));
          }
        }
      } catch (nextError) {
        if (!active || controller.signal.aborted) return;
        setError(getDmsErrorMessage(nextError, fallbackErrorMessageRef.current));
        setErrorCode(nextError instanceof DmsApiError ? (nextError.code ?? null) : null);
        if (isUnauthorizedDmsError(nextError)) await onUnauthorizedRef.current?.(nextError);
      } finally {
        if (active && !controller.signal.aborted) setIsLoading(false);
      }
    };

    void run();
    return () => {
      active = false;
      controller.abort();
    };
  }, [enabled, load, reloadVersion]);

  return { data, isLoading, error, errorCode, reload };
}
