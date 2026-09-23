// Consolida datos de cuenta, preferencias, mensaje de ayuda y cierre de sesión.
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AppScreen from '@shared/ui/AppScreen';
import AppCard from '@shared/ui/AppCard';
import ScreenHeader from '@shared/ui/ScreenHeader';
import ConfirmModal from '@shared/ui/ConfirmModal';
import Routes from '@shell/navigation/routes';
import useAppState from '@shell/providers/useAppState';
import { useAppTheme } from '@shared/theme';
import { useI18n } from '@shared/i18n';

type ProfileRoute =
  | typeof Routes.editProfile
  | typeof Routes.helpMessage
  | typeof Routes.language
  | typeof Routes.appearance;
interface ProfileOption {
  icon:
    | 'create-outline'
    | 'chatbox-ellipses-outline'
    | 'language-outline'
    | 'contrast-outline';
  label: string;
  value?: string;
  route: ProfileRoute;
}

export default function ProfileScreen() {
  const router = useRouter();
  const { profile, signOut } = useAppState();
  const { language, t } = useI18n();
  const { mode, colors, spacing, typography } = useAppTheme();
  const [logout, setLogout] = useState(false);
  const languageLabels = {
    es: t('language.spanish'),
    en: t('language.english'),
    pt: t('language.portuguese'),
    fr: t('language.french'),
  };
  const options: ProfileOption[] = [
    {
      icon: 'create-outline',
      label: t('profile.edit'),
      route: Routes.editProfile,
    },
    {
      icon: 'chatbox-ellipses-outline',
      label: t('profile.helpMessage'),
      route: Routes.helpMessage,
    },
    {
      icon: 'language-outline',
      label: t('profile.language'),
      value: languageLabels[language],
      route: Routes.language,
    },
    {
      icon: 'contrast-outline',
      label: t('profile.appearance'),
      value: mode === 'light' ? t('appearance.light') : t('appearance.dark'),
      route: Routes.appearance,
    },
  ];
  return (
    <AppScreen>
      <ScreenHeader title={t('profile.title')} />
      <AppCard>
        <View style={styles.identity}>
          <View style={[styles.avatar, { backgroundColor: colors.cardPurple }]}>
            <Ionicons
              name="person"
              size={35}
              color={colors.primary}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: colors.textDark,
                fontSize: typography.lg,
                fontWeight: '700',
              }}
            >
              {[profile.name, profile.lastName].filter(Boolean).join(' ')}
            </Text>
            <Text style={{ color: colors.textMedium }}>{profile.email}</Text>
            <Text style={{ color: colors.textMedium }}>{profile.phone}</Text>
          </View>
        </View>
      </AppCard>
      <Text
        style={{
          color: colors.textDark,
          fontSize: typography.md,
          fontWeight: '700',
          marginTop: spacing.lg,
          marginBottom: spacing.sm,
        }}
      >
        {t('profile.account')}
      </Text>
      <AppCard>
        {options.map((item, index) => (
          <Pressable
            key={item.label}
            onPress={() => router.push(item.route)}
            style={[
              styles.option,
              index > 0 && {
                borderTopWidth: 1,
                borderTopColor: colors.divider,
              },
            ]}
          >
            <Ionicons
              name={item.icon}
              size={23}
              color={colors.primary}
            />
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.textDark, fontWeight: '600' }}>
                {item.label}
              </Text>
              {item.value ? (
                <Text
                  style={{
                    color: colors.textMedium,
                    fontSize: 12,
                    marginTop: 2,
                  }}
                >
                  {item.value}
                </Text>
              ) : null}
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.textLight}
            />
          </Pressable>
        ))}
      </AppCard>
      <Pressable
        onPress={() => setLogout(true)}
        style={styles.logout}
      >
        <Ionicons
          name="log-out-outline"
          size={22}
          color={colors.danger}
        />
        <Text style={{ color: colors.danger, fontWeight: '700' }}>
          {t('profile.logout')}
        </Text>
      </Pressable>
      <ConfirmModal
        visible={logout}
        title={t('profile.logoutTitle')}
        message={t('profile.logoutBody')}
        confirmLabel={t('profile.logout')}
        cancelLabel={t('common.cancel')}
        destructive
        onCancel={() => setLogout(false)}
        onConfirm={() => {
          setLogout(false);
          signOut();
          router.replace(Routes.login);
        }}
      />
    </AppScreen>
  );
}
const styles = StyleSheet.create({
  identity: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: {
    width: 66,
    height: 66,
    borderRadius: 33,
    alignItems: 'center',
    justifyContent: 'center',
  },
  option: {
    minHeight: 62,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 9,
  },
  logout: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginTop: 20,
  },
});
