import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';

import { ReadonlyChart } from '@/components/ReadonlyChart';
import type { DmsApiError } from '@/features/auth/api-client';
import { useDashboardDetail } from '@/features/dashboard/use-dashboard-detail';

type Props = {
  dashboardId: number;
  onBackPress: () => void;
  onUnauthorized?: (error: DmsApiError) => void | Promise<void>;
};

export function DashboardDetailScreen({ dashboardId, onBackPress, onUnauthorized }: Props) {
  const { detail, widgetData, isLoading, error, reload } = useDashboardDetail(
    dashboardId,
    onUnauthorized,
  );
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
        </View>
        {isLoading && !detail ? (
          <View className="min-h-[360px] items-center justify-center">
            <ActivityIndicator color="#397cf0" size="large" />
          </View>
        ) : error ? (
          <View className="items-center rounded-2xl bg-white p-8">
            <Text className="text-lg font-black text-[#34445b]">看板加载失败</Text>
            <Text className="mt-2 text-center text-xs text-[#7b8aa0]">{error}</Text>
            <Pressable className="mt-5 rounded-xl bg-[#397cf0] px-5 py-3" onPress={reload}>
              <Text className="text-xs font-black text-white">重新加载</Text>
            </Pressable>
          </View>
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
                    <Text className="text-xs text-[#8290a2]">该组件暂时无法加载</Text>
                  </View>
                )}
              </View>
            ))}
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}
