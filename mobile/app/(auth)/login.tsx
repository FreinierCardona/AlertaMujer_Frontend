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
import AppInput from '../../components/AppInput';
import type { FieldErrors } from '../../utils/validations';
import { hasValidationErrors, validateEmail, validatePassword } from '../../utils/validations';

type LoginField = 'email' | 'password';

export default function LoginScreen() {
  const router = useRouter();

  // Estado que almacena el correo electronico ingresado por el usuario.
  const [email, setEmail] = useState('');

  // Estado que almacena la contrasena ingresada en el formulario de login.
  const [password, setPassword] = useState('');

  // Guarda los mensajes de error para mostrarlos debajo de cada input.
  const [errors, setErrors] = useState<FieldErrors<LoginField>>({});

  function updateField(field: LoginField, value: string) {
    // Actualiza el campo correspondiente sin modificar los demas estados del formulario.
    if (field === 'email') setEmail(value);
    if (field === 'password') setPassword(value);

    // Si el usuario ya vio un error, se revalida en vivo para mejorar la experiencia.
    if (errors[field]) {
      setErrors((currentErrors) => ({
        ...currentErrors,
        [field]: field === 'email' ? validateEmail(value) : validatePassword(value),
      }));
    }
  }

  function handleLogin() {
    // Validaciones del formulario antes de permitir la navegacion al home.
    const validationErrors: FieldErrors<LoginField> = {
      email: validateEmail(email),
      password: validatePassword(password),
    };

    if (hasValidationErrors(validationErrors)) {
      setErrors(validationErrors);
      return;
    }

    router.replace(Routes.home);
  }

  function handleRegister() {
    // Navega al primer paso del registro manteniendo el stack de autenticacion.
    router.push(Routes.registerStep1);
  }

  function handleForgotPassword() {
    // Abre el flujo para recuperar la contrasena desde el correo.
    router.push(Routes.forgotPassword);
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
          <View style={styles.topSpace} />

          <View style={styles.form}>
            <AppInput
              label="Correo electrónico"
              placeholder="tu@email.com"
              value={email}
              onChangeText={(value) => updateField('email', value)}
              error={errors.email}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <AppInput
              label="Contraseña"
              placeholder="••••••••••••"
              value={password}
              onChangeText={(value) => updateField('password', value)}
              error={errors.password}
              secureTextEntry
              showPasswordToggle
            />

            <AppButton
              title="Iniciar sesión"
              onPress={handleLogin}
              style={styles.loginButton}
            />

            <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotContainer}>
              <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.bottomSection}>
            <View style={styles.divider} />
            <Text style={styles.noAccountText}>¿No tienes una cuenta?</Text>
            <AppButton
              title="Registrarse"
              onPress={handleRegister}
              variant="outline"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl },
  topSpace: { height: 200 },
  form: { gap: 4 },
  loginButton: { marginTop: Spacing.md },
  forgotContainer: { alignItems: 'center', marginTop: Spacing.md },
  forgotText: { fontSize: Typography.sm, color: Colors.primary, fontWeight: Typography.medium },
  bottomSection: { marginTop: Spacing.xxl, alignItems: 'center', gap: Spacing.md },
  divider: { width: '100%', height: 1, backgroundColor: Colors.divider },
  noAccountText: { fontSize: Typography.sm, color: Colors.textMedium },
});
