import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
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
import { validateEmail } from '../../utils/validations';

type ForgotPasswordField = 'email';

export default function ForgotPasswordScreen() {
  const router = useRouter();

  // Correo al que se enviara el codigo de recuperacion.
  const [email, setEmail] = useState('');

  // Error del campo correo para evitar continuar con datos invalidos.
  const [errors, setErrors] = useState<FieldErrors<ForgotPasswordField>>({});

  function handleBack() {
    // Regresa al login cuando el usuario usa la flecha superior.
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace(Routes.login);
  }

  function updateEmail(value: string) {
    setEmail(value);

    // Si ya hay error, se valida mientras escribe para dar respuesta inmediata.
    if (errors.email) {
      setErrors({ email: validateEmail(value) });
    }
  }

  function handleSend() {
    // Valida el correo antes de pasar a la pantalla de codigo.
    const emailError = validateEmail(email);

    if (emailError) {
      setErrors({ email: emailError });
      return;
    }

    router.push({
      pathname: Routes.verifyCode,
      params: { flow: 'forgot', destination: email.trim() },
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
            <Text style={styles.title}>Recuperar contraseña</Text>
            <Text style={styles.subtitle}>
              Ingresa tu correo y te enviaremos un código de verificación
            </Text>
          </View>

          <AppInput
            label="Correo electrónico"
            placeholder="tu@email.com"
            value={email}
            onChangeText={updateEmail}
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <AppButton
            title="Enviar código"
            onPress={handleSend}
            style={styles.sendButton}
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
  sendButton: { marginTop: Spacing.lg },
});
