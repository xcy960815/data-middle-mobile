import { useCallback, useEffect, useState } from 'react';

import { dismissBroadcast, fetchActiveBroadcasts } from './broadcast-api';
import type { BroadcastItem } from './types';

/**
 * 欢迎页系统广播横幅：拉取当前可见广播，关闭即调用 dismiss 且本地移除。
 *
 * 拉取失败静默降级为空列表，不打扰欢迎页；dismiss 失败时向调用方抛出原始错误。
 *
 * @returns {{
 *   items: BroadcastItem[];
 *   isLoading: boolean;
 *   dismiss: (broadcastId: number) => Promise<void>;
 * }} 广播状态与操作：items 为当前可见广播，isLoading 表示首屏请求进行中；dismiss 调用
 *   服务端关闭接口，成功后从 items 中本地移除对应广播，失败时抛出 DmsApiError 由调用方
 *   提示，本地列表保持不变。
 */
export function useActiveBroadcasts() {
  const [items, setItems] = useState<BroadcastItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setIsLoading(true);
    void fetchActiveBroadcasts(controller.signal)
      .then((response) => {
        if (active) setItems(response.list);
      })
      .catch(() => {
        // 广播属增值信息，拉取失败静默降级，不打扰欢迎页。
        if (active) setItems([]);
      })
      .finally(() => {
        if (active && !controller.signal.aborted) setIsLoading(false);
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  const dismiss = useCallback(async (broadcastId: number) => {
    await dismissBroadcast(broadcastId);
    setItems((currentItems) => currentItems.filter((item) => item.id !== broadcastId));
  }, []);

  return { items, isLoading, dismiss };
}
