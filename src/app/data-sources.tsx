import { useCallback } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { Redirect, usePathname, useRouter } from 'expo-router';

import type { DmsApiError } from '@/features/auth/api-client';
import { useAuth } from '@/features/auth/auth-context';
import { DataSourceListScreen } from '@/screens/DataSourceListScreen';

/**
 * 数据源列表路由：登录守卫通过后渲染 DataSourceListScreen，新建跳转 /data-source-edit，
 * 编辑跳转 /data-source-edit?id={id}，接口 401 时刷新会话并携带 redirect 重定向 /login。
 *
 * @returns {JSX.Element} 数据源列表页、加载态或重定向。
 */
export default function DataSourcesRoute() {
  const router = useRouter();
  const pathname = usePathname();
  const { refresh, status } = useAuth();

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
      <View className="flex-1 items-center justify-center gap-3 bg-[#f5f9fe] px-6">
        <ActivityIndicator color="#397cf0" size="large" />
        <Text accessibilityLiveRegion="polite" className="text-sm font-bold text-[#687990]">
          正在检查登录会话…
        </Text>
      </View>
    );
  }

  if (status === 'unauthenticated') {
    return <Redirect href={{ pathname: '/login', params: { redirect: pathname } }} />;
  }

  return (
    <DataSourceListScreen
      onBackPress={() => router.replace('/welcome')}
      onAccountPress={() => router.push('/account')}
      onCreatePress={() => router.push('/data-source-edit')}
      onEditPress={(dataSource) => router.push(`/data-source-edit?id=${dataSource.id}`)}
      onNotificationsPress={() => router.push('/notifications')}
      onUnauthorized={handleUnauthorized}
    />
  );
}
