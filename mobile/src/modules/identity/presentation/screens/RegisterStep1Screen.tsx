import { useState } from 'react';
import { useRouter } from 'expo-router';
import { ApiError, identityApi } from '@core/api';
import { registrationFlowStorage } from '@core/api/registrationFlowStorage';
import { phoneFirstRegistrationSimulator } from '@modules/identity/application/phoneFirstRegistrationSimulator';
import Routes from '@shell/navigation/routes';
import { useI18n } from '@shared/i18n';
import { isPersonName, isPhone, isUsername, onlyDigits } from '@shared/validation/formRules';
import AppButton from '@shared/ui/AppButton';
import AppInput from '@shared/ui/AppInput';
import AppScreen from '@shared/ui/AppScreen';
import ScreenHeader from '@shared/ui/ScreenHeader';
import StatusBanner from '@shared/ui/StatusBanner';

export default function RegisterStep1Screen() {
  const router = useRouter();
  const { t } = useI18n();
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const valid = isUsername(username.toLowerCase()) && isPersonName(name) && isPersonName(lastName) && isPhone(phone);

  const submit = async () => {
    setSubmitted(true);
    if (!valid) return;
    setLoading(true);
    setFieldErrors({});
    setError(null);
    try {
      const registration = await identityApi.startPhoneFirstRegistration({
        username: username.trim(),
        firstNames: name.trim(),
        lastNames: lastName.trim(),
        phone,
      });
      await registrationFlowStorage.save({
        registrationRequestId: registration.registrationRequestId,
        registrationProof: registration.registrationProof,
        phone,
      });
      phoneFirstRegistrationSimulator.set(registration.registrationRequestId, registration.simulatedPhoneCode);
      router.replace({
        pathname: Routes.verifyCode,
        params: {
          flow: 'registration-v2',
          registrationRequestId: registration.registrationRequestId,
          channel: 'PHONE_SIMULATOR',
          notice: 'phoneVerificationIssued',
        },
      });
    } catch (cause) {
      const apiError = cause instanceof ApiError ? cause : new ApiError('No pudimos iniciar tu registro. Inténtalo de nuevo.', 'UNKNOWN');
      setFieldErrors(apiError.fields);
      setError(apiError.fields.username ?? apiError.fields.firstNames ?? apiError.fields.lastNames ?? apiError.fields.phone ?? apiError.message ?? 'No pudimos iniciar tu registro. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppScreen>
      <ScreenHeader canGoBack title={t('auth.personalTitle')} subtitle="Ingresa tus datos personales" />
      {error ? <StatusBanner tone="danger" title="Revisa tus datos" message={error} /> : null}
      <AppInput label="Usuario" hint="Empieza con @; usa letras minúsculas, números o _." value={username} onChangeText={(value) => { setUsername(value.toLowerCase()); setError(null); setFieldErrors({}); }} autoCapitalize="none" error={fieldErrors.username || (submitted && !isUsername(username) ? 'Usa un usuario válido de 3 a 20 caracteres.' : undefined)} />
      <AppInput label={t('auth.name')} value={name} onChangeText={(value) => { setName(value); setError(null); setFieldErrors({}); }} error={fieldErrors.firstNames || (submitted && !isPersonName(name) ? t('validation.name') : undefined)} />
      <AppInput label={t('auth.lastName')} value={lastName} onChangeText={(value) => { setLastName(value); setError(null); setFieldErrors({}); }} error={fieldErrors.lastNames || (submitted && !isPersonName(lastName) ? t('validation.name') : undefined)} />
      <AppInput label={t('auth.phone')} hint="Número colombiano de 10 dígitos, empezando en 3." value={phone} onChangeText={(value) => { setPhone(onlyDigits(value, 10)); setError(null); setFieldErrors({}); }} keyboardType="phone-pad" error={fieldErrors.phone || (submitted && !isPhone(phone) ? t('validation.phone') : undefined)} />
      <AppButton title="Siguiente" onPress={() => void submit()} loading={loading} />
    </AppScreen>
  );
}
