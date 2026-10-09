// Muestra exclusivamente el estado confirmado de una alerta abierta.
import { useEffect, useState } from 'react';
import { BackHandler, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Redirect, useRouter } from 'expo-router';
import AppScreen from '@shared/ui/AppScreen';
import AppCard from '@shared/ui/AppCard';
import AppButton from '@shared/ui/AppButton';
import StatusBanner from '@shared/ui/StatusBanner';
import ConfirmModal from '@shared/ui/ConfirmModal';
import Routes from '@shell/navigation/routes';
import useAppState from '@shell/providers/useAppState';
import { useAppTheme } from '@shared/theme';
import { useI18n } from '@shared/i18n';
import EvidenceGallery from '@modules/evidence/presentation/components/EvidenceGallery';

export default function ActiveEmergencyScreen() {
  const router = useRouter();
  const { activeEmergency, backgroundMessage, finishEmergency } = useAppState();
  const { t } = useI18n();
  const { colors, spacing, typography } = useAppTheme();
  const [finish, setFinish] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => subscription.remove();
  }, []);
  if (!activeEmergency) return <Redirect href={Routes.home} />;
  const statusKey = activeEmergency.status === 'inProgress' ? 'emergency.inProgress' : activeEmergency.status === 'offline' ? 'emergency.offline' : 'emergency.active';
  const tone = activeEmergency.status === 'offline' ? 'warning' : activeEmergency.status === 'inProgress' ? 'info' : 'danger';
  const location = activeEmergency.lastConfirmedLocation;
  const close = async () => {
    setFinishing(true);
    setError(null);
    const result = await finishEmergency();
    setFinishing(false);
    if (!result.ok) {
      setError(result.message ?? t('emergency.finishOffline'));
      setFinish(false);
      return;
    }
    const id = activeEmergency.id;
    setFinish(false);
    router.replace({ pathname: '/emergency/detail/[id]', params: { id } });
  };
  return <AppScreen>
    <View style={styles.header}>
      <Ionicons name="shield" size={30} color={colors.textWhite} />
      <View style={{ flex: 1 }}>
        <Text style={{ color: colors.textWhite, fontSize: typography.xl, fontWeight: '800' }}>{t('emergency.title')}</Text>
        <Text style={{ color: colors.textWhite }}>{t('emergency.reference', { id: activeEmergency.id })}</Text>
      </View>
      <View style={[styles.pill, { backgroundColor: colors.white }]}><Text style={{ color: colors.textDark, fontWeight: '700' }}>{t(statusKey)}</Text></View>
    </View>
    <StatusBanner tone={activeEmergency.syncState === 'pending' ? 'warning' : tone} title={activeEmergency.syncState === 'pending' ? t('emergency.offline') : t(statusKey)} message={activeEmergency.syncState === 'pending' ? t('emergency.locationPending') : t('emergency.locationSent')} />
    {error ? <View style={{ marginTop: spacing.sm }}><StatusBanner tone="danger" title={t('common.error')} message={error} /></View> : null}
    <AppCard style={{ marginTop: spacing.md }}>
      <Text style={[styles.label, { color: colors.textMedium }]}>{t('emergency.started')}</Text>
      <Text style={{ color: colors.textDark, fontWeight: '600' }}>{new Date(activeEmergency.startedAt).toLocaleString()}</Text>
      <View style={{ height: spacing.md }} />
      <Text style={[styles.label, { color: colors.textMedium }]}>{t('emergency.location')}</Text>
      {location ? <><Text style={{ color: colors.textDark, fontWeight: '700' }}>{`${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`}</Text><Text style={{ color: colors.textMedium, fontSize: 12, marginTop: 3 }}>± {Math.round(location.accuracy ?? 0)} m · {new Date(location.capturedAt).toLocaleTimeString()}</Text><AppButton title="Google Maps" variant="outline" onPress={() => void Linking.openURL(`https://maps.google.com/?q=${location.latitude},${location.longitude}`)} style={{ marginTop: spacing.md }} /></> : <Text style={{ color: colors.textMedium }}>{t('emergency.noLocation')}</Text>}
      {activeEmergency.lastHeartbeatAt ? <Text style={{ color: colors.textMedium, fontSize: 12, marginTop: 8 }}>{t('emergency.lastSync', { value: new Date(activeEmergency.lastHeartbeatAt).toLocaleTimeString() })}</Text> : null}
    </AppCard>
    <Text style={[styles.section, { color: colors.textDark, marginTop: spacing.lg }]}>{t('emergency.actions')}</Text>
    <View style={styles.actions}>
      <Action icon="camera-outline" label={t('emergency.evidence')} onPress={() => router.push(Routes.evidenceCapture)} />
      <Action icon="chatbubble-ellipses-outline" label={t('emergency.chat')} onPress={() => router.push({ pathname: '/emergency/chat/[id]', params: { id: activeEmergency.id } })} />
      <Action icon="call-outline" label={t('emergency.call')} onPress={() => void Linking.openURL('tel:')} />
    </View>
    <Text style={{ color: colors.textMedium, fontSize: 12, textAlign: 'center', marginTop: 6 }}>{t('call.disclaimer')}</Text>
    <Text style={[styles.section, { color: colors.textDark, marginTop: spacing.lg }]}>{t('history.evidence')} · {activeEmergency.evidence.length}</Text>
    <EvidenceGallery items={activeEmergency.evidence} />
    {backgroundMessage ? <AppCard style={{ marginTop: spacing.lg }}><Text style={{ color: backgroundMessage === 'ok' ? colors.success : colors.warning, fontSize: 12 }}>{t(backgroundMessage === 'ok' ? 'emergency.backgroundOk' : 'emergency.backgroundError')}</Text></AppCard> : null}
    <AppButton title={t('emergency.finish')} onPress={() => setFinish(true)} variant="danger" style={{ marginTop: spacing.lg }} />
    <ConfirmModal visible={finish} title={t('emergency.finishTitle')} message={t('emergency.finishBody')} confirmLabel={t('emergency.finish')} cancelLabel={t('common.cancel')} destructive loading={finishing} onCancel={() => setFinish(false)} onConfirm={() => void close()} />
  </AppScreen>;
}

function Action({ icon, label, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void }) {
  const { colors } = useAppTheme();
  return <Pressable accessibilityRole="button" onPress={onPress} style={[styles.action, { backgroundColor: colors.white, borderColor: colors.inputBorder }]}><Ionicons name={icon} size={28} color={colors.primary} /><Text style={{ color: colors.textDark, fontSize: 12, fontWeight: '600', textAlign: 'center' }}>{label}</Text></Pressable>;
}

const styles = StyleSheet.create({
  header: { backgroundColor: '#E8194A', borderRadius: 18, padding: 16, flexDirection: 'row', gap: 10, alignItems: 'center', marginBottom: 12 },
  pill: { borderRadius: 14, paddingHorizontal: 10, paddingVertical: 6 },
  label: { fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.6 },
  section: { fontSize: 17, fontWeight: '700', marginBottom: 10 },
  actions: { flexDirection: 'row', gap: 10 },
  action: { flex: 1, minHeight: 86, borderWidth: 1, borderRadius: 14, alignItems: 'center', justifyContent: 'center', gap: 7, padding: 8 },
});
