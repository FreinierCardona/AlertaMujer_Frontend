import type { ReactNode } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { I18nProvider } from '@shared/i18n';
import { ThemeProvider } from '@shared/theme';
import { AppStateProvider } from './AppStateProvider';

interface AppProvidersProps {
  children: ReactNode;
}

export default function AppProviders({ children }: AppProvidersProps) {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <I18nProvider>
          <AppStateProvider>{children}</AppStateProvider>
        </I18nProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
