import { useMemo } from 'react';
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
import { PermissionBadge, getPermissionMeta } from '@/components/PermissionBadge';
import { useDataSourceList } from '@/features/data-source/use-data-source-list';
import type {
  DataSourceListItem,
  DataSourceSortField,
  DataSourceSortOrder,
} from '@/features/data-source/types';
import type { DmsApiError } from '@/features/auth/api-client';
import { formatDateTime } from '@/utils/format-date-time';

type DataSourceSortOption = {
  key: string;
  label: string;
  field: DataSourceSortField;
  order: DataSourceSortOrder;
};

type DataSourceListScreenProps = {
  onBackPress?: () => void;
  onNotificationsPress?: () => void;
  onUnauthorized?: (error: DmsApiError) => void | Promise<void>;
};

const SORT_OPTIONS: readonly DataSourceSortOption[] = [
  { key: 'recently-updated', label: '最近更新', field: 'updateTime', order: 'desc' },
  { key: 'recently-created', label: '最近创建', field: 'createTime', order: 'desc' },
  { key: 'name', label: '名称排序', field: 'sourceName', order: 'asc' },
];

const sourceTypeLabels: Record<DataSourceListItem['sourceType'], string> = {
  mysql: 'MySQL',
  postgresql: 'PostgreSQL',
};

/** 业务数据源展示实际连接目标 host:port，平台托管库展示运行时名称 */
function formatDataSourceTarget(item: DataSourceListItem): string {
  return item.host ? `${item.host}:${item.port ?? ''}` : item.runtimeSourceName;
}

