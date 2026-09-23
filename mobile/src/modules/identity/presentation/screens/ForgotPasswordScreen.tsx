// Inicia recuperación con respuesta neutral para no revelar cuentas existentes.
import { useState } from 'react';
import { useRouter } from 'expo-router';
import AppScreen from '@shared/ui/AppScreen';
import AppInput from '@shared/ui/AppInput';
import AppButton from '@shared/ui/AppButton';
import ScreenHeader from '@shared/ui/ScreenHeader';
import Routes from '@shell/navigation/routes';
import { useI18n } from '@shared/i18n';
import { isEmail } from '@shared/validation/formRules';
export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const send = () => {
    setSubmitted(true);
    if (isEmail(email))
      router.push({
        pathname: Routes.verifyCode,
        params: { flow: 'forgot', destination: email },
      });
  };
  return (
    <AppScreen>
      <ScreenHeader
        canGoBack
        title={t('auth.recoverTitle')}
        subtitle={t('auth.recoverHelp')}
      />
      <AppInput
        label={t('auth.email')}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        error={submitted && !isEmail(email) ? t('validation.email') : undefined}
      />
      <AppButton
        title={t('auth.sendCode')}
        onPress={send}
      />
    </AppScreen>
  );
}
