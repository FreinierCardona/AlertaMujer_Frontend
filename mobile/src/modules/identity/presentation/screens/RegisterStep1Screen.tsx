// Recoge los datos personales del primer paso y los conserva al navegar.
import { useState } from 'react';
import { useRouter } from 'expo-router';
import AppScreen from '@shared/ui/AppScreen';
import AppInput from '@shared/ui/AppInput';
import AppButton from '@shared/ui/AppButton';
import ScreenHeader from '@shared/ui/ScreenHeader';
import Routes from '@shell/navigation/routes';
import { useI18n } from '@shared/i18n';
import {
  isPersonName,
  isPhone,
  onlyDigits,
} from '@shared/validation/formRules';
export default function RegisterStep1Screen() {
  const router = useRouter();
  const { t } = useI18n();
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const valid = isPersonName(name) && isPersonName(lastName) && isPhone(phone);
  const next = () => {
    setSubmitted(true);
    if (valid)
      router.push({
        pathname: Routes.registerStep2,
        params: { name, lastName, phone },
      });
  };
  return (
    <AppScreen>
      <ScreenHeader
        canGoBack
        title={t('auth.personalTitle')}
        subtitle={t('auth.personalSubtitle')}
      />
      <AppInput
        label={t('auth.name')}
        value={name}
        onChangeText={setName}
        error={
          submitted && !isPersonName(name) ? t('validation.name') : undefined
        }
      />
      <AppInput
        label={t('auth.lastName')}
        value={lastName}
        onChangeText={setLastName}
        error={
          submitted && !isPersonName(lastName)
            ? t('validation.name')
            : undefined
        }
      />
      <AppInput
        label={t('auth.phone')}
        value={phone}
        onChangeText={(v) => setPhone(onlyDigits(v, 10))}
        keyboardType="phone-pad"
        error={submitted && !isPhone(phone) ? t('validation.phone') : undefined}
      />
      <AppButton
        title={t('common.continue')}
        onPress={next}
      />
    </AppScreen>
  );
}
