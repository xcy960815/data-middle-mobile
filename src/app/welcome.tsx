import { useRouter } from 'expo-router';

import { WelcomeScreen } from '../screens/WelcomeScreen';

export default function WelcomeRoute() {
  const router = useRouter();

  return (
    <WelcomeScreen
      onAnalysisPress={() => router.push('/analyses')}
      onLoginPress={() => router.push('/login')}
    />
  );
}
