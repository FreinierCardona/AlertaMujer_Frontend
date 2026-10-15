import { useCallback, useState } from 'react';
import { Linking, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { ApiError, contactAlertsApi } from '@core/api';
import type { ContactAlertDetail } from '@core/api';
import EvidenceGallery from '@modules/evidence/presentation/components/EvidenceGallery';
import { contactAlertMapsUrl, isContactAlertAccessRevoked } from '@modules/notifications/application/contactAlertDetail';
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

  const load = useCallback(async (manual = false) => {
    if (!id) {
      returnToSafeList();
      return;
    }
    if (manual) setRefreshing(true); else setLoading(true);
    setError(null);
    try {
      setAlert(await contactAlertsApi.detail(id));
    } catch (cause) {
      if (cause instanceof ApiError && isContactAlertAccessRevoked(cause.status)) {
        returnToSafeList();
        return;
      }
      setError(cause instanceof ApiError ? cause.message : t('notifications.detailLoadError'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id, returnToSafeList, t]);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

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
            <StatusBanner tone="info" title={t(`notifications.status.${alert.status}`)} />
            <AppCard style={{ marginTop: spacing.md }}>
              {row(t('notifications.person'), alert.userDisplayName)}
              {row(t('notifications.startedAt'), new Date(alert.startedAt).toLocaleString())}
              {row(t('notifications.message'), alert.messageSnapshot)}
              {row(
                t('notifications.coordinates'),
                alert.lastConfirmedLocation
                  ? `${alert.lastConfirmedLocation.latitude.toFixed(5)}, ${alert.lastConfirmedLocation.longitude.toFixed(5)}`
                  : t('notifications.locationUnavailable'),
              )}
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
