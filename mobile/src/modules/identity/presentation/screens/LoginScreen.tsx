// Presenta acceso local validado y enlaces a registro y recuperación.
import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import AppScreen from '@shared/ui/AppScreen';
import AppInput from '@shared/ui/AppInput';
import AppButton from '@shared/ui/AppButton';
import ScreenHeader from '@shared/ui/ScreenHeader';
import Routes from '@shell/navigation/routes';
import useAppState from '@shell/providers/useAppState';
import { useAppTheme } from '@shared/theme';
import { useI18n } from '@shared/i18n';
import { isEmail, isPassword } from '@shared/validation/formRules';
export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAppState();
  const { colors, spacing } = useAppTheme();
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const validEmail = isEmail(email);
  const validPassword = isPassword(password);
  const handle = () => {
    setSubmitted(true);
    if (!validEmail || !validPassword) return;
    signIn(email);
    router.replace(Routes.home);
  };
  return (
    <AppScreen>
      <View style={styles.brand}>
        <Image
          source={require('../../../../../assets/images/Logo-AlertaMujer.jpeg')}
          resizeMode="contain"
          style={styles.logo}
        />
        <Text style={[styles.brandName, { color: colors.primary }]}>
          AlertaMujer
        </Text>
      </View>
      <ScreenHeader
        title={t('auth.loginTitle')}
        subtitle={t('auth.loginHint')}
      />
      <View style={{ height: spacing.lg }} />
      <AppInput
        label={t('auth.email')}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        error={submitted && !validEmail ? t('validation.email') : undefined}
      />
      <AppInput
        label={t('auth.password')}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        showPasswordToggle
        error={
          submitted && !validPassword ? t('validation.password') : undefined
        }
      />
      <AppButton
        title={t('auth.login')}
        onPress={handle}
      />
      <Pressable
        onPress={() => router.push(Routes.forgotPassword)}
        style={styles.link}
      >
        <Text style={{ color: colors.primary }}>{t('auth.forgot')}</Text>
      </Pressable>
      <View style={[styles.separator, { borderColor: colors.divider }]}>
        <Text style={{ color: colors.textMedium }}>{t('auth.noAccount')}</Text>
      </View>
      <AppButton
        title={t('auth.register')}
        onPress={() => router.push(Routes.registerStep1)}
        variant="outline"
      />
    </AppScreen>
  );
}
const styles = StyleSheet.create({
  brand: { alignItems: 'center', marginTop: 12, marginBottom: 22 },
  logo: { width: 132, height: 132, borderRadius: 30 },
  brandName: { fontSize: 28, fontWeight: '800', marginTop: 10 },
  link: { alignItems: 'center', padding: 16 },
  separator: {
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: 18,
    marginTop: 16,
    marginBottom: 12,
  },
});
