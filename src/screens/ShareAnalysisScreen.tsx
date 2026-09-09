import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';

import { ReadonlyChart } from '@/components/ReadonlyChart';
import { useShareAnalysisDetail } from '@/features/share/use-share-analysis-detail';

export function ShareAnalysisScreen({ analysisId }: { analysisId: number }) {
  const { detail, data, isLoading, error, reload } = useShareAnalysisDetail(analysisId);

  return (
    <View className="flex-1 bg-[#f5f9fe]">
      <ScrollView
        contentContainerClassName="gap-5 px-[18px] pb-8 pt-[52px]"
        refreshControl={
          <RefreshControl onRefresh={reload} refreshing={isLoading} tintColor="#397cf0" />
        }
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-xl font-black text-[#253750]">
              {detail?.analysisName ?? '分享图表'}
            </Text>
            <View className="mt-1 flex-row items-center gap-1.5">
              <View className="h-1.5 w-1.5 rounded-full bg-[#34b372]" />
              <Text className="text-xs text-[#718198]">公开分享 · 只读视图</Text>
            </View>
          </View>
        </View>

        {isLoading && !detail ? (
          <View className="min-h-[360px] items-center justify-center gap-3">
            <ActivityIndicator color="#397cf0" size="large" />
            <Text className="text-sm font-bold text-[#687990]">正在加载分享图表…</Text>
          </View>
        ) : error ? (
          <View className="items-center rounded-2xl border border-[#f1d4d4] bg-white p-8">
            <Text className="text-lg font-black text-[#34445b]">分享内容加载失败</Text>
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
