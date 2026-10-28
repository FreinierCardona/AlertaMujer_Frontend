// Presenta la matriz real de requisitos y activa SOS solo mediante pulsación prolongada confirmada.
import * as ImagePicker from 'expo-image-picker';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  AppState,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import AppScreen from '@shared/ui/AppScreen';
import AppCard from '@shared/ui/AppCard';
import StatusBanner from '@shared/ui/StatusBanner';
import ConfirmModal from '@shared/ui/ConfirmModal';
import Routes from '@shell/navigation/routes';
import useAppState from '@shell/providers/useAppState';
import { useAppTheme } from '@shared/theme';
import { useI18n } from '@shared/i18n';
import type { DeviceRequirementKey } from '@modules/location/infrastructure/deviceRequirements';
import {
  canUseBackgroundLocation,
} from '@core/config/appConfig';
import { contactAlertsApi } from '@core/api/contactAlertsApi';
import { authorizedOpenAlerts } from '@modules/notifications/application/contactAlerts';

export default function HomeEmergencyScreen() {
  const router = useRouter();
  const {
    profile,
    contacts,
    contactsConfirmed,
    requirements,
    refreshContacts,
    refreshRequirements,
    resolveRequirement,
    createEmergency,
  } = useAppState();
  const { t } = useI18n();
  const { colors, spacing, typography } = useAppTheme();
  const [cameraGranted, setCameraGranted] = useState(false);
  const [holding, setHolding] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [requirementTarget, setRequirementTarget] =
    useState<DeviceRequirementKey | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasContactAlerts, setHasContactAlerts] = useState(false);
  const requirementsComplete =
    contactsConfirmed &&
    contacts.some((contact) => contact.status === 'ACCEPTED' && contact.eligible) &&
    requirements.foreground &&
    (!canUseBackgroundLocation || requirements.background) &&
    requirements.gps &&
    requirements.connection;
  const ready = requirementsComplete;
  const previousReady = useRef<boolean | null>(null);
  const [showReady, setShowReady] = useState(false);
  useEffect(() => {
    if (requirements.checking || !contactsConfirmed) return;
    const becameReady = ready && previousReady.current === false;
    previousReady.current = ready;
    if (!becameReady && ready) return;
    const timer = setTimeout(() => setShowReady(becameReady), 0);
    return () => clearTimeout(timer);
  }, [ready, requirements.checking, contactsConfirmed]);
  useEffect(() => {
    if (!showReady) return;
    const timer = setTimeout(() => setShowReady(false), 5000);
    return () => clearTimeout(timer);
  }, [showReady]);
  const showRequirements = (!requirementsComplete || !cameraGranted) && !requirements.checking;
  useFocusEffect(
    useCallback(() => {
      void refreshRequirements();
      void ImagePicker.getCameraPermissionsAsync().then((permission) => setCameraGranted(permission.granted));
      void refreshContacts().catch(() => undefined);
      let active = true;
      let busy = false;
      const refresh = async () => {
        if (!active || busy || AppState.currentState !== 'active') return;
        busy = true;
        try {
          const page = await contactAlertsApi.list();
          if (active) setHasContactAlerts(authorizedOpenAlerts(page.items).length > 0);
        } catch { /* Conserva el último estado confirmado. */ }
        finally { busy = false; }
      };
      void refresh();
      const timer = setInterval(() => void refresh(), 10000);
      const subscription = AppState.addEventListener('change', (state) => { if (state === 'active') void refresh(); });
      return () => { active = false; clearInterval(timer); subscription.remove(); };
    }, [refreshContacts, refreshRequirements]),
  );
  const activate = async () => {
    setCreating(true);
    const result = await createEmergency();
    setCreating(false);
    if (result.ok) {
      setConfirm(false);
      router.replace(Routes.activeEmergency);
    } else {
      setConfirm(false);
      setError(result.message ?? result.reason ?? 'error');
      void refreshRequirements();
    }
  };
  const allRequirementRows: {
    key: DeviceRequirementKey | 'contacts' | 'camera';
    label: string;
    value: boolean;
  }[] = [
    {
      key: 'contacts',
      label: t('requirements.contacts'),
      value:
        contactsConfirmed &&
        contacts.some(
          (contact) => contact.status === 'ACCEPTED' && contact.eligible,
        ),
    },
    {
      key: 'foreground',
      label: t('requirements.foreground'),
      value: requirements.foreground,
    },
    {
      key: 'background',
      label: t('requirements.background'),
      value: requirements.background,
    },
    { key: 'camera', label: 'Cámara para fotografías', value: cameraGranted },
    { key: 'gps', label: t('requirements.gps'), value: requirements.gps },
    {
      key: 'connection',
      label: t('requirements.connection'),
      value: requirements.connection,
    },
  ];
  const rows = allRequirementRows.filter(
    (row) =>
      row.key !== 'background' || canUseBackgroundLocation,
  );
  const requirementHelp = requirementTarget
    ? t(
        requirementTarget === 'foreground'
          ? 'requirements.foregroundHelp'
          : requirementTarget === 'background'
            ? 'requirements.backgroundHelp'
            : 'requirements.gpsHelp',
      )
    : '';
  return (
    <AppScreen>
      <View style={styles.homeHeader}>
        <Text
          style={{
            color: colors.primary,
            flex: 1,
            fontSize: typography.xl,
            fontWeight: typography.bold,
          }}
        >
          {t('home.hello', {
            name: profile.name || t('profile.defaultName'),
          })}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={hasContactAlerts ? t('notifications.bellWithAlerts') : t('notifications.bell')}
          accessibilityHint={t('notifications.bellHint')}
          onPress={() => router.push(Routes.notifications)}
          style={[styles.bell, { backgroundColor: colors.white, borderColor: colors.inputBorder }]}
        >
          <Ionicons name="notifications-outline" size={24} color={colors.primary} />
          {hasContactAlerts ? <View accessibilityLabel={t('notifications.indicator')} style={[styles.indicator, { backgroundColor: colors.danger, borderColor: colors.white }]} /> : null}
        </Pressable>
      </View>
      <Text
        style={{
          color: colors.textMedium,
          marginTop: 4,
          marginBottom: spacing.lg,
        }}
      >
        {t('home.protected')}
      </Text>
      {!ready || showReady ? <StatusBanner
        tone={ready ? 'success' : requirements.checking ? 'info' : 'warning'}
        title={
          ready
            ? t('home.ready')
            : requirements.checking
              ? t('home.checking')
              : t('home.blocked')
        }
      /> : null}
      {error ? (
        <View style={{ marginTop: spacing.sm }}>
          <StatusBanner
            tone="danger"
            title={
              error === 'requirements' ? t('home.blocked') : t('common.error')
            }
            message={
              error === 'location'
                ? t('emergency.locationPending')
                : error === 'requirements'
                  ? undefined
                  : error
            }
          />
        </View>
      ) : null}
      {showRequirements ? (
        <>
          <Text
            style={[
              styles.section,
              { color: colors.textDark, marginTop: spacing.lg },
            ]}
          >
            {t('requirements.title')}
          </Text>
          <AppCard>
            {rows.map((row, index) => (
              <View
                key={row.key}
                style={[
                  styles.requirement,
                  index > 0 && {
                    borderTopWidth: 1,
                    borderTopColor: colors.divider,
                  },
                ]}
              >
                <Ionicons
                  name={row.value ? 'checkmark-circle' : 'alert-circle'}
                  size={22}
                  color={row.value ? colors.success : colors.warning}
                />
                <View style={styles.requirementText}>
                  <Text style={{ color: colors.textDark, fontWeight: '600' }}>
                    {row.label}
                  </Text>
                  <Text style={{ color: colors.textMedium, fontSize: 12 }}>
                    {row.value
                      ? t('requirements.ready')
                      : t('requirements.pending')}
                  </Text>
                </View>
                {!row.value ? (
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => {
                      if (row.key === 'contacts') router.push(Routes.contacts);
                      else if (row.key === 'camera') void ImagePicker.requestCameraPermissionsAsync().then((permission) => { setCameraGranted(permission.granted); if (!permission.granted) setError('Puedes activar el SOS. Para tomar fotos, habilita la cámara en ajustes.'); }).catch(() => setError('No fue posible solicitar el permiso de cámara.'));
                      else if (row.key === 'connection')
                        void refreshRequirements();
                      else setRequirementTarget(row.key);
                    }}
                    style={[styles.resolve, { borderColor: colors.primary }]}
                  >
                    <Text style={{ color: colors.primary, fontWeight: '600' }}>
                      {row.key === 'connection'
                        ? t('common.retry')
                        : t('requirements.resolve')}
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            ))}
          </AppCard>
        </>
      ) : null}
      <View style={{ alignItems: 'center', marginTop: spacing.xl }}>
        <Text style={{ color: colors.textDark, fontWeight: '600' }}>
          {t('home.hold')}
        </Text>
        <Text style={{ color: colors.textMedium, fontSize: 12, marginTop: 3 }}>
          {t('home.release')}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('home.sos')}
          accessibilityState={{ disabled: !ready, busy: holding }}
          disabled={!ready}
          delayLongPress={1000}
          onPressIn={() => {
            setError(null);
            setHolding(true);
          }}
          onPressOut={() => setHolding(false)}
          onLongPress={() => {
            setHolding(false);
            setConfirm(true);
          }}
          style={[
            styles.sos,
            {
              backgroundColor: colors.sosRed,
              opacity: ready ? 1 : 0.38,
              shadowColor: colors.sosRed,
            },
          ]}
        >
          <Ionicons
            name="shield-outline"
            size={62}
            color={colors.textWhite}
          />
          <Text
            style={{
              color: colors.textWhite,
              fontSize: 28,
              fontWeight: '800',
              letterSpacing: 2,
            }}
          >
            {t('home.sos')}
          </Text>
          {holding ? (
            <ActivityIndicator
              color={colors.textWhite}
              style={{ marginTop: 10 }}
            />
          ) : null}
        </Pressable>
      </View>
      <ConfirmModal
        visible={Boolean(requirementTarget)}
        title={
          rows.find((row) => row.key === requirementTarget)?.label ??
          t('requirements.title')
        }
        message={requirementHelp}
        confirmLabel={t('requirements.resolve')}
        cancelLabel={t('common.cancel')}
        onCancel={() => setRequirementTarget(null)}
        onConfirm={() => {
          if (requirementTarget) void resolveRequirement(requirementTarget);
          setRequirementTarget(null);
        }}
      />
      <ConfirmModal
        visible={confirm}
        title={t('home.confirmTitle')}
        message={t('home.confirmBody')}
        confirmLabel={t('home.create')}
        cancelLabel={t('common.cancel')}
        loading={creating}
        onCancel={() => setConfirm(false)}
        onConfirm={() => void activate()}
      />
    </AppScreen>
  );
}
const styles = StyleSheet.create({
  homeHeader: { alignItems: 'center', flexDirection: 'row', gap: 12 },
  bell: { alignItems: 'center', borderRadius: 22, borderWidth: 1, height: 44, justifyContent: 'center', width: 44 },
  indicator: { borderRadius: 6, borderWidth: 2, height: 12, position: 'absolute', right: 5, top: 5, width: 12 },
  section: { fontSize: 17, fontWeight: '700', marginBottom: 10 },
  requirement: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  requirementText: { flex: 1 },
  resolve: {
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  sos: {
    width: 236,
    height: 236,
    borderRadius: 118,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    elevation: 8,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 14,
  },
});
