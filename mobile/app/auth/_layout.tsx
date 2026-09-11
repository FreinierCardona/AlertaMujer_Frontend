import { Stack } from 'expo-router';
import Colors from '@shared/theme/Colors';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: Colors.background },
        headerShown: false,
      }}
    />
  );
}
