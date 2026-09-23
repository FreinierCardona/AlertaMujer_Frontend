// Presenta estados informativos, de éxito, advertencia o error usando icono y texto.
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@shared/theme';
type Tone = 'info' | 'success' | 'warning' | 'danger';
export default function StatusBanner({
  title,
  message,
  tone = 'info',
}: {
  title: string;
  message?: string;
  tone?: Tone;
}) {
  const { colors, typography } = useAppTheme();
  const config = {
    info: [colors.info, colors.infoLight, 'information-circle-outline'],
    success: [colors.success, colors.successLight, 'checkmark-circle-outline'],
    warning: [colors.warning, colors.warningLight, 'warning-outline'],
    danger: [colors.danger, colors.backgroundLight, 'alert-circle-outline'],
  } as const;
  const [color, background, icon] = config[tone];
  return (
    <View
      accessibilityRole="alert"
      style={[styles.row, { backgroundColor: background, borderColor: color }]}
    >
      <Ionicons
        name={icon}
        size={23}
        color={color}
      />
      <View style={styles.text}>
        <Text
          style={{ color: colors.textDark, fontWeight: typography.semiBold }}
        >
          {title}
        </Text>
        {message ? (
          <Text
            style={{
              color: colors.textMedium,
              fontSize: typography.sm,
              lineHeight: 19,
              marginTop: 3,
            }}
          >
            {message}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  row: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  text: { flex: 1 },
});
