import { useCallback } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { Redirect, usePathname, useRouter } from 'expo-router';

import type { DmsApiError } from '@/features/auth/api-client';
import { useAuth } from '@/features/auth/auth-context';
import type { NotificationResourceType } from '@/features/notification/types';
import { NotificationCenterScreen } from '@/screens/NotificationCenterScreen';

/**
 * 通知中心路由：登录守卫通过后渲染 NotificationCenterScreen，点击资源时 data_source 跳转
 * /data-sources 列表，其余类型跳转 /{resourceType}/{resourceId} 详情；接口 401 时刷新
 * 会话并携带 redirect 重定向 /login。
 *
 * @returns {JSX.Element} 通知中心页、加载态或重定向。
 */
export default function NotificationsRoute() {
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

  const handleResourcePress = useCallback(
    (resourceType: NotificationResourceType, resourceId: number) => {
      const path =
        resourceType === 'data_source' ? '/data-sources' : `/${resourceType}/${resourceId}`;
      router.push(path as `/analysis/${number}` | `/dashboard/${number}` | `/dataset/${number}`);
    },
    [router],
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

  return (
    <NotificationCenterScreen
      onBackPress={() => router.back()}
      onResourcePress={handleResourcePress}
      onUnauthorized={handleUnauthorized}
    />
  );
}
