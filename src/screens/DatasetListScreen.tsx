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
import { BrandMark } from '@/components/BrandMark';
import { PermissionBadge, getPermissionMeta } from '@/components/PermissionBadge';
import type { DmsApiError } from '@/features/auth/api-client';
import type {
  DatasetListItem,
  DatasetListSortField,
  DatasetListSortOrder,
} from '@/features/dataset/types';
import { useDatasetList } from '@/features/dataset/use-dataset-list';
import { formatDateTime } from '@/utils/format-date-time';

type DatasetSortOption = {
  key: string;
  label: string;
  field: DatasetListSortField;
  order: DatasetListSortOrder;
};

const SORT_OPTIONS: readonly DatasetSortOption[] = [
  { key: 'recently-updated', label: '最近更新', field: 'updateTime', order: 'desc' },
  { key: 'recently-created', label: '最近创建', field: 'createTime', order: 'desc' },
  { key: 'name', label: '名称排序', field: 'datasetName', order: 'asc' },
  { key: 'most-viewed', label: '浏览最多', field: 'viewCount', order: 'desc' },
];

/**
 * 数据集列表页：服务端分页/搜索/排序的数据集卡片列表，支持下拉刷新与加载更多。
 *
 * 卡片展示权限标签、启用状态、字段数与浏览次数；顶部提供返回欢迎页、我的账户与通知中心入口。
 *
 * @param {object} props - 页面属性。
 * @param {() => void} [props.onBackPress] - 点击品牌标识回调，由路由层跳回欢迎页。
 * @param {() => void} props.onAccountPress - 点击「我的」按钮回调，跳转我的账户页。
 * @param {() => void} props.onNotificationsPress - 点击「通知」按钮回调，跳转通知中心。
 * @param {(error: DmsApiError) => void | Promise<void>} props.onUnauthorized - 会话失效回调，用于跳转登录。
 * @param {(dataset: DatasetListItem) => void} props.onPress - 点击数据集卡片回调，跳转数据集详情页。
 * @returns {JSX.Element} 数据集列表页。
 */
export function DatasetListScreen({
  onBackPress,
  onAccountPress,
  onNotificationsPress,
  onUnauthorized,
  onPress,
}: {
  onBackPress?: () => void;
  onAccountPress: () => void;
  onNotificationsPress: () => void;
  onUnauthorized: (error: DmsApiError) => void | Promise<void>;
  onPress: (dataset: DatasetListItem) => void;
}) {
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
  } = useDatasetList({ onUnauthorized });

  const activeSortKey = useMemo(
    () =>
      SORT_OPTIONS.find((option) => option.field === sort.field && option.order === sort.order)
        ?.key,
    [sort.field, sort.order],
  );

  return (
    <ScrollView
      contentContainerClassName="gap-3 bg-[#f5f9fe] px-[18px] pb-8 pt-[52px]"
      keyboardShouldPersistTaps="handled"
      refreshControl={
        <RefreshControl
          accessibilityLabel="刷新数据集列表"
          onRefresh={() => void refresh()}
          refreshing={isRefreshing}
          tintColor="#397cf0"
        />
      }
    >
      <View className="flex-row items-center justify-between">
        <BrandMark compact onPress={onBackPress} />
        <View className="flex-row items-center gap-2">
          <Pressable
            accessibilityLabel="打开我的账户"
            accessibilityRole="button"
            className="rounded-full border border-[#dce7f4] bg-white/80 px-[11px] py-2"
            onPress={onAccountPress}
          >
            <Text className="text-[11px] font-extrabold text-[#60718a]">我的</Text>
          </Pressable>
          <Pressable
            accessibilityLabel="打开通知中心"
            accessibilityRole="button"
            className="rounded-full border border-[#dce7f4] bg-white/80 px-[11px] py-2"
            onPress={onNotificationsPress}
          >
            <Text className="text-[11px] font-extrabold text-[#60718a]">通知</Text>
          </Pressable>
        </View>
      </View>
      <Text className="text-3xl font-black text-[#172033]">数据集</Text>
      <Text className="text-sm text-[#687990]">查看已授权的数据集和预览数据。</Text>

      <View className="min-h-[52px] flex-row items-center rounded-[13px] border border-[#d8e4f2] bg-white px-3.5">
        <Text className="-mt-0.5 mr-[9px] text-[22px] text-[#6791cf]">⌕</Text>
        <TextInput
          accessibilityLabel="搜索数据集"
          autoCapitalize="none"
          onChangeText={setKeyword}
          placeholder="搜索数据集名称或描述"
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
              className={`min-h-10 rounded-full border px-[15px] py-2.5 ${
                isActive ? 'border-[#397cf0] bg-[#397cf0]' : 'border-[#dbe6f3] bg-white'
              }`}
              key={option.key}
              onPress={() => setSort({ field: option.field, order: option.order })}
            >
              <Text
                className={`text-xs font-extrabold ${isActive ? 'text-white' : 'text-[#62738b]'}`}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <Text accessibilityLiveRegion="polite" className="text-[11px] font-bold text-[#7a899d]">
        {isInitialLoading ? '正在加载数据集…' : `共 ${total} 个数据集，已加载 ${items.length} 个`}
      </Text>

      {refreshError && !isInitialLoading && (
        <InlineError message={`刷新失败：${refreshError}`} onRetry={() => void refresh()} />
      )}

      {isInitialLoading ? (
        <ActivityIndicator color="#397cf0" />
      ) : initialError ? (
        <View className="items-center rounded-2xl border border-[#f1d4d4] bg-white p-8">
          <Text className="text-lg font-black text-[#34445b]">数据集列表加载失败</Text>
          <Text className="mt-2 text-center text-xs leading-5 text-[#7b8aa0]">{initialError}</Text>
          <Pressable
            accessibilityLabel="重新加载数据集列表"
            accessibilityRole="button"
            className="mt-5 rounded-xl bg-[#397cf0] px-5 py-3"
            onPress={retryInitialLoad}
          >
            <Text className="text-xs font-black text-white">重新加载</Text>
          </Pressable>
        </View>
      ) : items.length > 0 ? (
        <>
          {items.map((dataset) => (
            <DatasetCard dataset={dataset} key={dataset.id} onPress={onPress} />
          ))}
          <View className="mt-2 items-center">
            {loadMoreError && (
              <InlineError
                message={`加载更多失败：${loadMoreError}`}
                onRetry={() => void loadMore()}
              />
            )}
            {hasMore ? (
              <Pressable
                accessibilityLabel="加载更多数据集"
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
              <Text className="text-[11px] font-bold text-[#8997aa]">已加载全部数据集</Text>
            )}
          </View>
        </>
      ) : (
        <View className="items-center rounded-2xl border border-[#dce7f3] bg-white p-8">
          <Text className="text-lg font-black text-[#2b3d57]">
            {keyword.trim() ? '没有匹配搜索条件的数据集' : '当前账号没有可查看的数据集'}
          </Text>
          <Text className="mt-2 text-center text-xs text-[#7b8aa0]">
            {keyword.trim()
              ? '请尝试更换关键词或清空搜索。'
              : '数据集的可见范围由 DMS 资源权限决定。'}
          </Text>
          {keyword.trim() && (
            <Pressable
              accessibilityLabel="清空数据集搜索"
              accessibilityRole="button"
              className="mt-5 rounded-xl bg-[#397cf0] px-5 py-3"
              onPress={() => setKeyword('')}
            >
              <Text className="text-xs font-black text-white">清空搜索</Text>
            </Pressable>
          )}
        </View>
      )}
    </ScrollView>
  );
}

