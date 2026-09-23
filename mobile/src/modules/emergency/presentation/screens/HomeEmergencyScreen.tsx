// Presenta la matriz real de requisitos y activa SOS solo mediante pulsación prolongada confirmada.
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
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

export default function HomeEmergencyScreen() {
  const router = useRouter();
  const {
    profile,
    contacts,
    requirements,
    refreshRequirements,
    resolveRequirement,
    createEmergency,
  } = useAppState();
  const { t } = useI18n();
  const { colors, spacing, typography } = useAppTheme();
  const [holding, setHolding] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [requirementTarget, setRequirementTarget] =
    useState<DeviceRequirementKey | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requirementsComplete =
    contacts.length > 0 &&
    requirements.foreground &&
    requirements.background &&
    requirements.notifications &&
    requirements.gps &&
    requirements.connection;
  const ready = requirementsComplete;
  const showRequirements = !requirementsComplete && !requirements.checking;
  useFocusEffect(
    useCallback(() => {
      void refreshRequirements();
    }, [refreshRequirements]),
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
      setError(result.reason ?? 'error');
      void refreshRequirements();
    }
  };
  const rows: {
    key: DeviceRequirementKey | 'contacts';
    label: string;
    value: boolean;
  }[] = [
    {
      key: 'contacts',
      label: t('requirements.contacts'),
      value: contacts.length > 0,
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
    {
      key: 'notifications',
      label: t('requirements.notifications'),
      value: requirements.notifications,
    },
    { key: 'gps', label: t('requirements.gps'), value: requirements.gps },
    {
      key: 'connection',
      label: t('requirements.connection'),
      value: requirements.connection,
    },
  ];
  const requirementHelp = requirementTarget
    ? t(
        requirementTarget === 'foreground'
          ? 'requirements.foregroundHelp'
          : requirementTarget === 'background'
            ? 'requirements.backgroundHelp'
            : requirementTarget === 'notifications'
              ? 'requirements.notificationsHelp'
              : 'requirements.gpsHelp',
      )
    : '';
  return (
    <AppScreen>
      <Text
        style={{
          color: colors.primary,
          fontSize: typography.xl,
          fontWeight: typography.bold,
        }}
      >
        {t('home.hello', {
          name: profile.name || t('profile.defaultName'),
        })}
      </Text>
      <Text
        style={{
          color: colors.textMedium,
          marginTop: 4,
          marginBottom: spacing.lg,
        }}
      >
        {t('home.protected')}
      </Text>
      <StatusBanner
        tone={ready ? 'success' : requirements.checking ? 'info' : 'warning'}
        title={
          ready
            ? t('home.ready')
            : requirements.checking
              ? t('home.checking')
              : t('home.blocked')
        }
      />
      {error ? (
        <View style={{ height: spacing.sm }}>
          <StatusBanner
            tone="danger"
            title={error === 'location' ? t('common.error') : t('home.blocked')}
            message={
              error === 'location' ? t('emergency.locationPending') : undefined
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
