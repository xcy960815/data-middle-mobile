import { useCallback } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { Redirect, useLocalSearchParams, usePathname, useRouter } from 'expo-router';

import type { DmsApiError } from '@/features/auth/api-client';
import { useAuth } from '@/features/auth/auth-context';
import type { ResourceHistoryType } from '@/features/resource/use-resource-history';
import { ResourceHistoryScreen } from '@/screens/ResourceHistoryScreen';

const HISTORY_TYPES: readonly ResourceHistoryType[] = ['analysis', 'dashboard', 'dataset'];

/**
 * 资源历史路由：路径参数 type 仅接受 analysis | dashboard | dataset，id 为资源 ID，
 * configId 经查询参数传入；type、id 或 configId 非法时重定向 /analyses，登录守卫通过后
 * 渲染 ResourceHistoryScreen。
 *
 * @returns {JSX.Element} 资源历史页、加载态或重定向。
 */
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
  if (
    !historyType ||
    !Number.isInteger(resourceId) ||
    resourceId <= 0 ||
    !Number.isInteger(currentConfigId) ||
    currentConfigId <= 0
  ) {
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
