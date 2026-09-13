import { useRouter } from 'expo-router';

import { RegisterScreen } from '@/screens/RegisterScreen';

/**
 * 注册路由：渲染 RegisterScreen，注册成功后 replace 到 /login；返回时优先 back，无历史
 * 则 replace 到 /login。
 *
 * @returns {JSX.Element} 注册页。
 */
export default function RegisterRoute() {
  const router = useRouter();

  return (
    <RegisterScreen
      onBackPress={() => {
        if (router.canGoBack()) {
          router.back();
          return;
        }
        router.replace('/login');
      }}
      onRegistered={() => router.replace('/login')}
    />
  );
}
