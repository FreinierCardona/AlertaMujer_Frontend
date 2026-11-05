// Cambia de forma explícita entre tema claro y oscuro sin alterar el flujo actual.
import { Pressable, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppScreen from '@shared/ui/AppScreen';
import AppCard from '@shared/ui/AppCard';
import ScreenHeader from '@shared/ui/ScreenHeader';
import { useAppTheme } from '@shared/theme';
import type { ThemeMode } from '@shared/theme';
import { useI18n } from '@shared/i18n';
export default function AppearanceScreen() {
  const { mode, setMode, colors } = useAppTheme();
  const { t } = useI18n();
  const options: {
    value: ThemeMode;
    label: string;
    icon: 'sunny-outline' | 'moon-outline';
  }[] = [
    { value: 'light', label: t('appearance.light'), icon: 'sunny-outline' },
    { value: 'dark', label: t('appearance.dark'), icon: 'moon-outline' },
  ];
  return (
    <AppScreen>
      <ScreenHeader
        canGoBack
        title={t('appearance.title')}
      />
      <AppCard>
        {options.map((item, index) => (
          <Pressable
            accessibilityRole="radio"
            accessibilityState={{ checked: mode === item.value }}
            key={item.value}
            onPress={() => void setMode(item.value)}
            style={[
              styles.option,
              index > 0 && {
                borderTopColor: colors.divider,
                borderTopWidth: 1,
              },
            ]}
          >
            <Ionicons
              name={item.icon}
              size={24}
              color={colors.primary}
            />
            <Text
              style={{ color: colors.textDark, flex: 1, fontWeight: '600' }}
            >
              {item.label}
            </Text>
            <Ionicons
              name={
                mode === item.value ? 'radio-button-on' : 'radio-button-off'
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
    minHeight: 62,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
});
