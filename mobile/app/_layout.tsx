// Compone providers, tema global y guardas de sesión y alerta para todas las rutas.
import 'react-native-gesture-handler';
import 'react-native-reanimated';
import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import AppProviders from '@shell/providers/AppProviders';
import useAppState from '@shell/providers/useAppState';
import Routes from '@shell/navigation/routes';
import { useAppTheme } from '@shared/theme';
import { useI18n } from '@shared/i18n';

function RootNavigator() {
  const { colors, resolvedMode, ready: themeReady } = useAppTheme();
  const { ready: languageReady } = useI18n();
  const { hydrated, sessionEmail, activeEmergency } = useAppState();
  const segments = useSegments();
  const router = useRouter();
  useEffect(() => {
    if (!hydrated || !themeReady || !languageReady) return;
    const root = segments[0];
    const currentPath = segments.join('/');
    const emergencyContext =
      currentPath === 'evidence/capture' ||
      currentPath === 'emergency/active' ||
      currentPath.startsWith('emergency/chat');
    if (activeEmergency && !emergencyContext) {
      router.replace(Routes.activeEmergency);
      return;
    }
    if (!sessionEmail && root !== 'auth') {
      router.replace(Routes.login);
    }
    if (sessionEmail && root === 'auth')
      router.replace(activeEmergency ? Routes.activeEmergency : Routes.home);
  }, [
    activeEmergency,
    hydrated,
    languageReady,
    router,
    segments,
    sessionEmail,
    themeReady,
  ]);
  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="tabs" />
        <Stack.Screen
          name="emergency/active"
          options={{ gestureEnabled: false }}
        />
      </Stack>
      <StatusBar style={resolvedMode === 'dark' ? 'light' : 'dark'} />
    </>
  );
}
export default function RootLayout() {
  return (
    <AppProviders>
      <RootNavigator />
    </AppProviders>
  );
}
