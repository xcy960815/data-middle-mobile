import { useRouter } from 'expo-router';

import { RegisterScreen } from '@/screens/RegisterScreen';

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
