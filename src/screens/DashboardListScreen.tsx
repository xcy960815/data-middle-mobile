import { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';

import { BrandMark } from '../components/BrandMark';

type DashboardPermission = 'view' | 'edit' | 'manage';
type DashboardFilter = 'all' | 'mine' | 'recent' | 'favorite';
type PreviewVariant = 'sales' | 'operation' | 'supply' | 'customer' | 'finance' | 'marketing';

export type DashboardListItem = {
  id: string;
  name: string;
  description: string;
  category: string;
  owner: string;
  collaborators: readonly string[];
  updatedAt: string;
  permission: DashboardPermission;
  widgetCount: number;
  isMine: boolean;
  isRecent: boolean;
  isFavorite: boolean;
  status: string;
  preview: PreviewVariant;
};

type DashboardListScreenProps = {
  dashboards?: readonly DashboardListItem[];
  onBackPress?: () => void;
  onDashboardPress?: (dashboard: DashboardListItem) => void;
};

const MOCK_DASHBOARDS: readonly DashboardListItem[] = [
  {
    id: 'executive-overview',
    name: '经营管理驾驶舱',
    description: '汇总收入、利润、订单与客户增长，面向管理层快速掌握核心经营态势。',
    category: '经营管理',
    owner: '林若川',
    collaborators: ['销售中心', '财务中心'],
    updatedAt: '今天 11:28',
    permission: 'manage',
    widgetCount: 12,
    isMine: true,
    isRecent: true,
    isFavorite: true,
    status: '实时概览',
    preview: 'sales',
  },
  {
    id: 'retail-operation',
    name: '零售运营全景',
    description: '联动门店、区域与品类表现，观察销售转化和重点门店达成情况。',
    category: '零售运营',
    owner: '周予安',
    collaborators: ['华东大区'],
    updatedAt: '今天 09:46',
    permission: 'edit',
    widgetCount: 9,
    isMine: false,
    isRecent: true,
    isFavorite: true,
    status: '每日更新',
    preview: 'operation',
  },
  {
    id: 'supply-chain',
    name: '供应链履约监控',
    description: '聚合库存健康、订单履约和供应风险，辅助采购与仓配团队协同处置。',
    category: '供应链',
    owner: '蒋思远',
    collaborators: ['采购组', '仓配组'],
    updatedAt: '昨天 17:12',
    permission: 'view',
    widgetCount: 10,
    isMine: false,
    isRecent: true,
    isFavorite: false,
    status: '每小时更新',
    preview: 'supply',
  },
  {
    id: 'customer-growth',
    name: '客户增长驾驶舱',
    description: '跟踪获客、活跃、留存和客户价值分层，识别增长机会与流失风险。',
    category: '客户增长',
    owner: '林若川',
    collaborators: ['增长团队'],
    updatedAt: '07-13 15:35',
    permission: 'manage',
    widgetCount: 8,
    isMine: true,
    isRecent: false,
    isFavorite: true,
    status: '每日更新',
    preview: 'customer',
  },
  {
    id: 'finance-profit',
    name: '财务利润分析',
    description: '按组织与业务线拆解收入、成本和利润结构，持续关注预算执行偏差。',
    category: '财务分析',
    owner: '许清和',
    collaborators: ['预算组'],
    updatedAt: '07-09 10:18',
    permission: 'view',
    widgetCount: 7,
    isMine: false,
    isRecent: false,
    isFavorite: false,
    status: '月度口径',
    preview: 'finance',
  },
  {
    id: 'campaign-command',
    name: '营销活动作战屏',
    description: '对比活动曝光、线索、转化与投入产出，集中查看重点营销项目进展。',
    category: '市场营销',
    owner: '唐星野',
    collaborators: ['品牌组', '电商组'],
    updatedAt: '07-02 18:04',
    permission: 'edit',
    widgetCount: 11,
    isMine: false,
    isRecent: false,
    isFavorite: false,
    status: '活动期更新',
    preview: 'marketing',
  },
];

const FILTERS: readonly { key: DashboardFilter; label: string }[] = [
  { key: 'all', label: '全部看板' },
  { key: 'mine', label: '我的看板' },
  { key: 'recent', label: '最近更新' },
  { key: 'favorite', label: '收藏 / 常用' },
];

const PERMISSION_META: Record<
  DashboardPermission,
  { label: string; color: string; backgroundColor: string }
> = {
  view: { label: 'VIEW · 可查看', color: '#2563eb', backgroundColor: '#e8f1ff' },
  edit: { label: 'EDIT · 可编辑', color: '#047857', backgroundColor: '#e7f8ef' },
  manage: { label: 'MANAGE · 可管理', color: '#7c3aed', backgroundColor: '#f2eaff' },
};

export function DashboardListScreen({
  dashboards = MOCK_DASHBOARDS,
  onBackPress,
  onDashboardPress,
}: DashboardListScreenProps) {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<DashboardFilter>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDashboardId, setSelectedDashboardId] = useState<string | null>(null);
  const { width } = useWindowDimensions();

  const isWide = width >= 760;
  const columnCount = width >= 1120 ? 3 : width >= 720 ? 2 : 1;
  const horizontalPadding = isWide ? 28 : 18;
  const availableWidth = Math.min(width, 1200) - horizontalPadding * 2;
  const cardWidth = (availableWidth - (columnCount - 1) * 16) / columnCount;

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 700);
    return () => clearTimeout(timer);
  }, []);

  const filteredDashboards = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();

    return dashboards.filter((dashboard) => {
      const matchesFilter =
        activeFilter === 'all' ||
        (activeFilter === 'mine' && dashboard.isMine) ||
        (activeFilter === 'recent' && dashboard.isRecent) ||
        (activeFilter === 'favorite' && dashboard.isFavorite);
      const searchableText = [
        dashboard.name,
        dashboard.description,
        dashboard.category,
        dashboard.owner,
        ...dashboard.collaborators,
      ]
        .join(' ')
        .toLocaleLowerCase();

      return matchesFilter && (!normalizedQuery || searchableText.includes(normalizedQuery));
    });
  }, [activeFilter, dashboards, query]);

  const selectedDashboard = dashboards.find((dashboard) => dashboard.id === selectedDashboardId);
  const isSourceEmpty = dashboards.length === 0;
  const hasConditions = query.trim().length > 0 || activeFilter !== 'all';

  const handleDashboardPress = (dashboard: DashboardListItem) => {
    setSelectedDashboardId(dashboard.id);
    onDashboardPress?.(dashboard);
  };

  return (
    <View style={styles.page}>
      <View pointerEvents="none" style={styles.blueGlow} />
      <View pointerEvents="none" style={styles.topGrid} />
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingHorizontal: horizontalPadding }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <View style={styles.headerRow}>
            <BrandMark compact={!isWide} onPress={onBackPress} />
            <View style={styles.workspaceBadge}>
              <View style={styles.onlineDot} />
              <Text style={styles.workspaceBadgeText}>看板工作区</Text>
            </View>
          </View>

          <View style={[styles.hero, isWide && styles.heroWide]}>
            <View style={styles.heroCopy}>
              <Text style={styles.eyebrow}>DECISION WORKSPACE</Text>
              <Text style={styles.title}>看板列表</Text>
              <Text style={styles.description}>
                将分散的关键指标组织成业务驾驶舱，在统一可见范围内持续掌握经营、客户与供应链动态。
              </Text>
            </View>
            <View style={styles.summaryCard}>
              <View>
                <Text style={styles.summaryValue}>{dashboards.length}</Text>
                <Text style={styles.summaryLabel}>本地看板样例</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View>
                <Text style={styles.summaryValueSecondary}>
                  {dashboards.reduce((sum, dashboard) => sum + dashboard.widgetCount, 0)}
                </Text>
                <Text style={styles.summaryLabel}>概览组件</Text>
              </View>
            </View>
          </View>

          <View style={styles.controls}>
            <View style={styles.searchBox}>
              <Text style={styles.searchIcon}>⌕</Text>
              <TextInput
                accessibilityLabel="搜索看板"
                autoCapitalize="none"
                onChangeText={setQuery}
                placeholder="搜索看板名称、描述、业务分类或创建人"
                placeholderTextColor="#91a0b4"
                returnKeyType="search"
                style={styles.searchInput}
                value={query}
              />
              {query.length > 0 && (
                <Pressable
                  accessibilityLabel="清空看板搜索"
                  accessibilityRole="button"
                  hitSlop={8}
                  onPress={() => setQuery('')}
                  style={({ pressed }) => [styles.clearButton, pressed && styles.controlPressed]}
                >
                  <Text style={styles.clearButtonText}>×</Text>
                </Pressable>
              )}
            </View>

            <ScrollView
              contentContainerStyle={styles.filterContent}
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
                    key={filter.key}
                    onPress={() => setActiveFilter(filter.key)}
                    style={({ pressed }) => [
                      styles.filterButton,
                      isActive && styles.filterButtonActive,
                      pressed && styles.controlPressed,
                    ]}
                  >
                    <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
                      {filter.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          <View style={styles.resultRow}>
            <Text accessibilityLiveRegion="polite" style={styles.resultText}>
              {isLoading ? '正在准备看板…' : `共 ${filteredDashboards.length} 个看板`}
            </Text>
            {selectedDashboard && (
              <Text accessibilityLiveRegion="polite" numberOfLines={1} style={styles.selectedText}>
                已选择：{selectedDashboard.name} · 详情暂未开放
              </Text>
            )}
          </View>

          {isLoading ? (
            <View style={styles.cardGrid}>
              {Array.from({ length: columnCount * 2 }, (_, index) => (
                <DashboardSkeleton key={index} width={cardWidth} />
              ))}
            </View>
          ) : filteredDashboards.length > 0 ? (
            <View style={styles.cardGrid}>
              {filteredDashboards.map((dashboard) => (
                <DashboardCard
                  dashboard={dashboard}
                  isSelected={selectedDashboardId === dashboard.id}
                  key={dashboard.id}
                  onPress={() => handleDashboardPress(dashboard)}
                  width={cardWidth}
                />
              ))}
            </View>
          ) : (
            <DashboardEmptyState
              hasConditions={hasConditions && !isSourceEmpty}
              onReset={() => {
                setQuery('');
                setActiveFilter('all');
              }}
            />
          )}

          <View style={styles.localNotice}>
            <View style={styles.infoIcon}>
              <Text style={styles.infoIconText}>i</Text>
            </View>
            <Text style={styles.localNoticeText}>
              当前看板、收藏、更新时间和权限标签均为本地 mock
              展示；页面不请求服务端，也不进行真实权限判断。
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
  const permission = PERMISSION_META[dashboard.permission];

  return (
    <Pressable
      accessibilityHint="按下后仅在本地选择此看板，不会打开详情或发起查询"
      accessibilityLabel={`${dashboard.name}，${dashboard.description}，${dashboard.category}，创建人 ${dashboard.owner}，${permission.label}，${dashboard.widgetCount} 个组件，更新于 ${dashboard.updatedAt}`}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.dashboardCard,
        { width },
        isSelected && styles.dashboardCardSelected,
        pressed && styles.cardPressed,
      ]}
    >
      <DashboardPreview variant={dashboard.preview} />
      <View style={styles.cardBody}>
        <View style={styles.cardTitleRow}>
          <View style={styles.cardTitleCopy}>
            <Text numberOfLines={1} style={styles.cardTitle}>
              {dashboard.name}
            </Text>
            <View style={styles.categoryRow}>
              <View style={styles.categoryTag}>
                <Text style={styles.categoryTagText}>{dashboard.category}</Text>
              </View>
              {dashboard.isFavorite && <Text style={styles.favorite}>★ 常用</Text>}
            </View>
          </View>
          <View style={[styles.permissionTag, { backgroundColor: permission.backgroundColor }]}>
            <Text style={[styles.permissionText, { color: permission.color }]}>
              {permission.label}
            </Text>
          </View>
        </View>
        <Text numberOfLines={2} style={styles.cardDescription}>
          {dashboard.description}
        </Text>
        <View style={styles.statusRow}>
          <View style={styles.liveDot} />
          <Text style={styles.statusText}>{dashboard.status}</Text>
          <Text style={styles.widgetCount}>{dashboard.widgetCount} 个组件</Text>
        </View>
        <View style={styles.cardDivider} />
        <View style={styles.metaRow}>
          <View style={styles.ownerGroup}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{dashboard.owner.slice(0, 1)}</Text>
            </View>
            <View style={styles.ownerCopy}>
              <Text numberOfLines={1} style={styles.ownerText}>
                {dashboard.owner}
              </Text>
              <Text numberOfLines={1} style={styles.collaboratorText}>
                协作：{dashboard.collaborators.join('、')}
              </Text>
            </View>
          </View>
          <Text style={styles.updatedAt}>{dashboard.updatedAt}</Text>
        </View>
      </View>
    </Pressable>
  );
}

