// Campo reutilizable con etiqueta, ayuda, error y control opcional de contraseña.
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { TextInputProps, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@shared/theme';
interface Props extends TextInputProps {
  label?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  hint?: string;
  error?: string;
  showPasswordToggle?: boolean;
  containerStyle?: ViewStyle;
}
export default function AppInput({
  label,
  icon,
  hint,
  error,
  showPasswordToggle = false,
  containerStyle,
  secureTextEntry,
  multiline,
  ...rest
}: Props) {
  const [visible, setVisible] = useState(false);
  const { colors, spacing, typography } = useAppTheme();
  return (
    <View style={[{ marginBottom: spacing.md }, containerStyle]}>
      {label ? (
        <Text
          style={{
            color: colors.textDark,
            fontSize: typography.sm,
            fontWeight: typography.medium,
            marginBottom: 6,
          }}
        >
          {label}
        </Text>
      ) : null}
      <View
        style={[
          styles.row,
          {
            minHeight: multiline ? 112 : 52,
            alignItems: multiline ? 'flex-start' : 'center',
            backgroundColor: colors.inputBackground,
            borderColor: error ? colors.danger : colors.inputBorder,
            borderRadius: spacing.radiusMd,
          },
        ]}
      >
        {icon ? (
          <Ionicons
            name={icon}
            size={20}
            color={error ? colors.danger : colors.primary}
            style={{ marginTop: multiline ? 14 : 0 }}
          />
        ) : null}
        <TextInput
          {...rest}
          multiline={multiline}
          secureTextEntry={secureTextEntry && !visible}
          placeholderTextColor={colors.textLight}
          accessibilityLabel={label}
          style={[
            styles.input,
            {
              color: colors.textDark,
              fontSize: typography.base,
              textAlignVertical: multiline ? 'top' : 'center',
              paddingTop: multiline ? 14 : 0,
            },
          ]}
        />
        {showPasswordToggle && secureTextEntry ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => setVisible((current) => !current)}
            style={styles.eye}
          >
            <Ionicons
              name={visible ? 'eye-off-outline' : 'eye-outline'}
              size={22}
              color={colors.textMedium}
            />
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <Text
          accessibilityLiveRegion="polite"
          style={{
            color: colors.dangerDark,
            fontSize: typography.xs,
            marginTop: 5,
          }}
        >
          {error}
        </Text>
      ) : hint ? (
        <Text
          style={{
            color: colors.textMedium,
            fontSize: typography.xs,
            marginTop: 5,
          }}
        >
          {hint}
        </Text>
      ) : null}
    </View>
  );
}
const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    borderWidth: 1.5,
    paddingHorizontal: 14,
    gap: 10,
  },
  input: { flex: 1, minHeight: 48 },
  eye: { padding: 8, alignSelf: 'center' },
});
