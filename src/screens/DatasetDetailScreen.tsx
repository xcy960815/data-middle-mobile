import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';

import { UsagePanel } from '@/components/UsagePanel';
import type { DmsApiError } from '@/features/auth/api-client';
import { useDatasetDetail } from '@/features/dataset/use-dataset-detail';
import { useDatasetUsage } from '@/features/resource/use-resource-usage';

type Props = {
  id: number;
  onBackPress: () => void;
  onHistoryPress?: (currentConfigId: number) => void;
  onUnauthorized?: (error: DmsApiError) => void | Promise<void>;
};

const emailTaskStatusLabels: Record<string, string> = {
  pending: '待执行',
  running: '执行中',
  completed: '已完成',
  failed: '失败',
  cancelled: '已取消',
};

const emailTaskTypeLabels: Record<string, string> = {
  scheduled: '定时任务',
  recurring: '重复任务',
};

const chartTypeLabels: Record<string, string> = {
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

function formatDateTime(value: string): string {
  const parsedDate = new Date(value.trim().replace(' ', 'T'));
  if (Number.isNaN(parsedDate.getTime())) return '时间未知';

  const pad = (part: number) => String(part).padStart(2, '0');
  return `${parsedDate.getFullYear()}-${pad(parsedDate.getMonth() + 1)}-${pad(
    parsedDate.getDate(),
  )} ${pad(parsedDate.getHours())}:${pad(parsedDate.getMinutes())}`;
}

export function DatasetDetailScreen({ id, onBackPress, onHistoryPress, onUnauthorized }: Props) {
  const { detail, preview, loading, error } = useDatasetDetail(id, onUnauthorized);
  const {
    usage,
    isLoading: isUsageLoading,
    error: usageError,
  } = useDatasetUsage(id, onUnauthorized);
  const columns = preview?.columns.map((c) => c.columnName) ?? Object.keys(preview?.rows[0] ?? {});
  return (
    <ScrollView contentContainerClassName="gap-5 bg-[#f5f9fe] px-[18px] pb-8 pt-[52px]">
      <View className="flex-row items-center gap-3">
        <Pressable
          accessibilityLabel="返回数据集列表"
          accessibilityRole="button"
          onPress={onBackPress}
        >
          <Text className="text-3xl text-[#397cf0]">‹</Text>
        </Pressable>
        <View className="flex-1">
          <Text className="text-xl font-black text-[#253750]">
            {detail?.datasetName ?? '数据集详情'}
          </Text>
          <Text className="mt-1 text-xs text-[#718198]">只读数据集查看</Text>
        </View>
        {detail && onHistoryPress ? (
          <Pressable
            accessibilityLabel="查看历史版本"
            accessibilityRole="button"
            className="rounded-full border border-[#dce7f4] bg-white px-[11px] py-2"
            onPress={() => onHistoryPress(detail.currentConfigId)}
          >
            <Text className="text-[11px] font-extrabold text-[#60718a]">历史版本</Text>
          </Pressable>
        ) : null}
      </View>
      {loading ? (
        <ActivityIndicator color="#397cf0" />
      ) : error ? (
        <Text className="rounded-xl bg-white p-5 text-sm text-[#a64b4b]">{error}</Text>
      ) : detail && preview ? (
        <>
          <View>
            <Text className="text-2xl font-black text-[#253750]">{detail.datasetName}</Text>
            <Text className="mt-2 text-sm text-[#687990]">{detail.datasetDesc || '暂无描述'}</Text>
          </View>
          <View className="rounded-2xl border border-[#dce7f3] bg-white p-4">
            <Text className="text-sm font-black text-[#425b7c]">字段配置</Text>
            {detail.fieldsConfig.map((field) => (
              <Text key={field.columnName} className="mt-2 text-xs text-[#687990]">
                {field.displayName || field.columnName} · {field.columnType}
              </Text>
            ))}
          </View>
          <UsagePanel
            title="引用影响"
            stats={[
              { key: 'analyses', label: '分析引用', count: usage?.usageSummary.analysisCount ?? 0 },
              {
                key: 'dashboards',
                label: '看板引用',
                count: usage?.usageSummary.dashboardCount ?? 0,
              },
              {
                key: 'emailTasks',
                label: '邮件任务',
                count: usage?.usageSummary.emailTaskCount ?? 0,
              },
            ]}
            sections={[
              {
                title: `分析（${usage?.usageReferences.analyses.length ?? 0}）`,
                emptyText: '暂无分析引用',
                items: (usage?.usageReferences.analyses ?? []).map((item) => ({
                  id: item.id,
                  title: item.analysisName,
                  subtitle: item.analysisDesc,
                  meta: `${chartTypeLabels[item.chartType] ?? item.chartType} · ${item.createdBy} · ${formatDateTime(item.updateTime)}`,
                })),
              },
              {
                title: `看板（${usage?.usageReferences.dashboards.length ?? 0}）`,
                emptyText: '暂无看板引用',
                items: (usage?.usageReferences.dashboards ?? []).map((item) => ({
                  id: item.id,
                  title: item.dashboardName,
                  subtitle: item.dashboardDesc,
                  meta: `受影响分析 ${item.affectedAnalysisCount} 个 · 受影响组件 ${item.affectedWidgetCount} 个 · ${item.createdBy} · ${formatDateTime(item.updateTime)}`,
                })),
              },
              {
                title: `邮件任务（${usage?.usageReferences.emailTasks.length ?? 0}）`,
                emptyText: '暂无邮件任务引用',
                items: (usage?.usageReferences.emailTasks ?? []).map((item) => ({
                  id: item.id,
                  title: item.taskName,
                  subtitle: `${emailTaskTypeLabels[item.taskType] ?? item.taskType} · ${
                    emailTaskStatusLabels[item.status] ?? item.status
                  }${item.isDisabled === 1 ? ' · 已停用' : ''}`,
                  meta: `关联分析 ${item.analysisName} · ${item.createdBy} · ${formatDateTime(item.updatedTime)}`,
                })),
              },
            ]}
            isLoading={isUsageLoading}
            error={usageError}
            footerNote={
              usage?.usageSummary.emailTaskDetailsRestricted
                ? '仅管理员可查看邮件任务详情，此处仅显示数量。'
                : null
            }
          />
          <ScrollView horizontal>
            <View className="min-w-full overflow-hidden rounded-2xl border border-[#dce7f3] bg-white">
              <View className="flex-row bg-[#edf5ff]">
                {columns.map((column) => (
                  <Text
                    key={column}
                    className="min-w-[130px] p-3 text-xs font-black text-[#425b7c]"
                  >
                    {column}
                  </Text>
                ))}
              </View>
              {preview.rows.map((row, index) => (
                <View key={index} className="flex-row border-t border-[#edf1f6]">
                  {columns.map((column) => (
                    <Text key={column} className="min-w-[130px] p-3 text-xs text-[#5f7088]">
                      {String(row[column] ?? '')}
                    </Text>
                  ))}
                </View>
              ))}
            </View>
          </ScrollView>
        </>
      ) : null}
    </ScrollView>
  );
}
