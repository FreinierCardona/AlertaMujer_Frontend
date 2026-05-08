// Gesture Handler debe cargarse primero para evitar fallos de navegacion en Expo Go.
import 'react-native-gesture-handler';
import 'react-native-reanimated';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Colors from '../constants/Colors';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }}>
        {/* index redirige al login al abrir la app. */}
        <Stack.Screen name="index" />

        {/* home es la pantalla principal despues de autenticarse. */}
        <Stack.Screen name="home" />

        {/* Grupo de pantallas de autenticacion. */}
        <Stack.Screen name="(auth)" />
      </Stack>
      <StatusBar style="dark" backgroundColor={Colors.background} translucent={false} />
    </SafeAreaProvider>
  );
}