function DashboardPreview({ variant }: { variant: PreviewVariant }) {
  const barValues =
    variant === 'supply'
      ? [48, 70, 58, 84, 72, 62]
      : variant === 'finance'
        ? [72, 54, 78, 63, 86, 74]
        : [38, 57, 49, 73, 64, 88];
  const trendValues =
    variant === 'customer' ? [25, 38, 34, 55, 62, 74, 82] : [31, 46, 41, 65, 59, 78, 91];
  const primaryValue = variant === 'finance' ? '28.6%' : variant === 'supply' ? '96.4%' : '¥ 8.42M';

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={styles.preview}
    >
      <View style={styles.previewTopRow}>
        <View style={styles.kpiPanel}>
          <Text style={styles.previewLabel}>核心指标</Text>
          <Text style={styles.previewValue}>{primaryValue}</Text>
          <Text style={styles.previewRise}>↗ 12.8%</Text>
        </View>
        <View style={styles.donutPanel}>
          <View style={styles.donutOuter}>
            <View style={styles.donutCutout}>
              <Text style={styles.donutText}>{variant === 'marketing' ? '54%' : '68%'}</Text>
            </View>
          </View>
          <View style={styles.legendGroup}>
            <PreviewLegend color="#4a83ef" label="达成" />
            <PreviewLegend color="#70c7dc" label="进行中" />
          </View>
        </View>
      </View>
      <View style={styles.previewBottomRow}>
        <View style={styles.barPanel}>
          <View style={styles.previewGridLineOne} />
          <View style={styles.previewGridLineTwo} />
          <View style={styles.bars}>
            {barValues.map((height, index) => (
              <View key={index} style={styles.barTrack}>
                <View style={[styles.bar, { height: `${height}%` }]} />
              </View>
            ))}
          </View>
        </View>
        <View style={styles.trendPanel}>
          <Text style={styles.previewLabel}>近 7 日趋势</Text>
          <View style={styles.trendBars}>
            {trendValues.map((height, index) => (
              <View key={index} style={styles.trendTrack}>
                <View
                  style={[styles.trendBar, { height: `${height}%`, opacity: 0.35 + index * 0.08 }]}
                />
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

function PreviewLegend({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

function DashboardSkeleton({ width }: { width: number }) {
  return (
    <View accessibilityLabel="正在加载看板卡片" style={[styles.skeletonCard, { width }]}>
      <View style={styles.skeletonPreview}>
        <View style={styles.skeletonKpi} />
        <View style={styles.skeletonChartRow}>
          {[42, 65, 50, 78, 61, 86].map((height, index) => (
            <View key={index} style={[styles.skeletonBar, { height }]} />
          ))}
        </View>
      </View>
      <View style={styles.skeletonBody}>
        <View style={styles.skeletonTitle} />
        <View style={styles.skeletonLine} />
        <View style={styles.skeletonLineShort} />
        <View style={styles.skeletonMeta} />
      </View>
    </View>
  );
}

function DashboardEmptyState({
  hasConditions,
  onReset,
}: {
  hasConditions: boolean;
  onReset: () => void;
}) {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIllustration}>
        <View style={styles.emptyKpi} />
        <View style={styles.emptyChart}>
          {[25, 44, 34, 58].map((height, index) => (
            <View key={index} style={[styles.emptyBar, { height }]} />
          ))}
        </View>
        <View style={styles.emptySearch}>
          <Text style={styles.emptySearchText}>⌕</Text>
        </View>
      </View>
      <Text style={styles.emptyTitle}>{hasConditions ? '没有找到匹配的看板' : '暂无看板'}</Text>
      <Text style={styles.emptyDescription}>
        {hasConditions
          ? '试试更换关键词，或切换到其他本地筛选条件。'
          : '这里还没有可展示的业务驾驶舱。'}
      </Text>
      {hasConditions && (
        <Pressable
          accessibilityLabel="重置看板搜索和筛选"
          accessibilityRole="button"
          onPress={onReset}
          style={({ pressed }) => [styles.resetButton, pressed && styles.controlPressed]}
        >
          <Text style={styles.resetButtonText}>重置条件</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, overflow: 'hidden', backgroundColor: '#f5f9fe' },
  blueGlow: {
    position: 'absolute',
    right: -130,
    top: -190,
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: '#d7ebff',
    opacity: 0.72,
  },
  topGrid: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 270,
    borderWidth: 1,
    borderColor: '#dce8f7',
    opacity: 0.55,
  },
  scrollContent: { paddingTop: 50, paddingBottom: 34 },
  container: { width: '100%', maxWidth: 1200, alignSelf: 'center' },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  workspaceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#dce7f4',
    backgroundColor: 'rgba(255,255,255,0.82)',
  },
  onlineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#48bd8c' },
  workspaceBadgeText: { fontSize: 11, fontWeight: '800', color: '#60718a' },
  hero: { marginTop: 45, gap: 20 },
  heroWide: {
    marginTop: 68,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  heroCopy: { maxWidth: 720 },
  eyebrow: { fontSize: 10, fontWeight: '900', letterSpacing: 1.2, color: '#4c83ed' },
  title: {
    marginTop: 9,
    fontSize: 36,
    lineHeight: 44,
    fontWeight: '900',
    letterSpacing: -1.3,
    color: '#172033',
  },
  description: { marginTop: 12, fontSize: 14, lineHeight: 23, color: '#687990' },
  summaryCard: {
    minWidth: 230,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 17,
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#dce7f4',
    backgroundColor: 'rgba(255,255,255,0.84)',
    shadowColor: '#64748b',
    shadowOpacity: 0.1,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 7 },
  },
  summaryValue: { fontSize: 22, fontWeight: '900', color: '#397bea' },
  summaryValueSecondary: { fontSize: 22, fontWeight: '900', color: '#7157cf' },
  summaryLabel: { marginTop: 2, fontSize: 10, fontWeight: '700', color: '#718198' },
  summaryDivider: { width: 1, height: 34, marginHorizontal: 17, backgroundColor: '#e1e9f2' },
  controls: { marginTop: 30, gap: 13 },
  searchBox: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#d8e4f2',
    backgroundColor: '#ffffff',
    shadowColor: '#64748b',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  searchIcon: { marginTop: -2, marginRight: 9, fontSize: 22, color: '#6791cf' },
  searchInput: {
    flex: 1,
    paddingVertical: 13,
    fontSize: 14,
    color: '#263850',
  },
  clearButton: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    backgroundColor: '#eef3f9',
  },
  clearButtonText: { marginTop: -2, fontSize: 20, lineHeight: 22, color: '#64758b' },
  filterContent: { gap: 8, paddingRight: 8 },
  filterButton: {
    minHeight: 40,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#dbe6f3',
    backgroundColor: '#ffffff',
  },
  filterButtonActive: { borderColor: '#397cf0', backgroundColor: '#397cf0' },
  filterText: { fontSize: 12, fontWeight: '800', color: '#62738b' },
  filterTextActive: { color: '#ffffff' },
  controlPressed: { transform: [{ scale: 0.97 }], opacity: 0.82 },
  resultRow: {
    minHeight: 20,
    marginTop: 24,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  resultText: { fontSize: 11, fontWeight: '700', color: '#7a899d' },
  selectedText: { flex: 1, textAlign: 'right', fontSize: 11, fontWeight: '800', color: '#397bea' },
  cardGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  dashboardCard: {
    overflow: 'hidden',
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#d9e5f2',
    backgroundColor: '#ffffff',
    shadowColor: '#64748b',
    shadowOpacity: 0.1,
    shadowRadius: 17,
    shadowOffset: { width: 0, height: 9 },
  },
  dashboardCardSelected: { borderColor: '#6d9df4', shadowColor: '#3b82f6', shadowOpacity: 0.2 },
  cardPressed: { transform: [{ scale: 0.985 }], opacity: 0.9 },
  preview: { height: 174, padding: 12, gap: 8, backgroundColor: '#edf6ff' },
  previewTopRow: { height: 64, flexDirection: 'row', gap: 8 },
  kpiPanel: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 11,
    borderRadius: 9,
    backgroundColor: 'rgba(255,255,255,0.82)',
  },
  previewLabel: { fontSize: 7, fontWeight: '900', letterSpacing: 0.5, color: '#8b9db5' },
  previewValue: { marginTop: 2, fontSize: 16, fontWeight: '900', color: '#2c405d' },
  previewRise: { marginTop: 1, fontSize: 8, fontWeight: '800', color: '#15805c' },
  donutPanel: {
    width: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderRadius: 9,
    backgroundColor: 'rgba(255,255,255,0.82)',
  },
  donutOuter: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    borderWidth: 8,
    borderColor: '#4a83ef',
    borderRightColor: '#70c7dc',
  },
  donutCutout: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: '#ffffff',
  },
  donutText: { fontSize: 8, fontWeight: '900', color: '#354c6c' },
  legendGroup: { gap: 5 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 5, height: 5, borderRadius: 3 },
  legendText: { fontSize: 7, fontWeight: '700', color: '#71849e' },
  previewBottomRow: { flex: 1, flexDirection: 'row', gap: 8 },
  barPanel: {
    flex: 1.3,
    overflow: 'hidden',
    borderRadius: 9,
    backgroundColor: 'rgba(255,255,255,0.82)',
  },
  previewGridLineOne: {
    position: 'absolute',
    left: 9,
    right: 9,
    top: '35%',
    borderTopWidth: 1,
    borderTopColor: '#d7e5f3',
  },
  previewGridLineTwo: {
    position: 'absolute',
    left: 9,
    right: 9,
    top: '68%',
    borderTopWidth: 1,
    borderTopColor: '#d7e5f3',
  },
  bars: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 8,
  },
  barTrack: { flex: 1, height: '100%', justifyContent: 'flex-end' },
  bar: { width: '100%', minHeight: 4, borderRadius: 3, backgroundColor: '#78a6f6' },
  trendPanel: { flex: 1, padding: 9, borderRadius: 9, backgroundColor: 'rgba(255,255,255,0.82)' },
  trendBars: { flex: 1, flexDirection: 'row', alignItems: 'flex-end', gap: 3, marginTop: 7 },
  trendTrack: { flex: 1, height: '100%', justifyContent: 'flex-end' },
  trendBar: { width: '100%', minHeight: 3, borderRadius: 2, backgroundColor: '#5c8fed' },
  cardBody: { padding: 16 },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 9,
  },
  cardTitleCopy: { flex: 1 },
  cardTitle: { fontSize: 17, fontWeight: '900', color: '#253750' },
  categoryRow: { minHeight: 21, marginTop: 7, flexDirection: 'row', alignItems: 'center', gap: 7 },
  categoryTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#eef4fb',
  },
  categoryTagText: { fontSize: 9, fontWeight: '800', color: '#5f7899' },
  favorite: { fontSize: 9, fontWeight: '800', color: '#c57d18' },
  permissionTag: { paddingHorizontal: 8, paddingVertical: 5, borderRadius: 999 },
  permissionText: { fontSize: 8, fontWeight: '900' },
  cardDescription: { minHeight: 38, marginTop: 10, fontSize: 12, lineHeight: 19, color: '#6d7d94' },
  statusRow: { marginTop: 11, flexDirection: 'row', alignItems: 'center' },
  liveDot: { width: 6, height: 6, marginRight: 5, borderRadius: 3, backgroundColor: '#48bd8c' },
  statusText: { fontSize: 9, fontWeight: '800', color: '#4f7f70' },
  widgetCount: { marginLeft: 'auto', fontSize: 9, fontWeight: '800', color: '#4b7fd6' },
  cardDivider: { height: 1, marginVertical: 13, backgroundColor: '#e8eef6' },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  ownerGroup: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  avatar: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: '#e4efff',
  },
  avatarText: { fontSize: 10, fontWeight: '900', color: '#397bea' },
  ownerCopy: { flex: 1 },
  ownerText: { fontSize: 10, fontWeight: '800', color: '#516780' },
  collaboratorText: { marginTop: 2, fontSize: 8, color: '#91a0b3' },
  updatedAt: { fontSize: 9, color: '#94a2b5' },
  skeletonCard: {
    overflow: 'hidden',
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#e1e9f3',
    backgroundColor: '#ffffff',
  },
  skeletonPreview: { height: 174, padding: 16, backgroundColor: '#eef3f8' },
  skeletonKpi: { width: 110, height: 18, borderRadius: 6, backgroundColor: '#dfe7f0' },
  skeletonChartRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginTop: 18,
  },
  skeletonBar: { flex: 1, borderRadius: 4, backgroundColor: '#d9e3ee' },
  skeletonBody: { gap: 11, padding: 16 },
  skeletonTitle: { width: '58%', height: 18, borderRadius: 6, backgroundColor: '#dfe7f0' },
  skeletonLine: { width: '100%', height: 11, borderRadius: 6, backgroundColor: '#dfe7f0' },
  skeletonLineShort: { width: '72%', height: 11, borderRadius: 6, backgroundColor: '#dfe7f0' },
  skeletonMeta: {
    width: '100%',
    height: 28,
    marginTop: 5,
    borderRadius: 9,
    backgroundColor: '#e8eef5',
  },
  emptyState: {
    minHeight: 340,
    alignItems: 'center',
    padding: 34,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#dce7f3',
    backgroundColor: '#ffffff',
  },
  emptyIllustration: { width: 145, height: 108, marginBottom: 18 },
  emptyKpi: {
    position: 'absolute',
    top: 2,
    left: 18,
    width: 78,
    height: 22,
    borderRadius: 7,
    backgroundColor: '#e1edfb',
  },
  emptyChart: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    width: 112,
    height: 76,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 7,
    padding: 13,
    borderRadius: 14,
    backgroundColor: '#eef5fd',
  },
  emptyBar: { flex: 1, borderRadius: 3, backgroundColor: '#a8c6f3' },
  emptySearch: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 25,
    borderWidth: 4,
    borderColor: '#78a5ec',
    backgroundColor: '#ffffff',
  },
  emptySearchText: { marginTop: -3, fontSize: 24, color: '#4e83df' },
  emptyTitle: { fontSize: 18, fontWeight: '900', color: '#2b3d57' },
  emptyDescription: { marginTop: 8, textAlign: 'center', fontSize: 12, color: '#7b8aa0' },
  resetButton: {
    marginTop: 20,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor: '#397cf0',
  },
  resetButtonText: { fontSize: 12, fontWeight: '900', color: '#ffffff' },
  localNotice: {
    marginTop: 22,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#edf5ff',
  },
  infoIcon: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: '#d3e7ff',
  },
  infoIconText: { fontSize: 11, fontWeight: '900', color: '#3d78d7' },
  localNoticeText: { flex: 1, fontSize: 10, lineHeight: 16, color: '#657994' },
});
