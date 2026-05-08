import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '../../constants/Colors';
import Typography from '../../constants/Typography';
import Spacing from '../../constants/Spacing';
import Routes from '../../constants/Routes';
import AppButton from '../../components/AppButton';
import AppBackButton from '../../components/AppBackButton';
import AppInput from '../../components/AppInput';
import type { FieldErrors } from '../../utils/validations';
import {
  hasValidationErrors,
  validatePassword,
  validatePasswordConfirmation,
} from '../../utils/validations';

type ResetPasswordField = 'password' | 'confirmPassword';

export default function ResetPasswordScreen() {
  const router = useRouter();

  // Nueva contraseña que se guardara despues de validar el codigo.
  const [password, setPassword] = useState('');

  // Confirmacion para evitar errores de digitacion en la nueva contraseña.
  const [confirmPassword, setConfirmPassword] = useState('');

  // Errores visibles del formulario de restablecimiento.
  const [errors, setErrors] = useState<FieldErrors<ResetPasswordField>>({});

  function handleBack() {
    // Permite volver a verificacion; si no hay historial, regresa al login.
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace(Routes.login);
  }

  function updateField(field: ResetPasswordField, value: string) {
    if (field === 'password') setPassword(value);
    if (field === 'confirmPassword') setConfirmPassword(value);

    // Mantiene los mensajes actualizados cuando el usuario corrige el formulario.
    if (errors[field]) {
      const nextPassword = field === 'password' ? value : password;
      const nextConfirmation = field === 'confirmPassword' ? value : confirmPassword;

      setErrors((currentErrors) => ({
        ...currentErrors,
        [field]:
          field === 'password'
            ? validatePassword(value)
            : validatePasswordConfirmation(nextPassword, nextConfirmation),
        confirmPassword:
          field === 'password'
            ? validatePasswordConfirmation(nextPassword, confirmPassword)
            : currentErrors.confirmPassword,
      }));
    }
  }

  function handleSavePassword() {
    // Valida seguridad y coincidencia antes de finalizar la recuperacion.
    const validationErrors: FieldErrors<ResetPasswordField> = {
      password: validatePassword(password),
      confirmPassword: validatePasswordConfirmation(password, confirmPassword),
    };

    if (hasValidationErrors(validationErrors)) {
      setErrors(validationErrors);
      return;
    }

    Alert.alert(
      'Contraseña actualizada',
      'Ahora puedes iniciar sesión con tu nueva contraseña.',
      [{ text: 'Continuar', onPress: () => router.replace(Routes.login) }]
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <AppBackButton onPress={handleBack} style={styles.backButton} />

          <View style={styles.titleContainer}>
            <Text style={styles.title}>Nueva contraseña</Text>
            <Text style={styles.subtitle}>
              Crea una contraseña segura para proteger tu cuenta.
            </Text>
          </View>

          <View style={styles.form}>
            <AppInput
              label="Contraseña"
              placeholder="Mínimo 12 caracteres"
              value={password}
              onChangeText={(value) => updateField('password', value)}
              error={errors.password}
              secureTextEntry
              showPasswordToggle
              hint="Mínimo 12 caracteres, incluir mayúscula, número y símbolo"
            />

            <AppInput
              label="Confirmar contraseña"
              placeholder="Repite tu contraseña"
              value={confirmPassword}
              onChangeText={(value) => updateField('confirmPassword', value)}
              error={errors.confirmPassword}
              secureTextEntry
              showPasswordToggle
            />
          </View>

          <AppButton
            title="Guardar contraseña"
            onPress={handleSavePassword}
            style={styles.saveButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl },
  backButton: { marginTop: Spacing.sm, marginBottom: Spacing.sm },
  titleContainer: { alignItems: 'center', marginBottom: Spacing.xl, marginTop: Spacing.xl },
  title: { fontSize: Typography.xl, fontWeight: Typography.bold, color: Colors.primary, marginBottom: Spacing.sm },
  subtitle: { fontSize: Typography.base, color: Colors.textMedium, textAlign: 'center', lineHeight: 22 },
  form: { gap: 4 },
  saveButton: { marginTop: Spacing.lg },
});
