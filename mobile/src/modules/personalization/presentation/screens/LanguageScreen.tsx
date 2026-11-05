// Cambia inmediatamente el idioma y persiste la selección.
import { Pressable, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppScreen from '@shared/ui/AppScreen';
import AppCard from '@shared/ui/AppCard';
import ScreenHeader from '@shared/ui/ScreenHeader';
import { useAppTheme } from '@shared/theme';
import { useI18n } from '@shared/i18n';
import type { AppLanguage } from '@shared/i18n';
export default function LanguageScreen() {
  const { language, setLanguage, t } = useI18n();
  const { colors } = useAppTheme();
  const options: { value: AppLanguage; label: string }[] = [
    { value: 'es', label: t('language.spanish') },
    { value: 'en', label: t('language.english') },
    { value: 'pt', label: t('language.portuguese') },
    { value: 'fr', label: t('language.french') },
  ];
  return (
    <AppScreen>
      <ScreenHeader
        canGoBack
        title={t('language.title')}
      />
      <AppCard>
        {options.map((item, index) => (
          <Pressable
            accessibilityRole="radio"
            accessibilityState={{ checked: language === item.value }}
            key={item.value}
            onPress={() => void setLanguage(item.value)}
            style={[
              styles.option,
              index > 0 && {
                borderTopColor: colors.divider,
                borderTopWidth: 1,
              },
            ]}
          >
            <Text
              style={{ color: colors.textDark, flex: 1, fontWeight: '600' }}
            >
              {item.label}
            </Text>
            <Ionicons
              name={
                language === item.value ? 'radio-button-on' : 'radio-button-off'
              }
              size={24}
              color={colors.primary}
            />
          </Pressable>
        ))}
      </AppCard>
    </AppScreen>
  );
}
const styles = StyleSheet.create({
  option: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
});
