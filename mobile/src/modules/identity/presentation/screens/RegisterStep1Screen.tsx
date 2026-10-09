import { useState } from 'react';
import { useRouter } from 'expo-router';
import AppScreen from '@shared/ui/AppScreen';
import AppInput from '@shared/ui/AppInput';
import AppButton from '@shared/ui/AppButton';
import ScreenHeader from '@shared/ui/ScreenHeader';
import Routes from '@shell/navigation/routes';
import { useI18n } from '@shared/i18n';
import { isPersonName, isPhone, isUsername, onlyDigits } from '@shared/validation/formRules';

export default function RegisterStep1Screen() {
  const router = useRouter(); const { t } = useI18n(); const [username, setUsername] = useState(''); const [name, setName] = useState(''); const [lastName, setLastName] = useState(''); const [phone, setPhone] = useState(''); const [submitted, setSubmitted] = useState(false);
  const valid = isUsername(username.toLowerCase()) && isPersonName(name) && isPersonName(lastName) && isPhone(phone);
  return <AppScreen><ScreenHeader canGoBack title={t('auth.personalTitle')} subtitle="Tus datos se validarán nuevamente con el servicio."/><AppInput label="Usuario" hint="Empieza con @; usa letras minúsculas, números o _." value={username} onChangeText={(value) => setUsername(value.toLowerCase())} autoCapitalize="none" error={submitted && !isUsername(username) ? 'Usa un usuario válido de 3 a 20 caracteres.' : undefined}/><AppInput label={t('auth.name')} value={name} onChangeText={setName} error={submitted && !isPersonName(name) ? t('validation.name') : undefined}/><AppInput label={t('auth.lastName')} value={lastName} onChangeText={setLastName} error={submitted && !isPersonName(lastName) ? t('validation.name') : undefined}/><AppInput label={t('auth.phone')} hint="Número colombiano de 10 dígitos, empezando en 3." value={phone} onChangeText={(value) => setPhone(onlyDigits(value, 10))} keyboardType="phone-pad" error={submitted && !isPhone(phone) ? t('validation.phone') : undefined}/><AppButton title={t('common.continue')} onPress={() => { setSubmitted(true); if (valid) router.push({ pathname: Routes.registerStep2, params: { username, name, lastName, phone } }); }}/></AppScreen>;
}
