// Encabezado compacto con regreso opcional y jerarquía tipográfica común.
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppTheme } from '@shared/theme';
import { useI18n } from '@shared/i18n';
export default function ScreenHeader({
  title,
  subtitle,
  canGoBack = false,
  onBack,
}: {
  title: string;
  subtitle?: string;
  canGoBack?: boolean;
  onBack?: () => void;
}) {
  const router = useRouter();
  const { t } = useI18n();
  const { colors, spacing, typography } = useAppTheme();
  return (
    <View style={{ marginBottom: spacing.lg }}>
      <View style={styles.row}>
        {canGoBack ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('common.back')}
            onPress={onBack ?? (() => router.back())}
            style={styles.back}
          >
            <Ionicons
              name="arrow-back"
              size={23}
              color={colors.textDark}
            />
          </Pressable>
        ) : null}
        <Text
          style={[
            styles.title,
            { color: colors.primary, fontSize: typography.xl },
          ]}
        >
          {title}
        </Text>
      </View>
      {subtitle ? (
        <Text
          style={{
            color: colors.textMedium,
            fontSize: typography.sm,
            lineHeight: 20,
            marginTop: 6,
          }}
        >
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}
const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  back: { padding: 8, marginLeft: -8 },
  title: { fontWeight: '700', flex: 1 },
});
