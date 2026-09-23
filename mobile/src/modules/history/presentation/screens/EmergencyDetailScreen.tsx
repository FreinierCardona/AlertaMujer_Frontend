// Consolida en solo lectura fechas, mensaje, ubicación, contactos, evidencia y conversación.
import { Linking, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AppScreen from '@shared/ui/AppScreen';
import AppCard from '@shared/ui/AppCard';
import AppButton from '@shared/ui/AppButton';
import ScreenHeader from '@shared/ui/ScreenHeader';
import StatusBanner from '@shared/ui/StatusBanner';
import useAppState from '@shell/providers/useAppState';
import Routes from '@shell/navigation/routes';
import { useAppTheme } from '@shared/theme';
import { useI18n } from '@shared/i18n';
import EvidenceGallery from '@modules/evidence/presentation/components/EvidenceGallery';
export default function EmergencyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { history } = useAppState();
  const { t } = useI18n();
  const { colors, spacing, typography } = useAppTheme();
  const item = history.find((alert) => alert.id === id);
  if (!item)
    return (
      <AppScreen>
        <ScreenHeader
          canGoBack
          title={t('history.detailTitle')}
        />
        <StatusBanner
          tone="danger"
          title={t('common.error')}
        />
      </AppScreen>
    );
  const row = (label: string, value: string) => (
    <View style={{ marginBottom: spacing.md }}>
      <Text style={{ color: colors.textMedium, fontSize: 12 }}>{label}</Text>
      <Text style={{ color: colors.textDark, fontWeight: '600', marginTop: 3 }}>
        {value}
      </Text>
    </View>
  );
  return (
    <AppScreen>
      <ScreenHeader
        canGoBack
        onBack={() => router.replace(Routes.history)}
        title={t('history.detailTitle')}
        subtitle={t('emergency.reference', { id: item.id })}
      />
      <StatusBanner
        tone="success"
        title={t('history.finalized')}
      />
      <AppCard style={{ marginTop: spacing.md }}>
        {row(t('history.start'), new Date(item.startedAt).toLocaleString())}
        {row(
          t('history.end'),
          item.endedAt ? new Date(item.endedAt).toLocaleString() : '—',
        )}
        {row(t('history.message'), item.message)}
        {row(
          t('emergency.location'),
          `${item.location.latitude.toFixed(5)}, ${item.location.longitude.toFixed(5)}`,
        )}
        <AppButton
          title="Google Maps"
          onPress={() =>
            void Linking.openURL(
              `https://maps.google.com/?q=${item.location.latitude},${item.location.longitude}`,
            )
          }
          variant="outline"
        />
      </AppCard>
      <Text
        style={[
          styles.section,
          {
            color: colors.textDark,
            fontSize: typography.md,
            marginTop: spacing.lg,
          },
        ]}
      >
        {t('history.contacts')}
      </Text>
      <AppCard>
        {item.contacts.map((contact) => (
          <Text
            key={contact.id}
            style={{ color: colors.textDark, marginVertical: 5 }}
          >
            • {contact.name} · {contact.relationship}
          </Text>
        ))}
      </AppCard>
      <Text
        style={[
          styles.section,
          {
            color: colors.textDark,
            fontSize: typography.md,
            marginTop: spacing.lg,
          },
        ]}
      >
        {t('history.evidence')} · {item.evidence.length}
      </Text>
      <EvidenceGallery items={item.evidence} />
      <AppButton
        title={t('history.conversation')}
        onPress={() =>
          router.push({
            pathname: '/emergency/chat/[id]',
            params: { id: item.id },
          })
        }
        variant="outline"
        style={{ marginTop: spacing.lg }}
      />
    </AppScreen>
  );
}
const styles = StyleSheet.create({
  section: { fontWeight: '700', marginBottom: 9 },
});
