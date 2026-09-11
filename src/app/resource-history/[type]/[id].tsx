import { useCallback } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { Redirect, useLocalSearchParams, usePathname, useRouter } from 'expo-router';

import type { DmsApiError } from '@/features/auth/api-client';
import { useAuth } from '@/features/auth/auth-context';
import type { ResourceHistoryType } from '@/features/resource/use-resource-history';
import { ResourceHistoryScreen } from '@/screens/ResourceHistoryScreen';

const HISTORY_TYPES: readonly ResourceHistoryType[] = ['analysis', 'dashboard', 'dataset'];

export default function ResourceHistoryRoute() {
  const router = useRouter();
  const pathname = usePathname();
  const { type, id, configId } = useLocalSearchParams<{
    type: string;
    id: string;
    configId: string;
  }>();
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

  const resourceId = Number(id);
  const currentConfigId = Number(configId);
  const historyType = HISTORY_TYPES.find((candidate) => candidate === type);

  if (status === 'loading') {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator color="#397cf0" />
        <Text className="mt-3 text-sm text-[#687990]">正在检查登录会话…</Text>
      </View>
    );
  }
  if (status === 'unauthenticated')
    return <Redirect href={{ pathname: '/login', params: { redirect: pathname } }} />;
  if (!historyType || !Number.isInteger(resourceId) || resourceId <= 0) {
    return <Redirect href="/analyses" />;
  }

  return (
    <ResourceHistoryScreen
      type={historyType}
      resourceId={resourceId}
      currentConfigId={currentConfigId}
      onBackPress={() => router.back()}
      onUnauthorized={handleUnauthorized}
    />
  );
}
