import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { AuthProvider } from '@/features/auth/auth-context';

import '../global.css';

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
