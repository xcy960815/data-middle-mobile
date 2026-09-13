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
import type { DmsApiError } from '@/features/auth/api-client';
import {
  deleteDashboard,
  updateDashboardPublic,
  updateDashboardShare,
} from '@/features/dashboard/dashboard-detail-api';
import { useDashboardDetail } from '@/features/dashboard/use-dashboard-detail';
import { buildShareWebUrl } from '@/features/share/share-api';

type Props = {
  dashboardId: number;
  onBackPress: () => void;
  onHistoryPress?: (currentConfigId: number) => void;
  onUnauthorized?: (error: DmsApiError) => void | Promise<void>;
};

/**
 * 看板详情页：按顺序渲染看板内各图表组件的只读图表，支持下拉刷新与历史版本查看。
 *
 * 每个图表组件独立加载数据，单个组件失败仅在卡片内提示，不影响其他组件；开启分享后可调用
 * 系统分享面板；管理权限可切换公开访问/分享开关并删除看板；403 时提供权限申请入口。
 *
 * @param {Props} props - 页面属性。
 * @param {number} props.dashboardId - 看板 ID。
 * @param {() => void} props.onBackPress - 点击左上角返回回调，返回看板列表；删除看板成功后也会触发。
 * @param {(currentConfigId: number) => void} [props.onHistoryPress] - 点击「历史版本」回调，
 *   携带当前配置 ID 跳转历史版本页；仅编辑权限以上且提供该回调时展示入口。
 * @param {(error: DmsApiError) => void | Promise<void>} [props.onUnauthorized] - 会话失效回调，用于跳转登录。
 * @returns {JSX.Element} 看板详情页。
 */
export function DashboardDetailScreen({
  dashboardId,
  onBackPress,
  onHistoryPress,
  onUnauthorized,
}: Props) {
  const { detail, widgetData, widgetErrors, isLoading, error, errorCode, reload } =
    useDashboardDetail(dashboardId, onUnauthorized);
  const canEdit =
    detail?.dashboardPermission === 'edit' || detail?.dashboardPermission === 'manage';
  const canManage = detail?.dashboardPermission === 'manage';
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
            accessibilityLabel="返回看板列表"
            accessibilityRole="button"
            onPress={onBackPress}
          >
            <Text className="text-3xl text-[#397cf0]">‹</Text>
          </Pressable>
          <View className="flex-1">
            <Text className="text-xl font-black text-[#253750]">
              {detail?.dashboardName ?? '看板详情'}
            </Text>
            <Text className="mt-1 text-xs text-[#718198]">只读看板查看</Text>
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
              accessibilityLabel="分享看板链接"
              accessibilityRole="button"
              className="rounded-full border border-[#dce7f4] bg-white px-[11px] py-2"
              onPress={() => {
                void Share.share({ message: buildShareWebUrl('dashboard', dashboardId) });
              }}
            >
              <Text className="text-[11px] font-extrabold text-[#60718a]">分享</Text>
            </Pressable>
          ) : null}
        </View>
        {isLoading && !detail ? (
          <View className="min-h-[360px] items-center justify-center">
            <ActivityIndicator color="#397cf0" size="large" />
          </View>
        ) : error ? (
          <>
            <View className="items-center rounded-2xl bg-white p-8">
              <Text className="text-lg font-black text-[#34445b]">看板加载失败</Text>
              <Text className="mt-2 text-center text-xs text-[#7b8aa0]">{error}</Text>
              <Pressable className="mt-5 rounded-xl bg-[#397cf0] px-5 py-3" onPress={reload}>
                <Text className="text-xs font-black text-white">重新加载</Text>
              </Pressable>
            </View>
            {errorCode === 403 ? (
              <ApplyAccessCard
                resourceType="dashboard"
                resourceId={dashboardId}
                onUnauthorized={onUnauthorized}
              />
            ) : null}
          </>
        ) : detail ? (
          <>
            <View className="rounded-2xl border border-[#dce7f3] bg-white p-4">
              <Text className="text-sm leading-5 text-[#687990]">
                {detail.dashboardDesc || '暂无描述'}
              </Text>
              <Text className="mt-3 text-[11px] font-bold text-[#8a98aa]">
                共 {detail.widgets.length} 个图表组件 · 更新于 {detail.updateTime}
              </Text>
            </View>
            {detail.widgets.map((widget) => (
              <View
                key={widget.id}
                className="gap-3 rounded-2xl border border-[#dce7f3] bg-[#fafdff] p-3"
              >
                <View>
                  <Text className="text-sm font-black text-[#34445b]">
                    {widget.widgetTitle || widget.analysis?.analysisName || '未命名组件'}
                  </Text>
                  {widget.analysis && (
                    <Text className="mt-1 text-[11px] text-[#7b8aa0]">
                      {widget.analysis.analysisName}
                    </Text>
                  )}
                </View>
                {widget.analysis && widgetData[widget.id] ? (
                  <ReadonlyChart type={widget.chartType} rows={widgetData[widget.id].rows} />
                ) : (
                  <View className="items-center rounded-xl bg-[#f0f4f8] p-8">
                    <Text className="text-xs text-[#8290a2]">
                      {widgetErrors[widget.id] ?? '该组件暂时无法加载'}
                    </Text>
                  </View>
                )}
              </View>
            ))}
            {detail && canManage ? (
              <ResourceManageCard
                toggles={[
                  {
                    key: 'public',
                    label: '公开访问',
                    enabled: detail.isPublic === 1,
                    onToggle: async (next) => {
                      await updateDashboardPublic(dashboardId, next);
                      reload();
                    },
                  },
                  {
                    key: 'share',
                    label: '开启分享',
                    enabled: detail.shareEnabled === 1,
                    onToggle: async (next) => {
                      await updateDashboardShare(dashboardId, next);
                      reload();
                    },
                  },
                ]}
                deleteLabel={`删除看板「${detail.dashboardName}」`}
                onDelete={async () => {
                  await deleteDashboard(dashboardId);
                  onBackPress();
                }}
                onUnauthorized={onUnauthorized}
              />
            ) : null}
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}
