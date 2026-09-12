import type { ReactNode } from 'react';
import { createContext, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { darkColors, lightColors } from './Colors';
import Spacing from './Spacing';
import Typography from './Typography';
import type { AppColors, ResolvedThemeMode, ThemeMode } from './Colors';

interface AppTheme {
  colors: AppColors;
  mode: ThemeMode;
  resolvedMode: ResolvedThemeMode;
  setMode: (mode: ThemeMode) => void;
  spacing: typeof Spacing;
  typography: typeof Typography;
}

export const ThemeContext = createContext<AppTheme | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const systemMode = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>('system');
  const resolvedSystemMode: ResolvedThemeMode = systemMode === 'dark' || systemMode === 'light' ? systemMode : 'light';
  const resolvedMode: ResolvedThemeMode = mode === 'system' ? resolvedSystemMode : mode;

  const value = useMemo<AppTheme>(
    () => ({
      colors: resolvedMode === 'dark' ? darkColors : lightColors,
      mode,
      resolvedMode,
      setMode,
      spacing: Spacing,
      typography: Typography,
    }),
    [mode, resolvedMode]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
