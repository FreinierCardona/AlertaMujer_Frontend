// Botón reutilizable con variantes accesibles, tema dinámico y estado de carga.
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import { useAppTheme } from '@shared/theme';

type ButtonVariant = 'primary' | 'outline' | 'danger' | 'ghost';
interface Props {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  accessibilityHint?: string;
}
export default function AppButton({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  textStyle,
  accessibilityHint,
}: Props) {
  const { colors, resolvedMode, typography } = useAppTheme();
  const backgrounds = {
    primary: colors.primary,
    outline: 'transparent',
    danger: colors.danger,
    ghost: 'transparent',
  };
  const foregrounds = {
    primary: resolvedMode === 'dark' ? '#241326' : colors.textWhite,
    outline: colors.primary,
    danger: colors.textWhite,
    ghost: colors.textDark,
  };
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: backgrounds[variant],
          borderColor: variant === 'outline' ? colors.primary : 'transparent',
          opacity: disabled ? 0.45 : pressed ? 0.78 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={foregrounds[variant]} />
      ) : (
        <Text
          adjustsFontSizeToFit
          minimumFontScale={0.75}
          numberOfLines={1}
          style={[
            styles.label,
            {
              color: foregrounds[variant],
              fontSize: typography.base,
              fontWeight: typography.semiBold,
            },
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}
const styles = StyleSheet.create({
  button: {
    minHeight: 50,
    borderRadius: 999,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  label: { textAlign: 'center' },
});
