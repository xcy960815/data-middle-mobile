import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, useWindowDimensions, View } from 'react-native';

import { BrandMark } from '../components/BrandMark';

type AnalysisPermission = 'view' | 'edit' | 'manage' | 'none';
type AnalysisFilter = 'all' | 'viewable' | 'recent';
type ChartType = 'line' | 'bar' | 'donut' | 'area';

export type AnalysisListItem = {
  id: string;
  name: string;
  description: string;
  datasetName: string;
  chartType: ChartType;
  updatedAt: string;
  permission: AnalysisPermission;
  isRecent: boolean;
};

type AnalysisListScreenProps = {
  analyses?: readonly AnalysisListItem[];
  onAnalysisPress?: (analysis: AnalysisListItem) => void;
  onBackPress?: () => void;
};

const MOCK_ANALYSES: readonly AnalysisListItem[] = [
  {
    id: 'sales-trend',
    name: '经营销售趋势',
    description: '追踪销售额、订单量与客单价的月度变化，快速识别增长拐点。',
    datasetName: '销售经营主题数据集',
    chartType: 'line',
    updatedAt: '今天 10:32',
    permission: 'manage',
    isRecent: true,
  },
  {
    id: 'regional-orders',
    name: '区域订单结构',
    description: '对比各区域的订单规模与完成率，定位市场表现差异。',
    datasetName: '订单履约数据集',
    chartType: 'bar',
    updatedAt: '昨天 16:08',
    permission: 'edit',
    isRecent: true,
  },
  {
    id: 'channel-contribution',
    name: '渠道贡献占比',
    description: '查看直营、电商与合作渠道的收入贡献及结构变化。',
    datasetName: '全渠道收入数据集',
    chartType: 'donut',
    updatedAt: '07-12 09:20',
    permission: 'view',
    isRecent: true,
  },
  {
    id: 'customer-conversion',
    name: '客户分层转化',
    description: '观察不同客户层级从线索到成交的转化表现。',
    datasetName: '客户增长数据集',
    chartType: 'area',
    updatedAt: '07-04 14:46',
    permission: 'view',
    isRecent: false,
  },
  {
    id: 'inventory-turnover',
    name: '库存周转监测',
    description: '结合库存金额和周转天数，发现积压风险与补货机会。',
    datasetName: '供应链库存数据集',
    chartType: 'line',
    updatedAt: '06-28 11:15',
    permission: 'view',
    isRecent: false,
  },
  {
    id: 'campaign-roi',
    name: '营销活动 ROI',
    description: '衡量重点活动的投入产出与新增客户贡献。',
    datasetName: '营销活动归因数据集',
    chartType: 'bar',
    updatedAt: '06-21 18:02',
    permission: 'none',
    isRecent: false,
  },
];

const FILTERS: readonly { key: AnalysisFilter; label: string }[] = [
  { key: 'all', label: '全部分析' },
  { key: 'viewable', label: '我可查看' },
  { key: 'recent', label: '最近更新' },
];

const permissionMeta: Record<
  AnalysisPermission,
  { label: string; color: string; backgroundColor: string }
> = {
  view: { label: '可查看', color: '#2563eb', backgroundColor: '#e8f1ff' },
  edit: { label: '可编辑', color: '#047857', backgroundColor: '#e7f8ef' },
  manage: { label: '可管理', color: '#7c3aed', backgroundColor: '#f2eaff' },
  none: { label: '待授权', color: '#718198', backgroundColor: '#edf1f6' },
};

const chartTypeLabels: Record<ChartType, string> = {
  line: '趋势图',
  bar: '柱状图',
  donut: '环形图',
  area: '面积图',
};

