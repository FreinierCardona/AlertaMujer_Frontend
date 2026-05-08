import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import type { TextInputProps, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import Typography from '../constants/Typography';
import Spacing from '../constants/Spacing';

interface AppInputProps extends TextInputProps {
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
  ...rest
}: AppInputProps) {
  // Estado local para mostrar u ocultar contrasenas sin afectar el formulario padre.
  const [passwordVisible, setPasswordVisible] = useState(false);

  // Si el input es seguro y el usuario no activo el ojo, el texto se mantiene oculto.
  const isSecure = secureTextEntry && !passwordVisible;

  return (
    <View style={[styles.container, containerStyle]}>
      {/* Etiqueta visible del campo. Ejemplo: Correo electronico o Contrasena. */}
      {label && <Text style={styles.label}>{label}</Text>}

      {/* Contenedor visual del input: icono opcional, caja de texto y ojo de contrasena. */}
      <View style={[styles.inputRow, error && styles.inputRowError]}>
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color={error ? Colors.danger : Colors.primary}
            style={styles.icon}
          />
        )}
        {icon && <View style={styles.separator} />}
        <TextInput
          style={styles.input}
          placeholderTextColor={Colors.textLight}
          secureTextEntry={isSecure}
          {...rest}
        />

        {/* Boton para mostrar u ocultar contrasenas cuando el campo lo permite. */}
        {showPasswordToggle && secureTextEntry && (
          <TouchableOpacity
            onPress={() => setPasswordVisible(!passwordVisible)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={passwordVisible ? 'eye' : 'eye-off'}
              size={20}
              color={Colors.textLight}
            />
          </TouchableOpacity>
        )}
      </View>
      {/* El error tiene prioridad visual sobre la ayuda para corregir rapido el campo. */}
      {error ? <Text style={styles.error}>{error}</Text> : hint && <Text style={styles.hint}>{hint}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: Typography.sm,
    fontWeight: Typography.medium,
    color: Colors.textDark,
    marginBottom: 6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inputBackground,
    borderRadius: Spacing.radiusMd,
    paddingHorizontal: Spacing.md,
    height: 52,
    shadowColor: '#C0A0C0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputRowError: {
    borderWidth: 1.5,
    borderColor: Colors.danger,
    shadowColor: Colors.danger,
  },
  icon: {
    marginRight: 4,
  },
  separator: {
    width: 1,
    height: 20,
    backgroundColor: Colors.inputBorder,
    marginHorizontal: 8,
  },
  input: {
    flex: 1,
    fontSize: Typography.base,
    color: Colors.textDark,
  },
  hint: {
    fontSize: Typography.xs,
    color: Colors.textMedium,
    marginTop: 4,
  },
  error: {
    fontSize: Typography.xs,
    color: Colors.dangerDark,
    marginTop: 4,
  },
});
