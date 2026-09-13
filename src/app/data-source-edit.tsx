import { useCallback } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { Redirect, useLocalSearchParams, usePathname, useRouter } from 'expo-router';

import type { DmsApiError } from '@/features/auth/api-client';
import { useAuth } from '@/features/auth/auth-context';
import { DataSourceFormScreen } from '@/screens/DataSourceFormScreen';

/**
 * 数据源编辑路由：id 为查询参数，缺省表示新建，携带但非正整数时重定向 /data-sources；
 * 登录守卫通过后渲染 DataSourceFormScreen。
 *
 * @returns {JSX.Element} 数据源表单页、加载态或重定向。
 */
export default function DataSourceEditRoute() {
  const router = useRouter();
  const pathname = usePathname();
  const { refresh, status } = useAuth();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const dataSourceId = id != null && id !== '' ? Number(id) : null;

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

  if (status === 'loading') {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator color="#397cf0" />
        <Text className="mt-3 text-sm text-[#687990]">正在检查登录会话…</Text>
      </View>
    );
  }
  if (status === 'unauthenticated') {
    return <Redirect href={{ pathname: '/login', params: { redirect: pathname } }} />;
  }
  if (id != null && (!Number.isInteger(dataSourceId) || (dataSourceId ?? 0) <= 0)) {
    return <Redirect href="/data-sources" />;
  }

  return (
    <DataSourceFormScreen
      dataSourceId={dataSourceId ?? undefined}
      onBackPress={() => router.back()}
      onUnauthorized={handleUnauthorized}
    />
  );
}
