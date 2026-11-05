import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useMemo, useState } from 'react';
import { AppState, View } from 'react-native';
import { Tabs, usePathname } from 'expo-router';
import { hasUnseenInvitations, pendingInvitationKeys } from '@modules/contacts/application/invitationIndicator';
import useAppState from '@shell/providers/useAppState';
import Routes from '@shell/navigation/routes';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useI18n } from '@shared/i18n';
import { useAppTheme } from '@shared/theme';

export default function TabsLayout() {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { t } = useI18n();
  const pathname = usePathname();
  const { profile, contacts, contactsConfirmed, refreshContacts, isAuthenticated, termsPending } = useAppState();
  const [seen, setSeen] = useState<{ userId: string; keys: string[] } | null>(null);
  const storageKey = `@alertamujer/seen-contact-invitations/${profile.userId}`;
  const pending = useMemo(() => pendingInvitationKeys(contacts), [contacts]);
  const currentSeen = seen?.userId === profile.userId ? seen.keys : null;
  const hasUnseen = currentSeen !== null && hasUnseenInvitations(pending, currentSeen);

  useEffect(() => {
    if (!profile.userId) return;
    let active = true;
    void AsyncStorage.getItem(storageKey).then((value) => {
      let keys: string[] = [];
      try { const parsed: unknown = value ? JSON.parse(value) : []; if (Array.isArray(parsed)) keys = parsed.filter((key): key is string => typeof key === 'string'); } catch { /* Un estado inválido se trata como no visto. */ }
      if (active) setSeen({ userId: profile.userId, keys });
    }).catch(() => { if (active) setSeen({ userId: profile.userId, keys: [] }); });
    return () => { active = false; };
  }, [profile.userId, storageKey]);

  useEffect(() => {
    if (!isAuthenticated || termsPending) return;
    const refresh = () => { if (AppState.currentState === 'active') void refreshContacts().catch(() => undefined); };
    refresh();
    const timer = setInterval(refresh, 10000);
    const subscription = AppState.addEventListener('change', (state) => { if (state === 'active') refresh(); });
    return () => { clearInterval(timer); subscription.remove(); };
  }, [isAuthenticated, termsPending, refreshContacts]);

  useEffect(() => {
    if (pathname !== Routes.contacts || !contactsConfirmed || currentSeen === null || !hasUnseen) return;
    const keys = [...new Set([...currentSeen, ...pending])];
    const timer = setTimeout(() => {
      setSeen({ userId: profile.userId, keys });
      void AsyncStorage.setItem(storageKey, JSON.stringify(keys)).catch(() => undefined);
    }, 0);
    return () => clearTimeout(timer);
  }, [pathname, contactsConfirmed, currentSeen, hasUnseen, pending, profile.userId, storageKey]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.divider,
          height: 58 + Math.max(insets.bottom, 8),
          paddingTop: 7,
          paddingBottom: Math.max(insets.bottom, 8),
        },
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: t('nav.home'),
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name="shield-outline"
              color={color == null || typeof color === 'number' ? (focused ? colors.primary : colors.textLight) : color}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="contacts"
        options={{
          title: t('nav.contacts'),
          tabBarAccessibilityLabel: hasUnseen && pathname !== Routes.contacts ? `${t('nav.contacts')}. Tienes una nueva invitación` : t('nav.contacts'),
          tabBarIcon: ({ color, size, focused }) => (
            <View>
              <Ionicons
                name="people-outline"
                color={color == null || typeof color === 'number' ? (focused ? colors.primary : colors.textLight) : color}
                size={size}
              />
              {hasUnseen && pathname !== Routes.contacts ? <View accessibilityElementsHidden importantForAccessibility="no" style={{ position: 'absolute', right: -3, top: -2, width: 11, height: 11, borderRadius: 6, backgroundColor: colors.sosRed, borderColor: colors.white, borderWidth: 1.5 }} /> : null}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: t('nav.history'),
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name="time-outline"
              color={color == null || typeof color === 'number' ? (focused ? colors.primary : colors.textLight) : color}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('nav.profile'),
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name="person-outline"
              color={color == null || typeof color === 'number' ? (focused ? colors.primary : colors.textLight) : color}
              size={size}
            />
          ),
        }}
      />
    </Tabs>
  );
}
