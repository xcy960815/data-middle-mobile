import { ActivityIndicator, Text, View } from 'react-native';
import { Redirect, usePathname, useRouter } from 'expo-router';

import { useAuth } from '@/features/auth/auth-context';
import { AccountScreen } from '@/screens/AccountScreen';

/**
 * 账户中心路由：登录守卫通过后渲染 AccountScreen，提供 /monitor、/knowledge、登录日志、
 * 告警日志、邮件日志与邮件任务入口；未登录时携带 redirect 参数重定向 /login。
 *
 * @returns {JSX.Element} 账户中心页、加载态或重定向。
 */
export default function AccountRoute() {
  const router = useRouter();
  const pathname = usePathname();
  const { status } = useAuth();

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
    <AccountScreen
      onBackPress={() => router.back()}
      onMonitorPress={() => router.push('/monitor')}
      onKnowledgePress={() => router.push('/knowledge')}
      onLoginLogsPress={() => router.push('/login-logs')}
      onAlarmLogsPress={() => router.push('/alarm-logs')}
      onEmailLogsPress={() => router.push('/email-logs')}
      onEmailTasksPress={() => router.push('/email-tasks')}
    />
  );
}
