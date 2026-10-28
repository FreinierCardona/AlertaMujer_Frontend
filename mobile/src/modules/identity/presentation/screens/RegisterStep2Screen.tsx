import { useEffect, useState } from 'react';
import { Keyboard, Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ApiError, identityApi } from '@core/api';
import { registrationFlowStorage, type PhoneFirstRegistrationFlow } from '@core/api/registrationFlowStorage';
import Routes from '@shell/navigation/routes';
import { useI18n } from '@shared/i18n';
import { useAppTheme } from '@shared/theme';
import { isEmail, isPassword } from '@shared/validation/formRules';
import AppButton from '@shared/ui/AppButton';
import AppInput from '@shared/ui/AppInput';
import AppScreen from '@shared/ui/AppScreen';
import ScreenHeader from '@shared/ui/ScreenHeader';
import StatusBanner from '@shared/ui/StatusBanner';
import PrivacyPolicyModal from '../components/PrivacyPolicyModal';

export default function RegisterStep2Screen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ registrationRequestId?: string }>();
  const { t } = useI18n();
  const { colors, spacing, typography } = useAppTheme();
  const [flow, setFlow] = useState<PhoneFirstRegistrationFlow | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [policyVisible, setPolicyVisible] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void registrationFlowStorage.get().then((stored) => {
      if (!stored || stored.registrationRequestId !== params.registrationRequestId) {
        setError('Tu verificación de teléfono ya no está disponible. Inicia el registro nuevamente.');
        return;
      }
      setFlow(stored);
    });
  }, [params.registrationRequestId]);

  const valid = Boolean(flow) && isEmail(email) && isPassword(password) && password === confirm && accepted;
  const submit = async () => {
    setSubmitted(true);
    if (!valid || !flow) return;
    setLoading(true);
    setError(null);
    setFieldErrors({});
    try {
      await identityApi.completePhoneFirstRegistrationCredentials(flow.registrationRequestId, flow.registrationProof, {
        email: email.trim().toLowerCase(), password, acceptedTerms: true,
      });
      await registrationFlowStorage.setEmail(email.trim().toLowerCase());
      router.replace({
        pathname: Routes.verifyCode,
        params: { flow: 'registration-v2', registrationRequestId: flow.registrationRequestId, channel: 'EMAIL', notice: 'emailVerificationIssued' },
      });
    } catch (cause) {
      const apiError = cause instanceof ApiError ? cause : new ApiError('No pudimos guardar tus credenciales. Inténtalo de nuevo.', 'UNKNOWN');
      setFieldErrors(apiError.fields);
      setError(apiError.fields.email ?? apiError.message ?? 'No pudimos guardar tus credenciales. Revisa la información e inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppScreen>
      <ScreenHeader canGoBack title={t('auth.personalTitle')} subtitle="Paso 2 de 2 · Correo, contraseña y aceptación." />
      {error ? <StatusBanner tone="danger" title="Revisa tus datos" message={error} /> : null}
      <AppInput label={t('auth.email')} value={email} onChangeText={(value) => { setEmail(value); setFieldErrors((current) => ({ ...current, email: '' })); }} keyboardType="email-address" autoCapitalize="none" error={fieldErrors.email || (submitted && !isEmail(email) ? t('validation.email') : undefined)} />
      <AppInput label={t('auth.password')} value={password} onChangeText={setPassword} secureTextEntry showPasswordToggle error={submitted && !isPassword(password) ? t('validation.password') : undefined} />
      <AppInput label={t('auth.confirmPassword')} value={confirm} onChangeText={setConfirm} secureTextEntry showPasswordToggle error={submitted && password !== confirm ? t('validation.passwordMatch') : undefined} />
      <View style={[styles.accept, { marginBottom: spacing.lg, gap: spacing.sm }]}>
        <Pressable accessibilityRole="checkbox" accessibilityLabel={t('auth.accept')} accessibilityState={{ checked: accepted }} onPress={() => setAccepted(!accepted)} style={styles.checkbox}>
        <Ionicons name={accepted ? 'checkbox' : 'square-outline'} size={24} color={submitted && !accepted ? colors.danger : colors.primary} />
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Leer los términos de uso y la política de privacidad" accessibilityHint="Abre el documento completo sin cambiar la casilla de aceptación." onPress={() => { Keyboard.dismiss(); setPolicyVisible(true); }} style={styles.policyLink}>
          <Text style={{ color: colors.primary, textDecorationLine: 'underline', fontSize: typography.base, lineHeight: 24 }}>{t('auth.accept')}</Text>
        </Pressable>
      </View>
      {policyVisible ? <PrivacyPolicyModal visible onClose={() => setPolicyVisible(false)} /> : null}
      <AppButton title="Crear cuenta y verificar correo" onPress={() => void submit()} disabled={!flow} loading={loading} />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  accept: { flexDirection: 'row', alignItems: 'flex-start' },
  checkbox: { minWidth: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  policyLink: { flex: 1, minHeight: 48, justifyContent: 'center' },
});
