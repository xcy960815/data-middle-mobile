import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';

import type { DmsApiError } from '@/features/auth/api-client';
import {
  useResourceHistory,
  type ResourceHistoryEntry,
  type ResourceHistoryType,
} from '@/features/resource/use-resource-history';

const resourceTypeLabels: Record<ResourceHistoryType, string> = {
  analysis: '分析',
  dashboard: '看板',
  dataset: '数据集',
};

function formatDateTime(value: string): string {
  const parsedDate = new Date(value.trim().replace(' ', 'T'));
  if (Number.isNaN(parsedDate.getTime())) return '时间未知';

  const pad = (part: number) => String(part).padStart(2, '0');
  return `${parsedDate.getFullYear()}-${pad(parsedDate.getMonth() + 1)}-${pad(
    parsedDate.getDate(),
  )} ${pad(parsedDate.getHours())}:${pad(parsedDate.getMinutes())}`;
}

function VersionDetailText({ entry }: { entry: ResourceHistoryEntry }) {
  if (entry.type === 'analysis') {
    const { item } = entry;
    const datasetLabel =
      item.commonChartConfig?.datasetName ||
      (item.datasetId ? `数据集 #${item.datasetId}` : '未绑定');
    return <Text className="mt-2 text-xs text-[#8a98aa]">数据集 {datasetLabel}</Text>;
  }
  if (entry.type === 'dashboard') {
    return <Text className="mt-2 text-xs text-[#8a98aa]">组件 {entry.item.widgetCount} 个</Text>;
  }
  return <Text className="mt-2 text-xs text-[#8a98aa]">数据源 #{entry.item.dataSourceId}</Text>;
}

type Props = {
  type: ResourceHistoryType;
  resourceId: number;
  currentConfigId: number;
  onBackPress: () => void;
  onUnauthorized?: (error: DmsApiError) => void | Promise<void>;
};

export function ResourceHistoryScreen({
  type,
  resourceId,
  currentConfigId,
  onBackPress,
  onUnauthorized,
}: Props) {
  const { entries, isLoading, error, reload } = useResourceHistory(
    type,
    resourceId,
    currentConfigId,
    onUnauthorized,
  );

  return (
    <View className="flex-1 bg-[#f5f9fe]">
      <ScrollView
        contentContainerClassName="gap-4 px-[18px] pb-8 pt-[52px]"
        refreshControl={
          <RefreshControl onRefresh={reload} refreshing={isLoading} tintColor="#397cf0" />
        }
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-center gap-3">
          <Pressable
            accessibilityLabel="返回详情页"
            accessibilityRole="button"
            onPress={onBackPress}
          >
            <Text className="text-3xl text-[#397cf0]">‹</Text>
          </Pressable>
          <View className="flex-1">
            <Text className="text-xl font-black text-[#253750]">历史版本</Text>
            <Text className="mt-1 text-xs text-[#718198]">
              {resourceTypeLabels[type]} #{resourceId} · 仅查看，不支持切换
            </Text>
          </View>
        </View>

        {isLoading && entries.length === 0 ? (
          <View className="min-h-[240px] items-center justify-center gap-3">
            <ActivityIndicator color="#397cf0" size="large" />
            <Text className="text-sm font-bold text-[#687990]">正在加载历史版本…</Text>
          </View>
        ) : error ? (
          <View className="items-center rounded-2xl border border-[#f1d4d4] bg-white p-8">
            <Text className="text-lg font-black text-[#34445b]">历史版本加载失败</Text>
            <Text className="mt-2 text-center text-xs leading-5 text-[#7b8aa0]">{error}</Text>
            <Pressable className="mt-5 rounded-xl bg-[#397cf0] px-5 py-3" onPress={reload}>
              <Text className="text-xs font-black text-white">重新加载</Text>
            </Pressable>
          </View>
        ) : entries.length === 0 ? (
          <View className="items-center rounded-2xl border border-[#dce7f3] bg-white p-8">
            <Text className="text-base font-black text-[#34445b]">暂无历史版本</Text>
            <Text className="mt-2 text-center text-xs text-[#7b8aa0]">
              每次保存配置都会生成一个新版本。
            </Text>
          </View>
        ) : (
          entries.map((entry) => {
            const isCurrent = entry.item.id === currentConfigId;
            return (
              <View
                key={entry.item.id}
                className={`rounded-2xl border bg-white p-4 ${
                  isCurrent ? 'border-[#9fd7bd] bg-[#f4fcf8]' : 'border-[#dce7f3]'
                }`}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-2">
                    <Text className="text-base font-black text-[#253750]">
                      v{entry.item.versionNo}
                    </Text>
                    {isCurrent ? (
                      <View className="rounded-full bg-[#e7f8ef] px-2 py-0.5">
                        <Text className="text-[10px] font-black text-[#047857]">当前版本</Text>
                      </View>
                    ) : null}
                  </View>
                  <Text className="text-[11px] font-bold text-[#8a98aa]">
                    {formatDateTime(entry.item.createTime)}
                  </Text>
                </View>
                <VersionDetailText entry={entry} />
                <Text className="mt-2 text-[11px] text-[#8a98aa]">
                  创建人 {entry.item.createdBy}
                </Text>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}
