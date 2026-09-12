import { Redirect, useRouter, useLocalSearchParams } from 'expo-router';
import type { Href } from 'expo-router';

import { useAuth } from '@/features/auth/auth-context';
import type { LoginCredentials } from '@/features/auth/types';
import { LoginScreen } from '../screens/LoginScreen';

function resolveRedirectTarget(value: unknown): Href {
  return (
    typeof value === 'string' && value.startsWith('/') && !value.startsWith('//')
      ? value
      : '/analyses'
  ) as Href;
}

export default function LoginRoute() {
  const router = useRouter();
  const { login, status } = useAuth();
  const { redirect } = useLocalSearchParams<{ redirect?: string }>();
  const redirectTarget = resolveRedirectTarget(redirect);

  if (status === 'authenticated') {
    return <Redirect href={redirectTarget} />;
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
    router.replace(redirectTarget);
  };

  return (
    <LoginScreen
      onBackPress={handleBackPress}
      onRegisterPress={() => router.push('/register')}
      onLogin={handleLogin}
    />
  );
}
