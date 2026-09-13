import { DmsApiError } from '@/features/auth/api-client';
import { useAsyncResource } from '@/features/common/use-async-resource';
import { fetchMonitorSnapshot } from './monitor-api';
import type { SnapshotResponse } from './types';

const loadSnapshot = (signal: AbortSignal) => fetchMonitorSnapshot(signal);

/**
 * 宿主机监控快照 hook：挂载时自动拉取一次快照，reload 供下拉刷新使用。
 *
 * 基于 useAsyncResource 封装；错误不会向调用方抛出，统一归一为 error 文案（抛出值不是
 * Error 时兜底为 '加载监控快照失败。'），会话失效（401）额外触发 onUnauthorized 回调。
 *
 * @param onUnauthorized - 会话失效回调；接收触发 401 的 DmsApiError，可异步，由调用方
 *   处理全局会话逻辑。
 * @returns {{
 *   snapshot: SnapshotResponse | null;
 *   isLoading: boolean;
 *   error: string | null;
 *   reload: () => void;
 * }} 快照加载状态：snapshot 为最近一次成功拉取的快照，尚无成功结果时为 null；isLoading
 *   表示请求进行中；error 为归一后的错误文案；reload 手动触发一次重新加载。
 */
export function useMonitorSnapshot(onUnauthorized?: (error: DmsApiError) => void | Promise<void>) {
  const resource = useAsyncResource<SnapshotResponse>({
    load: loadSnapshot,
    fallbackErrorMessage: '加载监控快照失败。',
    onUnauthorized,
  });

  return {
    snapshot: resource.data,
    isLoading: resource.isLoading,
    error: resource.error,
    reload: resource.reload,
  };
}
