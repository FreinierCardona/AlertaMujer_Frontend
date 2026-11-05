// Superficie reutilizable para agrupar información relacionada sin ruido visual.
import type { ReactNode } from 'react';
import { View } from 'react-native';
import type { ViewStyle } from 'react-native';
import { useAppTheme } from '@shared/theme';
export default function AppCard({
  children,
  style,
}: {
  children: ReactNode;
  style?: ViewStyle;
}) {
  const { colors, spacing } = useAppTheme();
  return (
    <View
      style={[
        {
          backgroundColor: colors.white,
          borderColor: colors.inputBorder,
          borderWidth: 1,
          borderRadius: spacing.radiusLg,
          padding: spacing.md,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
