import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '@shared/theme';
import AppButton from '@shared/ui/AppButton';
import { privacyPolicySections, privacyPolicyVersion } from '../../content/privacyPolicyContent';

export default function PrivacyPolicyModal({ visible, onClose, returnLabel = 'Volver al registro' }: { visible: boolean; onClose: () => void; returnLabel?: string }) {
  const { colors, spacing, typography } = useAppTheme();
  const body = { color: colors.textDark, fontSize: typography.base, lineHeight: 24 };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} presentationStyle="fullScreen">
      <SafeAreaView style={[styles.screen, { backgroundColor: colors.white }]}>
        <View accessibilityViewIsModal style={styles.screen}>
          <View style={[styles.header, { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, gap: spacing.sm, borderColor: colors.divider }]}>
            <Text accessibilityRole="header" style={[styles.heading, { color: colors.textDark, fontSize: typography.md, fontWeight: typography.bold }]}>Términos y privacidad</Text>
            <Pressable accessibilityRole="button" accessibilityLabel="Cerrar términos y privacidad" accessibilityHint="Cierra el documento sin cambiar tu aceptación." onPress={onClose} style={({ pressed }) => [styles.close, { gap: spacing.xs, borderRadius: spacing.radiusFull, backgroundColor: pressed ? colors.backgroundLight : colors.white }]}>
              <Ionicons name="close-outline" size={24} color={colors.primary} accessible={false} />
              <Text style={{ color: colors.primary, fontSize: typography.base, fontWeight: typography.semiBold }}>Cerrar</Text>
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={[styles.content, { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xl }]}>
            <View style={{ padding: spacing.lg, gap: spacing.md, backgroundColor: colors.backgroundLight, borderRadius: spacing.radiusLg }}>
              <View style={[styles.icon, { backgroundColor: colors.white, borderRadius: spacing.radiusFull }]}>
                <Ionicons name="shield-checkmark-outline" size={28} color={colors.primary} accessible={false} />
              </View>
              <Text accessibilityRole="header" style={{ color: colors.textDark, fontSize: typography.xl, fontWeight: typography.bold }}>Tu seguridad, tus decisiones</Text>
              <Text style={body}>Conoce cómo usar AlertaMujer, qué información compartes y cómo se utiliza durante una alerta.</Text>
              <View style={[styles.badge, { gap: spacing.sm }]}>
                <Ionicons name="person-circle-outline" size={24} color={colors.primary} accessible={false} />
                <Text style={[styles.heading, { ...body, fontWeight: typography.semiBold }]}>Solo para mayores de edad · 18 años o más</Text>
              </View>
            </View>
            {privacyPolicySections.map((section) => (
              <View key={section.id} style={{ padding: spacing.md, gap: spacing.md, borderWidth: 1, borderColor: colors.divider, borderRadius: spacing.radiusLg }}>
                <View style={[styles.sectionHeader, { gap: spacing.sm }]}>
                  <View style={[styles.icon, { borderRadius: spacing.radiusMd, backgroundColor: colors.backgroundLight }]}>
                    <Ionicons name={section.icon} size={24} color={colors.primary} accessible={false} />
                  </View>
                  <Text accessibilityRole="header" style={[styles.heading, { color: colors.textDark, fontSize: typography.md, fontWeight: typography.bold }]}>{section.title}</Text>
                </View>
                {'paragraphs' in section ? section.paragraphs.map((paragraph) => <Text selectable key={paragraph} style={body}>{paragraph}</Text>) : null}
                {'items' in section ? section.items.map((item) => (
                  <View key={item} style={[styles.listItem, { gap: spacing.sm }]}>
                    <Text accessible={false} style={{ ...body, color: colors.primary }}>•</Text>
                    <Text selectable style={[styles.heading, body]}>{item}</Text>
                  </View>
                )) : null}
              </View>
            ))}
            <Text style={{ color: colors.textMedium, fontSize: typography.sm, textAlign: 'center' }}>Términos de Uso y Condiciones de Privacidad · Versión {privacyPolicyVersion}</Text>
            <AppButton title={returnLabel} onPress={onClose} variant="outline" accessibilityHint="Cierra el documento sin cambiar tu aceptación." />
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { width: '100%', maxWidth: 720, alignSelf: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1 },
  heading: { flex: 1, minWidth: 0 },
  close: { minHeight: 48, minWidth: 96, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  icon: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center' },
  badge: { flexDirection: 'row', alignItems: 'center' },
  listItem: { flexDirection: 'row', alignItems: 'flex-start' },
});