export function AnalysisListScreen({
  analyses = MOCK_ANALYSES,
  onAnalysisPress,
  onBackPress,
}: AnalysisListScreenProps) {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<AnalysisFilter>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string | null>(null);
  const { width } = useWindowDimensions();

  const isWide = width >= 760;
  const columnCount = width >= 1080 ? 3 : width >= 700 ? 2 : 1;
  const horizontalPadding = isWide ? 28 : 18;
  const availableWidth = Math.min(width, 1180) - horizontalPadding * 2;
  const cardWidth = (availableWidth - (columnCount - 1) * 16) / columnCount;

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 650);
    return () => clearTimeout(timer);
  }, []);

  const filteredAnalyses = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();

    return analyses.filter((analysis) => {
      const matchesFilter =
        activeFilter === 'all' ||
        (activeFilter === 'viewable' && analysis.permission !== 'none') ||
        (activeFilter === 'recent' && analysis.isRecent);
      const searchableText =
        `${analysis.name} ${analysis.description} ${analysis.datasetName}`.toLocaleLowerCase();
      return matchesFilter && (!normalizedQuery || searchableText.includes(normalizedQuery));
    });
  }, [activeFilter, analyses, query]);

  const handleAnalysisPress = (analysis: AnalysisListItem) => {
    setSelectedAnalysisId(analysis.id);
    onAnalysisPress?.(analysis);
  };

  const selectedAnalysis = analyses.find((analysis) => analysis.id === selectedAnalysisId);
  const isEmpty = analyses.length === 0;
  const hasSearchOrFilter = query.trim().length > 0 || activeFilter !== 'all';

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
                基于统一数据集查看业务分析，快速找到值得持续关注的数据变化与决策线索。
              </Text>
            </View>
            <View className="min-w-[120px] self-start rounded-[14px] border border-[#dce7f4] bg-white/80 px-4 py-3 shadow-lg shadow-slate-500/10">
              <Text className="text-[22px] font-black text-[#397bea]">{analyses.length}</Text>
              <Text className="mt-0.5 text-[10px] font-bold text-[#718198]">本地分析样例</Text>
            </View>
          </View>

          <View className="mt-[30px] gap-[13px]">
            <View className="min-h-[52px] flex-row items-center rounded-[13px] border border-[#d8e4f2] bg-white px-3.5 shadow-md shadow-slate-500/10">
              <Text className="-mt-0.5 mr-[9px] text-[22px] text-[#6791cf]">⌕</Text>
              <TextInput
                accessibilityLabel="搜索分析"
                autoCapitalize="none"
                onChangeText={setQuery}
                placeholder="搜索分析名称、描述或数据集"
                placeholderTextColor="#91a0b4"
                returnKeyType="search"
                className="flex-1 py-[13px] text-sm text-[#263850]"
                value={query}
              />
              {query.length > 0 && (
                <Pressable
                  accessibilityLabel="清空搜索"
                  accessibilityRole="button"
                  hitSlop={8}
                  className="h-[26px] w-[26px] items-center justify-center rounded-full bg-[#eef3f9] active:scale-95 active:bg-[#dce8f6]"
                  onPress={() => setQuery('')}
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
              {FILTERS.map((filter) => {
                const isActive = activeFilter === filter.key;
                return (
                  <Pressable
                    accessibilityLabel={`筛选：${filter.label}`}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isActive }}
                    className={`min-h-10 rounded-full border px-[15px] py-2.5 active:scale-[0.97] active:opacity-80 ${
                      isActive
                        ? 'border-[#397cf0] bg-[#397cf0] shadow-md shadow-blue-500/20'
                        : 'border-[#dbe6f3] bg-white'
                    }`}
                    key={filter.key}
                    onPress={() => setActiveFilter(filter.key)}
                  >
                    <Text
                      className={`text-xs font-extrabold ${
                        isActive ? 'text-white' : 'text-[#62738b]'
                      }`}
                    >
                      {filter.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          <View className="mb-3 mt-6 min-h-5 flex-row items-center justify-between gap-3">
            <Text accessibilityLiveRegion="polite" className="text-[11px] font-bold text-[#7a899d]">
              {isLoading ? '正在准备分析…' : `共 ${filteredAnalyses.length} 个分析`}
            </Text>
            {selectedAnalysis && (
              <Text
                accessibilityLiveRegion="polite"
                className="flex-1 text-right text-[11px] font-extrabold text-[#397bea]"
                numberOfLines={1}
              >
                已选择：{selectedAnalysis.name}
              </Text>
            )}
          </View>

          {isLoading ? (
            <View className="flex-row flex-wrap gap-4">
              {Array.from({ length: columnCount * 2 }, (_, index) => (
                <SkeletonCard key={index} width={cardWidth} />
              ))}
            </View>
          ) : filteredAnalyses.length > 0 ? (
            <View className="flex-row flex-wrap gap-4">
              {filteredAnalyses.map((analysis) => (
                <AnalysisCard
                  analysis={analysis}
                  isSelected={selectedAnalysisId === analysis.id}
                  key={analysis.id}
                  onPress={() => handleAnalysisPress(analysis)}
                  width={cardWidth}
                />
              ))}
            </View>
          ) : (
            <EmptyState
              hasSearchOrFilter={hasSearchOrFilter && !isEmpty}
              onReset={() => {
                setQuery('');
                setActiveFilter('all');
              }}
            />
          )}

          <View className="mt-[22px] flex-row items-start gap-[9px] rounded-xl bg-[#edf5ff] p-3">
            <View className="h-5 w-5 items-center justify-center rounded-full bg-[#d3e7ff]">
              <Text className="text-[11px] font-black text-[#3d78d7]">i</Text>
            </View>
            <Text className="flex-1 text-[10px] leading-4 text-[#657994]">
              当前页面仅使用本地 mock 数据，不发起网络请求，也不包含真实权限判断。
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
  analysis: AnalysisListItem;
  isSelected: boolean;
  onPress: () => void;
  width: number;
}) {
  const permission = permissionMeta[analysis.permission];

  return (
    <Pressable
      accessibilityHint="按下后选择此分析，不会打开详情或发起查询"
      accessibilityLabel={`${analysis.name}，${analysis.description}，数据集 ${analysis.datasetName}，${permission.label}，更新于 ${analysis.updatedAt}`}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
      className={`overflow-hidden rounded-[17px] border bg-white shadow-xl shadow-slate-500/10 active:scale-[0.985] active:opacity-90 ${
        isSelected ? 'border-[#6d9df4] shadow-blue-500/20' : 'border-[#d9e5f2]'
      }`}
      onPress={onPress}
      style={{ width }}
    >
      <ChartPreview type={analysis.chartType} />
      <View className="p-4">
        <View className="flex-row items-start justify-between gap-2.5">
          <View className="flex-1">
            <Text numberOfLines={1} className="text-[17px] font-black text-[#253750]">
              {analysis.name}
            </Text>
            <Text className="mt-1 text-[9px] font-extrabold text-[#7f90a7]">
              {chartTypeLabels[analysis.chartType]}
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
          {analysis.description}
        </Text>
        <View className="my-[13px] h-px bg-[#e8eef6]" />
        <View className="flex-row items-center justify-between gap-2.5">
          <View className="flex-1 flex-row items-center gap-1.5">
            <Text className="text-xs text-[#5589e8]">▦</Text>
            <Text numberOfLines={1} className="flex-1 text-[10px] font-extrabold text-[#60738e]">
              {analysis.datasetName}
            </Text>
          </View>
          <Text className="text-[9px] text-[#94a2b5]">{analysis.updatedAt}</Text>
        </View>
      </View>
    </Pressable>
  );
}

function ChartPreview({ type }: { type: ChartType }) {
  const values = type === 'bar' ? [42, 68, 53, 82, 64, 92] : [26, 45, 38, 66, 58, 83, 72, 91];

  return (
    <View
      accessibilityElementsHidden
      className="h-[150px] overflow-hidden bg-[#eef6ff] p-[15px]"
      importantForAccessibility="no-hide-descendants"
    >
      <View className="z-[2] flex-row items-start justify-between">
        <View>
          <Text className="text-[8px] font-black tracking-[0.8px] text-[#8b9db5]">
            DATA PREVIEW
          </Text>
          <Text className="mt-1 text-sm font-black text-[#2c405d]">¥ 8,426,190</Text>
        </View>
        <View className="rounded-full bg-[#e0f5ea] px-[7px] py-1">
          <Text className="text-[8px] font-black text-[#15805c]">↗ 18.4%</Text>
        </View>
      </View>
      {type === 'donut' ? (
        <View className="flex-1 flex-row items-center justify-around pt-1">
          <View className="h-[78px] w-[78px] rotate-[25deg] items-center justify-center rounded-full border-[12px] border-[#4b83ef] border-r-[#a685ee] bg-[#70c8dc]">
            <View className="absolute -right-[13px] top-[3px] h-3.5 w-[13px] rotate-[35deg] bg-[#eef6ff]" />
            <View className="h-12 w-12 -rotate-[25deg] items-center justify-center rounded-full bg-[#eef6ff]">
              <Text className="text-xs font-black text-[#354c6c]">68%</Text>
            </View>
          </View>
          <View className="gap-[7px]">
            <LegendItem color="#4b83ef" label="直营" />
            <LegendItem color="#66c6da" label="电商" />
            <LegendItem color="#a685ee" label="合作" />
          </View>
        </View>
      ) : (
        <View className="mt-2.5 flex-1">
          <View className="absolute left-0 right-0 top-[35%] border-t border-[#cfe0f2]" />
          <View className="absolute left-0 right-0 top-[70%] border-t border-[#cfe0f2]" />
          <View className="absolute inset-0 flex-row items-end gap-[7px]">
            {values.map((value, index) => (
              <View key={index} className="h-full flex-1 justify-end">
                <View
                  className={`min-h-2 bg-[#78a6f6] ${
                    type === 'line'
                      ? 'w-[3px] rounded-sm bg-[#5e91ee] opacity-20'
                      : type === 'area'
                        ? 'w-full rounded-t bg-[#67bdd9] opacity-[0.62]'
                        : 'w-full rounded'
                  }`}
                  style={{ height: `${value}%` }}
                />
                {type === 'line' && (
                  <View
                    className="absolute -left-0.5 h-2 w-2 rounded-full border-2 border-white bg-[#3f7eea]"
                    style={{ bottom: `${Math.max(0, value - 4)}%` }}
                  />
                )}
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
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

function EmptyState({
  hasSearchOrFilter,
  onReset,
}: {
  hasSearchOrFilter: boolean;
  onReset: () => void;
}) {
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
        {hasSearchOrFilter ? '没有找到匹配的分析' : '暂无分析'}
      </Text>
      <Text className="mt-2 text-center text-xs text-[#7b8aa0]">
        {hasSearchOrFilter ? '试试更换关键词或筛选条件。' : '这里还没有可展示的分析内容。'}
      </Text>
      {hasSearchOrFilter && (
        <Pressable
          accessibilityLabel="重置搜索和筛选"
          accessibilityRole="button"
          className="mt-5 rounded-[10px] bg-[#397cf0] px-4 py-[11px] active:scale-[0.97] active:opacity-80"
          onPress={onReset}
        >
          <Text className="text-xs font-black text-white">重置条件</Text>
        </Pressable>
      )}
    </View>
  );
}
