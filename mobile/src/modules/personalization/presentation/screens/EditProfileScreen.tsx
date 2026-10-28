import { useCallback, useState } from 'react';
import { View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import AppScreen from '@shared/ui/AppScreen'; import AppInput from '@shared/ui/AppInput'; import AppButton from '@shared/ui/AppButton'; import ScreenHeader from '@shared/ui/ScreenHeader'; import StatusBanner from '@shared/ui/StatusBanner';
import useAppState from '@shell/providers/useAppState'; import Routes from '@shell/navigation/routes'; import { ApiError } from '@core/api'; import { isEmail, isPersonName, isPhone, isUsername, onlyDigits } from '@shared/validation/formRules';

export default function EditProfileScreen() {
  const router = useRouter(); const { profile, updateProfile, requestContactChange } = useAppState();
  const [username, setUsername] = useState(profile.username); const [name, setName] = useState(profile.name); const [lastName, setLastName] = useState(profile.lastName); const [email, setEmail] = useState(profile.email); const [phone, setPhone] = useState(profile.phone); const [submitted, setSubmitted] = useState(false); const [error, setError] = useState<string | null>(null); const [success, setSuccess] = useState(false); const [loading, setLoading] = useState(false);
  useFocusEffect(useCallback(() => {
    if (!success) return;
    const timer = setTimeout(() => router.replace(Routes.profile), 2000);
    return () => clearTimeout(timer);
  }, [success, router]));
  const directValid = isUsername(username) && isPersonName(name) && isPersonName(lastName);
  const save = async () => {
    setSubmitted(true); setSuccess(false); setError(null); if (!directValid) return;
    const emailChanged = email.trim().toLowerCase() !== profile.email; const phoneChanged = phone !== profile.phone;
    if (emailChanged && phoneChanged) { setError('Cambia el correo o el teléfono por separado para confirmar cada valor con su propio código.'); return; }
    if (emailChanged && !isEmail(email)) return; if (phoneChanged && !isPhone(phone)) return;
    setLoading(true);
    try {
      if (username !== profile.username || name !== profile.name || lastName !== profile.lastName) await updateProfile({ username, name, lastName });
      if (emailChanged || phoneChanged) {
        const field = emailChanged ? 'email' : 'phone'; const value = emailChanged ? email.trim().toLowerCase() : phone; const issued = await requestContactChange(field, value);
        router.push({ pathname: Routes.profileVerify, params: { flow: 'contact', field, destination: value, simulatedSmsCode: issued.simulatedSmsCode ?? '' } });
      } else setSuccess(true);
    } catch (cause) { setError(cause instanceof ApiError ? cause.message : 'No fue posible guardar el perfil.'); }
    finally { setLoading(false); }
  };
  return <AppScreen><ScreenHeader canGoBack title="Editar perfil" subtitle="Actualiza tus datos. Si cambias el correo o teléfono, te pediremos un código de confirmación."/>{success ? <View style={{ marginBottom: 16 }}><StatusBanner tone="success" title="Cambios guardados" message="Tus datos se actualizaron. Volverás a tu perfil en un momento."/></View> : null}{error ? <StatusBanner tone="danger" title="Revisa la información" message={error}/>: null}<AppInput label="Usuario" value={username} onChangeText={(value) => { setUsername(value.toLowerCase()); setSuccess(false); }} autoCapitalize="none" error={submitted && !isUsername(username) ? 'Usa un usuario válido.' : undefined}/><AppInput label="Nombres" value={name} onChangeText={(value) => { setName(value); setSuccess(false); }} error={submitted && !isPersonName(name) ? 'Ingresa tus nombres.' : undefined}/><AppInput label="Apellidos" value={lastName} onChangeText={(value) => { setLastName(value); setSuccess(false); }} error={submitted && !isPersonName(lastName) ? 'Ingresa tus apellidos.' : undefined}/><AppInput label="Correo" value={email} onChangeText={(value) => { setEmail(value); setSuccess(false); }} keyboardType="email-address" autoCapitalize="none" error={submitted && email !== profile.email && !isEmail(email) ? 'Ingresa un correo válido.' : undefined}/><AppInput label="Teléfono" value={phone} onChangeText={(value) => { setPhone(onlyDigits(value, 10)); setSuccess(false); }} keyboardType="phone-pad" error={submitted && phone !== profile.phone && !isPhone(phone) ? 'Ingresa un número colombiano válido.' : undefined}/><AppButton title="Guardar cambios" onPress={() => void save()} loading={loading} disabled={success}/></AppScreen>;
}
