import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Share,
  Text,
  View,
} from 'react-native';

import { ApplyAccessCard } from '@/components/ApplyAccessCard';
import { ReadonlyChart } from '@/components/ReadonlyChart';
import { ResourceManageCard } from '@/components/ResourceManageCard';
import { UsagePanel } from '@/components/UsagePanel';
import type { DmsApiError } from '@/features/auth/api-client';
import {
  deleteAnalysis,
  updateAnalysisDesc,
  updateAnalysisName,
  updateAnalysisPublic,
  updateAnalysisShare,
} from '@/features/analysis/analysis-detail-api';
import { useAnalysisDetail } from '@/features/analysis/use-analysis-detail';
import { useAnalysisUsage } from '@/features/resource/use-resource-usage';
import { buildShareWebUrl } from '@/features/share/share-api';
import { formatDateTime } from '@/utils/format-date-time';

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

/**
 * 分析详情页：展示单个分析的描述信息与只读图表，支持下拉刷新与历史版本查看。
 *
 * 编辑权限以上可查看「引用影响」面板（看板、邮件任务、报警规则）并进行重命名与描述维护，
 * 管理权限还可切换公开访问/分享开关并删除分析；开启分享后可调用系统分享面板，403 时提供
 * 权限申请入口。
 *
 * @param {Props} props - 页面属性。
 * @param {number} props.analysisId - 分析 ID。
 * @param {() => void} props.onBackPress - 点击左上角返回回调，返回分析列表；删除分析成功后也会触发。
 * @param {(currentConfigId: number) => void} [props.onHistoryPress] - 点击「历史版本」回调，
 *   携带当前配置 ID 跳转历史版本页；仅编辑权限以上且提供该回调时展示入口。
 * @param {(error: DmsApiError) => void | Promise<void>} [props.onUnauthorized] - 会话失效回调，用于跳转登录。
 * @returns {JSX.Element} 分析详情页。
 */
export function AnalysisDetailScreen({
  analysisId,
  onBackPress,
  onHistoryPress,
  onUnauthorized,
}: Props) {
  const { detail, data, isLoading, error, errorCode, reload } = useAnalysisDetail(
    analysisId,
    onUnauthorized,
  );
  const canEdit = detail?.analysisPermission === 'edit' || detail?.analysisPermission === 'manage';
  const canManage = detail?.analysisPermission === 'manage';
  const {
    usage,
    isLoading: isUsageLoading,
    error: usageError,
  } = useAnalysisUsage(analysisId, onUnauthorized, canEdit);

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
          {detail && onHistoryPress && canEdit ? (
            <Pressable
              accessibilityLabel="查看历史版本"
              accessibilityRole="button"
              className="rounded-full border border-[#dce7f4] bg-white px-[11px] py-2"
              onPress={() => onHistoryPress(detail.currentConfigId)}
            >
              <Text className="text-[11px] font-extrabold text-[#60718a]">历史版本</Text>
            </Pressable>
          ) : null}
          {detail?.shareEnabled === 1 ? (
            <Pressable
              accessibilityLabel="分享分析链接"
              accessibilityRole="button"
              className="rounded-full border border-[#dce7f4] bg-white px-[11px] py-2"
              onPress={() => {
                void Share.share({ message: buildShareWebUrl('analysis', analysisId) });
              }}
            >
              <Text className="text-[11px] font-extrabold text-[#60718a]">分享</Text>
            </Pressable>
          ) : null}
        </View>

        {isLoading && !detail ? (
          <View className="min-h-[360px] items-center justify-center gap-3">
            <ActivityIndicator color="#397cf0" size="large" />
            <Text className="text-sm font-bold text-[#687990]">正在加载分析图表…</Text>
          </View>
        ) : error ? (
          <>
            <View className="items-center rounded-2xl border border-[#f1d4d4] bg-white p-8">
              <Text className="text-lg font-black text-[#34445b]">图表加载失败</Text>
              <Text className="mt-2 text-center text-xs leading-5 text-[#7b8aa0]">{error}</Text>
              <Pressable className="mt-5 rounded-xl bg-[#397cf0] px-5 py-3" onPress={reload}>
                <Text className="text-xs font-black text-white">重新加载</Text>
              </Pressable>
            </View>
            {errorCode === 403 ? (
              <ApplyAccessCard
                resourceType="analysis"
                resourceId={analysisId}
                onUnauthorized={onUnauthorized}
              />
            ) : null}
          </>
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
            {canEdit ? (
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
                      meta: `${item.createdBy} · ${formatDateTime(item.updateTime)}`,
                    })),
                  },
                ]}
                isLoading={isUsageLoading}
                error={usageError}
              />
            ) : null}
            {canEdit ? (
              <ResourceManageCard
                renameValue={detail.analysisName}
                onRename={async (name) => {
                  await updateAnalysisName(analysisId, name);
                  reload();
                }}
                descValue={detail.analysisDesc}
                onDescSave={async (desc) => {
                  await updateAnalysisDesc(analysisId, desc);
                  reload();
                }}
                toggles={
                  canManage
                    ? [
                        {
                          key: 'public',
                          label: '公开访问',
                          enabled: detail.isPublic === 1,
                          onToggle: async (next) => {
                            await updateAnalysisPublic(analysisId, next);
                            reload();
                          },
                        },
                        {
                          key: 'share',
                          label: '开启分享',
                          enabled: detail.shareEnabled === 1,
                          onToggle: async (next) => {
                            await updateAnalysisShare(analysisId, next);
                            reload();
                          },
                        },
                      ]
                    : undefined
                }
                deleteLabel={canManage ? `删除分析「${detail.analysisName}」` : undefined}
                onDelete={
                  canManage
                    ? async () => {
                        await deleteAnalysis(analysisId);
                        onBackPress();
                      }
                    : undefined
                }
                onUnauthorized={onUnauthorized}
              />
            ) : null}
            <ReadonlyChart type={detail.chartConfig.chartType} rows={data.rows} />
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}
