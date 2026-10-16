import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
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

export default function RegisterStep2Screen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ registrationRequestId?: string }>();
  const { t } = useI18n();
  const { colors, spacing } = useAppTheme();
  const [flow, setFlow] = useState<PhoneFirstRegistrationFlow | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [accepted, setAccepted] = useState(false);
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
      const apiError = cause as ApiError;
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
      <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: accepted }} onPress={() => setAccepted(!accepted)} style={[styles.accept, { marginBottom: spacing.lg }]}>
        <Ionicons name={accepted ? 'checkbox' : 'square-outline'} size={24} color={submitted && !accepted ? colors.danger : colors.primary} />
        <Text style={{ color: colors.textDark, flex: 1 }}>{t('auth.accept')}</Text>
      </Pressable>
      <AppButton title="Crear cuenta y verificar correo" onPress={() => void submit()} disabled={!flow} loading={loading} />
    </AppScreen>
  );
}

const styles = StyleSheet.create({ accept: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' } });
