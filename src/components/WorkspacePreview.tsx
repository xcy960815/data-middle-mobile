import { StyleSheet, Text, View } from 'react-native';

type WorkspacePreviewProps = {
  compact?: boolean;
};

const chartBars = [38, 52, 46, 68, 58, 82, 74];

export function WorkspacePreview({ compact = false }: WorkspacePreviewProps) {
  return (
    <View
      style={[styles.window, compact && styles.windowCompact]}
      accessibilityLabel="数据分析工作台预览"
    >
      <View style={styles.titleBar}>
        <View style={styles.windowDots}>
          <View style={[styles.dot, { backgroundColor: '#f69b9b' }]} />
          <View style={[styles.dot, { backgroundColor: '#f7c96d' }]} />
          <View style={[styles.dot, { backgroundColor: '#7cdba7' }]} />
        </View>
        <Text numberOfLines={1} style={styles.windowTitle}>
          经营分析 / 实时概览
        </Text>
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.sidebar}>
          <View style={styles.sideLogo} />
          <View style={[styles.sideIcon, styles.sideIconActive]} />
          <View style={styles.sideIcon} />
          <View style={styles.sideIcon} />
        </View>

        <View style={styles.content}>
          <View style={styles.overviewRow}>
            <View>
              <Text style={styles.overviewLabel}>OVERVIEW</Text>
              <Text style={styles.overviewTitle}>核心业务指标</Text>
            </View>
            <View style={styles.overviewActions}>
              <View />
              <View />
            </View>
          </View>

          <View style={styles.metricRow}>
            <Metric label="活跃用户" value="36,921" trend="↗ 12.8%" />
            <Metric label="业务转化" value="24.6%" trend="↗ 4.2%" />
            {!compact && <Metric label="平均查询" value="1.28s" trend="AVG" muted />}
          </View>

          <View style={styles.chartRow}>
            <View style={styles.trendCard}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.chartTitle}>业务趋势</Text>
                  <Text style={styles.chartCaption}>近 7 天</Text>
                </View>
                <View style={styles.moreDot} />
              </View>
              <View style={styles.chartBars}>
                {chartBars.map((height, index) => (
                  <View key={index} style={styles.barTrack}>
                    <View style={[styles.bar, { height: `${height}%` }]} />
                  </View>
                ))}
              </View>
              <View style={styles.axis}>
                <Text>MON</Text>
                <Text>TUE</Text>
                <Text>WED</Text>
                <Text>THU</Text>
                <Text>FRI</Text>
                <Text>SAT</Text>
                <Text>SUN</Text>
              </View>
            </View>
            {!compact && (
              <View style={styles.distributionCard}>
                <Text style={styles.chartTitle}>区域贡献</Text>
                <Text style={styles.chartCaption}>本月</Text>
                <View style={styles.donut}>
                  <View style={styles.donutInner}>
                    <Text style={styles.donutValue}>68</Text>
                    <Text style={styles.donutPercent}>%</Text>
                  </View>
                </View>
                <Text style={styles.legendText}>● 华东区域领先</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {!compact && (
        <View style={styles.insight}>
          <Text style={styles.insightSpark}>✦</Text>
          <View>
            <Text style={styles.insightLabel}>INSIGHT FOUND</Text>
            <Text style={styles.insightTitle}>华东区域增速领先</Text>
          </View>
        </View>
      )}
    </View>
  );
}

type MetricProps = {
  label: string;
  value: string;
  trend: string;
  muted?: boolean;
};

