import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';

import type { DmsApiError } from '@/features/auth/api-client';
import type { NotificationItem, NotificationResourceType } from '@/features/notification/types';
import { useNotifications } from '@/features/notification/use-notifications';

type NotificationTabKey = 'notifications' | 'applies';

type Props = {
  onBackPress: () => void;
  onUnauthorized?: (error: DmsApiError) => void | Promise<void>;
  onResourcePress: (resourceType: NotificationResourceType, resourceId: number) => void;
};

const resourceTypeLabels: Record<NotificationResourceType, string> = {
  analysis: '分析',
  dashboard: '看板',
  dataset: '数据集',
  data_source: '数据源',
};

const applyStatusMeta: Record<string, { label: string; color: string; backgroundColor: string }> = {
  pending: { label: '审批中', color: '#b45309', backgroundColor: '#fef3c7' },
  approved: { label: '已通过', color: '#15803d', backgroundColor: '#dcfce7' },
  rejected: { label: '已拒绝', color: '#b91c1c', backgroundColor: '#fee2e2' },
};

function formatDateTime(value?: string | null): string {
  const trimmedValue = value?.trim();
  if (!trimmedValue) return '时间未知';

  const parsedDate = new Date(trimmedValue.replace(' ', 'T'));
  if (Number.isNaN(parsedDate.getTime())) return '时间未知';

  const pad = (part: number) => String(part).padStart(2, '0');
  return `${parsedDate.getFullYear()}-${pad(parsedDate.getMonth() + 1)}-${pad(
    parsedDate.getDate(),
  )} ${pad(parsedDate.getHours())}:${pad(parsedDate.getMinutes())}`;
}

