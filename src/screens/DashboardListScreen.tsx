import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';

import { BrandMark } from '@/components/BrandMark';
import type { DmsApiError } from '@/features/auth/api-client';
import type {
  DashboardListItem,
  DashboardListSortField,
  DashboardListSortOrder,
  DashboardPermission,
} from '@/features/dashboard/types';
import { useDashboardList } from '@/features/dashboard/use-dashboard-list';

type DashboardSortOption = {
  key: string;
  label: string;
  field: DashboardListSortField;
  order: DashboardListSortOrder;
};

type DashboardListScreenProps = {
  onBackPress?: () => void;
  onDashboardPress?: (dashboard: DashboardListItem) => void;
  onUnauthorized?: (error: DmsApiError) => void | Promise<void>;
};

const SORT_OPTIONS: readonly DashboardSortOption[] = [
  { key: 'recently-updated', label: '最近更新', field: 'updateTime', order: 'desc' },
  { key: 'recently-created', label: '最近创建', field: 'createTime', order: 'desc' },
  { key: 'most-viewed', label: '访问最多', field: 'viewCount', order: 'desc' },
  { key: 'name', label: '名称排序', field: 'dashboardName', order: 'asc' },
];

const permissionMeta: Record<
  DashboardPermission,
  { label: string; color: string; backgroundColor: string }
> = {
  none: { label: '无权限', color: '#718198', backgroundColor: '#edf1f6' },
  view: { label: '可查看', color: '#2563eb', backgroundColor: '#e8f1ff' },
  edit: { label: '可编辑', color: '#047857', backgroundColor: '#e7f8ef' },
  manage: { label: '可管理', color: '#7c3aed', backgroundColor: '#f2eaff' },
};

function formatDateTime(value?: string | null): string {
  const trimmedValue = value?.trim();
  if (!trimmedValue) return '时间未知';

  const parsedDate = new Date(trimmedValue.replace(' ', 'T'));
  if (Number.isNaN(parsedDate.getTime())) return '时间未知';

  const pad = (part: number) => String(part).padStart(2, '0');
  return `${pad(parsedDate.getMonth() + 1)}-${pad(parsedDate.getDate())} ${pad(
    parsedDate.getHours(),
  )}:${pad(parsedDate.getMinutes())}`;
}

