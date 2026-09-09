import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useDatasetDetail } from '@/features/dataset/use-dataset-detail';
import type { DmsApiError } from '@/features/auth/api-client';
export function DatasetDetailScreen({
  id,
  onBackPress,
  onUnauthorized,
}: {
  id: number;
  onBackPress: () => void;
  onUnauthorized?: (error: DmsApiError) => void | Promise<void>;
}) {
  const { detail, preview, loading, error } = useDatasetDetail(id, onUnauthorized);
  const columns = preview?.columns.map((c) => c.columnName) ?? Object.keys(preview?.rows[0] ?? {});
  return (
    <ScrollView contentContainerClassName="gap-5 bg-[#f5f9fe] px-[18px] pb-8 pt-[52px]">
      <Pressable onPress={onBackPress}>
        <Text className="text-3xl text-[#397cf0]">‹</Text>
      </Pressable>
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
