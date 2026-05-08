import { Stack } from 'expo-router';
import Colors from '../../constants/Colors';

// Layout del flujo de autenticacion.
// Registra las pantallas hijas para que Expo Router las encuentre en Expo Go.
export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.background },
        animation: 'slide_from_right',
      }}
    >
      {/* Pantalla inicial del flujo de autenticacion. */}
      <Stack.Screen name="login" />

      {/* Registro dividido en dos pasos para mantener formularios pequenos. */}
      <Stack.Screen name="register-step1" />
      <Stack.Screen name="register-step2" />

      {/* Recuperacion de contrasena: correo, codigo y nueva contrasena. */}
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="verify-code" />
      <Stack.Screen name="reset-password" />
    </Stack>
  );
}
