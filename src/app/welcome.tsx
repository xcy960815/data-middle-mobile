import { useRouter } from 'expo-router';

import { WelcomeScreen } from '../screens/WelcomeScreen';

/**
 * 欢迎页路由：渲染 WelcomeScreen，分析入口跳转 /analyses，登录入口跳转 /login。
 *
 * @returns {JSX.Element} 欢迎页。
 */
export default function WelcomeRoute() {
  const router = useRouter();

  return (
    <WelcomeScreen
      onAnalysisPress={() => router.push('/analyses')}
      onLoginPress={() => router.push('/login')}
    />
  );
}
