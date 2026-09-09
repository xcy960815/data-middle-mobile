import { useCallback } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';

import type { DmsApiError } from '@/features/auth/api-client';
import { useAuth } from '@/features/auth/auth-context';
import { DashboardDetailScreen } from '@/screens/DashboardDetailScreen';

export default function DashboardDetailRoute() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { refresh, status } = useAuth();
  const dashboardId = Number(id);
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
  if (status === 'loading')
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator color="#397cf0" />
        <Text className="mt-3 text-sm text-[#687990]">正在检查登录会话…</Text>
      </View>
    );
  if (status === 'unauthenticated') return <Redirect href="/login" />;
  if (!Number.isInteger(dashboardId) || dashboardId <= 0) return <Redirect href="/dashboards" />;
  return (
    <DashboardDetailScreen
      dashboardId={dashboardId}
      onBackPress={() => router.back()}
      onUnauthorized={handleUnauthorized}
    />
  );
}
