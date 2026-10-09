// Busca el directorio remoto y crea invitaciones sin almacenar relaciones locales.
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AppScreen from '@shared/ui/AppScreen';
import AppCard from '@shared/ui/AppCard';
import AppButton from '@shared/ui/AppButton';
import AppInput from '@shared/ui/AppInput';
import ConfirmModal from '@shared/ui/ConfirmModal';
import ScreenHeader from '@shared/ui/ScreenHeader';
import StatusBanner from '@shared/ui/StatusBanner';
import { contactsApi } from '@core/api';
import type { ContactInvitation, DirectoryUser } from '@core/api';
import Routes from '@shell/navigation/routes';
import useAppState from '@shell/providers/useAppState';
import { useAppTheme } from '@shared/theme';
import { useI18n } from '@shared/i18n';

const SEARCH_DELAY_MS = 300;

function normalizedUsername(username: string) {
  const value = username.trim().toLowerCase();
  return value.startsWith('@') ? value : `@${value}`;
}

export default function ContactFormScreen() {
  const router = useRouter();
  const { refreshContacts } = useAppState();
  const { t } = useI18n();
  const { colors, spacing, typography } = useAppTheme();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<DirectoryUser[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [target, setTarget] = useState<DirectoryUser | null>(null);
  const [inviting, setInviting] = useState(false);
  const [invitation, setInvitation] = useState<ContactInvitation | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const trimmedQuery = useMemo(() => query.trim(), [query]);

  useEffect(() => {
    if (!trimmedQuery) {
      return;
    }
    let current = true;
    const timeout = setTimeout(() => {
      setSearching(true);
      setSearchError(null);
      void contactsApi
        .directory(trimmedQuery)
        .then((response) => {
          if (current) setResults(response.items);
        })
        .catch((error) => {
          if (current) {
            setResults([]);
            setSearchError(error instanceof Error ? error.message : t('common.error'));
          }
        })
        .finally(() => {
          if (current) setSearching(false);
        });
    }, SEARCH_DELAY_MS);
    return () => {
      current = false;
      clearTimeout(timeout);
    };
  }, [t, trimmedQuery]);

  const sendInvitation = async () => {
    if (!target || inviting) return;
    setInviting(true);
    setInviteError(null);
    try {
      const created = await contactsApi.invite(normalizedUsername(target.username));
      setInvitation(created);
      await refreshContacts().catch(() => undefined);
    } catch (error) {
      setInviteError(error instanceof Error ? error.message : t('common.error'));
    } finally {
      setInviting(false);
      setTarget(null);
    }
  };

  return (
    <AppScreen>
      <ScreenHeader
        canGoBack
        title={t('contacts.searchTitle')}
        subtitle={t('contacts.searchDescription')}
      />
      {invitation ? (
        <StatusBanner
          tone="success"
          title={t('contacts.invitationSent')}
          message={t('contacts.invitationResult', {
            id: invitation.contactId,
            status: t(`contacts.status.${invitation.status}`),
            expires: invitation.expiresAt
              ? new Date(invitation.expiresAt).toLocaleString()
              : t('contacts.noExpiry'),
          })}
        />
      ) : null}
      {inviteError ? (
        <View style={{ marginTop: spacing.sm }}>
          <StatusBanner
            tone="danger"
            title={t('common.error')}
            message={inviteError}
          />
        </View>
      ) : null}
      <AppInput
        label={t('contacts.search')}
        value={query}
        onChangeText={setQuery}
        placeholder={t('contacts.searchPlaceholder')}
        autoCapitalize="none"
        autoCorrect={false}
        maxLength={50}
        hint={t('contacts.searchHint')}
      />
      {trimmedQuery && searching ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.primary} />
          <Text style={{ color: colors.textMedium }}>{t('common.loading')}</Text>
        </View>
      ) : null}
      {trimmedQuery && searchError ? (
        <StatusBanner
          tone="warning"
          title={t('contacts.searchError')}
          message={searchError}
        />
      ) : null}
      {trimmedQuery && !searching && !searchError && results.length === 0 ? (
        <StatusBanner
          tone="info"
          title={t('contacts.searchEmptyTitle')}
          message={t('contacts.searchEmptyBody')}
        />
      ) : null}
      {trimmedQuery && results.map((user) => (
        <AppCard
          key={user.username}
          style={{ marginTop: spacing.sm }}
        >
          <View style={styles.row}>
            <Ionicons
              name="person-outline"
              size={27}
              color={colors.primary}
            />
            <View style={styles.body}>
              <Text
                style={{
                  color: colors.textDark,
                  fontSize: typography.md,
                  fontWeight: '600',
                }}
              >
                {`${user.firstNames} ${user.lastNames}`.trim()}
              </Text>
              <Text style={{ color: colors.textMedium, fontSize: 13 }}>
                {user.username}
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('contacts.invite')}
              onPress={() => setTarget(user)}
              style={[styles.invite, { borderColor: colors.primary }]}
            >
              <Ionicons
                name="person-add-outline"
                size={20}
                color={colors.primary}
              />
              <Text style={{ color: colors.primary, fontWeight: '600' }}>
                {t('contacts.invite')}
              </Text>
            </Pressable>
          </View>
        </AppCard>
      ))}
      <View style={{ height: spacing.md }} />
      <AppButton
        title={t('common.back')}
        onPress={() => router.back()}
        variant="outline"
      />
      {invitation ? (
        <AppButton
          title={t('contacts.backToContacts')}
          onPress={() => router.replace(Routes.contacts)}
          style={{ marginTop: spacing.sm }}
        />
      ) : null}
      <ConfirmModal
        visible={Boolean(target)}
        title={t('contacts.inviteTitle')}
        message={t('contacts.inviteBody', {
          name: target
            ? `${target.firstNames} ${target.lastNames}`.trim()
            : '',
          username: target?.username ?? '',
        })}
        confirmLabel={t('contacts.invite')}
        cancelLabel={t('common.cancel')}
        loading={inviting}
        onCancel={() => setTarget(null)}
        onConfirm={() => void sendInvitation()}
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  loading: { flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  body: { flex: 1 },
  invite: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
});
