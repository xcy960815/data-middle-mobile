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
import { useAnalysisList } from '@/features/analysis/use-analysis-list';
import type {
  AnalysisChartType,
  AnalysisListSortField,
  AnalysisListSortOrder,
  AnalysisPermission,
  DmsAnalysisListItem,
} from '@/features/analysis/types';
import type { DmsApiError } from '@/features/auth/api-client';

type AnalysisSortOption = {
  key: string;
  label: string;
  field: AnalysisListSortField;
  order: AnalysisListSortOrder;
};

type AnalysisListScreenProps = {
  onAnalysisPress?: (analysis: DmsAnalysisListItem) => void;
  onBackPress?: () => void;
  onUnauthorized?: (error: DmsApiError) => void | Promise<void>;
};

const SORT_OPTIONS: readonly AnalysisSortOption[] = [
  { key: 'recently-updated', label: '最近更新', field: 'updateTime', order: 'desc' },
  { key: 'recently-created', label: '最近创建', field: 'createTime', order: 'desc' },
  { key: 'most-viewed', label: '访问最多', field: 'viewCount', order: 'desc' },
  { key: 'name', label: '名称排序', field: 'analysisName', order: 'asc' },
];

const CHART_TYPES: readonly AnalysisChartType[] = [
  'table',
  'line',
  'pie',
  'interval',
  'funnel',
  'scatter',
  'area',
  'stacked',
  'combo',
  'kpiCard',
];

const permissionMeta: Record<
  AnalysisPermission,
  { label: string; color: string; backgroundColor: string }
> = {
  none: { label: '无权限', color: '#718198', backgroundColor: '#edf1f6' },
  view: { label: '可查看', color: '#2563eb', backgroundColor: '#e8f1ff' },
  edit: { label: '可编辑', color: '#047857', backgroundColor: '#e7f8ef' },
  manage: { label: '可管理', color: '#7c3aed', backgroundColor: '#f2eaff' },
};

const chartTypeLabels: Record<AnalysisChartType, string> = {
  table: '表格',
  line: '折线图',
  pie: '饼图',
  interval: '柱状图',
  funnel: '漏斗图',
  scatter: '散点图',
  area: '面积图',
  stacked: '堆叠图',
  combo: '组合图',
  kpiCard: '指标卡',
};

function normalizeChartType(chartType?: string | null): AnalysisChartType {
  return CHART_TYPES.includes(chartType as AnalysisChartType)
    ? (chartType as AnalysisChartType)
    : 'table';
}

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

