import { useCallback } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { Redirect, usePathname, useRouter } from 'expo-router';

import type { DmsApiError } from '@/features/auth/api-client';
import { useAuth } from '@/features/auth/auth-context';
import { KnowledgeBaseListScreen } from '@/screens/KnowledgeBaseListScreen';

/**
 * 知识库列表路由：登录守卫通过后渲染 KnowledgeBaseListScreen，点击知识库跳转
 * /knowledge/{id}?name={encodeURIComponent(name)}，接口 401 时刷新会话并携带 redirect
 * 重定向 /login。
 *
 * @returns {JSX.Element} 知识库列表页、加载态或重定向。
 */
export default function KnowledgeRoute() {
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
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator color="#397cf0" />
        <Text className="mt-3 text-sm text-[#687990]">正在检查登录会话…</Text>
      </View>
    );
  }
  if (status === 'unauthenticated') {
    return <Redirect href={{ pathname: '/login', params: { redirect: pathname } }} />;
  }

  return (
    <KnowledgeBaseListScreen
      onBackPress={() => router.back()}
      onBasePress={(base) =>
        router.push(`/knowledge/${base.id}?name=${encodeURIComponent(base.name)}`)
      }
      onUnauthorized={handleUnauthorized}
    />
  );
}
