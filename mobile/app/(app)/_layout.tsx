import { Stack } from 'expo-router';
import Colors from '../../constants/Colors';

// Layout del area principal de la app.
// El index representa el home con el boton SOS y la barra inferior visual.
export default function AppLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.background },
        animation: 'fade',
      }}
    >
      {/* Registrar index evita errores de pantalla no encontrada al navegar a /(app)/. */}
      <Stack.Screen name="index" />
    </Stack>
  );
}
