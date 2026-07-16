import { useRouter } from 'expo-router';

import { AnalysisListScreen } from '../screens/AnalysisListScreen';

export default function AnalysesRoute() {
  const router = useRouter();

  return <AnalysisListScreen onBackPress={() => router.replace('/welcome')} />;
}
