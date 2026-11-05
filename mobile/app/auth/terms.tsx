import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ApiError } from '@core/api';
import PrivacyPolicyModal from '@modules/identity/presentation/components/PrivacyPolicyModal';
import useAppState from '@shell/providers/useAppState';
import Routes from '@shell/navigation/routes';
import { useAppTheme } from '@shared/theme';
import AppScreen from '@shared/ui/AppScreen';
import AppButton from '@shared/ui/AppButton';
import AppCard from '@shared/ui/AppCard';
import ScreenHeader from '@shared/ui/ScreenHeader';
import StatusBanner from '@shared/ui/StatusBanner';

export default function TermsScreen() {
  const router = useRouter();
  const { acceptTerms, signOut } = useAppState();
  const { colors, spacing } = useAppTheme();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const accept = async () => {
    setLoading(true); setError(null);
    try { await acceptTerms(); router.replace(Routes.home); }
    catch (cause) { setError(cause instanceof ApiError ? cause.message : 'No fue posible aceptar los términos.'); }
    finally { setLoading(false); }
  };
  return <AppScreen>
    <ScreenHeader title="Acepta los términos" subtitle="Revisa las condiciones para continuar con tu cuenta." />
    <View style={{ gap: spacing.md }}>
      {error ? <StatusBanner tone="danger" title="No pudimos continuar" message={error} /> : null}
      <AppCard>
        <Text style={{ color: colors.textDark, lineHeight: 24 }}>Conoce cómo usar AlertaMujer, qué información compartes y cómo se utiliza durante una alerta.</Text>
        <Pressable accessibilityRole="button" onPress={() => setVisible(true)} style={{ paddingVertical: spacing.md }}>
          <Text style={{ color: colors.primary, fontWeight: '600' }}>Leer los términos de uso y la política de privacidad</Text>
        </Pressable>
      </AppCard>
      <AppButton title="Acepto los términos" onPress={() => void accept()} loading={loading} />
      <AppButton title="Cerrar sesión" onPress={() => void signOut()} variant="ghost" />
    </View>
    <PrivacyPolicyModal visible={visible} onClose={() => setVisible(false)} returnLabel="Volver" />
  </AppScreen>;
}
