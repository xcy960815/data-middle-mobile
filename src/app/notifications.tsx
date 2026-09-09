import { useCallback } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { Redirect, useRouter } from 'expo-router';

import type { DmsApiError } from '@/features/auth/api-client';
import { useAuth } from '@/features/auth/auth-context';
import type { NotificationResourceType } from '@/features/notification/types';
import { NotificationCenterScreen } from '@/screens/NotificationCenterScreen';

export default function NotificationsRoute() {
  const router = useRouter();
  const { refresh, status } = useAuth();

  const handleUnauthorized = useCallback(
    async (_error: DmsApiError) => {
      try {
        await refresh();
      } finally {
        router.replace('/login');
      }
    },
    [refresh, router],
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
  if (status === 'unauthenticated') return <Redirect href="/login" />;

  return (
    <NotificationCenterScreen
      onBackPress={() => router.back()}
      onResourcePress={handleResourcePress}
      onUnauthorized={handleUnauthorized}
    />
  );
}
