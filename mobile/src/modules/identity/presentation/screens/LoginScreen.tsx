import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
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
  const router = useRouter(); const { signIn, sessionNotice } = useAppState(); const { colors, spacing } = useAppTheme(); const { t } = useI18n();
  const [identifier, setIdentifier] = useState(''); const [password, setPassword] = useState(''); const [error, setError] = useState<string | null>(null); const [loading, setLoading] = useState(false);
  const handle = async () => {
    if (!identifier.trim() || !password) { setError('Ingresa tu correo o usuario y tu contraseña.'); return; }
    setLoading(true); setError(null);
    try { await signIn(identifier, password); router.replace(Routes.home); }
    catch (cause) { setError(cause instanceof ApiError && cause.code === 'UNAUTHORIZED' ? 'Las credenciales no son válidas o la cuenta no está habilitada.' : cause instanceof Error ? cause.message : 'No fue posible iniciar sesión.'); }
    finally { setLoading(false); }
  };
  return <AppScreen><View style={styles.brand}><Image source={require('../../../../../assets/images/Logo-AlertaMujer-clean.png')} resizeMode="contain" style={styles.logo}/><Text style={[styles.brandName, { color: colors.primary }]}>AlertaMujer</Text></View><ScreenHeader title={t('auth.loginTitle')} subtitle={t('auth.loginHint')}/><View style={{ height: spacing.lg }}/>{sessionNotice ? <StatusBanner tone="warning" title="Sesión finalizada" message={sessionNotice}/> : null}{error ? <StatusBanner tone="danger" title="No pudimos iniciar sesión" message={error}/> : null}<AppInput label="Correo o usuario" value={identifier} onChangeText={setIdentifier} autoCapitalize="none"/><AppInput label={t('auth.password')} value={password} onChangeText={setPassword} secureTextEntry showPasswordToggle/><AppButton title={t('auth.login')} onPress={() => void handle()} loading={loading}/><Pressable onPress={() => router.push(Routes.forgotPassword)} style={styles.link}><Text style={{ color: colors.primary }}>{t('auth.forgot')}</Text></Pressable><View style={[styles.separator, { borderColor: colors.divider }]}><Text style={{ color: colors.textMedium }}>{t('auth.noAccount')}</Text></View><AppButton title={t('auth.register')} onPress={() => router.push(Routes.registerStep1)} variant="outline"/></AppScreen>;
}
const styles = StyleSheet.create({ brand: { alignItems: 'center', marginTop: 12, marginBottom: 22 }, logo: { width: 132, height: 132, borderRadius: 30 }, brandName: { fontSize: 28, fontWeight: '800', marginTop: 10 }, link: { alignItems: 'center', padding: 16 }, separator: { alignItems: 'center', borderTopWidth: 1, paddingTop: 18, marginTop: 16, marginBottom: 12 } });
