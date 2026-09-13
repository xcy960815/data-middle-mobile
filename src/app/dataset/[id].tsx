import { useCallback } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { Redirect, useLocalSearchParams, usePathname, useRouter } from 'expo-router';

import type { DmsApiError } from '@/features/auth/api-client';
import { useAuth } from '@/features/auth/auth-context';
import { DatasetDetailScreen } from '@/screens/DatasetDetailScreen';

/**
 * 数据集详情路由：读取路径参数 id 并校验为正整数（非法时重定向 /datasets），登录守卫
 * 通过后渲染 DatasetDetailScreen，历史入口跳转
 * /resource-history/dataset/{id}?configId=...。
 *
 * @returns {JSX.Element} 数据集详情页、加载态或重定向。
 */
export default function DatasetDetailRoute() {
  const router = useRouter();
  const pathname = usePathname();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { refresh, status } = useAuth();
  const datasetId = Number(id);
  const handleUnauthorized = useCallback(
    async (_error: DmsApiError) => {
      try {
        await refresh();
      } finally {
        router.replace({ pathname: '/login', params: { redirect: pathname } });
      }
    },
    [pathname, refresh, router],
  );
  if (status === 'loading')
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator color="#397cf0" />
        <Text className="mt-3 text-sm text-[#687990]">正在检查登录会话…</Text>
      </View>
    );
  if (status === 'unauthenticated')
    return <Redirect href={{ pathname: '/login', params: { redirect: pathname } }} />;
  if (!Number.isInteger(datasetId) || datasetId <= 0) return <Redirect href="/datasets" />;
  return (
    <DatasetDetailScreen
      id={datasetId}
      onBackPress={() => router.back()}
      onHistoryPress={(currentConfigId) =>
        router.push(`/resource-history/dataset/${datasetId}?configId=${currentConfigId}`)
      }
      onUnauthorized={handleUnauthorized}
    />
  );
}
