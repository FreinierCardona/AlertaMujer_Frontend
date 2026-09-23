// Modal accesible con cancelación y confirmación explícitas para acciones sensibles.
import { Modal, StyleSheet, Text, View } from 'react-native';
import AppButton from './AppButton';
import { useAppTheme } from '@shared/theme';
export default function ConfirmModal({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel,
  destructive = false,
  loading = false,
  onConfirm,
  onCancel,
}: {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const { colors, spacing, typography } = useAppTheme();
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
        <View
          style={{
            backgroundColor: colors.white,
            borderRadius: spacing.radiusLg,
            padding: spacing.lg,
            width: '88%',
          }}
        >
          <Text
            style={{
              color: colors.textDark,
              fontSize: typography.lg,
              fontWeight: typography.bold,
            }}
          >
            {title}
          </Text>
          <Text
            style={{
              color: colors.textMedium,
              marginVertical: spacing.md,
              lineHeight: 21,
            }}
          >
            {message}
          </Text>
          <View style={styles.actions}>
            <AppButton
              title={cancelLabel}
              onPress={onCancel}
              variant="outline"
              style={styles.button}
              textStyle={styles.buttonLabel}
            />
            <AppButton
              title={confirmLabel}
              onPress={onConfirm}
              loading={loading}
              variant={destructive ? 'danger' : 'primary'}
              style={styles.button}
              textStyle={styles.buttonLabel}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}
const styles = StyleSheet.create({
  overlay: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  actions: { flexDirection: 'row', gap: 10 },
  button: { flex: 1, minWidth: 0, paddingHorizontal: 14 },
  buttonLabel: { fontSize: 14 },
});
