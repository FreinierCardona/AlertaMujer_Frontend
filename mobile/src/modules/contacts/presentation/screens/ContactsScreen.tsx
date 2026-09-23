// Lista contactos locales registrados y confirma su eliminación sin alterar el historial.
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AppScreen from '@shared/ui/AppScreen';
import AppCard from '@shared/ui/AppCard';
import AppButton from '@shared/ui/AppButton';
import ScreenHeader from '@shared/ui/ScreenHeader';
import StatusBanner from '@shared/ui/StatusBanner';
import ConfirmModal from '@shared/ui/ConfirmModal';
import Routes from '@shell/navigation/routes';
import useAppState from '@shell/providers/useAppState';
import { useAppTheme } from '@shared/theme';
import { useI18n } from '@shared/i18n';
import type { Contact } from '@shell/providers/AppStateProvider';
export default function ContactsScreen() {
  const router = useRouter();
  const { contacts, removeContact } = useAppState();
  const { t } = useI18n();
  const { colors, spacing, typography } = useAppTheme();
  const [target, setTarget] = useState<Contact | null>(null);
  return (
    <AppScreen>
      <ScreenHeader
        title={t('contacts.title')}
        subtitle={t('contacts.description')}
      />
      {contacts.length === 0 ? (
        <StatusBanner
          tone="warning"
          title={t('contacts.emptyTitle')}
          message={t('contacts.emptyBody')}
        />
      ) : (
        contacts.map((contact) => (
          <AppCard
            key={contact.id}
            style={{ marginBottom: spacing.sm }}
          >
            <View style={styles.row}>
              <View
                style={[styles.avatar, { backgroundColor: colors.cardPurple }]}
              >
                <Ionicons
                  name="person-outline"
                  size={24}
                  color={colors.primary}
                />
              </View>
              <View style={styles.body}>
                <Text
                  style={{
                    color: colors.textDark,
                    fontWeight: typography.semiBold,
                  }}
                >
                  {contact.name}
                </Text>
                <Text style={{ color: colors.textMedium, fontSize: 13 }}>
                  ••• {contact.phone.slice(-4)} · {contact.relationship}
                </Text>
              </View>
              <Pressable
                accessibilityLabel={t('common.edit')}
                onPress={() =>
                  router.push({
                    pathname: Routes.contactForm,
                    params: { id: contact.id },
                  })
                }
                style={styles.icon}
              >
                <Ionicons
                  name="create-outline"
                  size={22}
                  color={colors.primary}
                />
              </Pressable>
              <Pressable
                accessibilityLabel={t('common.delete')}
                onPress={() => setTarget(contact)}
                style={styles.icon}
              >
                <Ionicons
                  name="trash-outline"
                  size={22}
                  color={colors.danger}
                />
              </Pressable>
            </View>
          </AppCard>
        ))
      )}
      <View style={{ height: spacing.lg }} />
      <AppButton
        title={t('contacts.add')}
        onPress={() => router.push(Routes.contactForm)}
      />
      <ConfirmModal
        visible={Boolean(target)}
        title={t('contacts.deleteTitle')}
        message={t('contacts.deleteBody', { name: target?.name ?? '' })}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        destructive
        onCancel={() => setTarget(null)}
        onConfirm={() => {
          if (target) removeContact(target.id);
          setTarget(null);
        }}
      />
    </AppScreen>
  );
}
const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1 },
  icon: { padding: 7 },
});