export function DataSourceListScreen({
  onBackPress,
  onNotificationsPress,
  onUnauthorized,
}: DataSourceListScreenProps) {
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
  } = useDataSourceList({ onUnauthorized });
  const { width } = useWindowDimensions();

  const isWide = width >= 760;
  const columnCount = width >= 1080 ? 3 : width >= 700 ? 2 : 1;
  const horizontalPadding = isWide ? 28 : 18;
  const availableWidth = Math.min(width, 1180) - horizontalPadding * 2;
  const cardWidth = (availableWidth - (columnCount - 1) * 16) / columnCount;

  const activeSortKey = useMemo(
    () =>
      SORT_OPTIONS.find((option) => option.field === sort.field && option.order === sort.order)
        ?.key,
    [sort.field, sort.order],
  );

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
            accessibilityLabel="刷新数据源列表"
            onRefresh={() => void refresh()}
            refreshing={isRefreshing}
            tintColor="#397cf0"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View className="w-full max-w-[1180px] self-center">
          <View className={`flex-row items-center justify-between ${isWide ? 'pt-1' : ''}`}>
            <BrandMark compact={!isWide} onPress={onBackPress} />
            <View className="flex-row items-center gap-2">
              {onNotificationsPress && (
                <Pressable
                  accessibilityLabel="打开通知中心"
                  accessibilityRole="button"
                  className="rounded-full border border-[#dce7f4] bg-white/80 px-[11px] py-2"
                  onPress={onNotificationsPress}
                >
                  <Text className="text-[11px] font-extrabold text-[#60718a]">通知</Text>
                </Pressable>
              )}
              <View className="flex-row items-center gap-1.5 rounded-full border border-[#dce7f4] bg-white/80 px-[11px] py-2">
                <View className="h-1.5 w-1.5 rounded-full bg-[#48bd8c]" />
                <Text className="text-[11px] font-extrabold text-[#60718a]">数据源工作区</Text>
              </View>
            </View>
          </View>

          <View
            className={`mt-[45px] gap-5 ${
              isWide ? 'mt-[68px] flex-row items-end justify-between' : ''
            }`}
          >
            <View className="max-w-[690px]">
              <Text className="text-[10px] font-black tracking-[1.2px] text-[#4c83ed]">
                DATA FOUNDATION
              </Text>
              <Text className="mt-[9px] text-4xl font-black tracking-[-1.3px] text-[#172033]">
                数据源列表
              </Text>
              <Text className="mt-3 text-sm leading-[23px] text-[#687990]">
                查看当前账号有权访问的数据源连接，了解分析、看板和数据集背后的数据基础。
              </Text>
            </View>
            <View className="min-w-[120px] self-start rounded-[14px] border border-[#dce7f4] bg-white/80 px-4 py-3 shadow-lg shadow-slate-500/10">
              <Text className="text-[22px] font-black text-[#397bea]">{total}</Text>
              <Text className="mt-0.5 text-[10px] font-bold text-[#718198]">可查看数据源</Text>
            </View>
          </View>

          <View className="mt-[30px] gap-[13px]">
            <View className="min-h-[52px] flex-row items-center rounded-[13px] border border-[#d8e4f2] bg-white px-3.5 shadow-md shadow-slate-500/10">
              <Text className="-mt-0.5 mr-[9px] text-[22px] text-[#6791cf]">⌕</Text>
              <TextInput
                accessibilityLabel="搜索数据源"
                autoCapitalize="none"
                onChangeText={setKeyword}
                placeholder="搜索数据源名称、描述、类型、运行时名称、库名或主机"
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
                  className="h-[26px] w-[26px] items-center justify-center rounded-full bg-[#eef3f9] active:scale-95 active:bg-[#dce8f6]"
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
                ? '正在加载数据源…'
                : `共 ${total} 个数据源，已加载 ${items.length} 个`}
            </Text>
          </View>

          {refreshError && !isInitialLoading && (
            <InlineError message={`刷新失败：${refreshError}`} onRetry={() => void refresh()} />
          )}

          {isInitialLoading ? (
            <View className="flex-row flex-wrap gap-4">
              {Array.from({ length: columnCount * 2 }, (_, index) => (
                <SkeletonCard key={index} width={cardWidth} />
              ))}
            </View>
          ) : initialError ? (
            <ErrorState message={initialError} onRetry={retryInitialLoad} />
          ) : items.length > 0 ? (
            <>
              <View className="flex-row flex-wrap gap-4">
                {items.map((dataSource) => (
                  <DataSourceCard dataSource={dataSource} key={dataSource.id} width={cardWidth} />
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
                    accessibilityLabel="加载更多数据源"
                    accessibilityRole="button"
                    accessibilityState={{ busy: isLoadingMore, disabled: isLoadingMore }}
                    className="mt-2 min-h-11 min-w-[132px] flex-row items-center justify-center gap-2 rounded-xl bg-[#397cf0] px-5 py-3 active:scale-[0.98] active:opacity-80 disabled:opacity-60"
                    disabled={isLoadingMore}
                    onPress={() => void loadMore()}
                  >
                    {isLoadingMore && <ActivityIndicator color="#ffffff" size="small" />}
                    <Text className="text-xs font-black text-white">
                      {isLoadingMore ? '正在加载…' : '加载更多'}
                    </Text>
                  </Pressable>
                ) : (
                  <Text className="mt-2 text-[11px] font-bold text-[#8997aa]">
                    已加载全部数据源
                  </Text>
                )}
              </View>
            </>
          ) : (
            <EmptyState keyword={keyword.trim()} onClear={() => setKeyword('')} />
          )}

          <View className="mt-[22px] flex-row items-start gap-[9px] rounded-xl bg-[#edf5ff] p-3">
            <View className="h-5 w-5 items-center justify-center rounded-full bg-[#d3e7ff]">
              <Text className="text-[11px] font-black text-[#3d78d7]">i</Text>
            </View>
            <Text className="flex-1 text-[10px] leading-4 text-[#657994]">
              列表、搜索、排序、分页与刷新均由 DMS
              服务端处理，展示范围以当前账号的资源权限为准；连接密码不对外暴露。
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function DataSourceCard({ dataSource, width }: { dataSource: DataSourceListItem; width: number }) {
  const permission = getPermissionMeta(dataSource.dataSourcePermission);
  const isDisabled = dataSource.isDisable === 1;
  const updatedAt = formatDateTime(dataSource.updateTime || dataSource.createTime);
  const target = formatDataSourceTarget(dataSource);

  return (
    <View
      accessible
      accessibilityLabel={`${dataSource.sourceName}，${sourceTypeLabels[dataSource.sourceType]} 数据源，${
        isDisabled ? '已禁用' : '已启用'
      }，${permission.label}，连接目标 ${target}，库名 ${
        dataSource.databaseName || '未配置'
      }，创建人 ${dataSource.createdBy || '未知'}，更新于 ${updatedAt}`}
      className="overflow-hidden rounded-[17px] border border-[#d9e5f2] bg-white p-4 shadow-xl shadow-slate-500/10"
      style={{ width }}
    >
      <View className="flex-row items-start justify-between gap-2.5">
        <View className="flex-1">
          <Text numberOfLines={1} className="text-[17px] font-black text-[#253750]">
            {dataSource.sourceName}
          </Text>
          <Text className="mt-1 text-[9px] font-extrabold text-[#7f90a7]">
            {sourceTypeLabels[dataSource.sourceType]} ·{' '}
            {dataSource.connectionMode === 'managed' ? '平台托管' : '自建连接'}
          </Text>
        </View>
        <PermissionBadge permission={dataSource.dataSourcePermission} />
      </View>
      <Text
        numberOfLines={2}
        className="mt-[11px] min-h-[38px] text-xs leading-[19px] text-[#6d7d94]"
      >
        {dataSource.sourceDesc || `${sourceTypeLabels[dataSource.sourceType]} 数据源`}
      </Text>
      <View className="mt-3 flex-row flex-wrap gap-1.5">
        <View className="rounded-full bg-[#edf1f6] px-2 py-1">
          <Text className="text-[9px] font-bold text-[#60738e]">
            {sourceTypeLabels[dataSource.sourceType]}
          </Text>
        </View>
        <View className={`rounded-full px-2 py-1 ${isDisabled ? 'bg-[#edf1f6]' : 'bg-[#e7f8ef]'}`}>
          <Text
            className={`text-[9px] font-black ${isDisabled ? 'text-[#718198]' : 'text-[#047857]'}`}
          >
            {isDisabled ? '已禁用' : '已启用'}
          </Text>
        </View>
        <View className="min-w-0 flex-1 flex-row items-center overflow-hidden rounded-full bg-[#e8f1ff] px-2 py-1">
          <Text numberOfLines={1} className="flex-1 text-[9px] font-bold text-[#2563eb]">
            {target}
          </Text>
        </View>
      </View>
      <View className="my-[13px] h-px bg-[#e8eef6]" />
      <View className="gap-1.5">
        <Text numberOfLines={1} className="text-[10px] font-extrabold text-[#60738e]">
          库名：{dataSource.databaseName || '未配置'}
        </Text>
        <View className="flex-row items-center justify-between gap-2">
          <Text className="text-[9px] text-[#7c8ca2]">创建人 {dataSource.createdBy || '未知'}</Text>
          <Text className="text-[9px] text-[#94a2b5]">更新于 {updatedAt}</Text>
        </View>
      </View>
    </View>
  );
}

function SkeletonCard({ width }: { width: number }) {
  return (
    <View
      accessibilityLabel="正在加载数据源卡片"
      className="rounded-[17px] border border-[#e1e9f3] bg-white p-4"
      style={{ width }}
    >
      <View className="gap-[11px]">
        <View className="h-[18px] w-[58%] rounded-md bg-[#dfe7f0]" />
        <View className="h-[11px] w-full rounded-md bg-[#dfe7f0]" />
        <View className="h-[11px] w-[72%] rounded-md bg-[#dfe7f0]" />
        <View className="mt-1 h-[24px] w-full rounded-full bg-[#eef3f8]" />
      </View>
      <View className="mt-[13px] h-px bg-[#e8eef6]" />
      <View className="mt-[13px] gap-1.5">
        <View className="h-[10px] w-[44%] rounded-md bg-[#dfe7f0]" />
        <View className="h-[9px] w-[64%] rounded-md bg-[#dfe7f0]" />
      </View>
    </View>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <View className="min-h-[300px] items-center justify-center rounded-[18px] border border-[#f1d4d4] bg-white p-8">
      <Text className="text-lg font-black text-[#34445b]">数据源列表加载失败</Text>
      <Text className="mt-2 max-w-[520px] text-center text-xs leading-5 text-[#7b8aa0]">
        {message}
      </Text>
      <Pressable
        accessibilityLabel="重新加载数据源列表"
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

function EmptyState({ keyword, onClear }: { keyword: string; onClear: () => void }) {
  const hasKeyword = keyword.length > 0;

  return (
    <View className="min-h-[330px] items-center rounded-[18px] border border-[#dce7f3] bg-white p-[34px]">
      <View className="mb-[18px] h-[100px] w-[130px]">
        <View className="absolute bottom-0 left-0 h-[82px] w-[102px] flex-row items-end gap-[7px] rounded-[14px] bg-[#eef5fd] p-[13px]">
          {[18, 32, 25, 43].map((height, index) => (
            <View key={index} className="flex-1 rounded bg-[#a8c6f3]" style={{ height }} />
          ))}
        </View>
        <View className="absolute bottom-0 right-0 h-12 w-12 items-center justify-center rounded-full border-4 border-[#78a5ec] bg-white shadow-lg shadow-slate-500/20">
          <Text className="-mt-[3px] text-2xl text-[#4e83df]">⌕</Text>
        </View>
      </View>
      <Text className="text-lg font-black text-[#2b3d57]">
        {hasKeyword ? '没有匹配搜索条件的数据源' : '当前账号没有可查看的数据源'}
      </Text>
      <Text className="mt-2 text-center text-xs text-[#7b8aa0]">
        {hasKeyword ? '请尝试更换关键词或清空搜索。' : '数据源的可见范围由 DMS 资源权限决定。'}
      </Text>
      {hasKeyword && (
        <Pressable
          accessibilityLabel="清空数据源搜索"
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
