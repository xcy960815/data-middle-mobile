import { useCallback, useEffect, useState } from 'react';

import { dismissBroadcast, fetchActiveBroadcasts } from './broadcast-api';
import type { BroadcastItem } from './types';

/** 欢迎页系统广播横幅：拉取当前可见广播，关闭即调用 dismiss 且本地移除。 */
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
