import { useMemo } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { DmsApiError } from '@/features/auth/api-client';
import { fetchAlarmLogList, fetchEmailLogList, fetchLoginLogList } from '@/features/log/log-api';
import type { AlarmLogItem, EmailLogItem, LogKind, LoginLogItem } from '@/features/log/types';
import { usePagedList } from '@/features/common/use-paged-list';
import { formatDateTime } from '@/utils/format-date-time';

const LOG_TITLES: Record<LogKind, { title: string; description: string; emptyText: string }> = {
  alarm: {
    title: '报警日志',
    description: '查看报警规则的触发记录与通知结果。',
    emptyText: '暂无报警日志',
  },
  email: {
    title: '邮件日志',
    description: '查看分析邮件任务的发送记录。',
    emptyText: '暂无邮件日志',
  },
  login: {
    title: '登录日志',
    description: '查看平台用户的登录记录与失败原因。',
    emptyText: '暂无登录日志',
  },
};

const notifyStatusLabels: Record<string, string> = {
  success: '通知成功',
  failed: '通知失败',
  skipped: '跳过通知',
};

const triggerTypeLabels: Record<string, string> = {
  manual: '手动发送',
  scheduled: '定时发送',
};

/**
 * 日志列表页：同一页面按 kind 分别展示报警、邮件、登录三类日志的服务端分页列表。
 *
 * 页头标题与空态文案随 kind 切换，提供关键词搜索（防抖后由服务端过滤）、下拉刷新与
 * 加载更多，列表项按日志类型渲染对应的只读卡片。
 *
 * @param {object} props - 页面属性。
 * @param {LogKind} props.kind - 日志类型：alarm 报警日志、email 邮件日志、login 登录日志。
 * @param {() => void} props.onBackPress - 点击页头返回按钮的回调。
 * @param {(error: DmsApiError) => void | Promise<void>} props.onUnauthorized - 会话失效
 *   回调；日志请求遇到 401 时触发，用于跳转登录。
 * @returns {JSX.Element} 日志列表页。
 */
