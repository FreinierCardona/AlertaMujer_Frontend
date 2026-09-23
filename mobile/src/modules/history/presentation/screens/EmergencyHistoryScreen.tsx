// Lista cronológicamente alertas propias finalizadas sin acciones destructivas.
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AppScreen from '@shared/ui/AppScreen';
import AppCard from '@shared/ui/AppCard';
import AppButton from '@shared/ui/AppButton';
import ScreenHeader from '@shared/ui/ScreenHeader';
import StatusBanner from '@shared/ui/StatusBanner';
import useAppState from '@shell/providers/useAppState';
import { useAppTheme } from '@shared/theme';
import { useI18n } from '@shared/i18n';
export default function EmergencyHistoryScreen() {
  const router = useRouter();
  const { history } = useAppState();
  const { t } = useI18n();
  const { colors, spacing, typography } = useAppTheme();
  return (
    <AppScreen>
      <ScreenHeader title={t('history.title')} />
      {history.length === 0 ? (
        <StatusBanner
          title={t('history.emptyTitle')}
          message={t('history.emptyBody')}
        />
      ) : (
        history.map((item) => (
          <AppCard
            key={item.id}
            style={{ marginBottom: spacing.md }}
          >
            <View style={styles.header}>
              <Ionicons
                name="checkmark-circle-outline"
                size={25}
                color={colors.success}
              />
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: colors.textDark,
                    fontSize: typography.md,
                    fontWeight: '700',
                  }}
                >
                  {t('emergency.reference', { id: item.id })}
                </Text>
                <Text style={{ color: colors.textMedium, fontSize: 13 }}>
                  {new Date(item.startedAt).toLocaleString()}
                </Text>
              </View>
              <Text style={{ color: colors.success, fontWeight: '700' }}>
                {t('history.finalized')}
              </Text>
            </View>
            <Text
              numberOfLines={2}
              style={{ color: colors.textMedium, marginVertical: spacing.sm }}
            >
              {item.message}
            </Text>
            <AppButton
              title={t('history.detail')}
              onPress={() =>
                router.push({
                  pathname: '/emergency/detail/[id]',
                  params: { id: item.id },
                })
              }
              variant="outline"
            />
          </AppCard>
        ))
      )}
    </AppScreen>
  );
}
const styles = StyleSheet.create({
  header: { flexDirection: 'row', gap: 10, alignItems: 'center' },
});
