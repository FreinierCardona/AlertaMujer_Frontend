import { useCallback, useState } from 'react';
import { View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import Routes from '@shell/navigation/routes';
import AppScreen from '@shared/ui/AppScreen'; import AppInput from '@shared/ui/AppInput'; import AppButton from '@shared/ui/AppButton'; import ScreenHeader from '@shared/ui/ScreenHeader'; import StatusBanner from '@shared/ui/StatusBanner';
import useAppState from '@shell/providers/useAppState'; import { ApiError } from '@core/api';
export default function HelpMessageScreen() { const { helpMessage, setHelpMessage } = useAppState(); const [value, setValue] = useState(helpMessage); const [error, setError] = useState<string | null>(null); const [saved, setSaved] = useState(false); const [loading, setLoading] = useState(false); const router = useRouter();
  useFocusEffect(useCallback(() => {
    if (!saved) return;
    const timer = setTimeout(() => router.replace(Routes.profile), 2000);
    return () => clearTimeout(timer);
  }, [saved, router]));
  const save = async () => { if (!value.trim() || value.trim().length > 500) return; setLoading(true); setError(null); try { await setHelpMessage(value.trim()); setSaved(true); } catch (cause) { setError(cause instanceof ApiError ? cause.message : 'No fue posible guardar el mensaje.'); } finally { setLoading(false); } }; return <AppScreen><ScreenHeader canGoBack title="Mensaje de ayuda" subtitle="Escribe el mensaje que acompañará tus próximas alertas de emergencia."/>{saved ? <View style={{ marginBottom: 16 }}><StatusBanner tone="success" title="Mensaje guardado" message="Usaremos este mensaje en tus próximas alertas. Volverás a tu perfil en un momento."/></View> : null}{error ? <StatusBanner tone="danger" title="No pudimos guardar" message={error}/> : null}<AppInput multiline maxLength={500} value={value} onChangeText={(text) => { setValue(text); setSaved(false); }} hint={`${value.length}/500 caracteres`} error={!value.trim() ? 'El mensaje no puede estar vacío.' : undefined}/><AppButton title="Guardar mensaje" disabled={saved || !value.trim() || value.trim().length > 500} onPress={() => void save()} loading={loading}/></AppScreen>; }