function DatasetCard({
  dataset,
  onPress,
}: {
  dataset: DatasetListItem;
  onPress: (dataset: DatasetListItem) => void;
}) {
  const permission = getPermissionMeta(dataset.datasetPermission);
  const isDisabled = dataset.isDisable === 1;
  const updatedAt = formatDateTime(dataset.updateTime || dataset.createTime);

  return (
    <Pressable
      accessibilityLabel={`${dataset.datasetName}，${permission.label}${isDisabled ? '，已禁用' : ''}，字段 ${dataset.fieldCount} 个`}
      onPress={() => onPress(dataset)}
      className="rounded-2xl border border-[#dce7f3] bg-white p-4"
    >
      <View className="flex-row items-start justify-between gap-2.5">
        <Text numberOfLines={1} className="flex-1 text-base font-black text-[#253750]">
          {dataset.datasetName}
        </Text>
        <PermissionBadge permission={dataset.datasetPermission} />
      </View>
      <Text numberOfLines={2} className="mt-2 text-xs text-[#718198]">
        {dataset.datasetDesc || '暂无描述'}
      </Text>
      <View className="mt-3 flex-row flex-wrap items-center gap-1.5">
        <View className="rounded-full bg-[#edf1f6] px-2 py-1">
          <Text className="text-[9px] font-bold text-[#60738e]">字段 {dataset.fieldCount} 个</Text>
        </View>
        <View className={`rounded-full px-2 py-1 ${isDisabled ? 'bg-[#edf1f6]' : 'bg-[#e7f8ef]'}`}>
          <Text
            className={`text-[9px] font-black ${isDisabled ? 'text-[#718198]' : 'text-[#047857]'}`}
          >
            {isDisabled ? '已禁用' : '已启用'}
          </Text>
        </View>
        <View className="rounded-full bg-[#edf1f6] px-2 py-1">
          <Text className="text-[9px] font-bold text-[#60738e]">浏览 {dataset.viewCount} 次</Text>
        </View>
      </View>
      <View className="mt-3 flex-row items-center justify-between gap-2">
        <Text className="text-[9px] text-[#7c8ca2]">创建人 {dataset.createdBy || '未知'}</Text>
        <Text className="text-[9px] text-[#94a2b5]">更新于 {updatedAt}</Text>
      </View>
    </Pressable>
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
        className="rounded-lg bg-white px-3 py-2"
        onPress={onRetry}
      >
        <Text className="text-[10px] font-black text-[#397cf0]">重试</Text>
      </Pressable>
    </View>
  );
}
