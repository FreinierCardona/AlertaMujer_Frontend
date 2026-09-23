// Valida la nueva contraseña y ofrece un cierre explícito hacia el inicio de sesión.
import { useState } from 'react';
import { useRouter } from 'expo-router';
import AppScreen from '@shared/ui/AppScreen';
import AppInput from '@shared/ui/AppInput';
import AppButton from '@shared/ui/AppButton';
import ScreenHeader from '@shared/ui/ScreenHeader';
import StatusBanner from '@shared/ui/StatusBanner';
import Routes from '@shell/navigation/routes';
import { useI18n } from '@shared/i18n';
import { isPassword } from '@shared/validation/formRules';
export default function ResetPasswordScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [done, setDone] = useState(false);
  if (done)
    return (
      <AppScreen>
        <ScreenHeader title={t('auth.newPassword')} />
        <StatusBanner
          tone="success"
          title={t('auth.passwordSaved')}
        />
        <AppButton
          title={t('auth.login')}
          onPress={() => router.replace(Routes.login)}
        />
      </AppScreen>
    );
  return (
    <AppScreen>
      <ScreenHeader
        canGoBack
        title={t('auth.newPassword')}
      />
      <AppInput
        label={t('auth.password')}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        showPasswordToggle
        error={
          submitted && !isPassword(password)
            ? t('validation.password')
            : undefined
        }
      />
      <AppInput
        label={t('auth.confirmPassword')}
        value={confirm}
        onChangeText={setConfirm}
        secureTextEntry
        showPasswordToggle
        error={
          submitted && password !== confirm
            ? t('validation.passwordMatch')
            : undefined
        }
      />
      <AppButton
        title={t('common.save')}
        onPress={() => {
          setSubmitted(true);
          if (isPassword(password) && password === confirm) setDone(true);
        }}
      />
    </AppScreen>
  );
}