export function AnalysisListScreen({
  onAnalysisPress,
  onBackPress,
  onUnauthorized,
}: AnalysisListScreenProps) {
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
  } = useAnalysisList({ onUnauthorized });
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<number | null>(null);
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
  const selectedAnalysis = items.find((analysis) => analysis.id === selectedAnalysisId);

  const handleAnalysisPress = (analysis: DmsAnalysisListItem) => {
    setSelectedAnalysisId(analysis.id);
    onAnalysisPress?.(analysis);
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
            accessibilityLabel="刷新分析列表"
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
            <View className="flex-row items-center gap-1.5 rounded-full border border-[#dce7f4] bg-white/80 px-[11px] py-2">
              <View className="h-1.5 w-1.5 rounded-full bg-[#48bd8c]" />
              <Text className="text-[11px] font-extrabold text-[#60718a]">分析工作区</Text>
            </View>
          </View>

          <View
            className={`mt-[45px] gap-5 ${
              isWide ? 'mt-[68px] flex-row items-end justify-between' : ''
            }`}
          >
            <View className="max-w-[690px]">
              <Text className="text-[10px] font-black tracking-[1.2px] text-[#4c83ed]">
                VISUAL EXPLORATION
              </Text>
              <Text className="mt-[9px] text-4xl font-black tracking-[-1.3px] text-[#172033]">
                分析列表
              </Text>
              <Text className="mt-3 text-sm leading-[23px] text-[#687990]">
                查看当前账号有权访问的业务分析，快速找到值得持续关注的数据变化与决策线索。
              </Text>
            </View>
            <View className="min-w-[120px] self-start rounded-[14px] border border-[#dce7f4] bg-white/80 px-4 py-3 shadow-lg shadow-slate-500/10">
              <Text className="text-[22px] font-black text-[#397bea]">{total}</Text>
              <Text className="mt-0.5 text-[10px] font-bold text-[#718198]">可查看分析</Text>
            </View>
          </View>

          <View className="mt-[30px] gap-[13px]">
            <View className="min-h-[52px] flex-row items-center rounded-[13px] border border-[#d8e4f2] bg-white px-3.5 shadow-md shadow-slate-500/10">
              <Text className="-mt-0.5 mr-[9px] text-[22px] text-[#6791cf]">⌕</Text>
              <TextInput
                accessibilityLabel="搜索分析"
                autoCapitalize="none"
                onChangeText={setKeyword}
                placeholder="搜索分析名称或描述"
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
              {isInitialLoading ? '正在加载分析…' : `共 ${total} 个分析，已加载 ${items.length} 个`}
            </Text>
            {selectedAnalysis && (
              <Text
                accessibilityLiveRegion="polite"
                className="flex-1 text-right text-[11px] font-extrabold text-[#397bea]"
                numberOfLines={1}
              >
                已选择：{selectedAnalysis.analysisName}
              </Text>
            )}
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
                {items.map((analysis) => (
                  <AnalysisCard
                    analysis={analysis}
                    isSelected={selectedAnalysisId === analysis.id}
                    key={analysis.id}
                    onPress={() => handleAnalysisPress(analysis)}
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
                    accessibilityLabel="加载更多分析"
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
                  <Text className="mt-2 text-[11px] font-bold text-[#8997aa]">已加载全部分析</Text>
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
              列表、搜索、排序、分页与刷新均由 DMS 服务端处理，展示范围以当前账号的资源权限为准。
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function AnalysisCard({
  analysis,
  isSelected,
  onPress,
  width,
}: {
  analysis: DmsAnalysisListItem;
  isSelected: boolean;
  onPress: () => void;
  width: number;
}) {
  const permission = permissionMeta[analysis.analysisPermission ?? 'none'];
  const chartType = normalizeChartType(analysis.chartType);
  const updatedAt = formatDateTime(analysis.updateTime);

  return (
    <Pressable
      accessibilityHint="按下后在当前列表中选择此分析"
      accessibilityLabel={`${analysis.analysisName}，${analysis.analysisDesc || '暂无描述'}，${
        chartTypeLabels[chartType]
      }，${permission.label}，创建人 ${analysis.createdBy || '未知'}，浏览 ${analysis.viewCount} 次，更新于 ${updatedAt}`}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
      className={`overflow-hidden rounded-[17px] border bg-white shadow-xl shadow-slate-500/10 active:scale-[0.985] active:opacity-90 ${
        isSelected ? 'border-[#6d9df4] shadow-blue-500/20' : 'border-[#d9e5f2]'
      }`}
      onPress={onPress}
      style={{ width }}
    >
      <ChartPreview type={chartType} />
      <View className="p-4">
        <View className="flex-row items-start justify-between gap-2.5">
          <View className="flex-1">
            <Text numberOfLines={1} className="text-[17px] font-black text-[#253750]">
              {analysis.analysisName}
            </Text>
            <Text className="mt-1 text-[9px] font-extrabold text-[#7f90a7]">
              {chartTypeLabels[chartType]}
            </Text>
          </View>
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
          numberOfLines={2}
          className="mt-[11px] min-h-[38px] text-xs leading-[19px] text-[#6d7d94]"
        >
          {analysis.analysisDesc || '暂无描述'}
        </Text>
        <View className="my-[13px] h-px bg-[#e8eef6]" />
        <View className="gap-1.5">
          <Text numberOfLines={1} className="text-[10px] font-extrabold text-[#60738e]">
            创建人：{analysis.createdBy || '未知'}
          </Text>
          <View className="flex-row items-center justify-between gap-2">
            <Text className="text-[9px] text-[#7c8ca2]">浏览 {analysis.viewCount} 次</Text>
            <Text className="text-[9px] text-[#94a2b5]">更新于 {updatedAt}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

function ChartPreview({ type }: { type: AnalysisChartType }) {
  if (type === 'pie') return <PiePreview />;
  if (type === 'table') return <TablePreview />;
  if (type === 'kpiCard') return <KpiPreview />;
  if (type === 'funnel') return <FunnelPreview />;
  if (type === 'scatter') return <ScatterPreview />;

  const values = [26, 45, 38, 66, 58, 83, 72, 91];
  const useColumns = type === 'interval' || type === 'stacked' || type === 'combo';

  return (
    <PreviewFrame>
      <PreviewHeader />
      <View className="mt-2.5 flex-1">
        <View className="absolute left-0 right-0 top-[35%] border-t border-[#cfe0f2]" />
        <View className="absolute left-0 right-0 top-[70%] border-t border-[#cfe0f2]" />
        <View className="absolute inset-0 flex-row items-end gap-[7px]">
          {values.map((value, index) => (
            <View key={index} className="h-full flex-1 justify-end">
              <View
                className={`min-h-2 ${
                  useColumns
                    ? 'w-full rounded-t bg-[#78a6f6]'
                    : type === 'area'
                      ? 'w-full rounded-t bg-[#67bdd9] opacity-[0.62]'
                      : 'w-[3px] rounded-sm bg-[#5e91ee] opacity-20'
                }`}
                style={{ height: `${value}%` }}
              />
              {(type === 'line' || type === 'combo') && (
                <View
                  className="absolute -left-0.5 h-2 w-2 rounded-full border-2 border-white bg-[#3f7eea]"
                  style={{ bottom: `${Math.max(0, value - 4)}%` }}
                />
              )}
              {type === 'stacked' && (
                <View
                  className="absolute bottom-0 left-0 right-0 rounded-t bg-[#806de1] opacity-80"
                  style={{ height: `${Math.round(value * 0.38)}%` }}
                />
              )}
            </View>
          ))}
        </View>
      </View>
    </PreviewFrame>
  );
}

function PreviewFrame({ children }: { children: React.ReactNode }) {
  return (
    <View
      accessibilityElementsHidden
      className="h-[150px] overflow-hidden bg-[#eef6ff] p-[15px]"
      importantForAccessibility="no-hide-descendants"
    >
      {children}
    </View>
  );
}

function PreviewHeader() {
  return (
    <View className="z-[2] flex-row items-start justify-between">
      <View>
        <Text className="text-[8px] font-black tracking-[0.8px] text-[#8b9db5]">DATA PREVIEW</Text>
        <Text className="mt-1 text-sm font-black text-[#2c405d]">数据概览</Text>
      </View>
      <View className="rounded-full bg-[#e0f5ea] px-[7px] py-1">
        <Text className="text-[8px] font-black text-[#15805c]">实时列表</Text>
      </View>
    </View>
  );
}

function PiePreview() {
  return (
    <PreviewFrame>
      <PreviewHeader />
      <View className="flex-1 flex-row items-center justify-around pt-1">
        <View className="h-[78px] w-[78px] rotate-[25deg] items-center justify-center rounded-full border-[12px] border-[#4b83ef] border-r-[#a685ee] bg-[#70c8dc]">
          <View className="absolute -right-[13px] top-[3px] h-3.5 w-[13px] rotate-[35deg] bg-[#eef6ff]" />
          <View className="h-12 w-12 -rotate-[25deg] items-center justify-center rounded-full bg-[#eef6ff]">
            <Text className="text-xs font-black text-[#354c6c]">68%</Text>
          </View>
        </View>
        <View className="gap-[7px]">
          <LegendItem color="#4b83ef" label="分类 A" />
          <LegendItem color="#66c6da" label="分类 B" />
          <LegendItem color="#a685ee" label="分类 C" />
        </View>
      </View>
    </PreviewFrame>
  );
}

function TablePreview() {
  return (
    <PreviewFrame>
      <PreviewHeader />
      <View className="mt-3 overflow-hidden rounded-lg border border-[#cfdef0] bg-white/70">
        {[0, 1, 2, 3].map((row) => (
          <View key={row} className="flex-row border-b border-[#dce7f3] last:border-b-0">
            {[42, 31, 27].map((width, column) => (
              <View
                key={column}
                className={`h-[17px] border-r border-[#dce7f3] px-2 py-1 last:border-r-0 ${
                  row === 0 ? 'bg-[#dceaff]' : ''
                }`}
                style={{ width: `${width}%` }}
              >
                <View className="h-1.5 rounded bg-[#8eacd2] opacity-60" />
              </View>
            ))}
          </View>
        ))}
      </View>
    </PreviewFrame>
  );
}

function KpiPreview() {
  return (
    <PreviewFrame>
      <PreviewHeader />
      <View className="flex-1 items-center justify-center">
        <Text className="text-3xl font-black tracking-[-1px] text-[#397cf0]">12,580</Text>
        <Text className="mt-1 text-[9px] font-bold text-[#7b8da5]">核心指标示意</Text>
      </View>
    </PreviewFrame>
  );
}

function FunnelPreview() {
  return (
    <PreviewFrame>
      <PreviewHeader />
      <View className="flex-1 items-center justify-center gap-1.5 pt-2">
        {[100, 78, 56, 36].map((width, index) => (
          <View
            key={width}
            className="h-3 rounded bg-[#5d8feb]"
            style={{ opacity: 1 - index * 0.16, width: `${width}%` }}
          />
        ))}
      </View>
    </PreviewFrame>
  );
}

function ScatterPreview() {
  const points = [
    [12, 18],
    [28, 45],
    [43, 30],
    [57, 65],
    [72, 48],
    [86, 78],
  ];

  return (
    <PreviewFrame>
      <PreviewHeader />
      <View className="mt-2 flex-1 border-b border-l border-[#bfd2e8]">
        {points.map(([left, bottom], index) => (
          <View
            key={left}
            className="absolute h-2.5 w-2.5 rounded-full border-2 border-white bg-[#547fe2]"
            style={{ bottom: `${bottom}%`, left: `${left}%`, opacity: 0.65 + index * 0.05 }}
          />
        ))}
      </View>
    </PreviewFrame>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <View className="flex-row items-center gap-[5px]">
      <View className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
      <Text className="text-[8px] font-bold text-[#71849e]">{label}</Text>
    </View>
  );
}

function SkeletonCard({ width }: { width: number }) {
  return (
    <View
      accessibilityLabel="正在加载分析卡片"
      className="overflow-hidden rounded-[17px] border border-[#e1e9f3] bg-white"
      style={{ width }}
    >
      <View className="h-[150px] bg-[#eef3f8] p-4">
        <View className="h-[17px] w-[100px] rounded-md bg-[#dfe7f0]" />
        <View className="mt-5 h-[82px] flex-row items-end gap-[7px]">
          {[40, 62, 48, 78, 58, 86].map((height, index) => (
            <View key={index} className="flex-1 rounded bg-[#d9e3ee]" style={{ height }} />
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
      <Text className="text-lg font-black text-[#34445b]">分析列表加载失败</Text>
      <Text className="mt-2 max-w-[520px] text-center text-xs leading-5 text-[#7b8aa0]">
        {message}
      </Text>
      <Pressable
        accessibilityLabel="重新加载分析列表"
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
        {hasKeyword ? '没有匹配搜索条件的分析' : '当前账号没有可查看的分析'}
      </Text>
      <Text className="mt-2 text-center text-xs text-[#7b8aa0]">
        {hasKeyword ? '请尝试更换关键词或清空搜索。' : '分析的可见范围由 DMS 资源权限决定。'}
      </Text>
      {hasKeyword && (
        <Pressable
          accessibilityLabel="清空分析搜索"
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
