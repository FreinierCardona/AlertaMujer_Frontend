import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AppScreen from '@shared/ui/AppScreen';
import AppInput from '@shared/ui/AppInput';
import AppButton from '@shared/ui/AppButton';
import ScreenHeader from '@shared/ui/ScreenHeader';
import StatusBanner from '@shared/ui/StatusBanner';
import Routes from '@shell/navigation/routes';
import useAppState from '@shell/providers/useAppState';
import { ApiError } from '@core/api';
import { useAppTheme } from '@shared/theme';
import { useI18n } from '@shared/i18n';

export default function LoginScreen() {
  const router = useRouter(); const { notice } = useLocalSearchParams<{ notice?: 'registrationCompleted' | 'passwordChanged' | 'passwordReset' | 'emailUpdated' | 'accountDeleted' }>(); const { signIn, sessionNotice } = useAppState(); const { colors, spacing } = useAppTheme(); const { t } = useI18n();
  const [identifier, setIdentifier] = useState(''); const [password, setPassword] = useState(''); const [error, setError] = useState<string | null>(null); const [loading, setLoading] = useState(false);
  const handle = async () => {
    if (!identifier.trim() || !password) { setError('Ingresa tu correo o usuario y tu contraseña.'); return; }
    setLoading(true); setError(null);
    try { await signIn(identifier, password); router.replace(Routes.home); }
    catch (cause) { setError(cause instanceof ApiError && cause.code === 'UNAUTHORIZED' ? 'Las credenciales no son válidas o la cuenta no está habilitada.' : cause instanceof Error ? cause.message : 'No fue posible iniciar sesión.'); }
    finally { setLoading(false); }
  };
  const success = notice === 'registrationCompleted' ? ['Cuenta lista', 'Tu registro se completó correctamente. Ya puedes iniciar sesión.'] : notice === 'passwordChanged' ? ['Contraseña actualizada', 'Tu contraseña cambió correctamente. Inicia sesión de nuevo para continuar.'] : notice === 'passwordReset' ? ['Contraseña restablecida', 'Ya puedes iniciar sesión con tu nueva contraseña.'] : notice === 'emailUpdated' ? ['Correo actualizado', 'Tu nuevo correo fue confirmado. Inicia sesión otra vez para proteger tu cuenta.'] : notice === 'accountDeleted' ? ['Cuenta eliminada', 'Tu cuenta y la sesión asociada se eliminaron correctamente.'] : notice === 'signedOut' ? ['Sesión cerrada', 'Cerraste sesión correctamente. Te esperamos cuando necesites volver.'] : null;
  return <AppScreen><View style={styles.brand}><Image source={require('../../../../../assets/images/Logo-AlertaMujer-clean.png')} resizeMode="contain" style={styles.logo}/><Text style={[styles.brandName, { color: colors.primary }]}>AlertaMujer</Text></View><ScreenHeader title={t('auth.loginTitle')} subtitle={t('auth.loginHint')}/><View style={{ height: spacing.lg }}/>{success ? <StatusBanner tone="success" title={success[0]} message={success[1]}/> : null}{sessionNotice ? <StatusBanner tone="warning" title="Sesión finalizada" message={sessionNotice}/> : null}{error ? <StatusBanner tone="danger" title="No pudimos iniciar sesión" message={error}/> : null}<AppInput label="Correo o usuario" value={identifier} onChangeText={setIdentifier} autoCapitalize="none"/><AppInput label={t('auth.password')} value={password} onChangeText={setPassword} secureTextEntry showPasswordToggle/><AppButton title={t('auth.login')} onPress={() => void handle()} loading={loading}/><Pressable onPress={() => router.push(Routes.forgotPassword)} style={styles.link}><Text style={{ color: colors.primary }}>{t('auth.forgot')}</Text></Pressable><View style={[styles.separator, { borderColor: colors.divider }]}><Text style={{ color: colors.textMedium }}>{t('auth.noAccount')}</Text></View><AppButton title={t('auth.register')} onPress={() => router.push(Routes.registerStep1)} variant="outline"/></AppScreen>;
}
const styles = StyleSheet.create({ brand: { alignItems: 'center', marginTop: 12, marginBottom: 22 }, logo: { width: 132, height: 132, borderRadius: 30 }, brandName: { fontSize: 28, fontWeight: '800', marginTop: 10 }, link: { alignItems: 'center', padding: 16 }, separator: { alignItems: 'center', borderTopWidth: 1, paddingTop: 18, marginTop: 16, marginBottom: 12 } });
