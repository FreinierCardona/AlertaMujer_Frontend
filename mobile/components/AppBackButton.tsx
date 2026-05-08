import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import type { ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import Spacing from '../constants/Spacing';

interface AppBackButtonProps {
  onPress: () => void;
  style?: ViewStyle;
}

export default function AppBackButton({ onPress, style }: AppBackButtonProps) {
  return (
    <TouchableOpacity
      // Mejora accesibilidad para lectores de pantalla.
      accessibilityLabel="Volver"
      accessibilityRole="button"
      activeOpacity={0.72}
      // Aumenta el area tactil sin agrandar visualmente el boton.
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      onPress={onPress}
      style={[styles.button, style]}
    >
      <Ionicons name="arrow-back" size={28} color={Colors.textDark} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 42,
    height: 42,
    borderRadius: Spacing.radiusFull,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
  },
});