export function NotificationCenterScreen({ onBackPress, onUnauthorized, onResourcePress }: Props) {
  const {
    items,
    total,
    unreadCount,
    myApplies,
    isInitialLoading,
    isRefreshing,
    isLoadingMore,
    initialError,
    refreshError,
    loadMoreError,
    hasMore,
    refresh,
    loadMore,
    markRead,
    retryInitialLoad,
  } = useNotifications(onUnauthorized);
  const [activeTab, setActiveTab] = useState<NotificationTabKey>('notifications');

  const handleNotificationPress = (notificationId: number, isRead: boolean) => {
    const notification = items.find((item) => item.id === notificationId);
    if (!notification) return;
    const openResource = () =>
      notification.resourceId > 0 &&
      onResourcePress(notification.resourceType, notification.resourceId);
    if (isRead) {
      openResource();
      return;
    }
    void markRead(notificationId)
      .then(openResource)
      .catch(() => {
        Alert.alert('标记已读失败', '请稍后重试，或下拉刷新通知列表。');
      });
  };

  const tabs: readonly { key: NotificationTabKey; label: string }[] = [
    { key: 'notifications', label: `通知${unreadCount > 0 ? `（${unreadCount} 条未读）` : ''}` },
    { key: 'applies', label: '我的申请' },
  ];

  return (
    <View className="flex-1 bg-[#f5f9fe]">
      <ScrollView
        contentContainerClassName="gap-4 px-[18px] pb-8 pt-[52px]"
        refreshControl={
          <RefreshControl
            onRefresh={() => void refresh()}
            refreshing={isRefreshing}
            tintColor="#397cf0"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-center gap-3">
          <Pressable accessibilityLabel="返回" accessibilityRole="button" onPress={onBackPress}>
            <Text className="text-3xl text-[#397cf0]">‹</Text>
          </Pressable>
          <View className="flex-1">
            <Text className="text-xl font-black text-[#253750]">通知中心</Text>
            <Text className="mt-1 text-xs text-[#718198]">
              {unreadCount > 0 ? `${unreadCount} 条未读通知` : '通知与权限申请进度'}
            </Text>
          </View>
        </View>

        <View className="gap-2 rounded-2xl border border-[#dce7f3] bg-white p-2 shadow-md shadow-slate-500/10">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <Pressable
                accessibilityLabel={tab.label}
                accessibilityRole="tab"
                accessibilityState={{ selected: isActive }}
                className={`rounded-xl px-4 py-2.5 active:opacity-80 ${
                  isActive ? 'bg-[#397cf0]' : 'bg-transparent'
                }`}
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
              >
                <Text
                  className={`text-xs font-black ${isActive ? 'text-white' : 'text-[#62738b]'}`}
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {refreshError && !isInitialLoading && (
          <View className="flex-row items-center gap-3 rounded-xl border border-[#f2d3d3] bg-[#fff7f7] p-3">
            <Text accessibilityLiveRegion="assertive" className="flex-1 text-[11px] text-[#a64b4b]">
              {`刷新失败：${refreshError}`}
            </Text>
            <Pressable
              accessibilityLabel="重试"
              accessibilityRole="button"
              className="rounded-lg bg-white px-3 py-2 active:opacity-70"
              onPress={() => void refresh()}
            >
              <Text className="text-[10px] font-black text-[#397cf0]">重试</Text>
            </Pressable>
          </View>
        )}

        {isInitialLoading ? (
          <View className="min-h-[300px] items-center justify-center gap-3">
            <ActivityIndicator color="#397cf0" size="large" />
            <Text className="text-sm font-bold text-[#687990]">正在加载通知…</Text>
          </View>
        ) : initialError ? (
          <View className="items-center rounded-2xl border border-[#f1d4d4] bg-white p-8">
            <Text className="text-lg font-black text-[#34445b]">通知加载失败</Text>
            <Text className="mt-2 text-center text-xs leading-5 text-[#7b8aa0]">
              {initialError}
            </Text>
            <Pressable
              className="mt-5 rounded-xl bg-[#397cf0] px-5 py-3"
              onPress={retryInitialLoad}
            >
              <Text className="text-xs font-black text-white">重新加载</Text>
            </Pressable>
          </View>
        ) : activeTab === 'notifications' ? (
          <>
            <Text className="text-[11px] font-bold text-[#7a899d]">
              共 {total} 条通知，已加载 {items.length} 条
            </Text>
            {items.length > 0 ? (
              <View className="gap-3">
                {items.map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                    onPress={() => handleNotificationPress(notification.id, notification.isRead)}
                  />
                ))}
              </View>
            ) : (
              <View className="min-h-[220px] items-center justify-center rounded-2xl border border-[#dce7f3] bg-white p-8">
                <Text className="text-base font-black text-[#2b3d57]">暂无通知</Text>
                <Text className="mt-2 text-center text-xs text-[#7b8aa0]">
                  资源权限审批结果会通过通知提醒你。
                </Text>
              </View>
            )}
            {hasMore && (
              <View className="mt-2 items-center">
                {loadMoreError && (
                  <Text
                    accessibilityLiveRegion="assertive"
                    className="mb-2 text-[11px] text-[#a64b4b]"
                  >
                    {`加载更多失败：${loadMoreError}`}
                  </Text>
                )}
                <Pressable
                  accessibilityLabel="加载更多通知"
                  accessibilityRole="button"
                  accessibilityState={{ busy: isLoadingMore, disabled: isLoadingMore }}
                  className="min-h-11 min-w-[132px] flex-row items-center justify-center gap-2 rounded-xl bg-[#397cf0] px-5 py-3 active:opacity-80 disabled:opacity-60"
                  disabled={isLoadingMore}
                  onPress={() => void loadMore()}
                >
                  {isLoadingMore && <ActivityIndicator color="#ffffff" size="small" />}
                  <Text className="text-xs font-black text-white">
                    {isLoadingMore ? '正在加载…' : '加载更多'}
                  </Text>
                </Pressable>
              </View>
            )}
          </>
        ) : (
          <View className="gap-3">
            {myApplies.length > 0 ? (
              myApplies.map((apply) => {
                const status = applyStatusMeta[apply.status];
                return (
                  <View
                    className="gap-2.5 rounded-2xl border border-[#dce7f3] bg-white p-4"
                    key={apply.id}
                  >
                    <View className="flex-row items-start justify-between gap-2.5">
                      <View className="flex-1">
                        <Text numberOfLines={1} className="text-sm font-black text-[#34445b]">
                          {apply.resourceName}
                        </Text>
                        <Text className="mt-1 text-[10px] text-[#8a98aa]">
                          {resourceTypeLabels[apply.resourceType]} · 申请于{' '}
                          {formatDateTime(apply.applyTime)}
                        </Text>
                      </View>
                      <View
                        className="rounded-full px-2 py-1"
                        style={{ backgroundColor: status.backgroundColor }}
                      >
                        <Text className="text-[9px] font-black" style={{ color: status.color }}>
                          {status.label}
                        </Text>
                      </View>
                    </View>
                    {apply.applyReason ? (
                      <Text className="text-xs leading-[19px] text-[#6d7d94]">
                        {apply.applyReason}
                      </Text>
                    ) : null}
                    {apply.handleReason && (
                      <View className="rounded-xl bg-[#f0f5fb] px-3 py-2">
                        <Text className="text-[10px] leading-4 text-[#657994]">
                          审批意见：{apply.handleReason}
                        </Text>
                      </View>
                    )}
                  </View>
                );
              })
            ) : (
              <View className="min-h-[220px] items-center justify-center rounded-2xl border border-[#dce7f3] bg-white p-8">
                <Text className="text-base font-black text-[#2b3d57]">暂无申请记录</Text>
                <Text className="mt-2 text-center text-xs text-[#7b8aa0]">
                  在 PC 端对无权限资源发起的查看申请会记录在这里。
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function NotificationCard({
  notification,
  onPress,
}: {
  notification: NotificationItem;
  onPress: () => void;
}) {
  const resourceLabel =
    notification.resourceId > 0
      ? `${resourceTypeLabels[notification.resourceType]}资源`
      : '已下线资源';

  return (
    <Pressable
      accessibilityHint="按下后标记已读并跳转对应资源"
      accessibilityLabel={`${notification.isRead ? '' : '未读，'}${notification.title}，${
        notification.content || '无详细内容'
      }，来自 ${notification.actorName || '系统'}，${formatDateTime(notification.createTime)}`}
      accessibilityRole="button"
      className={`gap-2 rounded-2xl border bg-white p-4 active:opacity-90 ${
        notification.isRead ? 'border-[#dce7f3]' : 'border-[#a8c8f2]'
      }`}
      onPress={onPress}
    >
      <View className="flex-row items-start justify-between gap-2.5">
        <View className="flex-1 flex-row items-center gap-2">
          {!notification.isRead && <View className="h-2 w-2 shrink-0 rounded-full bg-[#397cf0]" />}
          <Text numberOfLines={1} className="flex-1 text-sm font-black text-[#34445b]">
            {notification.title}
          </Text>
        </View>
        <Text className="text-[9px] text-[#94a2b5]">{formatDateTime(notification.createTime)}</Text>
      </View>
      {notification.content ? (
        <Text numberOfLines={3} className="text-xs leading-[19px] text-[#6d7d94]">
          {notification.content}
        </Text>
      ) : null}
      <View className="flex-row items-center justify-between">
        <Text className="text-[10px] font-bold text-[#60738e]">
          来自 {notification.actorName || '系统'} · {resourceLabel}
        </Text>
        {notification.resourceId > 0 && (
          <Text className="text-[10px] font-extrabold text-[#397bea]">查看 →</Text>
        )}
      </View>
    </Pressable>
  );
}
