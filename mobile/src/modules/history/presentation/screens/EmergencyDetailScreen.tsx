// Consulta el detalle autorizado en vez de reutilizar copias locales de la alerta.
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ApiError, emergencyApi } from '@core/api';
import type { EmergencyDetailResponse } from '@core/api';
import AppScreen from '@shared/ui/AppScreen';
import AppCard from '@shared/ui/AppCard';
import ScreenHeader from '@shared/ui/ScreenHeader';
import StatusBanner from '@shared/ui/StatusBanner';
import Routes from '@shell/navigation/routes';
import { useAppTheme } from '@shared/theme';
import { useI18n } from '@shared/i18n';

export default function EmergencyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useI18n();
  const { colors, spacing } = useAppTheme();
  const [item, setItem] = useState<EmergencyDetailResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    if (id) {
      void emergencyApi.get(id).then((response) => {
        if (active) setItem(response);
      }).catch((cause) => {
        if (active) setError(cause instanceof ApiError ? cause.message : t('common.error'));
      });
    }
    return () => { active = false; };
  }, [id, t]);
  const row = (label: string, value: string) => <View style={{ marginBottom: spacing.md }}><Text style={{ color: colors.textMedium, fontSize: 12 }}>{label}</Text><Text style={{ color: colors.textDark, fontWeight: '600', marginTop: 3 }}>{value}</Text></View>;
  return <AppScreen>
    <ScreenHeader canGoBack onBack={() => router.replace(Routes.history)} title={t('history.detailTitle')} subtitle={id ? t('emergency.reference', { id }) : undefined} />
    {error ? <StatusBanner tone="danger" title={t('common.error')} message={error} /> : null}
    {!item && !error ? <StatusBanner title={t('common.loading')} /> : null}
    {item ? <><StatusBanner tone={item.status === 'FINALIZED' ? 'success' : 'info'} title={item.status === 'FINALIZED' ? t('history.finalized') : item.status} />
      <AppCard style={{ marginTop: spacing.md }}>
        {row(t('history.start'), new Date(item.startedAt).toLocaleString())}
        {row(t('history.end'), item.finalizedAt ? new Date(item.finalizedAt).toLocaleString() : '—')}
        {row(t('emergency.lastSync'), item.lastHeartbeatAt ? new Date(item.lastHeartbeatAt).toLocaleString() : '—')}
        {row(t('history.message'), item.messageSnapshot)}
        {row(
          t('emergency.location'),
          item.lastConfirmedLocation
            ? `${item.lastConfirmedLocation.latitude.toFixed(5)}, ${item.lastConfirmedLocation.longitude.toFixed(5)}`
            : '—',
        )}
      </AppCard>
    </> : null}
  </AppScreen>;
}
