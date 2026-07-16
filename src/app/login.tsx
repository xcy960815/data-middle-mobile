import { useRouter } from 'expo-router';

import { LoginScreen } from '../screens/LoginScreen';

export default function LoginRoute() {
  const router = useRouter();

  const handleBackPress = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/welcome');
  };

  return <LoginScreen onBackPress={handleBackPress} />;
}
