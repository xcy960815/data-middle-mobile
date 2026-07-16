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

type DatasetStatus = 'enabled' | 'disabled';
type DatasetPermission = 'view' | 'edit' | 'manage';
type DatasetType = 'SQL 数据集' | '单表数据集';
type DatasetFilter = 'all' | 'enabled' | 'disabled' | 'recent' | 'mine';

export type DatasetFieldPreview = { name: string; type: string };

export type DatasetListItem = {
  id: string;
  name: string;
  description: string;
  type: DatasetType;
  datasourceName: string;
  datasourceType: string;
  fieldCount: number;
  rowCountLabel: string;
  status: DatasetStatus;
  updatedAt: string;
  owner: string;
  permission: DatasetPermission;
  businessTags: readonly string[];
  fields: readonly DatasetFieldPreview[];
  isRecent: boolean;
  isMine: boolean;
};

type DatasetListScreenProps = {
  datasets?: readonly DatasetListItem[];
  onBackPress?: () => void;
  onDatasetPress?: (dataset: DatasetListItem) => void;
};

const MOCK_DATASETS: readonly DatasetListItem[] = [
  {
    id: 'sales-sql',
    name: '销售经营主题数据集',
    description: '统一沉淀订单、销售额与渠道口径，为经营分析提供可信数据资产。',
    type: 'SQL 数据集',
    datasourceName: '业务订单库',
    datasourceType: 'MySQL',
    fieldCount: 32,
    rowCountLabel: '2,486 万行',
    status: 'enabled',
    updatedAt: '今天 10:32',
    owner: '林若川',
    permission: 'manage',
    businessTags: ['订单', '销售'],
    fields: [
      { name: 'order_id', type: 'string' },
      { name: 'sales_amount', type: 'decimal' },
      { name: 'order_date', type: 'datetime' },
      { name: 'region_name', type: 'string' },
    ],
    isRecent: true,
    isMine: true,
  },
  {
    id: 'customer-table',
    name: '用户增长基础表',
    description: '客户主数据与活跃行为的轻量汇总，支持用户分层与增长指标查看。',
    type: '单表数据集',
    datasourceName: '用户中心库',
    datasourceType: 'MySQL',
    fieldCount: 24,
    rowCountLabel: '386 万行',
    status: 'enabled',
    updatedAt: '昨天 16:08',
    owner: '周予安',
    permission: 'edit',
    businessTags: ['用户', '运营'],
    fields: [
      { name: 'user_id', type: 'string' },
      { name: 'register_channel', type: 'string' },
      { name: 'active_days', type: 'int' },
      { name: 'last_active_at', type: 'datetime' },
    ],
    isRecent: true,
    isMine: false,
  },
  {
    id: 'legacy-orders',
    name: '历史订单归档集',
    description: '已归档的历史订单口径，仅用于回溯与同比查询，当前不再持续更新。',
    type: 'SQL 数据集',
    datasourceName: '历史数仓',
    datasourceType: 'Hive',
    fieldCount: 41,
    rowCountLabel: '1.2 亿行',
    status: 'disabled',
    updatedAt: '06-28 11:15',
    owner: '蒋思远',
    permission: 'view',
    businessTags: ['订单', '归档'],
    fields: [
      { name: 'order_id', type: 'string' },
      { name: 'settled_amount', type: 'decimal' },
      { name: 'settled_month', type: 'date' },
      { name: 'store_id', type: 'string' },
    ],
    isRecent: false,
    isMine: false,
  },
  {
    id: 'marketing-attribution',
    name: '营销活动归因数据集',
    description: '汇总曝光、线索和转化归因结果，帮助运营团队评估活动投入产出。',
    type: '单表数据集',
    datasourceName: '营销数据湖',
    datasourceType: 'PostgreSQL',
    fieldCount: 18,
    rowCountLabel: '92 万行',
    status: 'enabled',
    updatedAt: '07-12 09:20',
    owner: '唐星野',
    permission: 'view',
    businessTags: ['运营', '销售'],
    fields: [
      { name: 'campaign_id', type: 'string' },
      { name: 'impressions', type: 'int' },
      { name: 'leads', type: 'int' },
      { name: 'conversion_rate', type: 'decimal' },
    ],
    isRecent: false,
    isMine: false,
  },
  {
    id: 'supply-chain',
    name: '供应链履约宽表',
    description: '面向采购与仓配团队的履约主题数据，覆盖库存、发货与签收节点。',
    type: 'SQL 数据集',
    datasourceName: '供应链数仓',
    datasourceType: 'ClickHouse',
    fieldCount: 56,
    rowCountLabel: '6,820 万行',
    status: 'enabled',
    updatedAt: '今天 08:46',
    owner: '林若川',
    permission: 'manage',
    businessTags: ['订单', '运营'],
    fields: [
      { name: 'shipment_id', type: 'string' },
      { name: 'warehouse_code', type: 'string' },
      { name: 'fulfillment_rate', type: 'decimal' },
      { name: 'delivered_at', type: 'datetime' },
    ],
    isRecent: true,
    isMine: true,
  },
];