function Metric({ label, value, trend, muted = false }: MetricProps) {
  return (
    <View style={styles.metric}>
      <Text numberOfLines={1} style={styles.metricLabel}>
        {label}
      </Text>
      <Text numberOfLines={1} style={styles.metricValue}>
        {value}
      </Text>
      <Text numberOfLines={1} style={[styles.metricTrend, muted && styles.metricTrendMuted]}>
        {trend}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  window: {
    backgroundColor: '#f8fbff',
    borderColor: '#d5e3f5',
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#4777a9',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.18,
    shadowRadius: 22,
  },
  windowCompact: {
    borderRadius: 14,
  },
  titleBar: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderBottomColor: '#e4edf8',
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  windowDots: { flexDirection: 'row', gap: 4 },
  dot: { borderRadius: 99, height: 5, width: 5 },
  windowTitle: { color: '#718096', flex: 1, fontSize: 9, fontWeight: '600' },
  liveBadge: {
    alignItems: 'center',
    backgroundColor: '#ebfff5',
    borderRadius: 10,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  liveDot: { backgroundColor: '#27c888', borderRadius: 99, height: 4, width: 4 },
  liveText: { color: '#159260', fontSize: 7, fontWeight: '800', letterSpacing: 0.5 },
  body: { flexDirection: 'row', minHeight: 202 },
  sidebar: { alignItems: 'center', backgroundColor: '#182744', gap: 12, paddingTop: 14, width: 30 },
  sideLogo: { backgroundColor: '#77d8ff', borderRadius: 3, height: 11, width: 11 },
  sideIcon: { backgroundColor: '#587092', borderRadius: 3, height: 7, opacity: 0.62, width: 7 },
  sideIconActive: { backgroundColor: '#6da5ff', height: 11, opacity: 1, width: 11 },
  content: { flex: 1, gap: 9, padding: 12 },
  overviewRow: { alignItems: 'flex-start', flexDirection: 'row', justifyContent: 'space-between' },
  overviewLabel: { color: '#9caec4', fontSize: 7, fontWeight: '800', letterSpacing: 0.8 },
  overviewTitle: { color: '#283650', fontSize: 12, fontWeight: '800', marginTop: 2 },
  overviewActions: { flexDirection: 'row', gap: 5 },
  metricRow: { flexDirection: 'row', gap: 6 },
  metric: {
    backgroundColor: '#ffffff',
    borderColor: '#e5edf8',
    borderRadius: 7,
    borderWidth: 1,
    flex: 1,
    padding: 7,
  },
  metricLabel: { color: '#8391a6', fontSize: 7 },
  metricValue: { color: '#25334a', fontSize: 12, fontWeight: '800', marginTop: 3 },
  metricTrend: { color: '#10a976', fontSize: 7, fontWeight: '700', marginTop: 3 },
  metricTrendMuted: { color: '#8594aa' },
  chartRow: { flex: 1, flexDirection: 'row', gap: 7 },
  trendCard: {
    backgroundColor: '#ffffff',
    borderColor: '#e5edf8',
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    padding: 8,
  },
  distributionCard: {
    backgroundColor: '#ffffff',
    borderColor: '#e5edf8',
    borderRadius: 8,
    borderWidth: 1,
    padding: 8,
    width: 90,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  chartTitle: { color: '#37465e', fontSize: 8, fontWeight: '800' },
  chartCaption: { color: '#98a7ba', fontSize: 6, marginTop: 2 },
  moreDot: { backgroundColor: '#a8b5c6', borderRadius: 99, height: 4, width: 4 },
  chartBars: {
    alignItems: 'flex-end',
    flex: 1,
    flexDirection: 'row',
    gap: 4,
    marginTop: 7,
    minHeight: 48,
  },
  barTrack: {
    backgroundColor: '#edf4fd',
    borderRadius: 4,
    flex: 1,
    height: 48,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  bar: { backgroundColor: '#6091f6', borderRadius: 4, width: '100%' },
  axis: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  donut: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#65a0f7',
    borderColor: '#dde9fb',
    borderRadius: 99,
    borderWidth: 8,
    height: 50,
    justifyContent: 'center',
    marginTop: 7,
    width: 50,
  },
  donutInner: { alignItems: 'baseline', flexDirection: 'row' },
  donutValue: { color: '#ffffff', fontSize: 14, fontWeight: '800' },
  donutPercent: { color: '#eaf4ff', fontSize: 7, fontWeight: '800' },
  legendText: { color: '#718096', fontSize: 6, marginTop: 6 },
  insight: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#d8e7fa',
    borderRadius: 10,
    borderWidth: 1,
    bottom: 11,
    flexDirection: 'row',
    gap: 7,
    paddingHorizontal: 9,
    paddingVertical: 7,
    position: 'absolute',
    right: 10,
    shadowColor: '#56799f',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  insightSpark: { color: '#5c84ed', fontSize: 14 },
  insightLabel: { color: '#95a6bd', fontSize: 6, fontWeight: '800', letterSpacing: 0.7 },
  insightTitle: { color: '#33435d', fontSize: 8, fontWeight: '700', marginTop: 2 },
});
