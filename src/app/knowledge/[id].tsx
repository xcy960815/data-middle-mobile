import { useCallback } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { Redirect, useLocalSearchParams, usePathname, useRouter } from 'expo-router';

import type { DmsApiError } from '@/features/auth/api-client';
import { useAuth } from '@/features/auth/auth-context';
import { KnowledgeDocumentListScreen } from '@/screens/KnowledgeDocumentListScreen';

/**
 * 知识库文档路由：从路径参数取 id、查询参数取 name（缺省回退为“知识库”），id 非正整数
 * 时重定向 /knowledge；登录守卫通过后渲染 KnowledgeDocumentListScreen。
 *
 * @returns {JSX.Element} 知识库文档列表页、加载态或重定向。
 */
export default function KnowledgeDocumentsRoute() {
  const router = useRouter();
  const pathname = usePathname();
  const { refresh, status } = useAuth();
  const params = useLocalSearchParams<{ id?: string; name?: string }>();
  const baseId = Number(params.id);
  const baseName = typeof params.name === 'string' ? params.name : '知识库';

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
  if (!Number.isInteger(baseId) || baseId <= 0) {
    return <Redirect href="/knowledge" />;
  }

  return (
    <KnowledgeDocumentListScreen
      baseId={baseId}
      baseName={baseName}
      onBackPress={() => router.back()}
      onUnauthorized={handleUnauthorized}
    />
  );
}
