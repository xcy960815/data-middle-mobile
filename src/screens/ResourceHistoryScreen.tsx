import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';

import type { DmsApiError } from '@/features/auth/api-client';
import {
  useResourceHistory,
  type ResourceHistoryEntry,
  type ResourceHistoryType,
} from '@/features/resource/use-resource-history';
import { formatDateTime } from '@/utils/format-date-time';

const resourceTypeLabels: Record<ResourceHistoryType, string> = {
  analysis: '分析',
  dashboard: '看板',
  dataset: '数据集',
};

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

/** 历史版本页属性。 */
type Props = {
  type: ResourceHistoryType;
  resourceId: number;
  /** 当前生效的配置版本 id，用于在列表中标记当前版本。 */
  currentConfigId: number;
  onBackPress: () => void;
  onUnauthorized?: (error: DmsApiError) => void | Promise<void>;
};

/**
 * 历史版本页：按资源类型查看分析、看板或数据集的历史配置版本列表，仅查看、不支持切换。
 *
 * 每个条目展示版本号、创建时间与创建人，与 currentConfigId 一致的条目标记为当前版本，
 * 并按资源类型展示绑定的数据集、组件数量或数据源等差异信息。
 *
 * @param {Props} props - 页面属性。
 * @param {ResourceHistoryType} props.type - 资源类型：analysis 分析、dashboard 看板、
 *   dataset 数据集，决定请求哪个模块的历史接口。
 * @param {number} props.resourceId - 资源 id。
 * @param {number} props.currentConfigId - 当前生效的配置版本 id，用于标记当前版本。
 * @param {() => void} props.onBackPress - 点击页头返回按钮的回调，用于返回资源详情页。
 * @param {(error: DmsApiError) => void | Promise<void>} [props.onUnauthorized] - 会话失效
 *   回调；历史请求遇到 401 时触发，用于跳转登录。
 * @returns {JSX.Element} 历史版本页。
 */
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
