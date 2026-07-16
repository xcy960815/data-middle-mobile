import { useRouter } from 'expo-router';

import { DashboardListScreen } from '../screens/DashboardListScreen';

export default function DashboardsRoute() {
  const router = useRouter();

  return <DashboardListScreen onBackPress={() => router.replace('/welcome')} />;
}
