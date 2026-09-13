import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';

import type { DmsApiError } from '@/features/auth/api-client';
import type { MetricValue, MetricStatus } from '@/features/monitor/types';
import { useMonitorSnapshot } from '@/features/monitor/use-monitor-snapshot';
import { formatDateTime } from '@/utils/format-date-time';

const statusChipStyles: Record<MetricStatus, { background: string; color: string; label: string }> =
  {
    ok: { background: '#e7f8ef', color: '#047857', label: '正常' },
    warning: { background: '#fef3c7', color: '#b45309', label: '警告' },
    danger: { background: '#fee2e2', color: '#b91c1c', label: '危险' },
    unavailable: { background: '#edf1f6', color: '#718198', label: '不可用' },
  };

function MetricCard({ metric }: { metric: MetricValue }) {
  const chip = statusChipStyles[metric.status] ?? statusChipStyles.unavailable;
  return (
    <View className="flex-1 gap-1.5 rounded-2xl border border-[#dce7f3] bg-white p-4">
      <View className="flex-row items-start justify-between gap-2">
        <Text numberOfLines={1} className="flex-1 text-xs font-black text-[#425b7c]">
          {metric.label}
        </Text>
        <View className="rounded-full px-2 py-1" style={{ backgroundColor: chip.background }}>
          <Text className="text-[9px] font-black" style={{ color: chip.color }}>
            {chip.label}
          </Text>
        </View>
      </View>
      <Text className="text-xl font-black text-[#253750]">
        {metric.formattedValue}
        {metric.unit ? (
          <Text className="text-xs font-bold text-[#718198]"> {metric.unit}</Text>
        ) : null}
      </Text>
      {metric.description ? (
        <Text numberOfLines={2} className="text-[10px] leading-4 text-[#8a98aa]">
          {metric.description}
        </Text>
      ) : null}
    </View>
  );
}

function MetricSection({ title, metrics }: { title: string; metrics: MetricValue[] }) {
  if (metrics.length === 0) return null;
  return (
    <View className="gap-3">
      <Text className="text-[10px] font-black tracking-[1.2px] text-[#4c83ed]">{title}</Text>
      <View className="flex-row flex-wrap gap-3">
        {metrics.map((metric) => (
          <View className="min-w-[46%] flex-1" key={metric.key}>
            <MetricCard metric={metric} />
          </View>
        ))}
      </View>
    </View>
  );
}

/**
 * 宿主机监控只读快照：服务端聚合的指标卡，下拉刷新获取最新值。
 *
 * 指标按“宿主机 / 应用容器”分组展示，卡片含取值、单位、健康状态与说明；
 * 监控数据源未连接时在页头提示。
 *
 * @param {object} props - 页面属性。
 * @param {() => void} props.onBackPress - 点击页头返回按钮的回调。
 * @param {(error: DmsApiError) => void | Promise<void>} props.onUnauthorized - 会话失效
 *   回调；快照请求遇到 401 时触发，用于跳转登录。
 * @returns {JSX.Element} 宿主机监控页。
 */
export function MonitorScreen({
  onBackPress,
  onUnauthorized,
}: {
  onBackPress: () => void;
  onUnauthorized: (error: DmsApiError) => void | Promise<void>;
}) {
  const { snapshot, isLoading, error, reload } = useMonitorSnapshot(onUnauthorized);

  return (
    <View className="flex-1 bg-[#f5f9fe]">
      <ScrollView
        contentContainerClassName="gap-4 px-[18px] pb-8 pt-[52px]"
        refreshControl={
          <RefreshControl
            accessibilityLabel="刷新监控快照"
            onRefresh={reload}
            refreshing={isLoading}
            tintColor="#397cf0"
          />
        }
      >
        <View className="flex-row items-center gap-3">
          <Pressable accessibilityLabel="返回" accessibilityRole="button" onPress={onBackPress}>
            <Text className="text-3xl text-[#397cf0]">‹</Text>
          </Pressable>
          <View className="flex-1">
            <Text className="text-xl font-black text-[#253750]">宿主机监控</Text>
            <Text className="mt-1 text-xs text-[#718198]">
              {snapshot?.connected === false ? '监控数据源未连接' : '运行指标只读快照'}
            </Text>
          </View>
        </View>

        {isLoading && !snapshot ? (
          <View className="min-h-[300px] items-center justify-center">
            <ActivityIndicator color="#397cf0" size="large" />
          </View>
        ) : error ? (
          <View className="items-center rounded-2xl border border-[#f1d4d4] bg-white p-8">
            <Text className="text-lg font-black text-[#34445b]">监控快照加载失败</Text>
            <Text className="mt-2 text-center text-xs leading-5 text-[#7b8aa0]">{error}</Text>
            <Pressable
              accessibilityLabel="重新加载监控快照"
              accessibilityRole="button"
              className="mt-5 rounded-xl bg-[#397cf0] px-5 py-3"
              onPress={reload}
            >
              <Text className="text-xs font-black text-white">重新加载</Text>
            </Pressable>
          </View>
        ) : snapshot ? (
          <>
            <Text className="text-[11px] font-bold text-[#7a899d]">
              快照时间 {formatDateTime(snapshot.timestamp)} · 数据保留 {snapshot.retentionDays} 天
            </Text>
            {snapshot.message ? (
              <Text className="rounded-xl bg-[#fffbeb] p-3 text-xs text-[#92400e]">
                {snapshot.message}
              </Text>
            ) : null}
            <MetricSection title="HOST · 宿主机" metrics={snapshot.host} />
            <MetricSection title="APP · 应用容器" metrics={snapshot.nuxt} />
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}
