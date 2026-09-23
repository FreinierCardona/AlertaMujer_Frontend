// Agrega un perfil del directorio controlado o edita únicamente la relación existente.
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AppScreen from '@shared/ui/AppScreen';
import AppCard from '@shared/ui/AppCard';
import AppInput from '@shared/ui/AppInput';
import AppButton from '@shared/ui/AppButton';
import ScreenHeader from '@shared/ui/ScreenHeader';
import StatusBanner from '@shared/ui/StatusBanner';
import useAppState from '@shell/providers/useAppState';
import { localDirectory } from '@shell/providers/AppStateProvider';
import { useAppTheme } from '@shared/theme';
import { useI18n } from '@shared/i18n';
export default function ContactFormScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { contacts, addContact, updateContact } = useAppState();
  const { t } = useI18n();
  const { colors, spacing, typography } = useAppTheme();
  const existing = useMemo(
    () => contacts.find((item) => item.id === id),
    [contacts, id],
  );
  const [relationship, setRelationship] = useState(
    existing?.relationship ?? '',
  );
  const [message, setMessage] = useState<'saved' | 'duplicate' | 'self' | null>(
    null,
  );
  if (existing)
    return (
      <AppScreen>
        <ScreenHeader
          canGoBack
          title={t('common.edit')}
          subtitle={existing.name}
        />
        <AppInput
          label={t('contacts.relationship')}
          value={relationship}
          onChangeText={setRelationship}
        />
        <AppButton
          title={t('common.save')}
          disabled={!relationship.trim()}
          onPress={() => {
            updateContact(existing.id, relationship.trim());
            router.back();
          }}
        />
      </AppScreen>
    );
  return (
    <AppScreen>
      <ScreenHeader
        canGoBack
        title={t('contacts.add')}
        subtitle={t('contacts.description')}
      />
      {message ? (
        <StatusBanner
          tone={message === 'saved' ? 'success' : 'danger'}
          title={t(
            message === 'saved'
              ? 'contacts.saved'
              : message === 'duplicate'
                ? 'contacts.duplicate'
                : 'contacts.self',
          )}
        />
      ) : null}
      <Text
        style={{
          color: colors.textDark,
          fontSize: typography.md,
          fontWeight: '700',
          marginVertical: spacing.md,
        }}
      >
        {t('contacts.directory')}
      </Text>
      <AppInput
        label={t('contacts.relationship')}
        value={relationship}
        onChangeText={setRelationship}
        placeholder={t('contacts.relationship')}
      />
      {localDirectory.map((user) => (
        <AppCard
          key={user.id}
          style={{ marginBottom: spacing.sm }}
        >
          <View style={styles.row}>
            <Ionicons
              name="shield-checkmark-outline"
              size={27}
              color={colors.success}
            />
            <View style={styles.body}>
              <Text style={{ color: colors.textDark, fontWeight: '600' }}>
                {user.name}
              </Text>
              <Text style={{ color: colors.textMedium, fontSize: 13 }}>
                ••• {user.phone.slice(-4)} · {t('contacts.registered')}
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              disabled={!relationship.trim()}
              onPress={() => setMessage(addContact(user, relationship))}
              style={{ padding: 10, opacity: relationship.trim() ? 1 : 0.4 }}
            >
              <Ionicons
                name="person-add-outline"
                size={24}
                color={colors.primary}
              />
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
    </AppScreen>
  );
}
const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  body: { flex: 1 },
});
