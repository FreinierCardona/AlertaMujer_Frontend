// Reutiliza una verificación local para registro y recuperación con error y reenvío visibles.
import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AppScreen from '@shared/ui/AppScreen';
import AppButton from '@shared/ui/AppButton';
import ScreenHeader from '@shared/ui/ScreenHeader';
import StatusBanner from '@shared/ui/StatusBanner';
import Routes from '@shell/navigation/routes';
import useAppState from '@shell/providers/useAppState';
import { useAppTheme } from '@shared/theme';
import { useI18n } from '@shared/i18n';
import { maskDestination, onlyDigits } from '@shared/validation/formRules';
export default function VerifyCodeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    flow?: 'register' | 'forgot' | 'profile';
    destination?: string;
    name?: string;
    lastName?: string;
    phone?: string;
    email?: string;
  }>();
  const { updateProfile } = useAppState();
  const { t } = useI18n();
  const { colors, spacing, typography } = useAppTheme();
  const [code, setCode] = useState('');
  const [error, setError] = useState<'invalid' | 'expired' | null>(null);
  const [resent, setResent] = useState(false);
  const verify = () => {
    if (code === '000000') {
      setError('invalid');
      return;
    }
    if (code === '999999') {
      setError('expired');
      return;
    }
    if (code.length !== 6) {
      setError('invalid');
      return;
    }
    if (params.flow === 'forgot') {
      router.replace(Routes.resetPassword);
      return;
    }
    updateProfile({
      name: params.name ?? t('profile.defaultName'),
      lastName: params.lastName ?? '',
      phone: params.phone ?? '',
      email: params.email ?? params.destination ?? '',
    });
    if (params.flow === 'profile') {
      router.replace(Routes.profile);
      return;
    }
    router.replace(Routes.login);
  };
  return (
    <AppScreen>
      <ScreenHeader
        canGoBack
        title={t('auth.verifyTitle')}
        subtitle={t('auth.verifyHelp')}
      />
      <Text
        style={{
          color: colors.primary,
          textAlign: 'center',
          marginBottom: spacing.lg,
        }}
      >
        {maskDestination(params.destination ?? '')}
      </Text>
      <TextInput
        accessibilityLabel={t('auth.verifyTitle')}
        value={code}
        onChangeText={(v) => {
          setCode(onlyDigits(v, 6));
          setError(null);
        }}
        keyboardType="number-pad"
        maxLength={6}
        textAlign="center"
        style={[
          styles.code,
          {
            backgroundColor: colors.inputBackground,
            borderColor: error ? colors.danger : colors.inputBorder,
            color: colors.textDark,
            fontSize: typography.xl,
            letterSpacing: 12,
          },
        ]}
      />
      {error ? (
        <StatusBanner
          tone="danger"
          title={t(
            error === 'expired' ? 'auth.expiredCode' : 'auth.invalidCode',
          )}
        />
      ) : resent ? (
        <StatusBanner
          tone="success"
          title={t('auth.resent')}
        />
      ) : null}
      <View style={{ height: spacing.md }} />
      <AppButton
        title={t('auth.verify')}
        onPress={verify}
        disabled={code.length !== 6}
      />
      <View style={{ height: spacing.sm }} />
      <AppButton
        title={t('auth.resend')}
        onPress={() => {
          setCode('');
          setError(null);
          setResent(true);
        }}
        variant="ghost"
      />
    </AppScreen>
  );
}
const styles = StyleSheet.create({
  code: {
    height: 62,
    borderWidth: 1.5,
    borderRadius: 14,
    marginBottom: 16,
    paddingHorizontal: 14,
  },
});
