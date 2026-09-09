import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';

import { ReadonlyChart } from '@/components/ReadonlyChart';
import type { DmsApiError } from '@/features/auth/api-client';
import { useAnalysisDetail } from '@/features/analysis/use-analysis-detail';

type Props = {
  analysisId: number;
  onBackPress: () => void;
  onUnauthorized?: (error: DmsApiError) => void | Promise<void>;
};

export function AnalysisDetailScreen({ analysisId, onBackPress, onUnauthorized }: Props) {
  const { detail, data, isLoading, error, reload } = useAnalysisDetail(analysisId, onUnauthorized);

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
            <ReadonlyChart type={detail.chartConfig.chartType} rows={data.rows} />
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}
