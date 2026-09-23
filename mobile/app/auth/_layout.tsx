// Configura la pila de autenticación con el tema global activo.
import { Stack } from 'expo-router';
import { useAppTheme } from '@shared/theme';

export default function AuthLayout() {
  const { colors } = useAppTheme();
  return (
    <Stack
      screenOptions={{
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: colors.background },
        headerShown: false,
      }}
    />
  );
}
