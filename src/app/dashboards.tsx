import { useCallback } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { Redirect, useRouter } from 'expo-router';

import type { DmsApiError } from '@/features/auth/api-client';
import { useAuth } from '@/features/auth/auth-context';
import { DashboardListScreen } from '../screens/DashboardListScreen';

export default function DashboardsRoute() {
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
    return <Redirect href="/login" />;
  }

  return (
    <DashboardListScreen
      onBackPress={() => router.replace('/welcome')}
      onUnauthorized={handleUnauthorized}
    />
  );
}
