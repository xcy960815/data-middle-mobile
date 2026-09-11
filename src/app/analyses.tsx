import { useCallback } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { Redirect, usePathname, useRouter } from 'expo-router';

import type { DmsApiError } from '@/features/auth/api-client';
import { useAuth } from '@/features/auth/auth-context';
import { AnalysisListScreen } from '../screens/AnalysisListScreen';

export default function AnalysesRoute() {
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
    <AnalysisListScreen
      onAnalysisPress={(analysis) => router.push(`/analysis/${analysis.id}`)}
      onBackPress={() => router.replace('/welcome')}
      onNotificationsPress={() => router.push('/notifications')}
      onUnauthorized={handleUnauthorized}
    />
  );
}
