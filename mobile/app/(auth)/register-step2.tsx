import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
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
  REQUIRED_FIELD_MESSAGE,
  hasValidationErrors,
  validateEmail,
  validatePassword,
  validatePasswordConfirmation,
} from '../../utils/validations';

type RegisterStep2Field = 'email' | 'password' | 'confirmPassword' | 'accepted';

export default function RegisterStep2Screen() {
  const router = useRouter();

  // Datos de acceso que se solicitaran para crear la cuenta.
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Controla si la usuaria acepto terminos y politica de privacidad.
  const [accepted, setAccepted] = useState(false);

  // Mensajes visibles debajo de cada input o bloque del formulario.
  const [errors, setErrors] = useState<FieldErrors<RegisterStep2Field>>({});

  function handleBack() {
    // Vuelve al paso anterior de registro o al login si la pantalla se abrio directamente.
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace(Routes.login);
  }

  function updateField(field: Exclude<RegisterStep2Field, 'accepted'>, value: string) {
    if (field === 'email') setEmail(value);
    if (field === 'password') setPassword(value);
    if (field === 'confirmPassword') setConfirmPassword(value);

    // Cuando un error ya esta en pantalla, se actualiza con cada cambio del usuario.
    if (errors[field]) {
      const nextPassword = field === 'password' ? value : password;
      const nextConfirmation = field === 'confirmPassword' ? value : confirmPassword;
      const validationMap = {
        email: validateEmail(value),
        password: validatePassword(value),
        confirmPassword: validatePasswordConfirmation(nextPassword, nextConfirmation),
      };

      setErrors((currentErrors) => ({
        ...currentErrors,
        [field]: validationMap[field],
        confirmPassword:
          field === 'password'
            ? validatePasswordConfirmation(nextPassword, confirmPassword)
            : currentErrors.confirmPassword,
      }));
    }
  }

  function toggleAccepted() {
    const nextAccepted = !accepted;
    setAccepted(nextAccepted);

    // Si el usuario corrige la aceptacion, se limpia el mensaje de error del checkbox.
    if (errors.accepted) {
      setErrors((currentErrors) => ({
        ...currentErrors,
        accepted: nextAccepted ? '' : REQUIRED_FIELD_MESSAGE,
      }));
    }
  }

  function handleCreateAccount() {
    // Valida correo, contrasena, confirmacion y aceptacion antes de enviar codigo.
    const validationErrors: FieldErrors<RegisterStep2Field> = {
      email: validateEmail(email),
      password: validatePassword(password),
      confirmPassword: validatePasswordConfirmation(password, confirmPassword),
      accepted: accepted ? '' : REQUIRED_FIELD_MESSAGE,
    };

    if (hasValidationErrors(validationErrors)) {
      setErrors(validationErrors);
      return;
    }

    router.push({
      pathname: Routes.verifyCode,
      params: { flow: 'register', destination: email.trim() },
    });
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
            <Text style={styles.title}>Crear Cuenta</Text>
            <Text style={styles.subtitle}>Completa tus datos</Text>
          </View>

          <View style={styles.form}>
            <AppInput
              label="Correo electrónico"
              placeholder="maria@email.com"
              value={email}
              onChangeText={(value) => updateField('email', value)}
              error={errors.email}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
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

          <TouchableOpacity
            style={styles.termsRow}
            onPress={toggleAccepted}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, accepted && styles.checkboxActive, errors.accepted && styles.checkboxError]}>
              {accepted && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <View style={styles.termsTextContainer}>
              <Text style={styles.termsText}>Aceptas nuestros </Text>
              <Text style={styles.termsLink}>Términos de Servicio y Política de Privacidad</Text>
              {errors.accepted && <Text style={styles.termsError}>{errors.accepted}</Text>}
            </View>
          </TouchableOpacity>

          <AppButton
            title="Crear Cuenta"
            onPress={handleCreateAccount}
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
  titleContainer: { alignItems: 'center', marginBottom: Spacing.xl },
  title: { fontSize: Typography.xl, fontWeight: Typography.bold, color: Colors.primary },
  subtitle: { fontSize: Typography.base, color: Colors.textMedium, marginTop: 4 },
  form: { gap: 4 },
  termsRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: Spacing.md, marginBottom: Spacing.lg, gap: Spacing.sm },
  checkbox: { width: 20, height: 20, borderWidth: 1.5, borderColor: Colors.textDark, borderRadius: 4, justifyContent: 'center', alignItems: 'center', marginTop: 2 },
  checkboxActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  checkboxError: { borderColor: Colors.danger },
  checkmark: { color: Colors.white, fontSize: 12, fontWeight: Typography.bold },
  termsTextContainer: { flex: 1 },
  termsText: { fontSize: Typography.sm, color: Colors.textDark },
  termsLink: { fontSize: Typography.sm, color: Colors.primary, fontWeight: Typography.medium },
  termsError: { fontSize: Typography.xs, color: Colors.dangerDark, marginTop: 4 },
});
