// Completa credenciales y aceptación antes de abrir la verificación contextual.
import { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AppScreen from '@shared/ui/AppScreen';
import AppInput from '@shared/ui/AppInput';
import AppButton from '@shared/ui/AppButton';
import ScreenHeader from '@shared/ui/ScreenHeader';
import Routes from '@shell/navigation/routes';
import { useAppTheme } from '@shared/theme';
import { useI18n } from '@shared/i18n';
import { isEmail, isPassword } from '@shared/validation/formRules';
export default function RegisterStep2Screen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    name: string;
    lastName: string;
    phone: string;
  }>();
  const { t } = useI18n();
  const { colors, spacing } = useAppTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const valid =
    isEmail(email) && isPassword(password) && password === confirm && accepted;
  const submit = () => {
    setSubmitted(true);
    if (valid)
      router.push({
        pathname: Routes.verifyCode,
        params: { flow: 'register', destination: email, ...params },
      });
  };
  return (
    <AppScreen>
      <ScreenHeader
        canGoBack
        title={t('auth.personalTitle')}
        subtitle={t('auth.credentialsSubtitle')}
      />
      <AppInput
        label={t('auth.email')}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        error={submitted && !isEmail(email) ? t('validation.email') : undefined}
      />
      <AppInput
        label={t('auth.password')}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        showPasswordToggle
        error={
          submitted && !isPassword(password)
            ? t('validation.password')
            : undefined
        }
      />
      <AppInput
        label={t('auth.confirmPassword')}
        value={confirm}
        onChangeText={setConfirm}
        secureTextEntry
        showPasswordToggle
        error={
          submitted && password !== confirm
            ? t('validation.passwordMatch')
            : undefined
        }
      />
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: accepted }}
        onPress={() => setAccepted(!accepted)}
        style={[styles.accept, { marginBottom: spacing.lg }]}
      >
        <Ionicons
          name={accepted ? 'checkbox' : 'square-outline'}
          size={24}
          color={submitted && !accepted ? colors.danger : colors.primary}
        />
        <Text style={{ color: colors.textDark, flex: 1 }}>
          {t('auth.accept')}
        </Text>
      </Pressable>
      <AppButton
        title={t('auth.create')}
        onPress={submit}
      />
    </AppScreen>
  );
}
const styles = StyleSheet.create({
  accept: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
});
