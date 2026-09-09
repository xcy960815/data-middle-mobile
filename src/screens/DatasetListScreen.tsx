import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import type { DmsApiError } from '@/features/auth/api-client';
import type { DatasetListItem } from '@/features/dataset/types';
import { useDatasetList } from '@/features/dataset/use-dataset-list';

export function DatasetListScreen({
  onNotificationsPress,
  onUnauthorized,
  onPress,
}: {
  onNotificationsPress: () => void;
  onUnauthorized: (error: DmsApiError) => void | Promise<void>;
  onPress: (item: DatasetListItem) => void;
}) {
  const { items, loading, error } = useDatasetList(onUnauthorized);
  return (
    <ScrollView contentContainerClassName="gap-3 bg-[#f5f9fe] px-[18px] pb-8 pt-[52px]">
      <View className="flex-row items-center justify-between">
        <Text className="text-3xl font-black text-[#172033]">数据集</Text>
        <Pressable
          accessibilityLabel="打开通知中心"
          accessibilityRole="button"
          className="rounded-full border border-[#dce7f4] bg-white/80 px-[11px] py-2"
          onPress={onNotificationsPress}
        >
          <Text className="text-[11px] font-extrabold text-[#60718a]">通知</Text>
        </Pressable>
      </View>
      <Text className="text-sm text-[#687990]">查看已授权的数据集和预览数据。</Text>
      {loading ? (
        <ActivityIndicator color="#397cf0" />
      ) : error ? (
        <Text className="rounded-xl bg-white p-5 text-sm text-[#a64b4b]">{error}</Text>
      ) : (
        items.map((item) => (
          <Pressable
            key={item.id}
            onPress={() => onPress(item)}
            className="rounded-2xl border border-[#dce7f3] bg-white p-4"
          >
            <Text className="text-base font-black text-[#253750]">{item.datasetName}</Text>
            <Text className="mt-2 text-xs text-[#718198]">{item.datasetDesc || '暂无描述'}</Text>
            <Text className="mt-3 text-[11px] text-[#8a98aa]">
              字段 {item.fieldCount} 个 · 浏览 {item.viewCount} 次
            </Text>
          </Pressable>
        ))
      )}
    </ScrollView>
  );
}
