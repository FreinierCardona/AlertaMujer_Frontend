import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '../../constants/Colors';
import Typography from '../../constants/Typography';
import Spacing from '../../constants/Spacing';
import Routes from '../../constants/Routes';
import AppButton from '../../components/AppButton';
import AppBackButton from '../../components/AppBackButton';
import useCountdown from '../../hooks/useCountdown';

const CODE_LENGTH = 6;
const RESEND_SECONDS = 60;

type VerificationFlow = 'register' | 'forgot';

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return `00:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export default function VerifyCodeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ flow?: VerificationFlow; destination?: string }>();
  const flow = params.flow ?? 'register';
  const destination = params.destination ?? '';

  // Cada posicion del arreglo representa un cuadro del codigo de verificacion.
  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [resendMessage, setResendMessage] = useState('');

  // Referencias usadas para mover el foco automaticamente entre inputs.
  const inputRefs = useRef<(TextInput | null)[]>([]);

  // Hook de contador para deshabilitar "Reenviar codigo" durante 1 minuto.
  const { secondsLeft, isRunning, start } = useCountdown(RESEND_SECONDS);

  useEffect(() => {
    // El codigo se acaba de solicitar en la pantalla anterior.
    start();
  }, [start]);

  function handleBack() {
    // Regresa a la pantalla anterior; si no hay historial, usa el flujo como respaldo.
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace(flow === 'forgot' ? Routes.forgotPassword : Routes.login);
  }

  function handleDigitChange(text: string, index: number) {
    // Solo se aceptan numeros; si el usuario pega varios, se reparten en los cuadros.
    const digits = text.replace(/\D/g, '').slice(0, CODE_LENGTH - index);

    setCode((currentCode) => {
      const nextCode = [...currentCode];

      if (!digits) {
        nextCode[index] = '';
        return nextCode;
      }

      digits.split('').forEach((digit, offset) => {
        nextCode[index + offset] = digit;
      });

      return nextCode;
    });
    setResendMessage('');

    if (digits.length > 0) {
      const nextIndex = Math.min(index + digits.length, CODE_LENGTH - 1);
      inputRefs.current[nextIndex]?.focus();
    }
  }

  function handleKeyPress(key: string, index: number) {
    // Si el cuadro actual esta vacio, Backspace mueve el foco al cuadro anterior.
    if (key === 'Backspace' && code[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handleConfirm() {
    // Registro entra a la app; recuperacion continua hacia restablecer contrasena.
    if (flow === 'forgot') {
      router.replace(Routes.resetPassword);
      return;
    }

    router.replace(Routes.home);
  }

  function handleResend() {
    if (isRunning) return;

    // Aqui se conectara el servicio real cuando exista backend; por ahora el flujo
    // deja feedback visible y reinicia el contador de Expo Go.
    const message = destination
      ? `Enviamos un nuevo codigo a ${destination}.`
      : 'Enviamos un nuevo codigo de verificacion.';

    setCode(Array(CODE_LENGTH).fill(''));
    setResendMessage(message);
    start();
    Alert.alert('Codigo reenviado', message);
  }

  const isCodeComplete = code.every((digit) => digit !== '');

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <View style={styles.container}>
          <AppBackButton onPress={handleBack} style={styles.backButton} />

          <Text style={styles.title}>Código de verificación</Text>
          <Text style={styles.description}>
            Ingresa el código de verificación que enviamos a tu correo o teléfono.
          </Text>
          {destination && <Text style={styles.destinationText}>{destination}</Text>}

          <View style={styles.codeContainer}>
            {Array.from({ length: CODE_LENGTH }).map((_, index) => (
              <React.Fragment key={index}>
                {index === 3 && <View style={styles.codeDivider} />}
                <TextInput
                  ref={(element) => {
                    inputRefs.current[index] = element;
                  }}
                  style={[
                    styles.codeInput,
                    code[index] !== '' && styles.codeInputFilled,
                  ]}
                  maxLength={CODE_LENGTH}
                  keyboardType="numeric"
                  value={code[index]}
                  onChangeText={(text) => handleDigitChange(text, index)}
                  onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                  textAlign="center"
                />
              </React.Fragment>
            ))}
          </View>

          <AppButton
            title="Confirmar código"
            onPress={handleConfirm}
            disabled={!isCodeComplete}
            style={styles.confirmButton}
          />

          <TouchableOpacity
            onPress={handleResend}
            style={[styles.resendContainer, isRunning && styles.resendDisabled]}
            disabled={isRunning}
          >
            <Text style={[styles.resendText, isRunning && styles.resendTextDisabled]}>
              {isRunning ? `Reenviar código (${formatTime(secondsLeft)})` : 'Reenviar código'}
            </Text>
          </TouchableOpacity>
          {resendMessage ? <Text style={styles.resendMessage}>{resendMessage}</Text> : null}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  container: { flex: 1, paddingHorizontal: Spacing.lg, paddingTop: Spacing.md },
  backButton: { marginBottom: Spacing.xl },
  title: { fontSize: Typography.xl, fontWeight: Typography.bold, color: Colors.primary, textAlign: 'center', marginBottom: Spacing.xl },
  description: { fontSize: Typography.base, color: Colors.textMedium, textAlign: 'center', lineHeight: 22, marginBottom: Spacing.xl, paddingHorizontal: Spacing.md },
  destinationText: { fontSize: Typography.sm, color: Colors.primary, textAlign: 'center', fontWeight: Typography.medium, marginTop: -Spacing.lg, marginBottom: Spacing.xl },
  codeContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.xl },
  codeInput: { width: 44, height: 52, backgroundColor: Colors.white, borderRadius: Spacing.radiusMd, fontSize: Typography.xl, fontWeight: Typography.bold, color: Colors.textDark, borderWidth: 1.5, borderColor: Colors.inputBorder },
  codeInputFilled: { borderColor: Colors.primary },
  codeDivider: { width: 20, height: 2, backgroundColor: Colors.textMedium, marginHorizontal: 4 },
  confirmButton: { marginBottom: Spacing.md },
  resendContainer: { alignItems: 'center', marginTop: Spacing.sm },
  resendText: { fontSize: Typography.sm, color: Colors.primary, fontWeight: Typography.medium },
  resendDisabled: { opacity: 0.85 },
  resendTextDisabled: { color: Colors.textLight },
  resendMessage: { fontSize: Typography.xs, color: Colors.textMedium, textAlign: 'center', marginTop: Spacing.sm },
});
