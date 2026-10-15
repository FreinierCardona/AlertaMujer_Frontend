import { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { contactAlertsApi } from '@core/api/contactAlertsApi';
import type { ContactAlertSummary } from '@core/api/contactAlertsApi';
import { authorizedOpenAlerts } from '@modules/notifications/application/contactAlerts';
import AppButton from '@shared/ui/AppButton';
import AppCard from '@shared/ui/AppCard';
import AppScreen from '@shared/ui/AppScreen';
import ScreenHeader from '@shared/ui/ScreenHeader';
import StatusBanner from '@shared/ui/StatusBanner';
import { useI18n } from '@shared/i18n';
import { useAppTheme } from '@shared/theme';

export default function ContactAlertsScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const { colors, spacing, typography } = useAppTheme();
  const [alerts, setAlerts] = useState<ContactAlertSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async (manual = false) => {
    if (manual) setRefreshing(true); else setLoading(true);
    setError(null);
    try {
      const page = await contactAlertsApi.list();
      setAlerts(authorizedOpenAlerts(page.items));
    } catch {
      setAlerts([]);
      setError(t('notifications.loadError'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [t]);
  useFocusEffect(useCallback(() => { void load(); }, [load]));
  return (
    <AppScreen scroll={false}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xl }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load(true)} tintColor={colors.primary} />}>
        <ScreenHeader title={t('notifications.title')} canGoBack />
        {loading ? <StatusBanner title={t('common.loading')} /> : null}
        {error ? <View style={{ gap: spacing.md }}><StatusBanner tone="danger" title={t('common.error')} message={error} /><AppButton title={t('common.retry')} onPress={() => void load()} variant="outline" /></View> : null}
        {!loading && !error && alerts.length === 0 ? <StatusBanner title={t('notifications.emptyTitle')} message={t('notifications.emptyBody')} /> : null}
        {!loading && !error ? alerts.map((alert) => (
          <AppCard key={alert.emergencyId} style={{ marginBottom: spacing.md }}>
            <View style={styles.cardHeader}><Ionicons name="warning-outline" size={25} color={colors.danger} /><View style={{ flex: 1 }}><Text style={{ color: colors.textDark, fontSize: typography.md, fontWeight: typography.bold }}>{alert.title}</Text><Text style={{ color: colors.danger, fontSize: typography.sm, fontWeight: typography.semiBold }}>{t(`notifications.status.${alert.status}`)}</Text></View></View>
            <Text style={{ color: colors.textMedium, marginTop: spacing.sm }}>{alert.message}</Text>
            <AppButton
              title={t('notifications.details')}
              onPress={() => router.push({ pathname: '/notifications/[id]', params: { id: alert.emergencyId } })}
              variant="outline"
              style={{ marginTop: spacing.md }}
              accessibilityHint={t('notifications.detailsHint')}
            />
          </AppCard>
        )) : null}
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({ cardHeader: { alignItems: 'center', flexDirection: 'row', gap: 10 } });