const FILTERS: readonly { key: DatasetFilter; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'enabled', label: '已启用' },
  { key: 'disabled', label: '已停用' },
  { key: 'recent', label: '最近更新' },
  { key: 'mine', label: '我的数据集' },
];

const PERMISSION_META: Record<
  DatasetPermission,
  { label: string; color: string; backgroundColor: string }
> = {
  view: { label: 'VIEW · 仅查看', color: '#2563eb', backgroundColor: '#e8f1ff' },
  edit: { label: 'EDIT · 可编辑', color: '#047857', backgroundColor: '#e7f8ef' },
  manage: { label: 'MANAGE · 可管理', color: '#7c3aed', backgroundColor: '#f2eaff' },
};

export function DatasetListScreen({
  datasets = MOCK_DATASETS,
  onBackPress,
  onDatasetPress,
}: DatasetListScreenProps) {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<DatasetFilter>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDatasetId, setSelectedDatasetId] = useState<string | null>(null);
  const { width } = useWindowDimensions();
  const columnCount = width >= 1120 ? 3 : width >= 720 ? 2 : 1;
  const horizontalPadding = width >= 760 ? 28 : 18;
  const availableWidth = Math.min(width, 1200) - horizontalPadding * 2;
  const cardWidth = (availableWidth - (columnCount - 1) * 16) / columnCount;

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 650);
    return () => clearTimeout(timer);
  }, []);

  const filteredDatasets = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return datasets.filter((dataset) => {
      const matchesFilter =
        activeFilter === 'all' ||
        (activeFilter === 'enabled' && dataset.status === 'enabled') ||
        (activeFilter === 'disabled' && dataset.status === 'disabled') ||
        (activeFilter === 'recent' && dataset.isRecent) ||
        (activeFilter === 'mine' && dataset.isMine);
      const searchableText = [
        dataset.name,
        dataset.description,
        dataset.datasourceName,
        dataset.datasourceType,
        ...dataset.businessTags,
      ]
        .join(' ')
        .toLocaleLowerCase();
      return matchesFilter && (!normalizedQuery || searchableText.includes(normalizedQuery));
    });
  }, [activeFilter, datasets, query]);

  const isSourceEmpty = datasets.length === 0;
  const hasConditions = query.trim().length > 0 || activeFilter !== 'all';
  const selectedDataset = datasets.find((dataset) => dataset.id === selectedDatasetId);
  const handleDatasetPress = (dataset: DatasetListItem) => {
    setSelectedDatasetId(dataset.id);
    onDatasetPress?.(dataset);
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
            <BrandMark compact={width < 760} onPress={onBackPress} />
            <View style={styles.workspaceBadge}>
              <View style={styles.onlineDot} />
              <Text style={styles.workspaceBadgeText}>数据资产工作区</Text>
            </View>
          </View>
          <View style={[styles.hero, width >= 760 && styles.heroWide]}>
            <View style={styles.heroCopy}>
              <Text style={styles.eyebrow}>DATA FOUNDATION</Text>
              <Text style={styles.title}>数据集列表</Text>
              <Text style={styles.description}>
                统一管理数据资产、字段语义与来源，让分析和看板始终建立在清晰、可信的数据口径上。
              </Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryValue}>{datasets.length}</Text>
              <Text style={styles.summaryLabel}>本地数据集样例</Text>
              <View style={styles.summaryDivider} />
              <Text style={styles.summaryValueSecondary}>
                {datasets.filter((dataset) => dataset.status === 'enabled').length}
              </Text>
              <Text style={styles.summaryLabel}>已启用</Text>
            </View>
          </View>
          <View style={styles.controls}>
            <View style={styles.searchBox}>
              <Text style={styles.searchIcon}>⌕</Text>
              <TextInput
                accessibilityLabel="搜索数据集"
                autoCapitalize="none"
                onChangeText={setQuery}
                placeholder="搜索名称、描述、数据源或业务标签"
                placeholderTextColor="#91a0b4"
                returnKeyType="search"
                style={styles.searchInput}
                value={query}
              />
              {query.length > 0 && (
                <Pressable
                  accessibilityLabel="清空数据集搜索"
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
              {isLoading ? '正在准备数据集…' : `共 ${filteredDatasets.length} 个数据集`}
            </Text>
            {selectedDataset && (
              <Text accessibilityLiveRegion="polite" numberOfLines={1} style={styles.selectedText}>
                已选择：{selectedDataset.name} · 详情将在后续迁移
              </Text>
            )}
          </View>
          {isLoading ? (
            <View style={styles.cardGrid}>
              {Array.from({ length: columnCount * 2 }, (_, index) => (
                <DatasetSkeleton key={index} width={cardWidth} />
              ))}
            </View>
          ) : filteredDatasets.length > 0 ? (
            <View style={styles.cardGrid}>
              {filteredDatasets.map((dataset) => (
                <DatasetCard
                  dataset={dataset}
                  isSelected={selectedDatasetId === dataset.id}
                  key={dataset.id}
                  onPress={() => handleDatasetPress(dataset)}
                  width={cardWidth}
                />
              ))}
            </View>
          ) : (
            <DatasetEmptyState
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
              当前数据集、字段预览、更新时间和权限标签均为本地 mock
              展示；页面不请求服务端，也不进行真实权限判断。
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function DatasetCard({
  dataset,
  isSelected,
  onPress,
  width,
}: {
  dataset: DatasetListItem;
  isSelected: boolean;
  onPress: () => void;
  width: number;
}) {
  const permission = PERMISSION_META[dataset.permission];
  return (
    <Pressable
      accessibilityHint="按下后仅在本地选择此数据集，不会打开详情或发起查询"
      accessibilityLabel={`${dataset.name}，${dataset.description}，${dataset.datasourceName}，${dataset.fieldCount} 个字段，${dataset.status === 'enabled' ? '已启用' : '已停用'}，${permission.label}`}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.datasetCard,
        { width },
        isSelected && styles.datasetCardSelected,
        pressed && styles.cardPressed,
      ]}
    >
      <View style={styles.cardBody}>
        <View style={styles.cardTitleRow}>
          <View style={styles.cardTitleCopy}>
            <Text numberOfLines={1} style={styles.cardTitle}>
              {dataset.name}
            </Text>
            <View style={styles.tagRow}>
              <View style={styles.typeTag}>
                <Text style={styles.typeTagText}>{dataset.type}</Text>
              </View>
              {dataset.businessTags.slice(0, 2).map((tag) => (
                <View key={tag} style={styles.businessTag}>
                  <Text style={styles.businessTagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
          <View style={[styles.permissionTag, { backgroundColor: permission.backgroundColor }]}>
            <Text style={[styles.permissionText, { color: permission.color }]}>
              {permission.label}
            </Text>
          </View>
        </View>
        <Text numberOfLines={2} style={styles.cardDescription}>
          {dataset.description}
        </Text>
        <View style={styles.sourceRow}>
          <View
            style={[styles.statusDot, dataset.status === 'disabled' && styles.statusDotDisabled]}
          />
          <Text style={styles.sourceText}>
            {dataset.status === 'enabled' ? '已启用' : '已停用'} · {dataset.datasourceName}
          </Text>
          <Text style={styles.sourceType}>{dataset.datasourceType}</Text>
        </View>
        <View style={styles.statsRow}>
          <Text style={styles.statText}>{dataset.fieldCount} 个字段</Text>
          <Text style={styles.statText}>{dataset.rowCountLabel}</Text>
          <Text style={styles.updatedAt}>{dataset.updatedAt}</Text>
        </View>
        <View style={styles.cardDivider} />
        <Text style={styles.previewLabel}>字段预览</Text>
        <View style={styles.fieldPreview}>
          {dataset.fields.slice(0, 4).map((field) => (
            <View key={field.name} style={styles.fieldPill}>
              <Text style={styles.fieldName}>{field.name}</Text>
              <Text style={styles.fieldType}>{field.type}</Text>
            </View>
          ))}
        </View>
        <View style={styles.metaRow}>
          <View style={styles.ownerGroup}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{dataset.owner.slice(0, 1)}</Text>
            </View>
            <Text numberOfLines={1} style={styles.ownerText}>
              负责人：{dataset.owner}
            </Text>
          </View>
          <Text style={styles.permissionCode}>{dataset.permission.toUpperCase()}</Text>
        </View>
      </View>
    </Pressable>
  );
}

function DatasetSkeleton({ width }: { width: number }) {
  return (
    <View accessibilityLabel="正在加载数据集卡片" style={[styles.skeletonCard, { width }]}>
      <View style={styles.skeletonTitle} />
      <View style={styles.skeletonLine} />
      <View style={styles.skeletonLineShort} />
      <View style={styles.skeletonMeta} />
      <View style={styles.skeletonFields} />
    </View>
  );
}

function DatasetEmptyState({
  hasConditions,
  onReset,
}: {
  hasConditions: boolean;
  onReset: () => void;
}) {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIllustration}>
        <View style={styles.emptyTable}>
          <View />
          <View />
          <View />
        </View>
        <Text style={styles.emptySearchText}>⌕</Text>
      </View>
      <Text style={styles.emptyTitle}>{hasConditions ? '没有找到匹配的数据集' : '暂无数据集'}</Text>
      <Text style={styles.emptyDescription}>
        {hasConditions
          ? '试试更换关键词，或切换到其他本地筛选条件。'
          : '这里还没有可展示的数据资产。'}
      </Text>
      {hasConditions && (
        <Pressable
          accessibilityLabel="重置数据集搜索和筛选"
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
    flexWrap: 'wrap',
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
  summaryLabel: { width: 70, marginTop: 2, fontSize: 10, fontWeight: '700', color: '#718198' },
  summaryDivider: { width: 1, height: 34, marginHorizontal: 13, backgroundColor: '#e1e9f2' },
  controls: { marginTop: 30, gap: 13 },
  searchBox: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#d8e4f2',
    backgroundColor: '#fff',
    shadowColor: '#64748b',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  searchIcon: { marginTop: -2, marginRight: 9, fontSize: 22, color: '#6791cf' },
  searchInput: { flex: 1, paddingVertical: 13, fontSize: 14, color: '#263850' },
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
    backgroundColor: '#fff',
  },
  filterButtonActive: { borderColor: '#397cf0', backgroundColor: '#397cf0' },
  filterText: { fontSize: 12, fontWeight: '800', color: '#62738b' },
  filterTextActive: { color: '#fff' },
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
  datasetCard: {
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#d9e5f2',
    backgroundColor: '#fff',
    shadowColor: '#64748b',
    shadowOpacity: 0.1,
    shadowRadius: 17,
    shadowOffset: { width: 0, height: 9 },
  },
  datasetCardSelected: { borderColor: '#6d9df4', shadowColor: '#3b82f6', shadowOpacity: 0.2 },
  cardPressed: { transform: [{ scale: 0.985 }], opacity: 0.9 },
  cardBody: { padding: 16 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  cardTitleCopy: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '900', color: '#223451' },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 8 },
  typeTag: {
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 5,
    backgroundColor: '#edf5ff',
  },
  typeTagText: { fontSize: 9, fontWeight: '900', color: '#397bea' },
  businessTag: {
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 5,
    backgroundColor: '#f3f6fa',
  },
  businessTagText: { fontSize: 9, fontWeight: '800', color: '#718198' },
  permissionTag: { paddingHorizontal: 7, paddingVertical: 5, borderRadius: 6 },
  permissionText: { fontSize: 8, fontWeight: '900' },
  cardDescription: { marginTop: 12, fontSize: 12, lineHeight: 19, color: '#687990' },
  sourceRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 14 },
  statusDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#36b37e' },
  statusDotDisabled: { backgroundColor: '#a6b1c1' },
  sourceText: { flex: 1, fontSize: 11, fontWeight: '800', color: '#4e6381' },
  sourceType: { fontSize: 10, fontWeight: '700', color: '#8a98aa' },
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: 9, marginTop: 12 },
  statText: { fontSize: 10, fontWeight: '800', color: '#61738d' },
  updatedAt: { flex: 1, textAlign: 'right', fontSize: 10, color: '#8a98aa' },
  cardDivider: { height: 1, marginVertical: 14, backgroundColor: '#edf1f6' },
  previewLabel: { fontSize: 9, fontWeight: '900', letterSpacing: 0.5, color: '#8a98aa' },
  fieldPreview: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  fieldPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    maxWidth: '100%',
    paddingHorizontal: 7,
    paddingVertical: 5,
    borderRadius: 5,
    backgroundColor: '#f6f9fd',
  },
  fieldName: { maxWidth: 100, fontSize: 9, fontWeight: '800', color: '#465d7d' },
  fieldType: { fontSize: 8, color: '#9aa8b8' },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 15,
  },
  ownerGroup: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 7 },
  avatar: {
    width: 23,
    height: 23,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#dceaff',
  },
  avatarText: { fontSize: 10, fontWeight: '900', color: '#397bea' },
  ownerText: { flex: 1, fontSize: 10, fontWeight: '800', color: '#60718a' },
  permissionCode: { fontSize: 9, fontWeight: '900', color: '#8b98aa' },
  skeletonCard: {
    minHeight: 280,
    padding: 16,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#e1e9f3',
    backgroundColor: '#fff',
  },
  skeletonTitle: { width: '64%', height: 18, borderRadius: 5, backgroundColor: '#e6edf6' },
  skeletonLine: {
    width: '100%',
    height: 10,
    marginTop: 20,
    borderRadius: 5,
    backgroundColor: '#edf2f8',
  },
  skeletonLineShort: {
    width: '76%',
    height: 10,
    marginTop: 8,
    borderRadius: 5,
    backgroundColor: '#edf2f8',
  },
  skeletonMeta: {
    width: '90%',
    height: 10,
    marginTop: 24,
    borderRadius: 5,
    backgroundColor: '#e9f0f8',
  },
  skeletonFields: {
    width: '78%',
    height: 40,
    marginTop: 22,
    borderRadius: 8,
    backgroundColor: '#f0f4f9',
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 66,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#dce7f4',
    backgroundColor: 'rgba(255,255,255,0.75)',
  },
  emptyIllustration: {
    width: 100,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: '#edf5ff',
  },
  emptyTable: {
    position: 'absolute',
    top: 17,
    left: 20,
    right: 20,
    height: 28,
    flexDirection: 'row',
    gap: 5,
    padding: 7,
    borderRadius: 6,
    backgroundColor: '#cfe3ff',
  },
  emptySearchText: { marginTop: 32, fontSize: 24, color: '#397bea' },
  emptyTitle: { marginTop: 18, fontSize: 17, fontWeight: '900', color: '#253956' },
  emptyDescription: {
    marginTop: 8,
    fontSize: 12,
    lineHeight: 19,
    textAlign: 'center',
    color: '#7b8ba0',
  },
  resetButton: {
    marginTop: 18,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 9,
    backgroundColor: '#397cf0',
  },
  resetButtonText: { fontSize: 11, fontWeight: '900', color: '#fff' },
  localNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 24,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#eaf3ff',
  },
  infoIcon: {
    width: 17,
    height: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
    backgroundColor: '#7ba7ed',
  },
  infoIconText: { fontSize: 11, fontWeight: '900', color: '#fff' },
  localNoticeText: { flex: 1, fontSize: 10, lineHeight: 16, color: '#617b9c' },
});
