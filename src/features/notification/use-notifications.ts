import { useCallback, useState } from 'react';

import { DmsApiError } from '@/features/auth/api-client';
import { usePagedList, type PagedListRequest } from '@/features/common/use-paged-list';

import {
  fetchAccessApplyList,
  fetchNotificationList,
  fetchUnreadNotificationCount,
  handleAccessApply,
  markNotificationsRead,
} from './notification-api';
import type { AccessApplyItem, NotificationItem } from './types';

function fetchNotificationPage(request: PagedListRequest, signal?: AbortSignal) {
  return fetchNotificationList(request.pageNum, request.pageSize, signal);
}

/**
 * 通知中心数据 hook：管理通知分页列表、未读数与我的权限申请记录。
 * 通知与申请数据由服务端按当前用户过滤，没有搜索与排序参数；分页骨架复用 usePagedList。
 */
export function useNotifications(onUnauthorized?: (error: DmsApiError) => void | Promise<void>) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [myApplies, setMyApplies] = useState<AccessApplyItem[]>([]);
  const [pendingApplies, setPendingApplies] = useState<AccessApplyItem[]>([]);

  const loadCountAndApplies = useCallback(async (signal: AbortSignal) => {
    const [countResponse, applyResponse] = await Promise.all([
      fetchUnreadNotificationCount(signal),
      fetchAccessApplyList(signal),
    ]);
    setUnreadCount(countResponse.count);
    setMyApplies(applyResponse.mine);
    setPendingApplies(applyResponse.pending);
  }, []);

  const list = usePagedList<NotificationItem>(fetchNotificationPage, {
    onUnauthorized,
    dedupeKey: (item) => item.id,
    errorLabel: '通知',
    loadExtras: async (signal) => {
      // 未读数与申请记录属辅助信息，失败不打断通知列表。
      await loadCountAndApplies(signal).catch(() => undefined);
    },
  });

  const { updateItems } = list;

  /** 标记单条通知已读；失败时抛错由调用方提示。 */
  const markRead = useCallback(
    async (notificationId: number) => {
      await markNotificationsRead({ notificationIds: [notificationId] });
      updateItems((currentItems) =>
        currentItems.map((item) => (item.id === notificationId ? { ...item, isRead: true } : item)),
      );
      setUnreadCount((count) => Math.max(0, count - 1));
    },
    [updateItems],
  );

  /** 审批待处理申请；成功后从待审列表移除，失败抛错由调用方提示。 */
  const handleApply = useCallback(async (applyId: number, approved: boolean) => {
    await handleAccessApply({ applyId, approved });
    setPendingApplies((currentItems) => currentItems.filter((item) => item.id !== applyId));
  }, []);

  return {
    items: list.items,
    total: list.total,
    unreadCount,
    myApplies,
    pendingApplies,
    isInitialLoading: list.isInitialLoading,
    isRefreshing: list.isRefreshing,
    isLoadingMore: list.isLoadingMore,
    initialError: list.initialError,
    refreshError: list.refreshError,
    loadMoreError: list.loadMoreError,
    hasMore: list.hasMore,
    refresh: list.refresh,
    loadMore: list.loadMore,
    markRead,
    handleApply,
    retryInitialLoad: list.retryInitialLoad,
  };
}
