import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';

import type { DmsApiError } from '@/features/auth/api-client';
import { usePagedList } from '@/features/common/use-paged-list';
import { fetchKnowledgeBaseList } from '@/features/knowledge/knowledge-api';
import type { KnowledgeBaseItem } from '@/features/knowledge/types';
import { formatDateTime } from '@/utils/format-date-time';

const baseStatusLabels: Record<string, { label: string; color: string; backgroundColor: string }> =
  {
    active: { label: '已启用', color: '#047857', backgroundColor: '#e7f8ef' },
    disabled: { label: '已停用', color: '#718198', backgroundColor: '#edf1f6' },
  };

/** 知识库只读浏览第一层：知识库列表。 */
export function KnowledgeBaseListScreen({
  onBackPress,
  onBasePress,
  onUnauthorized,
}: {
  onBackPress: () => void;
  onBasePress: (base: KnowledgeBaseItem) => void;
  onUnauthorized: (error: DmsApiError) => void | Promise<void>;
}) {
  const {
    items,
    total,
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
  } = usePagedList<KnowledgeBaseItem>(fetchKnowledgeBaseList, {
    onUnauthorized,
    errorLabel: '知识库',
  });

  return (
    <View className="flex-1 bg-[#f5f9fe]">
      <ScrollView
        contentContainerClassName="gap-3 px-[18px] pb-8 pt-[52px]"
        refreshControl={
          <RefreshControl
            accessibilityLabel="刷新知识库列表"
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
            <Text className="text-xl font-black text-[#253750]">知识库</Text>
            <Text className="mt-1 text-xs text-[#718198]">浏览知识库与其文档，只读视图。</Text>
          </View>
        </View>

        <Text accessibilityLiveRegion="polite" className="text-[11px] font-bold text-[#7a899d]">
          {isInitialLoading ? '正在加载知识库…' : `共 ${total} 个知识库，已加载 ${items.length} 个`}
        </Text>

        {isInitialLoading ? (
          <ActivityIndicator color="#397cf0" />
        ) : initialError ? (
          <View className="items-center rounded-2xl border border-[#f1d4d4] bg-white p-8">
            <Text className="text-lg font-black text-[#34445b]">知识库加载失败</Text>
            <Text className="mt-2 text-center text-xs leading-5 text-[#7b8aa0]">
              {initialError}
            </Text>
            <Pressable
              accessibilityLabel="重新加载知识库"
              accessibilityRole="button"
              className="mt-5 rounded-xl bg-[#397cf0] px-5 py-3"
              onPress={retryInitialLoad}
            >
              <Text className="text-xs font-black text-white">重新加载</Text>
            </Pressable>
          </View>
        ) : items.length > 0 ? (
          <>
            {items.map((base) => {
              const status = baseStatusLabels[base.status] ?? baseStatusLabels.disabled;
              return (
                <Pressable
                  accessibilityLabel={`打开知识库 ${base.name}`}
                  accessibilityRole="button"
                  className="rounded-2xl border border-[#dce7f3] bg-white p-4"
                  key={base.id}
                  onPress={() => onBasePress(base)}
                >
                  <View className="flex-row items-start justify-between gap-2.5">
                    <Text numberOfLines={1} className="flex-1 text-base font-black text-[#253750]">
                      {base.name}
                    </Text>
                    <View
                      className="rounded-full px-2 py-1"
                      style={{ backgroundColor: status.backgroundColor }}
                    >
                      <Text className="text-[9px] font-black" style={{ color: status.color }}>
                        {status.label}
                      </Text>
                    </View>
                  </View>
                  <Text numberOfLines={2} className="mt-2 text-xs text-[#718198]">
                    {base.description || '暂无描述'}
                  </Text>
                  <Text className="mt-3 text-[10px] text-[#94a2b5]">
                    编码 {base.code} · 更新于 {formatDateTime(base.updateTime || base.createTime)}
                  </Text>
                </Pressable>
              );
            })}
            <View className="mt-2 items-center">
              {loadMoreError ? (
                <Text
                  accessibilityLiveRegion="assertive"
                  className="mb-2 text-[11px] text-[#a64b4b]"
                >
                  {`加载更多失败：${loadMoreError}`}
                </Text>
              ) : null}
              {hasMore ? (
                <Pressable
                  accessibilityLabel="加载更多知识库"
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
                <Text className="text-[11px] font-bold text-[#8997aa]">已加载全部知识库</Text>
              )}
            </View>
          </>
        ) : (
          <View className="items-center rounded-2xl border border-[#dce7f3] bg-white p-8">
            <Text className="text-lg font-black text-[#2b3d57]">暂无知识库</Text>
          </View>
        )}
        {refreshError && !isInitialLoading ? (
          <Text accessibilityLiveRegion="assertive" className="text-[11px] text-[#a64b4b]">
            {`刷新失败：${refreshError}`}
          </Text>
        ) : null}
      </ScrollView>
    </View>
  );
}