export function DashboardListScreen({
  onBackPress,
  onDashboardPress,
  onUnauthorized,
}: DashboardListScreenProps) {
  const {
    items,
    total,
    keyword,
    setKeyword,
    sort,
    setSort,
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
  } = useDashboardList({ onUnauthorized });
  const [selectedDashboardId, setSelectedDashboardId] = useState<number | null>(null);
  const { width } = useWindowDimensions();

  const isWide = width >= 760;
  const columnCount = width >= 1120 ? 3 : width >= 720 ? 2 : 1;
  const horizontalPadding = isWide ? 28 : 18;
  const availableWidth = Math.min(width, 1200) - horizontalPadding * 2;
  const cardWidth = (availableWidth - (columnCount - 1) * 16) / columnCount;
  const loadedWidgetCount = items.reduce((sum, dashboard) => sum + dashboard.widgetCount, 0);
  const showSkeleton = isInitialLoading && items.length === 0 && !initialError;

  const activeSortKey = useMemo(
    () =>
      SORT_OPTIONS.find((option) => option.field === sort.field && option.order === sort.order)
        ?.key,
    [sort.field, sort.order],
  );
  const selectedDashboard = items.find((dashboard) => dashboard.id === selectedDashboardId);

  const handleDashboardPress = (dashboard: DashboardListItem) => {
    setSelectedDashboardId(dashboard.id);
    onDashboardPress?.(dashboard);
  };

  return (
    <View className="flex-1 bg-[#f5f9fe]">
      <View
        pointerEvents="none"
        className="absolute -right-[130px] -top-[190px] h-[360px] w-[360px] rounded-[340px] bg-[#d7ebff] opacity-[0.72]"
      />
      <View
        pointerEvents="none"
        className="absolute left-0 right-0 top-0 h-[270px] border border-[#dce8f7] opacity-55"
      />
      <ScrollView
        contentContainerClassName="pb-[34px] pt-[50px]"
        contentContainerStyle={{ paddingHorizontal: horizontalPadding }}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            accessibilityLabel="刷新看板列表"
            onRefresh={() => void refresh()}
            refreshing={isRefreshing}
            tintColor="#397cf0"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View className="w-full max-w-[1200px] self-center">
          <View className="flex-row items-center justify-between">
            <BrandMark compact={!isWide} onPress={onBackPress} />
            <View className="flex-row items-center gap-1.5 rounded-full border border-[#dce7f4] bg-white/80 px-[11px] py-2">
              <View className="h-1.5 w-1.5 rounded-full bg-[#48bd8c]" />
              <Text className="text-[11px] font-extrabold text-[#60718a]">看板工作区</Text>
            </View>
          </View>

          <View
            className={`mt-[45px] gap-5 ${
              isWide ? 'mt-[68px] flex-row items-end justify-between' : ''
            }`}
          >
            <View className="max-w-[720px]">
              <Text className="text-[10px] font-black tracking-[1.2px] text-[#4c83ed]">
                DECISION WORKSPACE
              </Text>
              <Text className="mt-[9px] text-4xl font-black tracking-[-1.3px] text-[#172033]">
                看板列表
              </Text>
              <Text className="mt-3 text-sm leading-[23px] text-[#687990]">
                查看当前账号有权访问的业务看板，在统一可见范围内快速掌握可用的数据资产。
              </Text>
            </View>
            <View className="flex-row self-start rounded-[14px] border border-[#dce7f4] bg-white/80 px-[17px] py-[13px] shadow-lg shadow-slate-500/10">
              <View>
                <Text className="text-[22px] font-black text-[#397bea]">{total}</Text>
                <Text className="mt-0.5 text-[10px] font-bold text-[#718198]">看板总数</Text>
              </View>
              <View className="mx-[17px] h-[34px] w-px bg-[#e1e9f2]" />
              <View>
                <Text className="text-[22px] font-black text-[#7157cf]">{items.length}</Text>
                <Text className="mt-0.5 text-[10px] font-bold text-[#718198]">已加载</Text>
              </View>
              <View className="mx-[17px] h-[34px] w-px bg-[#e1e9f2]" />
              <View>
                <Text className="text-[22px] font-black text-[#168264]">{loadedWidgetCount}</Text>
                <Text className="mt-0.5 text-[10px] font-bold text-[#718198]">已加载组件</Text>
              </View>
            </View>
          </View>

          <View className="mt-[30px] gap-[13px]">
            <View className="min-h-[52px] flex-row items-center rounded-[13px] border border-[#d8e4f2] bg-white px-3.5 shadow-md shadow-slate-500/10">
              <Text className="-mt-0.5 mr-[9px] text-[22px] text-[#6791cf]">⌕</Text>
              <TextInput
                accessibilityLabel="搜索看板"
                autoCapitalize="none"
                className="flex-1 py-[13px] text-sm text-[#263850]"
                onChangeText={setKeyword}
                placeholder="搜索看板名称或描述"
                placeholderTextColor="#91a0b4"
                returnKeyType="search"
                value={keyword}
              />
              {keyword.length > 0 && (
                <Pressable
                  accessibilityLabel="清空看板搜索"
                  accessibilityRole="button"
                  className="h-[26px] w-[26px] items-center justify-center rounded-full bg-[#eef3f9] active:scale-95 active:bg-[#dce8f6]"
                  hitSlop={8}
                  onPress={() => setKeyword('')}
                >
                  <Text className="text-xl leading-[21px] text-[#64758b]">×</Text>
                </Pressable>
              )}
            </View>

            <ScrollView
              contentContainerClassName="gap-2 pr-2"
              horizontal
              showsHorizontalScrollIndicator={false}
            >
              {SORT_OPTIONS.map((option) => {
                const isActive = activeSortKey === option.key;
                return (
                  <Pressable
                    accessibilityLabel={`排序：${option.label}`}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isActive }}
                    className={`min-h-10 rounded-full border px-[15px] py-2.5 active:scale-[0.97] active:opacity-80 ${
                      isActive
                        ? 'border-[#397cf0] bg-[#397cf0] shadow-md shadow-blue-500/20'
                        : 'border-[#dbe6f3] bg-white'
                    }`}
                    key={option.key}
                    onPress={() => setSort({ field: option.field, order: option.order })}
                  >
                    <Text
                      className={`text-xs font-extrabold ${
                        isActive ? 'text-white' : 'text-[#62738b]'
                      }`}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          <View className="mb-3 mt-6 min-h-5 flex-row items-center justify-between gap-3">
            <Text accessibilityLiveRegion="polite" className="text-[11px] font-bold text-[#7a899d]">
              {isInitialLoading
                ? items.length > 0
                  ? '正在更新看板列表…'
                  : '正在加载看板…'
                : `共 ${total} 个看板，已加载 ${items.length} 个`}
            </Text>
            {selectedDashboard && (
              <Text
                accessibilityLiveRegion="polite"
                className="flex-1 text-right text-[11px] font-extrabold text-[#397bea]"
                numberOfLines={1}
              >
                已选择：{selectedDashboard.dashboardName} · 详情暂未开放
              </Text>
            )}
          </View>

          {refreshError && !showSkeleton && (
            <InlineError message={`刷新失败：${refreshError}`} onRetry={() => void refresh()} />
          )}
          {initialError && items.length > 0 && (
            <InlineError message={`更新失败：${initialError}`} onRetry={retryInitialLoad} />
          )}

          {showSkeleton ? (
            <View className="flex-row flex-wrap gap-4">
              {Array.from({ length: columnCount * 2 }, (_, index) => (
                <DashboardSkeleton key={index} width={cardWidth} />
              ))}
            </View>
          ) : initialError && items.length === 0 ? (
            <ErrorState message={initialError} onRetry={retryInitialLoad} />
          ) : items.length > 0 ? (
            <>
              <View className="flex-row flex-wrap gap-4">
                {items.map((dashboard) => (
                  <DashboardCard
                    dashboard={dashboard}
                    isSelected={selectedDashboardId === dashboard.id}
                    key={dashboard.id}
                    onPress={() => handleDashboardPress(dashboard)}
                    width={cardWidth}
                  />
                ))}
              </View>
              <View className="mt-5 items-center">
                {loadMoreError && (
                  <InlineError
                    message={`加载更多失败：${loadMoreError}`}
                    onRetry={() => void loadMore()}
                  />
                )}
                {hasMore ? (
                  <Pressable
                    accessibilityLabel="加载更多看板"
                    accessibilityRole="button"
                    accessibilityState={{ busy: isLoadingMore, disabled: isLoadingMore }}
                    className="mt-2 min-h-11 min-w-[152px] flex-row items-center justify-center gap-2 rounded-xl bg-[#397cf0] px-5 py-3 active:scale-[0.98] active:opacity-80 disabled:opacity-60"
                    disabled={isLoadingMore}
                    onPress={() => void loadMore()}
                  >
                    {isLoadingMore && <ActivityIndicator color="#ffffff" size="small" />}
                    <Text className="text-xs font-black text-white">
                      {isLoadingMore ? '正在加载更多…' : '加载更多'}
                    </Text>
                  </Pressable>
                ) : (
                  <Text className="mt-2 text-[11px] font-bold text-[#8997aa]">已加载全部看板</Text>
                )}
              </View>
            </>
          ) : (
            <DashboardEmptyState keyword={keyword.trim()} onClear={() => setKeyword('')} />
          )}

          <View className="mt-[22px] flex-row items-start gap-[9px] rounded-xl bg-[#edf5ff] p-3">
            <View className="h-5 w-5 items-center justify-center rounded-full bg-[#d3e7ff]">
              <Text className="text-[11px] font-black text-[#3d78d7]">i</Text>
            </View>
            <Text className="flex-1 text-[10px] leading-4 text-[#657994]">
              列表、搜索、排序、分页与刷新均由 DMS 服务端处理，权限标签和可见范围以当前账号为准。
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function DashboardCard({
  dashboard,
  isSelected,
  onPress,
  width,
}: {
  dashboard: DashboardListItem;
  isSelected: boolean;
  onPress: () => void;
  width: number;
}) {
  const permission = permissionMeta[dashboard.dashboardPermission ?? 'none'];
  const updatedAt = formatDateTime(dashboard.updateTime);
  const createdAt = formatDateTime(dashboard.createTime);
  const creator = dashboard.createdBy?.trim() || '未知';
  const updater = dashboard.updatedBy?.trim() || '未知';

  return (
    <Pressable
      accessibilityHint="按下后在当前列表中选择此看板"
      accessibilityLabel={`${dashboard.dashboardName}，${dashboard.dashboardDesc || '暂无描述'}，${permission.label}，创建人 ${creator}，更新人 ${updater}，${dashboard.widgetCount} 个组件，访问 ${dashboard.viewCount} 次，更新于 ${updatedAt}`}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
      className={`overflow-hidden rounded-[17px] border bg-white shadow-xl shadow-slate-500/10 active:scale-[0.985] active:opacity-90 ${
        isSelected ? 'border-[#6d9df4] shadow-blue-500/20' : 'border-[#d9e5f2]'
      }`}
      onPress={onPress}
      style={{ width }}
    >
      <DashboardPlaceholder />
      <View className="p-4">
        <View className="flex-row items-start justify-between gap-2.5">
          <Text className="flex-1 text-[17px] font-black text-[#253750]" numberOfLines={1}>
            {dashboard.dashboardName}
          </Text>
          <View
            className="rounded-full px-2 py-1"
            style={{ backgroundColor: permission.backgroundColor }}
          >
            <Text className="text-[9px] font-black" style={{ color: permission.color }}>
              {permission.label}
            </Text>
          </View>
        </View>
        <Text
          className="mt-[11px] min-h-[38px] text-xs leading-[19px] text-[#6d7d94]"
          numberOfLines={2}
        >
          {dashboard.dashboardDesc || '暂无描述'}
        </Text>
        <View className="mt-3 flex-row flex-wrap gap-2">
          <View className="rounded-full bg-[#edf4ff] px-2.5 py-1.5">
            <Text className="text-[9px] font-extrabold text-[#3974cf]">
              {dashboard.widgetCount} 个组件
            </Text>
          </View>
          <View className="rounded-full bg-[#eef8f4] px-2.5 py-1.5">
            <Text className="text-[9px] font-extrabold text-[#278068]">
              访问 {dashboard.viewCount} 次
            </Text>
          </View>
        </View>
        <View className="my-[13px] h-px bg-[#e8eef6]" />
        <View className="gap-1.5">
          <Text className="text-[10px] font-extrabold text-[#60738e]" numberOfLines={1}>
            创建人：{creator} · 更新人：{updater}
          </Text>
          <View className="flex-row items-center justify-between gap-2">
            <Text className="text-[9px] text-[#7c8ca2]">创建于 {createdAt}</Text>
            <Text className="text-[9px] text-[#94a2b5]">更新于 {updatedAt}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

function DashboardPlaceholder() {
  return (
    <View
      accessibilityElementsHidden
      className="h-[154px] overflow-hidden bg-[#edf6ff] p-4"
      importantForAccessibility="no-hide-descendants"
    >
      <View className="flex-row gap-3">
        <View className="h-12 flex-[1.2] rounded-xl border border-[#d4e4f5] bg-white/80 p-3">
          <View className="h-2 w-12 rounded-full bg-[#b7cfef]" />
          <View className="mt-2 h-2 w-20 rounded-full bg-[#d4e2f2]" />
        </View>
        <View className="h-12 flex-1 rounded-xl border border-[#d4e4f5] bg-white/80 p-3">
          <View className="h-2 w-10 rounded-full bg-[#b9dddc]" />
          <View className="mt-2 h-2 w-16 rounded-full bg-[#d4e7e7]" />
        </View>
      </View>
      <View className="mt-3 flex-1 flex-row items-end gap-2 rounded-xl border border-[#d4e4f5] bg-white/70 px-3 pt-3">
        {[34, 56, 43, 70, 52, 80, 64].map((height, index) => (
          <View
            className="flex-1 rounded-t bg-[#8eb2ea] opacity-70"
            key={index}
            style={{ height }}
          />
        ))}
      </View>
    </View>
  );
}

function DashboardSkeleton({ width }: { width: number }) {
  return (
    <View
      accessibilityLabel="正在加载看板卡片"
      className="overflow-hidden rounded-[17px] border border-[#e1e9f3] bg-white"
      style={{ width }}
    >
      <View className="h-[154px] bg-[#eef3f8] p-4">
        <View className="h-12 rounded-xl bg-[#dfe7f0]" />
        <View className="mt-3 h-[72px] flex-row items-end gap-[7px]">
          {[40, 62, 48, 78, 58, 86].map((height, index) => (
            <View className="flex-1 rounded bg-[#d9e3ee]" key={index} style={{ height }} />
          ))}
        </View>
      </View>
      <View className="gap-[11px] p-4">
        <View className="h-[18px] w-[58%] rounded-md bg-[#dfe7f0]" />
        <View className="h-[11px] w-full rounded-md bg-[#dfe7f0]" />
        <View className="h-[11px] w-[72%] rounded-md bg-[#dfe7f0]" />
      </View>
    </View>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <View className="min-h-[300px] items-center justify-center rounded-[18px] border border-[#f1d4d4] bg-white p-8">
      <Text className="text-lg font-black text-[#34445b]">看板列表加载失败</Text>
      <Text className="mt-2 max-w-[520px] text-center text-xs leading-5 text-[#7b8aa0]">
        {message}
      </Text>
      <Pressable
        accessibilityLabel="重新加载看板列表"
        accessibilityRole="button"
        className="mt-5 rounded-[10px] bg-[#397cf0] px-4 py-[11px] active:scale-[0.97] active:opacity-80"
        onPress={onRetry}
      >
        <Text className="text-xs font-black text-white">重新加载</Text>
      </Pressable>
    </View>
  );
}

function InlineError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <View className="mb-3 w-full flex-row items-center gap-3 rounded-xl border border-[#f2d3d3] bg-[#fff7f7] p-3">
      <Text
        accessibilityLiveRegion="assertive"
        className="flex-1 text-[11px] leading-4 text-[#a64b4b]"
      >
        {message}
      </Text>
      <Pressable
        accessibilityLabel="重试"
        accessibilityRole="button"
        className="rounded-lg bg-white px-3 py-2 active:opacity-70"
        onPress={onRetry}
      >
        <Text className="text-[10px] font-black text-[#397cf0]">重试</Text>
      </Pressable>
    </View>
  );
}

function DashboardEmptyState({ keyword, onClear }: { keyword: string; onClear: () => void }) {
  const hasKeyword = keyword.length > 0;

  return (
    <View className="min-h-[330px] items-center rounded-[18px] border border-[#dce7f3] bg-white p-[34px]">
      <View className="mb-[18px] h-[100px] w-[130px]">
        <View className="absolute bottom-0 left-0 h-[82px] w-[102px] flex-row items-end gap-[7px] rounded-[14px] bg-[#eef5fd] p-[13px]">
          {[18, 32, 25, 43].map((height, index) => (
            <View className="flex-1 rounded bg-[#a8c6f3]" key={index} style={{ height }} />
          ))}
        </View>
        <View className="absolute bottom-0 right-0 h-12 w-12 items-center justify-center rounded-full border-4 border-[#78a5ec] bg-white shadow-lg shadow-slate-500/20">
          <Text className="-mt-[3px] text-2xl text-[#4e83df]">⌕</Text>
        </View>
      </View>
      <Text className="text-lg font-black text-[#2b3d57]">
        {hasKeyword ? '没有找到匹配的看板' : '当前账号暂无可查看的看板'}
      </Text>
      <Text className="mt-2 text-center text-xs text-[#7b8aa0]">
        {hasKeyword ? '请尝试更换关键词或清空搜索。' : '看板可见范围由 DMS 资源权限决定。'}
      </Text>
      {hasKeyword && (
        <Pressable
          accessibilityLabel="清空看板搜索"
          accessibilityRole="button"
          className="mt-5 rounded-[10px] bg-[#397cf0] px-4 py-[11px] active:scale-[0.97] active:opacity-80"
          onPress={onClear}
        >
          <Text className="text-xs font-black text-white">清空搜索</Text>
        </Pressable>
      )}
    </View>
  );
}