export function LogListScreen({
  kind,
  onBackPress,
  onUnauthorized,
}: {
  kind: LogKind;
  onBackPress: () => void;
  onUnauthorized: (error: DmsApiError) => void | Promise<void>;
}) {
  const meta = LOG_TITLES[kind];
  const fetcher = useMemo(() => {
    if (kind === 'alarm') return fetchAlarmLogList;
    if (kind === 'email') return fetchEmailLogList;
    return fetchLoginLogList;
  }, [kind]);
  const {
    items,
    total,
    keyword,
    setKeyword,
    isInitialLoading,
    isRefreshing,
    isLoadingMore,
    initialError,
    refreshError,
    loadMoreError,
    hasMore,
    refresh,
    loadMore,
    retryInitialLoad,
  } = usePagedList<AlarmLogItem | EmailLogItem | LoginLogItem>(fetcher, {
    onUnauthorized,
    errorLabel: '日志',
  });

  return (
    <View className="flex-1 bg-[#f5f9fe]">
      <ScrollView
        contentContainerClassName="gap-3 px-[18px] pb-8 pt-[52px]"
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            accessibilityLabel={`刷新${meta.title}`}
            onRefresh={() => void refresh()}
            refreshing={isRefreshing}
            tintColor="#397cf0"
          />
        }
      >
        <View className="flex-row items-center gap-3">
          <Pressable accessibilityLabel="返回" accessibilityRole="button" onPress={onBackPress}>
            <Text className="text-3xl text-[#397cf0]">‹</Text>
          </Pressable>
          <View className="flex-1">
            <Text className="text-xl font-black text-[#253750]">{meta.title}</Text>
            <Text className="mt-1 text-xs text-[#718198]">{meta.description}</Text>
          </View>
        </View>

        <View className="min-h-[52px] flex-row items-center rounded-[13px] border border-[#d8e4f2] bg-white px-3.5">
          <Text className="-mt-0.5 mr-[9px] text-[22px] text-[#6791cf]">⌕</Text>
          <TextInput
            accessibilityLabel={`搜索${meta.title}`}
            autoCapitalize="none"
            onChangeText={setKeyword}
            placeholder="搜索关键词"
            placeholderTextColor="#91a0b4"
            returnKeyType="search"
            className="flex-1 py-[13px] text-sm text-[#263850]"
            value={keyword}
          />
          {keyword.length > 0 && (
            <Pressable
              accessibilityLabel="清空搜索"
              accessibilityRole="button"
              hitSlop={8}
              className="h-[26px] w-[26px] items-center justify-center rounded-full bg-[#eef3f9]"
              onPress={() => setKeyword('')}
            >
              <Text className="text-xl leading-[21px] text-[#64758b]">×</Text>
            </Pressable>
          )}
        </View>

        <Text accessibilityLiveRegion="polite" className="text-[11px] font-bold text-[#7a899d]">
          {isInitialLoading
            ? `正在加载${meta.title}…`
            : `共 ${total} 条，已加载 ${items.length} 条`}
        </Text>

        {refreshError && !isInitialLoading && (
          <View className="w-full flex-row items-center gap-3 rounded-xl border border-[#f2d3d3] bg-[#fff7f7] p-3">
            <Text
              accessibilityLiveRegion="assertive"
              className="flex-1 text-[11px] leading-4 text-[#a64b4b]"
            >
              刷新失败：{refreshError}
            </Text>
            <Pressable
              accessibilityLabel="重试刷新"
              accessibilityRole="button"
              className="rounded-lg bg-white px-3 py-2"
              onPress={() => void refresh()}
            >
              <Text className="text-[10px] font-black text-[#397cf0]">重试</Text>
            </Pressable>
          </View>
        )}

        {isInitialLoading ? (
          <ActivityIndicator color="#397cf0" />
        ) : initialError ? (
          <View className="items-center rounded-2xl border border-[#f1d4d4] bg-white p-8">
            <Text className="text-lg font-black text-[#34445b]">{meta.title}加载失败</Text>
            <Text className="mt-2 text-center text-xs leading-5 text-[#7b8aa0]">
              {initialError}
            </Text>
            <Pressable
              accessibilityLabel={`重新加载${meta.title}`}
              accessibilityRole="button"
              className="mt-5 rounded-xl bg-[#397cf0] px-5 py-3"
              onPress={retryInitialLoad}
            >
              <Text className="text-xs font-black text-white">重新加载</Text>
            </Pressable>
          </View>
        ) : items.length > 0 ? (
          <>
            {items.map((item) =>
              kind === 'alarm' ? (
                <AlarmLogCard item={item as AlarmLogItem} key={`alarm-${item.id}`} />
              ) : kind === 'email' ? (
                <EmailLogCard item={item as EmailLogItem} key={`email-${item.id}`} />
              ) : (
                <LoginLogCard item={item as LoginLogItem} key={`login-${item.id}`} />
              ),
            )}
            <View className="mt-2 items-center">
              {loadMoreError && (
                <View className="mb-3 w-full flex-row items-center gap-3 rounded-xl border border-[#f2d3d3] bg-[#fff7f7] p-3">
                  <Text
                    accessibilityLiveRegion="assertive"
                    className="flex-1 text-[11px] leading-4 text-[#a64b4b]"
                  >
                    加载更多失败：{loadMoreError}
                  </Text>
                  <Pressable
                    accessibilityLabel="重试加载更多"
                    accessibilityRole="button"
                    className="rounded-lg bg-white px-3 py-2"
                    onPress={() => void loadMore()}
                  >
                    <Text className="text-[10px] font-black text-[#397cf0]">重试</Text>
                  </Pressable>
                </View>
              )}
              {hasMore ? (
                <Pressable
                  accessibilityLabel={`加载更多${meta.title}`}
                  accessibilityRole="button"
                  accessibilityState={{ busy: isLoadingMore, disabled: isLoadingMore }}
                  className="min-h-11 min-w-[132px] flex-row items-center justify-center gap-2 rounded-xl bg-[#397cf0] px-5 py-3 disabled:opacity-60"
                  disabled={isLoadingMore}
                  onPress={() => void loadMore()}
                >
                  {isLoadingMore && <ActivityIndicator color="#ffffff" size="small" />}
                  <Text className="text-xs font-black text-white">
                    {isLoadingMore ? '正在加载…' : '加载更多'}
                  </Text>
                </Pressable>
              ) : (
                <Text className="text-[11px] font-bold text-[#8997aa]">已加载全部{meta.title}</Text>
              )}
            </View>
          </>
        ) : (
          <View className="items-center rounded-2xl border border-[#dce7f3] bg-white p-8">
            <Text className="text-lg font-black text-[#2b3d57]">
              {keyword.trim() ? '没有匹配搜索条件的记录' : meta.emptyText}
            </Text>
            {keyword.trim() ? (
              <Pressable
                accessibilityLabel={`清空${meta.title}搜索`}
                accessibilityRole="button"
                className="mt-5 rounded-xl bg-[#397cf0] px-5 py-3"
                onPress={() => setKeyword('')}
              >
                <Text className="text-xs font-black text-white">清空搜索</Text>
              </Pressable>
            ) : null}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function StatusChip({ status }: { status: 'success' | 'failed' }) {
  return (
    <View
      className={`rounded-full px-2 py-1 ${status === 'success' ? 'bg-[#e7f8ef]' : 'bg-[#fee2e2]'}`}
    >
      <Text
        className={`text-[9px] font-black ${status === 'success' ? 'text-[#047857]' : 'text-[#b91c1c]'}`}
      >
        {status === 'success' ? '成功' : '失败'}
      </Text>
    </View>
  );
}

function AlarmLogCard({ item }: { item: AlarmLogItem }) {
  return (
    <View className="gap-2 rounded-2xl border border-[#dce7f3] bg-white p-4">
      <View className="flex-row items-start justify-between gap-2.5">
        <View className="flex-1">
          <Text numberOfLines={1} className="text-sm font-black text-[#34445b]">
            {item.alarmName || `报警 #${item.alarmId}`}
          </Text>
          <Text className="mt-1 text-[10px] text-[#8a98aa]">
            {item.analysisName || '未关联分析'} · 执行于 {formatDateTime(item.executeTime)}
          </Text>
        </View>
        <View
          className={`rounded-full px-2 py-1 ${item.isTriggered === 1 ? 'bg-[#fef3c7]' : 'bg-[#edf1f6]'}`}
        >
          <Text
            className={`text-[9px] font-black ${item.isTriggered === 1 ? 'text-[#b45309]' : 'text-[#718198]'}`}
          >
            {item.isTriggered === 1 ? '已触发' : '未触发'}
          </Text>
        </View>
      </View>
      {item.notifyStatus ? (
        <Text className="text-xs text-[#6d7d94]">
          {notifyStatusLabels[item.notifyStatus] ?? item.notifyStatus}
        </Text>
      ) : null}
      {item.errorMessage ? (
        <Text className="rounded-xl bg-[#fff7f7] px-3 py-2 text-[11px] leading-4 text-[#a64b4b]">
          {item.errorMessage}
        </Text>
      ) : null}
    </View>
  );
}

function EmailLogCard({ item }: { item: EmailLogItem }) {
  return (
    <View className="gap-2 rounded-2xl border border-[#dce7f3] bg-white p-4">
      <View className="flex-row items-start justify-between gap-2.5">
        <View className="flex-1">
          <Text numberOfLines={1} className="text-sm font-black text-[#34445b]">
            {item.emailSubject || item.analysisName}
          </Text>
          <Text className="mt-1 text-[10px] text-[#8a98aa]">
            {item.analysisName} · {triggerTypeLabels[item.triggerType] ?? item.triggerType} · 执行于{' '}
            {formatDateTime(item.executionTime)}
          </Text>
        </View>
        <StatusChip status={item.status} />
      </View>
      {item.senderEmail ? (
        <Text numberOfLines={1} className="text-[10px] text-[#7c8ca2]">
          发件人 {item.senderEmail}
          {item.executionDuration != null ? ` · 耗时 ${item.executionDuration} ms` : ''}
        </Text>
      ) : null}
      {item.message ? (
        <Text
          numberOfLines={3}
          className={`rounded-xl px-3 py-2 text-[11px] leading-4 ${
            item.status === 'failed' ? 'bg-[#fff7f7] text-[#a64b4b]' : 'bg-[#f0f5fb] text-[#657994]'
          }`}
        >
          {item.message}
        </Text>
      ) : null}
    </View>
  );
}

function LoginLogCard({ item }: { item: LoginLogItem }) {
  return (
    <View className="gap-2 rounded-2xl border border-[#dce7f3] bg-white p-4">
      <View className="flex-row items-start justify-between gap-2.5">
        <View className="flex-1">
          <Text numberOfLines={1} className="text-sm font-black text-[#34445b]">
            {item.userName}
          </Text>
          <Text className="mt-1 text-[10px] text-[#8a98aa]">
            登录于 {formatDateTime(item.loginTime)}
            {item.loginIp ? ` · IP ${item.loginIp}` : ''}
          </Text>
        </View>
        <StatusChip status={item.status} />
      </View>
      {item.failReason ? (
        <Text className="rounded-xl bg-[#fff7f7] px-3 py-2 text-[11px] leading-4 text-[#a64b4b]">
          {item.failReason}
        </Text>
      ) : null}
      {item.userAgent ? (
        <Text numberOfLines={1} className="text-[10px] text-[#94a2b5]">
          {item.userAgent}
        </Text>
      ) : null}
    </View>
  );
}
