import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { AuthProvider } from '@/features/auth/auth-context';

import '../global.css';

/**
 * 根布局：以深色 StatusBar 与 AuthProvider 包裹全部路由，经由无标题栏、fade 切换动画的
 * Stack 承载各页面，为各路由的登录守卫提供认证状态。
 *
 * @returns {JSX.Element} 应用根布局。
 */
export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <AuthProvider>
        <Stack screenOptions={{ animation: 'fade', headerShown: false }} />
      </AuthProvider>
    </>
  );
}
