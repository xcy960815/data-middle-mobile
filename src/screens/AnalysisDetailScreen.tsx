import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';

import { ReadonlyChart } from '@/components/ReadonlyChart';
import { UsagePanel } from '@/components/UsagePanel';
import type { DmsApiError } from '@/features/auth/api-client';
import { useAnalysisDetail } from '@/features/analysis/use-analysis-detail';
import { useAnalysisUsage } from '@/features/resource/use-resource-usage';

type Props = {
  analysisId: number;
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

const alarmStrategyLabels: Record<string, string> = {
  always: '每次触发',
  once_per_day: '每日一次',
  only_state_change: '仅状态变化',
};

const emailTaskTypeLabels: Record<string, string> = {
  scheduled: '定时任务',
  recurring: '重复任务',
};

function formatDateTime(value: string): string {
  const parsedDate = new Date(value.trim().replace(' ', 'T'));
  if (Number.isNaN(parsedDate.getTime())) return '时间未知';

  const pad = (part: number) => String(part).padStart(2, '0');
  return `${parsedDate.getFullYear()}-${pad(parsedDate.getMonth() + 1)}-${pad(
    parsedDate.getDate(),
  )} ${pad(parsedDate.getHours())}:${pad(parsedDate.getMinutes())}`;
}

export function AnalysisDetailScreen({
  analysisId,
  onBackPress,
  onHistoryPress,
  onUnauthorized,
}: Props) {
  const { detail, data, isLoading, error, reload } = useAnalysisDetail(analysisId, onUnauthorized);
  const {
    usage,
    isLoading: isUsageLoading,
    error: usageError,
  } = useAnalysisUsage(analysisId, onUnauthorized);

  const canViewHistory =
    detail?.analysisPermission === 'edit' || detail?.analysisPermission === 'manage';

  return (
    <View className="flex-1 bg-[#f5f9fe]">
      <ScrollView
        contentContainerClassName="gap-5 px-[18px] pb-8 pt-[52px]"
        refreshControl={
          <RefreshControl onRefresh={reload} refreshing={isLoading} tintColor="#397cf0" />
        }
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-center gap-3">
          <Pressable
            accessibilityLabel="返回分析列表"
            accessibilityRole="button"
            onPress={onBackPress}
          >
            <Text className="text-3xl text-[#397cf0]">‹</Text>
          </Pressable>
          <View className="flex-1">
            <Text className="text-xl font-black text-[#253750]">
              {detail?.analysisName ?? '分析详情'}
            </Text>
            <Text className="mt-1 text-xs text-[#718198]">只读图表查看</Text>
          </View>
          {detail && onHistoryPress && canViewHistory ? (
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

        {isLoading && !detail ? (
          <View className="min-h-[360px] items-center justify-center gap-3">
            <ActivityIndicator color="#397cf0" size="large" />
            <Text className="text-sm font-bold text-[#687990]">正在加载分析图表…</Text>
          </View>
        ) : error ? (
          <View className="items-center rounded-2xl border border-[#f1d4d4] bg-white p-8">
            <Text className="text-lg font-black text-[#34445b]">图表加载失败</Text>
            <Text className="mt-2 text-center text-xs leading-5 text-[#7b8aa0]">{error}</Text>
            <Pressable className="mt-5 rounded-xl bg-[#397cf0] px-5 py-3" onPress={reload}>
              <Text className="text-xs font-black text-white">重新加载</Text>
            </Pressable>
          </View>
        ) : detail && data ? (
          <>
            <View className="rounded-2xl border border-[#dce7f3] bg-white p-4">
              <Text className="text-sm leading-5 text-[#687990]">
                {detail.analysisDesc || '暂无描述'}
              </Text>
              <Text className="mt-3 text-[11px] font-bold text-[#8a98aa]">
                更新于 {detail.updateTime} · 查询耗时 {data.queryElapsedMs} ms
              </Text>
            </View>
            <UsagePanel
              title="引用影响"
              stats={[
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
                { key: 'alarms', label: '报警规则', count: usage?.usageSummary.alarmCount ?? 0 },
              ]}
              sections={[
                {
                  title: `看板（${usage?.usageReferences.dashboards.length ?? 0}）`,
                  emptyText: '暂无看板引用',
                  items: (usage?.usageReferences.dashboards ?? []).map((item) => ({
                    id: item.id,
                    title: item.dashboardName,
                    subtitle: item.dashboardDesc,
                    meta: `受影响组件 ${item.affectedWidgetCount} 个 · ${item.createdBy} · ${formatDateTime(item.updateTime)}`,
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
                    meta: `${item.createdBy} · ${formatDateTime(item.updatedTime)}`,
                  })),
                },
                {
                  title: `报警规则（${usage?.usageReferences.alarms.length ?? 0}）`,
                  emptyText: '暂无报警规则引用',
                  items: (usage?.usageReferences.alarms ?? []).map((item) => ({
                    id: item.id,
                    title: item.alarmName,
                    subtitle: `${alarmStrategyLabels[item.alarmStrategy] ?? item.alarmStrategy} · ${
                      item.cronExpression
                    }${item.isDisabled === 1 ? ' · 已停用' : ''}`,
                    meta: `${item.createdBy} · ${formatDateTime(item.updatedTime)}`,
                  })),
                },
              ]}
              isLoading={isUsageLoading}
              error={usageError}
            />
            <ReadonlyChart type={detail.chartConfig.chartType} rows={data.rows} />
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}
