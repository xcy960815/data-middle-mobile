import { useRef, useState } from 'react';
import { Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';

import { BrandMark } from '../components/BrandMark';
import { WorkspacePreview } from '../components/WorkspacePreview';

type WelcomeScreenProps = {
  onAnalysisPress: () => void;
  onLoginPress: () => void;
};

type DemoKey = 'analyze' | 'dashboard' | 'dataset';

const capabilities = [
  {
    number: '01',
    eyebrow: 'DATA FOUNDATION',
    title: '统一数据集',
    copy: '接入数据源、管理字段语义和可见范围，让团队始终基于一致、可信的数据口径。',
    symbol: '▦',
  },
  {
    number: '02',
    eyebrow: 'VISUAL EXPLORATION',
    title: '自由分析',
    copy: '组合维度、指标、筛选和排序，用多种图表快速验证假设、发现业务变化。',
    symbol: '⌁',
  },
  {
    number: '03',
    eyebrow: 'DECISION WORKSPACE',
    title: '协作看板',
    copy: '将关键指标沉淀为面向业务现场的持续决策界面。',
    symbol: '◫',
  },
];

const workflow = [
  ['01', '连接数据', '接入数据源并建立字段语义'],
  ['02', '探索分析', '组合查询条件并验证业务假设'],
  ['03', '构建看板', '将关键洞察组织为业务界面'],
  ['04', '分享行动', '通过权限、邮件和调度持续触达'],
];

export function WelcomeScreen({ onAnalysisPress, onLoginPress }: WelcomeScreenProps) {
  const scrollViewRef = useRef<ScrollView>(null);
  const [activeDemo, setActiveDemo] = useState<DemoKey>('analyze');
  const { width } = useWindowDimensions();
  const isWide = width >= 760;

  const scrollToExperience = () =>
    scrollViewRef.current?.scrollTo({ y: isWide ? 1000 : 1230, animated: true });

  return (
    <View className={tw.page}>
      <View pointerEvents="none" className={`${tw.grid} ${isWide ? tw.gridWide : ''}`} />
      <View pointerEvents="none" className={tw.blueGlow} />
      <View pointerEvents="none" className={tw.violetGlow} />
      <ScrollView
        ref={scrollViewRef}
        contentContainerClassName={tw.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View className={`${tw.header} ${isWide ? tw.headerWide : ''}`}>
          <BrandMark />
          {isWide && (
            <View className={tw.nav}>
              <Pressable onPress={scrollToExperience}>
                <Text className={tw.navText}>核心能力</Text>
              </Pressable>
              <Pressable onPress={scrollToExperience}>
                <Text className={tw.navText}>产品体验</Text>
              </Pressable>
              <Pressable onPress={scrollToExperience}>
                <Text className={tw.navText}>工作流</Text>
              </Pressable>
            </View>
          )}
          <Pressable accessibilityRole="button" onPress={onLoginPress} className={tw.headerLogin}>
            <Text className={tw.headerLoginText}>{isWide ? '登录平台' : '登录'}</Text>
            <Text className={tw.headerLoginArrow}>↗</Text>
          </Pressable>
        </View>

        <View className={`${tw.hero} ${isWide ? tw.heroWide : ''}`}>
          <View className={`${tw.heroCopy} ${isWide ? tw.heroCopyWide : ''}`}>
            <Text className={tw.eyebrow}>
              <Text className={tw.eyebrowDot}>●</Text> ONE PLATFORM · EVERY INSIGHT
            </Text>
            <Text className={tw.heroTitle}>
              让数据从{`\n`}
              <Text className={tw.heroEmphasis}>“看见”</Text>走向{`\n`}
              <Text className={tw.heroEmphasis}>“行动”</Text>
            </Text>
            <Text className={tw.heroDescription}>
              连接数据资产、自由探索分析、沉淀可视化看板。用一套完整的数据工作流，让复杂信息变得清晰，让每一次决策都有据可依。
            </Text>
            <View className={tw.heroActions}>
              <Pressable
                accessibilityRole="button"
                onPress={onLoginPress}
                className={tw.primaryAction}
              >
                <Text className={tw.primaryActionText}>立即进入平台</Text>
                <Text className={tw.primaryActionArrow}>→</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={scrollToExperience}
                className={tw.secondaryAction}
              >
                <Text className={tw.playIcon}>▶</Text>
                <Text className={tw.secondaryActionText}>产品体验</Text>
              </Pressable>
              <Pressable
                accessibilityRole="link"
                onPress={onAnalysisPress}
                className={tw.analysisPreviewAction}
              >
                <Text className={tw.analysisPreviewActionText}>查看分析样例</Text>
                <Text className={tw.analysisPreviewActionArrow}>↗</Text>
              </Pressable>
            </View>
            <View className={tw.trustRow}>
              <TrustItem label="统一数据语义" />
              <TrustItem label="细粒度权限" />
              {isWide && <TrustItem label="跨端数据访问" />}
            </View>
          </View>

          <View className={`${tw.productPreview} ${isWide ? tw.productPreviewWide : ''}`}>
            <View pointerEvents="none" className={tw.previewOrbitOuter} />
            <View pointerEvents="none" className={tw.previewOrbitInner} />
            <WorkspacePreview />
            <View className={`${tw.floatingCard} ${tw.floatingCardQuery}`}>
              <Text className={tw.floatingSpark}>⌁</Text>
              <View>
                <Text className={tw.floatingLabel}>QUERY COMPLETED</Text>
                <Text className={tw.floatingValue}>36,921 rows · 1.28s</Text>
              </View>
            </View>
          </View>
        </View>

        <View className={tw.signalStrip}>
          <Text>DATASET</Text>
          <Text>✦</Text>
          <Text>ANALYZE</Text>
          <Text>✦</Text>
          <Text>DASHBOARD</Text>
          <Text>✦</Text>
          <Text>PERMISSION</Text>
        </View>

        <View className={tw.section}>
          <SectionHeading
            number="01"
            eyebrow="CORE CAPABILITIES"
            title="一套平台，贯穿数据价值的完整链路"
            copy="从可信数据资产到可执行业务洞察，每一个环节都在同一套语义、权限与协作体系中流转。"
          />
          <View className={`${tw.capabilityGrid} ${isWide ? tw.capabilityGridWide : ''}`}>
            {capabilities.map((capability, index) => (
              <View
                key={capability.number}
                className={`${tw.capabilityCard} ${index === 1 ? tw.capabilityCardFeatured : ''}`}
              >
                <Text className={tw.capabilityNumber}>{capability.number}</Text>
                <View
                  className={`${tw.capabilityIcon} ${index === 1 ? tw.capabilityIconFeatured : ''}`}
                >
                  <Text>{capability.symbol}</Text>
                </View>
                <Text className={tw.capabilityEyebrow}>{capability.eyebrow}</Text>
                <Text className={tw.capabilityTitle}>{capability.title}</Text>
                <Text className={tw.capabilityCopy}>{capability.copy}</Text>
                <Text className={tw.capabilityLink}>
                  {index === 0 ? '数据资产沉淀' : index === 1 ? '探索数据洞察' : '构建业务驾驶舱'} ↗
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View className={`${tw.section} ${tw.experienceSection}`}>
          <SectionHeading
            number="02"
            eyebrow="PRODUCT EXPERIENCE"
            title={'不是展示数据，\n而是与数据一起工作'}
            copy="选择一个工作场景，查看数据如何从字段配置流向分析图表，再沉淀为团队共享的业务看板。"
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName={tw.demoTabs}
          >
            <DemoTab
              active={activeDemo === 'analyze'}
              index="01"
              title="分析探索"
              english="ANALYZE"
              onPress={() => setActiveDemo('analyze')}
            />
            <DemoTab
              active={activeDemo === 'dashboard'}
              index="02"
              title="业务看板"
              english="DASHBOARD"
              onPress={() => setActiveDemo('dashboard')}
            />
            <DemoTab
              active={activeDemo === 'dataset'}
              index="03"
              title="数据集"
              english="DATASET"
              onPress={() => setActiveDemo('dataset')}
            />
          </ScrollView>
          <DemoStage activeDemo={activeDemo} />
        </View>

        <View
          className={`${tw.section} ${tw.workflowSection} ${isWide ? tw.workflowSectionWide : ''}`}
        >
          <View className={tw.workflowCopy}>
            <Text className={tw.sectionEyebrow}>
              <Text className={tw.sectionNumber}>03</Text> CONNECTED WORKFLOW
            </Text>
            <Text className={tw.workflowTitle}>
              洞察不是终点，{`\n`}
              <Text className={tw.heroEmphasis}>推动行动才是。</Text>
            </Text>
            <Text className={tw.sectionCopy}>
              统一权限、版本、查询与协作链路，让数据真正进入业务节奏，而不是停留在孤立报表中。
            </Text>
          </View>
          <View className={tw.workflowList}>
            {workflow.map(([number, title, copy], index) => (
              <View key={number} className={tw.workflowItem}>
                <Text className={tw.workflowNumber}>{number}</Text>
                <View className={tw.workflowText}>
                  <Text className={tw.workflowItemTitle}>{title}</Text>
                  <Text className={tw.workflowItemCopy}>{copy}</Text>
                </View>
                <Text className={tw.workflowArrow}>
                  {index === workflow.length - 1 ? '✓' : '→'}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View className={tw.finalCta}>
          <View pointerEvents="none" className={tw.finalGlow} />
          <Text className={tw.finalEyebrow}>YOUR DATA IS READY</Text>
          <Text className={tw.finalTitle}>下一次关键决策，{`\n`}从更清晰的数据开始。</Text>
          <Pressable accessibilityRole="button" onPress={onLoginPress} className={tw.finalAction}>
            <Text className={tw.finalActionText}>登录数据中台</Text>
            <Text className={tw.finalActionArrow}>↗</Text>
          </Pressable>
          <Text className={tw.finalMeta}>ANALYZE · DASHBOARD · DATASET</Text>
        </View>

        <View className={tw.footer}>
          <BrandMark compact />
          <Text className={tw.footerCopy}>让复杂数据变得清晰，让清晰洞察推动行动。</Text>
          <Pressable onPress={onLoginPress}>
            <Text className={tw.footerAction}>进入平台 →</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

function TrustItem({ label }: { label: string }) {
  return (
    <View className={tw.trustItem}>
      <View className={tw.trustDot} />
      <Text className={tw.trustText}>{label}</Text>
    </View>
  );
}

type SectionHeadingProps = { number: string; eyebrow: string; title: string; copy: string };

function SectionHeading({ number, eyebrow, title, copy }: SectionHeadingProps) {
  return (
    <View className={tw.sectionHeading}>
      <Text className={tw.sectionEyebrow}>
        <Text className={tw.sectionNumber}>{number}</Text> {eyebrow}
      </Text>
      <Text className={tw.sectionTitle}>{title}</Text>
      <Text className={tw.sectionCopy}>{copy}</Text>
    </View>
  );
}

type DemoTabProps = {
  active: boolean;
  index: string;
  title: string;
  english: string;
  onPress: () => void;
};

function DemoTab({ active, index, title, english, onPress }: DemoTabProps) {
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      className={`${tw.demoTab} ${active ? tw.demoTabActive : ''}`}
    >
      <Text className={`${tw.demoTabIndex} ${active ? tw.demoTabIndexActive : ''}`}>{index}</Text>
      <View>
        <Text className={`${tw.demoTabTitle} ${active ? tw.demoTabTitleActive : ''}`}>{title}</Text>
        <Text className={tw.demoTabEnglish}>{english}</Text>
      </View>
      <Text className={`${tw.demoTabArrow} ${active ? tw.demoTabArrowActive : ''}`}>→</Text>
    </Pressable>
  );
}

function DemoStage({ activeDemo }: { activeDemo: DemoKey }) {
  if (activeDemo === 'dashboard') {
    return (
      <View className={tw.demoStage}>
        <View className={tw.demoWindowHeader}>
          <Text className={tw.demoPath}>/dashboard/business-cockpit</Text>
          <Text className={tw.demoBadge}>LIVE VIEW</Text>
        </View>
        <View className={tw.dashboardDemo}>
          <DemoMetric label="本月销售额" value="¥ 8,426,190" />
          <DemoMetric label="订单转化率" value="26.8%" />
          <View className={tw.dashboardWideCard}>
            <Text className={tw.demoCardTitle}>区域业务热度</Text>
            <View className={tw.heatMap}>
              {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                <View key={item} className={tw.heatCell} style={{ opacity: 0.2 + item * 0.08 }} />
              ))}
            </View>
          </View>
          <View className={tw.dashboardWideCard}>
            <Text className={tw.demoCardTitle}>增长趋势</Text>
            <View className={tw.demoTrendLine}>
              {[34, 43, 38, 57, 52, 72, 82].map((height, index) => (
                <View key={index} className={tw.trendSegment} style={{ height }} />
              ))}
            </View>
          </View>
        </View>
      </View>
    );
  }
  if (activeDemo === 'dataset') {
    const rows = [
      ['order_date', 'DATE', '订单日期'],
      ['region', 'TEXT', '销售区域'],
      ['amount', 'NUMBER', '销售金额'],
      ['quantity', 'NUMBER', '订单数量'],
    ];
    return (
      <View className={tw.demoStage}>
        <View className={tw.demoWindowHeader}>
          <Text className={tw.demoPath}>/dataset/order-business</Text>
          <Text className={tw.demoBadge}>ENABLED</Text>
        </View>
        <View className={tw.datasetDemo}>
          <View className={tw.datasetToolbar}>
            <Text className={tw.datasetToolbarTitle}>订单业务数据集</Text>
            <Text className={tw.datasetEnabled}>已启用</Text>
          </View>
          <View className={`${tw.datasetRow} ${tw.datasetHead}`}>
            <Text>字段名称</Text>
            <Text>类型</Text>
            <Text>业务名称</Text>
          </View>
          {rows.map((row) => (
            <View key={row[0]} className={tw.datasetRow}>
              <Text className={tw.datasetField}>● {row[0]}</Text>
              <Text>{row[1]}</Text>
              <Text>{row[2]}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  }
  return (
    <View className={tw.demoStage}>
      <View className={tw.demoWindowHeader}>
        <Text className={tw.demoPath}>/analyze/sales-overview</Text>
        <Text className={tw.demoBadge}>LIVE QUERY</Text>
      </View>
      <View className={tw.analyzeDemo}>
        <View className={tw.fieldsPanel}>
          <Text className={tw.fieldsLabel}>DATA FIELDS</Text>
          <Text>● 订单日期</Text>
          <Text>● 销售区域</Text>
          <Text>● 销售金额</Text>
          <Text>● 订单数量</Text>
        </View>
        <View className={tw.analyzeContent}>
          <View className={tw.configPill}>
            <Text>维度</Text>
            <Text>订单日期 · 月</Text>
          </View>
          <View className={tw.configPill}>
            <Text>指标</Text>
            <Text>销售金额 · SUM</Text>
          </View>
          <View className={tw.analyzeBars}>
            {[42, 58, 48, 76, 67, 92, 81, 100].map((height, index) => (
              <View key={index} className={tw.analyzeBarTrack}>
                <View className={tw.analyzeBar} style={{ height: `${height}%` }} />
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

function DemoMetric({ label, value }: { label: string; value: string }) {
  return (
    <View className={tw.demoMetric}>
      <Text className={tw.demoMetricLabel}>{label}</Text>
      <Text className={tw.demoMetricValue}>{value}</Text>
      <Text className={tw.demoMetricTrend}>↗ 18.4%</Text>
    </View>
  );
}

const tw = {
  page: 'flex-1 bg-[#f7fbff]',
  scrollContent: 'bg-[#f7fbff] pb-2',
  grid: 'absolute left-0 right-0 top-0 h-[470px] border border-[#dfeaf8] opacity-[0.62]',
  gridWide: 'h-[610px]',
  blueGlow:
    'absolute -right-[200px] -top-[125px] h-[420px] w-[420px] rounded-[400px] bg-[#d3efff] opacity-70',
  violetGlow:
    'absolute -left-[170px] top-[290px] h-[260px] w-[260px] rounded-[300px] bg-[#ebe1ff] opacity-[0.76]',
  header: 'flex-row items-center justify-between px-5 pt-[58px]',
  headerWide: 'w-full max-w-[1140px] self-center px-7',
  nav: 'ml-auto mr-7 flex-row gap-7',
  navText: 'text-[13px] font-bold text-[#63728a]',
  headerLogin:
    'flex-row items-center gap-1.5 rounded-xl bg-[#172033] px-[13px] py-2.5 active:opacity-85',
  headerLoginText: 'text-[13px] font-extrabold text-white',
  headerLoginArrow: 'text-base font-bold text-[#8bceff]',
  hero: 'gap-9 px-5 pt-16',
  heroWide: 'w-full max-w-[1140px] flex-row self-center px-7 pt-[110px]',
  heroCopy: 'z-[1]',
  heroCopyWide: 'flex-[0.94] pt-[42px]',
  eyebrow: 'text-[10px] font-extrabold tracking-[1.1px] text-[#52647f]',
  eyebrowDot: 'text-[10px] text-[#4c9ef8]',
  heroTitle: 'mt-[15px] text-[42px] font-black leading-[52px] tracking-[-1.8px] text-[#172033]',
  heroEmphasis: 'text-[#477df1]',
  heroDescription: 'mt-[18px] max-w-[530px] text-[15px] leading-6 text-[#66758c]',
  heroActions: 'mt-[25px] flex-row flex-wrap gap-3',
  primaryAction:
    'flex-row items-center gap-4 rounded-[13px] bg-[#3f7ff2] px-[17px] py-3.5 shadow-lg shadow-blue-500/30 active:opacity-85',
  primaryActionText: 'text-sm font-extrabold text-white',
  primaryActionArrow: 'text-xl leading-5 text-[#dbe9ff]',
  secondaryAction: 'flex-row items-center gap-[7px] px-2.5 py-3.5 active:opacity-70',
  playIcon: 'text-xs text-[#4c83ed]',
  secondaryActionText: 'text-sm font-extrabold text-[#455875]',
  analysisPreviewAction:
    'flex-row items-center gap-[7px] rounded-[13px] border border-[#cfe0f6] bg-[#eef5ff] px-[13px] py-[13px] active:opacity-80',
  analysisPreviewActionText: 'text-xs font-black text-[#3d73d6]',
  analysisPreviewActionArrow: 'text-[15px] font-extrabold text-[#6893e4]',
  trustRow: 'mt-[23px] flex-row flex-wrap gap-3',
  trustItem: 'flex-row items-center gap-[5px]',
  trustDot: 'h-[5px] w-[5px] rounded-full bg-[#55c999]',
  trustText: 'text-[10px] font-bold text-[#7a899e]',
  productPreview: 'z-[1] mb-[18px]',
  productPreviewWide: 'mb-0 mt-0 flex-[1.16]',
  previewOrbitOuter:
    'absolute -left-10 -top-[45px] h-[350px] w-[350px] rounded-full border border-[#c7e2ff]',
  previewOrbitInner:
    'absolute -right-[30px] top-[45px] h-[220px] w-[220px] rounded-full border border-[#d7c7ff]',
  floatingCard:
    'absolute flex-row items-center gap-[7px] rounded-[11px] border border-[#dbe8f8] bg-white px-2.5 py-2 shadow-lg shadow-slate-500/20',
  floatingCardQuery: '-bottom-[17px] left-2',
  floatingSpark: 'text-base text-[#6090f5]',
  floatingLabel: 'text-[7px] font-extrabold tracking-[0.6px] text-[#9aaac1]',
  floatingValue: 'mt-0.5 text-[9px] font-bold text-[#455872]',
  signalStrip:
    'mt-[55px] flex-row items-center justify-center gap-3.5 overflow-hidden bg-[#172033] px-5 py-3.5',
  section: 'px-5 pt-[76px]',
  sectionHeading: 'max-w-[600px]',
  sectionEyebrow: 'text-[10px] font-extrabold tracking-[1.1px] text-[#6d7f99]',
  sectionNumber: 'text-[#4781ef]',
  sectionTitle: 'mt-[11px] text-[30px] font-black leading-[38px] tracking-[-1.1px] text-[#172033]',
  sectionCopy: 'mt-[13px] text-sm leading-[22px] text-[#697991]',
  capabilityGrid: 'mt-[27px] gap-3',
  capabilityGridWide: 'flex-row',
  capabilityCard:
    'min-h-[250px] flex-1 rounded-[17px] border border-[#dbe6f3] bg-white p-5 shadow-lg shadow-slate-500/10',
  capabilityCardFeatured: 'border-[#9fc1f6] bg-[#eff6ff]',
  capabilityNumber: 'absolute right-[18px] top-[17px] text-[11px] font-extrabold text-[#a3b2c5]',
  capabilityIcon: 'h-9 w-9 items-center justify-center rounded-[11px] bg-[#ecf5ff]',
  capabilityIconFeatured: 'bg-[#dae9ff]',
  capabilityEyebrow: 'mt-[18px] text-[9px] font-extrabold tracking-[0.8px] text-[#7890b0]',
  capabilityTitle: 'mt-1.5 text-[19px] font-black text-[#263750]',
  capabilityCopy: 'mt-[9px] text-[13px] leading-5 text-[#6c7d95]',
  capabilityLink: 'mt-auto pt-4 text-xs font-extrabold text-[#3c7deb]',
  experienceSection: 'mt-[75px] bg-[#edf5ff] pb-[70px]',
  demoTabs: 'mt-[26px] gap-2.5 pr-5',
  demoTab:
    'min-w-[170px] flex-row items-center gap-[9px] rounded-xl border border-[#d9e5f4] bg-white p-[13px] active:opacity-80',
  demoTabActive: 'border-[#397bf0] bg-[#397bf0]',
  demoTabIndex: 'text-[11px] font-black text-[#79a2df]',
  demoTabIndexActive: 'text-[#bcd5ff]',
  demoTabTitle: 'text-[13px] font-extrabold text-[#32445f]',
  demoTabTitleActive: 'text-white',
  demoTabEnglish: 'mt-0.5 text-[8px] font-extrabold tracking-[0.6px] text-[#95a9c3]',
  demoTabArrow: 'ml-auto text-[17px] text-[#9db0c6]',
  demoTabArrowActive: 'text-white',
  demoStage:
    'mt-[15px] overflow-hidden rounded-2xl border border-[#d6e4f5] bg-white shadow-xl shadow-slate-500/20',
  demoWindowHeader:
    'flex-row items-center justify-between border-b border-[#e4edf8] bg-[#f8fbff] px-[13px] py-2.5',
  demoPath: 'text-[10px] font-bold text-[#71839d]',
  demoBadge:
    'overflow-hidden rounded-lg bg-[#e9f7ff] px-[7px] py-[3px] text-[8px] font-black text-[#3975cf]',
  analyzeDemo: 'min-h-[220px] flex-row',
  fieldsPanel: 'w-[35%] gap-[13px] bg-[#182744] p-[15px]',
  fieldsLabel: 'mb-1 text-[8px] font-black tracking-[0.7px] text-[#89a6cc]',
  analyzeContent: 'flex-1 gap-[9px] p-3.5',
  configPill:
    'flex-row items-center justify-between rounded-[7px] border border-[#dce8f6] bg-[#f4f8ff] px-2 py-[7px]',
  analyzeBars: 'flex-1 flex-row items-end justify-between gap-1.5 rounded-lg bg-[#fafcff] p-3',
  analyzeBarTrack: 'h-full flex-1 justify-end overflow-hidden rounded bg-[#edf3fc]',
  analyzeBar: 'w-full rounded bg-[#5d91f6]',
  dashboardDemo: 'flex-row flex-wrap gap-2.5 p-[13px]',
  demoMetric: 'w-[46%] grow rounded-[9px] border border-[#e0eaf7] bg-[#f8fbff] p-3',
  demoMetricLabel: 'text-[10px] text-[#8192a8]',
  demoMetricValue: 'mt-[5px] text-[17px] font-black text-[#2e405b]',
  demoMetricTrend: 'mt-[5px] text-[9px] font-extrabold text-[#16ae79]',
  dashboardWideCard: 'w-full rounded-[9px] border border-[#e0eaf7] bg-[#f8fbff] p-3',
  demoCardTitle: 'text-[11px] font-extrabold text-[#435672]',
  heatMap: 'mt-2.5 flex-row flex-wrap gap-1.5',
  heatCell: 'h-6 w-[30%] rounded bg-[#4c88f5]',
  demoTrendLine: 'mt-2 h-[50px] flex-row items-end gap-1.5',
  trendSegment: 'flex-1 rounded bg-[#6594f2]',
  datasetDemo: 'p-[13px]',
  datasetToolbar: 'mb-3 flex-row items-center justify-between',
  datasetToolbarTitle: 'text-[13px] font-black text-[#30435f]',
  datasetEnabled:
    'overflow-hidden rounded-[7px] bg-[#e9fbf2] px-[7px] py-1 text-[9px] font-extrabold text-[#179761]',
  datasetRow: 'flex-row gap-1.5 border-b border-[#e8eef7] py-[9px]',
  datasetHead: 'rounded-md bg-[#f5f8fd] px-[5px]',
  datasetField: 'font-bold text-[#447fe6]',
  workflowSection: 'pb-[70px]',
  workflowSectionWide: 'w-full max-w-[1040px] flex-row self-center gap-[70px]',
  workflowCopy: 'flex-1',
  workflowTitle: 'mt-[11px] text-[30px] font-black leading-[38px] tracking-[-1.1px] text-[#172033]',
  workflowList: 'mt-[29px] flex-1',
  workflowItem: 'flex-row items-center gap-[13px] border-b border-[#dce6f2] py-[15px]',
  workflowNumber: 'text-xs font-black text-[#558af2]',
  workflowText: 'flex-1',
  workflowItemTitle: 'text-[15px] font-black text-[#30415a]',
  workflowItemCopy: 'mt-[3px] text-[11px] text-[#7c8ca2]',
  workflowArrow: 'text-[17px] text-[#86a0c2]',
  finalCta: 'mx-5 items-center overflow-hidden rounded-[22px] bg-[#172b4b] px-[25px] py-[52px]',
  finalGlow:
    'absolute -right-[130px] -top-[155px] h-[320px] w-[320px] rounded-[260px] bg-[#467ce7] opacity-45',
  finalEyebrow: 'text-[10px] font-black tracking-[1.2px] text-[#aac7ff]',
  finalTitle:
    'mt-[13px] text-center text-[27px] font-black leading-[35px] tracking-[-0.9px] text-white',
  finalAction:
    'mt-[25px] flex-row items-center gap-3.5 rounded-xl bg-white px-[18px] py-[13px] active:opacity-85',
  finalActionText: 'text-sm font-black text-[#2757a5]',
  finalActionArrow: 'text-lg text-[#4f82e2]',
  finalMeta: 'mt-[25px] text-[9px] font-extrabold tracking-[0.7px] text-[#a3bde9]',
  footer: 'items-start gap-[13px] px-5 pt-[35px]',
  footerCopy: 'text-xs text-[#7b8ba1]',
  footerAction: 'text-[13px] font-extrabold text-[#3d7be8]',
} as const;
