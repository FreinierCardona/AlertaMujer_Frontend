// Gesture Handler debe cargarse primero para evitar fallos de navegacion en Expo Go.
import 'react-native-gesture-handler';
import 'react-native-reanimated';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import AppProviders from '@shell/providers/AppProviders';
import { useAppTheme } from '@shared/theme';

function RootNavigator() {
  const { colors, resolvedMode } = useAppTheme();

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="tabs" />
      </Stack>
      <StatusBar
        style={resolvedMode === 'dark' ? 'light' : 'dark'}
      />
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
