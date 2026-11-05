import { useCallback, useState } from 'react';
import { AppState, Linking, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { ApiError, contactAlertsApi } from '@core/api';
import type { ContactAlertDetail } from '@core/api';
import EvidenceGallery from '@modules/evidence/presentation/components/EvidenceGallery';
import { contactAlertMapsUrl, isContactAlertAccessRevoked } from '@modules/notifications/application/contactAlertDetail';
import MapView, { Marker } from 'react-native-maps';
import Routes from '@shell/navigation/routes';
import AppButton from '@shared/ui/AppButton';
import AppCard from '@shared/ui/AppCard';
import AppScreen from '@shared/ui/AppScreen';
import ScreenHeader from '@shared/ui/ScreenHeader';
import StatusBanner from '@shared/ui/StatusBanner';
import { useI18n } from '@shared/i18n';
import { useAppTheme } from '@shared/theme';

export default function ContactAlertDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useI18n();
  const { colors, spacing } = useAppTheme();
  const [alert, setAlert] = useState<ContactAlertDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mapsError, setMapsError] = useState<string | null>(null);

  const returnToSafeList = useCallback(() => {
    setAlert(null);
    router.replace(Routes.notifications);
  }, [router]);

  const load = useCallback(async (manual = false, silent = false) => {
    if (!id) {
      returnToSafeList();
      return;
    }
    if (manual) setRefreshing(true); else if (!silent) setLoading(true);
    if (!silent) setError(null);
    try {
      setAlert(await contactAlertsApi.detail(id));
      setError(null);
    } catch (cause) {
      if (cause instanceof ApiError && isContactAlertAccessRevoked(cause.status)) {
        returnToSafeList();
        return;
      }
      if (!silent) setError(cause instanceof ApiError ? cause.message : t('notifications.detailLoadError'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id, returnToSafeList, t]);

  useFocusEffect(useCallback(() => {
    let busy = false;
    const refresh = async () => { if (busy || AppState.currentState !== 'active') return; busy = true; try { await load(false, true); } finally { busy = false; } };
    void load();
    const timer = setInterval(() => void refresh(), 5000);
    const subscription = AppState.addEventListener('change', (state) => { if (state === 'active') void refresh(); });
    return () => { clearInterval(timer); subscription.remove(); };
  }, [load]));

  const openMaps = useCallback(async () => {
    const url = contactAlertMapsUrl(alert?.lastConfirmedLocation ?? null);
    if (!url) return;
    setMapsError(null);
    try {
      if (!(await Linking.canOpenURL(url))) throw new Error('Maps unavailable');
      await Linking.openURL(url);
    } catch {
      setMapsError(t('notifications.mapsUnavailable'));
    }
  }, [alert?.lastConfirmedLocation, t]);

  const row = (label: string, value: string) => (
    <View style={{ marginBottom: spacing.md }}>
      <Text style={{ color: colors.textMedium, fontSize: 12 }}>{label}</Text>
      <Text style={{ color: colors.textDark, fontWeight: '600', marginTop: 3 }}>{value}</Text>
    </View>
  );
  const mapUrl = contactAlertMapsUrl(alert?.lastConfirmedLocation ?? null);

  return (
    <AppScreen scroll={false}>
      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xl }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load(true)} tintColor={colors.primary} />}
      >
        <ScreenHeader title={t('notifications.detailTitle')} canGoBack onBack={() => router.replace(Routes.notifications)} />
        {loading && !alert ? <StatusBanner title={t('common.loading')} /> : null}
        {error ? (
          <View style={{ gap: spacing.md }}>
            <StatusBanner tone="danger" title={t('common.error')} message={error} />
            <AppButton title={t('common.retry')} onPress={() => void load()} variant="outline" />
          </View>
        ) : null}
        {alert ? (
          <>
            <StatusBanner tone={alert.status === 'ACTIVE' ? 'danger' : alert.status === 'IN_PROGRESS' ? 'info' : 'warning'} title={`Estado de la alerta: ${t(`notifications.status.${alert.status}`)}`} />
            <AppCard style={{ marginTop: spacing.md }}>
              {row('Activada por', alert.userDisplayName)}
              {row(t('notifications.startedAt'), new Date(alert.startedAt).toLocaleString())}
              {row(t('notifications.message'), alert.messageSnapshot)}
              {row(
                t('notifications.coordinates'),
                alert.lastConfirmedLocation
                  ? `${alert.lastConfirmedLocation.latitude.toFixed(5)}, ${alert.lastConfirmedLocation.longitude.toFixed(5)}`
                  : t('notifications.locationUnavailable'),
              )}
              {alert.lastConfirmedLocation ? <MapView style={{ height: 240, marginBottom: spacing.md }}
                region={{ latitude: alert.lastConfirmedLocation.latitude, longitude: alert.lastConfirmedLocation.longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 }}>
                <Marker coordinate={alert.lastConfirmedLocation} title={alert.userDisplayName} />
              </MapView> : null}
              {mapUrl ? <AppButton title={t('notifications.openMaps')} onPress={() => void openMaps()} variant="outline" /> : null}
              {mapsError ? <View style={{ marginTop: spacing.sm }}><StatusBanner tone="warning" title={t('notifications.mapsUnavailable')} message={mapsError} /></View> : null}
            </AppCard>
            <Text style={[styles.section, { color: colors.textDark, marginTop: spacing.lg }]}>{t('history.evidence')}</Text>
            <EvidenceGallery emergencyId={alert.emergencyId} access="contact" onAccessRevoked={returnToSafeList} />
          </>
        ) : null}
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  section: { fontSize: 17, fontWeight: '700', marginBottom: 10 },
});
