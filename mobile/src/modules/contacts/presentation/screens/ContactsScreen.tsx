// Presenta únicamente relaciones confirmadas por el Backend y sus acciones autorizadas.
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import AppScreen from '@shared/ui/AppScreen';
import AppCard from '@shared/ui/AppCard';
import AppButton from '@shared/ui/AppButton';
import ScreenHeader from '@shared/ui/ScreenHeader';
import StatusBanner from '@shared/ui/StatusBanner';
import Routes from '@shell/navigation/routes';
import useAppState from '@shell/providers/useAppState';
import { useAppTheme } from '@shared/theme';
import { useI18n } from '@shared/i18n';
import type { ContactAction, ContactRelationship } from '@core/api';

const actionIcon: Record<ContactAction, keyof typeof Ionicons.glyphMap> = {
  ACCEPT: 'checkmark-outline',
  REJECT: 'close-outline',
  REINVITE: 'refresh-outline',
};

export default function ContactsScreen() {
  const router = useRouter();
  const {
    contacts,
    contactsConfirmed,
    contactsError,
    contactsLoading,
    deviceTokenConflict,
    performContactAction,
    refreshContacts,
    registerDeviceToken,
  } = useAppState();
  const { t } = useI18n();
  const { colors, spacing, typography } = useAppTheme();
  const [actionInFlight, setActionInFlight] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      void refreshContacts().catch(() => undefined);
    }, [refreshContacts]),
  );

  const runAction = async (contact: ContactRelationship, action: ContactAction) => {
    setActionInFlight(`${contact.contactId}:${action}`);
    setActionError(null);
    try {
      await performContactAction(contact.contactId, action);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : t('common.error'));
    } finally {
      setActionInFlight(null);
    }
  };

  return (
    <AppScreen>
      <ScreenHeader
        title={t('contacts.title')}
        subtitle={t('contacts.description')}
      />
      {contactsError ? (
        <StatusBanner
          tone="warning"
          title={t('contacts.notUpdated')}
          message={contactsError}
        />
      ) : null}
      {actionError ? (
        <View style={{ marginTop: spacing.sm }}>
          <StatusBanner
            tone="danger"
            title={t('common.error')}
            message={actionError}
          />
        </View>
      ) : null}
      {deviceTokenConflict ? (
        <View style={{ marginTop: spacing.sm }}>
          <StatusBanner
            tone="warning"
            title={t('contacts.deviceConflictTitle')}
            message={t('contacts.deviceConflictBody')}
          />
          <AppButton
            title={t('contacts.registerDevice')}
            onPress={() => void registerDeviceToken()}
            variant="outline"
            style={{ marginTop: spacing.sm }}
          />
        </View>
      ) : null}
      {contactsLoading && contacts.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
          <Text style={{ color: colors.textMedium }}>{t('common.loading')}</Text>
        </View>
      ) : contacts.length === 0 ? (
        <StatusBanner
          tone={contactsConfirmed ? 'warning' : 'info'}
          title={t('contacts.emptyTitle')}
          message={t('contacts.emptyBody')}
        />
      ) : (
        contacts.map((contact) => (
          <AppCard
            key={contact.contactId}
            style={{ marginTop: spacing.sm }}
          >
            <View style={styles.row}>
              <View style={[styles.avatar, { backgroundColor: colors.cardPurple }]}>
                <Ionicons
                  name="person-outline"
                  size={24}
                  color={colors.primary}
                />
              </View>
              <View style={styles.body}>
                <Text
                  style={{ color: colors.textDark, fontWeight: typography.semiBold }}
                >
                  {`${contact.counterpart.firstNames} ${contact.counterpart.lastNames}`.trim()}
                </Text>
                <Text style={{ color: colors.textMedium, fontSize: 13 }}>
                  {contact.counterpart.username}
                </Text>
                <Text style={{ color: colors.textMedium, fontSize: 12, marginTop: 3 }}>
                  {t(`contacts.direction.${contact.direction}`)} · {t(`contacts.status.${contact.status}`)}
                </Text>
                {contact.expiresAt ? (
                  <Text style={{ color: colors.textMedium, fontSize: 12, marginTop: 2 }}>
                    {t('contacts.expires', {
                      date: new Date(contact.expiresAt).toLocaleString(),
                    })}
                  </Text>
                ) : null}
                {contact.status === 'ACCEPTED' ? (
                  <Text
                    style={{
                      color: contact.eligible ? colors.success : colors.warning,
                      fontSize: 12,
                      fontWeight: '600',
                      marginTop: 3,
                    }}
                  >
                    {t(
                      contact.eligible
                        ? 'contacts.eligible'
                        : 'contacts.notEligible',
                    )}
                  </Text>
                ) : null}
              </View>
            </View>
            {contact.allowedActions.length > 0 ? (
              <View style={[styles.actions, { marginTop: spacing.sm }]}>
                {contact.allowedActions.map((action) => {
                  const busy = actionInFlight === `${contact.contactId}:${action}`;
                  return (
                    <Pressable
                      key={action}
                      accessibilityRole="button"
                      accessibilityState={{ disabled: Boolean(actionInFlight), busy }}
                      disabled={Boolean(actionInFlight)}
                      onPress={() => void runAction(contact, action)}
                      style={[
                        styles.action,
                        {
                          borderColor:
                            action === 'REJECT' ? colors.danger : colors.primary,
                          opacity: actionInFlight ? 0.5 : 1,
                        },
                      ]}
                    >
                      {busy ? (
                        <ActivityIndicator
                          color={action === 'REJECT' ? colors.danger : colors.primary}
                        />
                      ) : (
                        <Ionicons
                          name={actionIcon[action]}
                          size={18}
                          color={action === 'REJECT' ? colors.danger : colors.primary}
                        />
                      )}
                      <Text
                        style={{
                          color: action === 'REJECT' ? colors.danger : colors.primary,
                          fontWeight: '600',
                        }}
                      >
                        {t(`contacts.action.${action}`)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            ) : null}
          </AppCard>
        ))
      )}
      <View style={{ height: spacing.lg }} />
      <AppButton
        title={t('contacts.add')}
        onPress={() => router.push(Routes.contactForm)}
      />
      {!contactsConfirmed || contactsError ? (
        <AppButton
          title={t('common.retry')}
          onPress={() => void refreshContacts().catch(() => undefined)}
          variant="outline"
          style={{ marginTop: spacing.sm }}
        />
      ) : null}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', gap: 10, paddingVertical: 28 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  action: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});
