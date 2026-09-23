// Permite editar los datos de perfil que forman parte de la autenticación.
import { useState } from 'react';
import { useRouter } from 'expo-router';
import AppScreen from '@shared/ui/AppScreen';
import AppInput from '@shared/ui/AppInput';
import AppButton from '@shared/ui/AppButton';
import ScreenHeader from '@shared/ui/ScreenHeader';
import StatusBanner from '@shared/ui/StatusBanner';
import useAppState from '@shell/providers/useAppState';
import Routes from '@shell/navigation/routes';
import { useI18n } from '@shared/i18n';
import {
  isEmail,
  isPersonName,
  isPhone,
  onlyDigits,
} from '@shared/validation/formRules';
export default function EditProfileScreen() {
  const router = useRouter();
  const { profile, updateProfile } = useAppState();
  const { t } = useI18n();
  const [name, setName] = useState(profile.name);
  const [lastName, setLastName] = useState(profile.lastName);
  const [email, setEmail] = useState(profile.email);
  const [phone, setPhone] = useState(profile.phone);
  const [submitted, setSubmitted] = useState(false);
  const [saved, setSaved] = useState(false);
  const valid =
    isPersonName(name) &&
    (!lastName || isPersonName(lastName)) &&
    isEmail(email) &&
    isPhone(phone);
  return (
    <AppScreen>
      <ScreenHeader
        canGoBack
        title={t('profile.edit')}
      />
      {saved ? (
        <StatusBanner
          tone="success"
          title={t('profile.updated')}
        />
      ) : null}
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
          submitted && Boolean(lastName) && !isPersonName(lastName)
            ? t('validation.name')
            : undefined
        }
      />
      <AppInput
        label={t('auth.email')}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        error={submitted && !isEmail(email) ? t('validation.email') : undefined}
      />
      <AppInput
        label={t('auth.phone')}
        value={phone}
        onChangeText={(v) => setPhone(onlyDigits(v, 10))}
        keyboardType="phone-pad"
        error={submitted && !isPhone(phone) ? t('validation.phone') : undefined}
      />
      <AppButton
        title={t('common.save')}
        onPress={() => {
          setSubmitted(true);
          if (valid) {
            const nextProfile = {
              ...profile,
              name: name.trim(),
              lastName: lastName.trim(),
              email: email.trim(),
              phone,
            };
            if (
              nextProfile.email !== profile.email ||
              nextProfile.phone !== profile.phone
            ) {
              router.push({
                pathname: Routes.profileVerify,
                params: {
                  flow: 'profile',
                  destination:
                    nextProfile.email !== profile.email
                      ? nextProfile.email
                      : nextProfile.phone,
                  ...nextProfile,
                },
              });
            } else {
              updateProfile(nextProfile);
              setSaved(true);
            }
          }
        }}
      />
      <AppButton
        title={t('common.back')}
        onPress={() => router.back()}
        variant="ghost"
      />
    </AppScreen>
  );
}
