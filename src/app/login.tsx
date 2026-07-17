import { Redirect, useRouter } from 'expo-router';

import { useAuth } from '@/features/auth/auth-context';
import type { LoginCredentials } from '@/features/auth/types';
import { LoginScreen } from '../screens/LoginScreen';

export default function LoginRoute() {
  const router = useRouter();
  const { login, status } = useAuth();

  if (status === 'authenticated') {
    return <Redirect href="/analyses" />;
  }

  const handleBackPress = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/welcome');
  };

  const handleLogin = async (credentials: LoginCredentials) => {
    await login(credentials);
    router.replace('/analyses');
  };

  return <LoginScreen onBackPress={handleBackPress} onLogin={handleLogin} />;
}
