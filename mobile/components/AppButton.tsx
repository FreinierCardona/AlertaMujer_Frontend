import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import type { TextStyle, ViewStyle } from 'react-native';
import Colors from '../constants/Colors';
import Typography from '../constants/Typography';
import Spacing from '../constants/Spacing';

type ButtonVariant = 'primary' | 'outline';

interface AppButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export default function AppButton({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
}: AppButtonProps) {
  // Define si se usa el estilo principal o el estilo de borde.
  const isPrimary = variant === 'primary';

  return (
    <TouchableOpacity
      style={[
        styles.button,
        isPrimary ? styles.primaryButton : styles.outlineButton,
        (disabled || loading) && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {/* Mientras loading esta activo se muestra el indicador y se bloquea el boton. */}
      {loading ? (
        <ActivityIndicator color={isPrimary ? Colors.white : Colors.primary} />
      ) : (
        <Text style={[styles.text, isPrimary ? styles.primaryText : styles.outlineText]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 52,
    borderRadius: Spacing.radiusFull,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  primaryButton: {
    backgroundColor: Colors.primary,
  },
  outlineButton: {
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.textDark,
  },
  disabled: {
    opacity: 0.6,
  },
  text: {
    fontSize: Typography.base,
    fontWeight: Typography.semiBold,
  },
  primaryText: {
    color: Colors.white,
  } as TextStyle,
  outlineText: {
    color: Colors.textDark,
  } as TextStyle,
});
